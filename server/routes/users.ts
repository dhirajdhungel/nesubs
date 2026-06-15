import { Hono } from "hono";
import { prisma } from "../db.js";
import crypto from "node:crypto";

const app = new Hono();

async function generateUniqueNesubsEmail(name: string): Promise<string> {
  const firstName = name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = firstName.substring(0, 6);
  for (let attempts = 0; attempts < 50; attempts++) {
    const digits = Math.floor(1000 + Math.random() * 9000).toString();
    const nesubsEmail = `${base}${digits}@nesubs.com`;
    const exists = await prisma.user.findFirst({ where: { nesubsEmail } });
    if (!exists) return nesubsEmail;
  }
  return `${base}${Math.floor(1000 + Math.random() * 9000).toString()}@nesubs.com`;
}

app.get("/", async (c) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        nesubsEmail: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      }
    });
    return c.json({ success: true, users });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, phone, role } = body;

    if (!name || !email) {
      return c.json({ success: false, error: "Name and email are required" }, 400);
    }

    const emailLower = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existingUser) {
      return c.json({ success: false, error: "A user with this email already exists" }, 409);
    }

    const userId = crypto.randomUUID();
    const nesubsEmail = await generateUniqueNesubsEmail(name);

    const user = await prisma.user.create({
      data: {
        id: userId,
        email: emailLower,
        name,
        phone: phone || null,
        nesubsEmail,
        role: role || "user",
        status: "active",
      }
    });

    return c.json({ success: true, user });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { name, email, phone, role } = body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return c.json({ success: false, error: "User not found" }, 404);

    if (email && email.toLowerCase() !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (emailTaken) return c.json({ success: false, error: "Email already in use" }, 409);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email: email ? email.toLowerCase() : undefined,
        phone,
        role,
      }
    });

    return c.json({ success: true, user });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    let user = await prisma.user.findUnique({ where: { id } });
    if (!user) return c.json({ success: false, error: "User not found" }, 404);

    if (!user.nesubsEmail) {
      const nesubsEmail = await generateUniqueNesubsEmail(user.name);
      user = await prisma.user.update({
        where: { id },
        data: { nesubsEmail }
      });
    }

    return c.json({ success: true, user });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.put("/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();

    const validStatuses = ["active", "suspended", "inactive"];
    if (!validStatuses.includes(status)) {
      return c.json({ success: false, error: "Invalid status" }, 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status }
    });

    return c.json({ success: true, user });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await prisma.user.delete({ where: { id } });
    return c.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

export default app;
