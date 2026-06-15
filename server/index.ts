import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import dotenv from 'dotenv';
dotenv.config();

import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

import authApp from './routes/auth.js';
import categoriesApp from './routes/categories.js';
import productsApp from './routes/products.js';
import ordersApp from './routes/orders.js';
import usersApp from './routes/users.js';
import paymentApp from './routes/payment.js';
import emailsApp from './routes/emails.js';
import { uploadFile, getFile } from './s3.js';

const app = new Hono();

app.use('*', logger());

// Ensure cors is tightly bound to avoid data leakage to unauthorized frontends
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
const allowedOrigins = allowedOriginsEnv ? allowedOriginsEnv.split(",").map(s => s.trim()) : ["http://localhost:5173", "http://localhost:4173"];

app.use(
  "/*",
  cors({
    origin: (origin) => {
      if (!origin) return allowedOrigins[0];
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.startsWith("http://[::1]:")
      ) {
        return origin;
      }
      return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get('/health', (c) => c.json({ status: 'ok' }));

// Group API routes
const api = new Hono();
api.route('/auth', authApp);
api.route('/categories', categoriesApp);
api.route('/products', productsApp);
api.route('/orders', ordersApp);
api.route('/users', usersApp);
api.route('/payment', paymentApp);
api.route('/emails', emailsApp);

api.post("/init-admins", (c) => c.json({ success: true, message: "Admins initialized" }));
api.post("/init-storage", (c) => c.json({ success: true, message: "Storage configured (Mocked).", bucketName: "mock-bucket" }));
api.post("/init-product-storage", (c) => c.json({ success: true, message: "Product storage configured (Mocked).", bucketName: "mock-product-bucket" }));

api.post("/init-dummy-data", async (c) => {
  try {
    const { prisma } = await import("./db.js");
    const catCount = await prisma.category.count();
    if (catCount === 0) {
      const cat = await prisma.category.create({
        data: {
          id: "cat_dummy_1",
          name: "Streaming Services",
          icon: "Play",
          order: 1,
        }
      });
      
      await prisma.product.create({
        data: {
          id: "prod_dummy_1",
          name: "Netflix Premium",
          description: "4K HDR Streaming",
          image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&q=80",
          categoryId: cat.id,
          packages: [
            { id: "pkg_1", name: "1 Month", price: 14.99, duration: "1 month" }
          ],
          customFields: [
            { name: "Email", type: "email" }
          ],
          status: "active",
        }
      });
    }
    return c.json({ success: true, message: "Dummy data initialized" });
  } catch (error: any) {
    console.error("Error in init-dummy-data:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

api.get("/website-content", async (c) => {
  try {
    const { prisma } = await import("./db.js");
    const content = await prisma.kv_store_f9b2f90e.findUnique({
      where: { key: "website_content" }
    });
    
    return c.json({ 
      success: true, 
      content: content ? content.value : {
        homeFAQs: [],
        helpFAQs: [],
        termsAndConditions: "",
        privacyPolicy: "",
        refundPolicy: "",
        helpSupportSettings: {
          heroTitle: "Need Assistance?",
          heroSubtitle: "Choose your preferred way to reach our support team",
          supportEmail: "support@nesubs.com",
          whatsappNumber: "9779812345678",
          whatsappMessage: "Hi, I need help with my Nesubs order.",
          supportHours: [
            { day: "Monday - Friday", hours: "9:00 AM - 8:00 PM" },
            { day: "Saturday", hours: "10:00 AM - 6:00 PM" },
            { day: "Sunday", hours: "10:00 AM - 4:00 PM" }
          ],
          timezone: "Nepal Standard Time (NPT)",
          stillNeedHelpTitle: "Still need help?",
          stillNeedHelpSubtitle: "Our friendly support team is ready to assist you"
        }
      }
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

api.put("/website-content", async (c) => {
  try {
    const body = await c.req.json();
    const { prisma } = await import("./db.js");
    
    await prisma.kv_store_f9b2f90e.upsert({
      where: { key: "website_content" },
      update: { value: body },
      create: { key: "website_content", value: body }
    });
    
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

api.get("/images/:key", async (c) => {
  const key = c.req.param("key");
  try {
    const response = await getFile(key);
    
    // Set content type and other headers
    c.header("Content-Type", response.ContentType || "image/png");
    if (response.CacheControl) c.header("Cache-Control", response.CacheControl);
    
    // Stream the body to Hono response
    // Hono can take a ReadableStream or a Buffer
    const body = await response.Body?.transformToByteArray();
    return c.body(body as any);
  } catch (error: any) {
    console.error("Error proxying image:", error);
    return c.json({ error: "Image not found" }, 404);
  }
});

api.post("/upload-product-image", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'] as any;
    
    if (!file) {
      return c.json({ success: false, error: "No file uploaded" }, 400);
    }

    if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
      return c.json({ success: false, error: "S3/R2 credentials not configured in .env" }, 500);
    }

    const buffer = await file.arrayBuffer();
    const url = await uploadFile(Buffer.from(buffer), file.name, file.type);
    
    return c.json({ success: true, url });
  } catch (error: any) {
    console.error("Error uploading product image:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

api.post("/upload-category-icon", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'] as any;
    
    if (!file) {
      return c.json({ success: false, error: "No file uploaded" }, 400);
    }

    if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
      return c.json({ success: false, error: "S3/R2 credentials not configured in .env" }, 500);
    }

    const buffer = await file.arrayBuffer();
    const url = await uploadFile(Buffer.from(buffer), file.name, file.type);
    
    return c.json({ success: true, url });
  } catch (error: any) {
    console.error("Error uploading category icon:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Note: Removing the /make-server-f9b2f90e/ prefix since we are now a dedicated backend
app.route('/api', api);

const port = parseInt(process.env.PORT || '3000', 10);
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
