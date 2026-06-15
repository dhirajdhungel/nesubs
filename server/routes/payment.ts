import { Hono } from "hono";
import { prisma } from "../db.js";
import * as emailService from "../email-service.js";
import { FonePay } from "../fonepay.js";

const app = new Hono();

const fonepay = new FonePay({
  username: process.env.FONEPAY_USERNAME || "",
  password: process.env.FONEPAY_PASSWORD || "",
  secret: process.env.FONEPAY_SECRET_KEY || "",
  fonepayPan: process.env.FONEPAY_MERCHANT_CODE || "",
});

// GET /health
app.get("/health", (c) => c.json({ success: true, status: "healthy" }));

// GET /history
app.get("/history", async (c) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" }
    });
    const history = orders.map(o => {
      const custom = (o.customFields as Record<string, any>) || {};
      const payDetails = custom.paymentDetails || {};
      
      // Determine payment status based on order status or custom paymentDetails status
      let paymentStatus = "qr_generated";
      if (o.status === "completed" || o.status === "Paid" || o.status === "Success" || payDetails.status === "SUCCESS" || payDetails.status === "payment_success") {
        paymentStatus = "payment_success";
      } else if (o.status === "cancelled" || o.status === "Failed" || payDetails.status === "FAILED" || payDetails.status === "payment_failed") {
        paymentStatus = "payment_failed";
      }

      return {
        id: `PAY-${o.id.substring(0, 8)}`,
        orderId: o.id,
        amount: String(o.price),
        status: paymentStatus,
        createdAt: o.createdAt,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        paymentMethod: o.paymentMethod,
        transactionRef: payDetails.transactionId || `TXN-${o.id.substring(0, 8)}`,
        bankName: payDetails.bankName || o.paymentMethod || "Nepal Pay",
        remarks: payDetails.remarks || "",
        updatedAt: o.updatedAt,
        transactionId: payDetails.transactionId || null,
        paymentCompletedAt: payDetails.updatedAt || (o.status === "Paid" || o.status === "completed" ? o.updatedAt.toISOString() : null)
      };
    });
    return c.json({ success: true, history });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /history/:orderId/details
app.post("/history/:orderId/details", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const { transactionId, bankName, remarks, status } = await c.req.json();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return c.json({ success: false, error: "Order not found" }, 404);

    // Merge payment details into customFields
    const currentCustomFields = (order.customFields as Record<string, any>) || {};
    currentCustomFields.paymentDetails = {
      transactionId,
      bankName,
      remarks,
      status,
      updatedAt: new Date().toISOString()
    };

    // Determine target order status
    let orderStatus = order.status;
    if (status === "payment_success") {
      orderStatus = "Paid";
    } else if (status === "payment_failed") {
      orderStatus = "cancelled";
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        customFields: currentCustomFields,
        status: orderStatus
      }
    });

    return c.json({ success: true, order: updated });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /stats
app.get("/stats", async (c) => {
  try {
    const orders = await prisma.order.findMany();
    const totalVolume = orders.filter(o => o.status === "completed" || o.status === "Paid").reduce((sum, o) => sum + o.price, 0);
    const pendingVolume = orders.filter(o => o.status === "pending").reduce((sum, o) => sum + o.price, 0);
    const successfulPayments = orders.filter(o => o.status === "completed" || o.status === "Paid").length;
    const failedPayments = orders.filter(o => o.status === "cancelled").length;

    return c.json({
      success: true,
      stats: {
        totalVolume,
        pendingVolume,
        successfulPayments,
        failedPayments
      }
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /generate-qr
app.post("/generate-qr", async (c) => {
  try {
    const body = await c.req.json();
    const { orderId, amount, userId, userEmail, userName } = body;

    if (!orderId || !amount) {
      return c.json({ success: false, error: "Missing required fields" }, 400);
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }

    // Call FonePay SDK to generate dynamic QR
    // FonePay expects a unique PRN (Payment Reference Number) and amount in Paisa
    const prn = orderId;
    const remarks = `Payment for order ${orderId}`;
    const amountInPaisa = (parseFloat(amount) * 100).toString();

    const fonepayRes = await fonepay.generateDynamicQR({
      amount: amountInPaisa,
      prn,
      remarks,
    });

    const transactionRef = fonepayRes.clientCode;
    const qrString = fonepayRes.qrMessage;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    return c.json({
      success: true,
      qr: {
        transactionRef,
        qrString,
        expiresAt
      }
    });
  } catch (error: any) {
    console.error("FonePay QR generation failed:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /status/:orderId
app.get("/status/:orderId", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }

    // Check payment status dynamically using FonePay API
    const prn = orderId;
    const fonepayStatus = await fonepay.verifyQRPaymentStatus({ prn });

    let isCompleted = order.status === "completed" || order.status === "Paid";

    // If payment is successful but order status is not updated in DB
    if (!isCompleted && fonepayStatus && fonepayStatus.paymentStatus === "success") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "Paid" }
      });
      isCompleted = true;

      // Send payment confirmation email
      if (order.customerEmail) {
        emailService.sendOrderStatusUpdate(order.customerEmail, {
          id: order.id,
          productName: order.productName || "Your Product",
          status: "Paid",
          customerName: order.customerName,
          totalAmount: order.price,
        }).catch(e => console.error("Error sending order status email:", e));
      }
    }

    const isFailed = fonepayStatus && fonepayStatus.paymentStatus === "failed";

    return c.json({
      success: true,
      payment: {
        status: isCompleted ? "completed" : isFailed ? "failed" : "pending",
        transactionRef: fonepayStatus && fonepayStatus.paymentStatus === "success" && 'fonepayTraceId' in fonepayStatus
          ? String(fonepayStatus.fonepayTraceId)
          : `TXN-${order.id.substring(0, 8)}`
      }
    });
  } catch (error: any) {
    console.error("FonePay payment verification failed:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;
