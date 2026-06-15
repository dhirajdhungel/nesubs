import { Hono } from "hono";
import { prisma } from "../db.js";
import * as emailService from "../email-service.js";

const app = new Hono();

app.get("/", async (c) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        let user = null;
        if (order.userId) {
          user = await prisma.user.findUnique({ where: { id: order.userId } });
        }
        if (!user && order.customerEmail) {
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: { equals: order.customerEmail, mode: "insensitive" } },
                { nesubsEmail: { equals: order.customerEmail, mode: "insensitive" } }
              ]
            }
          });
        }
        return {
          ...order,
          userNesubsEmail: user?.nesubsEmail || null,
          userMainEmail: user?.email || null,
          userActualName: user?.name || null,
        };
      })
    );

    return c.json({ success: true, orders: enrichedOrders });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const order = await prisma.order.create({
      data: {
        productId: body.productId,
        productName: body.productName,
        productImage: body.productImage,
        packageName: body.packageName,
        price: body.price,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone || "",
        customFields: body.customFields || {},
        paymentMethod: body.paymentMethod,
        userId: body.userId || null,
        status: "pending",
      },
    });
    return c.json({ success: true, order });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return c.json({ success: false, error: "Order not found" }, 404);
    
    let user = null;
    if (order.userId) {
      user = await prisma.user.findUnique({ where: { id: order.userId } });
    }
    if (!user && order.customerEmail) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: order.customerEmail, mode: "insensitive" } },
            { nesubsEmail: { equals: order.customerEmail, mode: "insensitive" } }
          ]
        }
      });
    }

    const safeOrder = {
      ...order,
      userNesubsEmail: user?.nesubsEmail || null,
      userMainEmail: user?.email || null,
      userActualName: user?.name || null,
    };
    
    // Do not return credentials here natively unless specifically requested and authenticated
    delete (safeOrder as any).credentials;
    return c.json({ success: true, order: safeOrder });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.put("/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return c.json({ success: false, error: "Order not found" }, 404);
    
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // Send status update email to customer
    if (updated.customerEmail) {
      emailService.sendOrderStatusUpdate(updated.customerEmail, {
        id,
        productName: updated.productName || "Your Product",
        status,
        customerName: updated.customerName,
        totalAmount: updated.price,
      }).catch(e => console.error(e));
    }
    
    return c.json({ success: true, order: updated });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.post("/:id/send-credentials", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { credentials, sentBy } = body;

    if (!credentials || typeof credentials !== "object" || Object.keys(credentials).length === 0) {
      return c.json({ success: false, error: "At least one credential field is required" }, 400);
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return c.json({ success: false, error: "Order not found" }, 404);

    const credentialRecord = {
      credentials,
      sentBy: sentBy || "admin",
      sentAt: new Date().toISOString(),
    };

    await prisma.order.update({
      where: { id },
      data: {
        credentials: credentialRecord,
      },
    });

    const email = order.customerEmail;
    if (email) {
      emailService.sendProductCredentials(email, {
        customerName: order.customerName,
        orderId: id,
        productName: order.productName || "Your Product",
        credentials,
      }).catch(e => console.error(e));
    }

    return c.json({ success: true, credentialRecord });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.get("/:id/credentials", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await prisma.order.findUnique({
      where: { id },
      select: { credentials: true }
    });
    if (!order || !order.credentials) return c.json({ success: true, credentials: null });
    return c.json({ success: true, credentials: order.credentials });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

export default app;
