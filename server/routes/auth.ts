import { Hono } from "hono";
import { prisma } from "../db.js";
import * as emailService from "../email-service.js";
import crypto from "node:crypto";

const app = new Hono();

const otpStore = new Map<string, { otp: string; expires: number; userData: any }>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function generateUniqueUsername(name: string): Promise<string> {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 6).padEnd(4, "x");
  for (let attempts = 0; attempts < 20; attempts++) {
    const digits = String(Math.floor(1000 + Math.random() * 9000));
    const username = `${base}${digits}`;
    const exists = await prisma.user.findUnique({ where: { username } });
    if (!exists) return username;
  }
  return `${base}${Date.now().toString().slice(-4)}`;
}

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

app.post("/send-otp", async (c) => {
  try {
    const { email, name } = await c.req.json();
    if (!email || !name) return c.json({ success: false, message: "Email and name are required" }, 400);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return c.json({ success: false, message: "Invalid email format" }, 400);
    
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) return c.json({ success: false, message: "Email already registered. Please login instead." }, 400);
    
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000;
    otpStore.set(email.toLowerCase(), { otp, expires, userData: { email: email.toLowerCase(), name } });
    
    const emailResult = await emailService.sendSignupOTP(email, name, otp);
    if (!emailResult.success) {
      return c.json({ success: false, message: `Failed to send OTP email: ${emailResult.error}. Please try again.` }, 500);
    }

    return c.json({ success: true, message: "OTP sent to your email. Please check your inbox." });
  } catch (error) {
    return c.json({ success: false, message: "Failed to send OTP" }, 500);
  }
});

app.post("/verify-otp", async (c) => {
  try {
    const { email, otp } = await c.req.json();
    if (!email || !otp) return c.json({ success: false, message: "Email and OTP are required" }, 400);
    const emailLower = email.toLowerCase();
    
    const storedData = otpStore.get(emailLower);
    if (!storedData) return c.json({ success: false, message: "OTP not found or expired" }, 400);
    if (Date.now() > storedData.expires) {
      otpStore.delete(emailLower);
      return c.json({ success: false, message: "OTP expired. Please request a new one." }, 400);
    }
    if (storedData.otp !== otp) return c.json({ success: false, message: "Invalid OTP" }, 400);
    
    const username = await generateUniqueUsername(storedData.userData.name);
    
    const userId = crypto.randomUUID();
    const nesubsEmail = await generateUniqueNesubsEmail(storedData.userData.name);

    const user = await prisma.user.create({
      data: {
        id: userId,
        email: emailLower,
        name: storedData.userData.name,
        username,
        nesubsEmail,
        role: "user",
        status: "active",
        lastLoginAt: new Date(),
      }
    });
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const session = await prisma.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        email: emailLower,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    });
    
    otpStore.delete(emailLower);
    
    return c.json({
      success: true,
      message: "Account created successfully",
      user: { id: user.id, email: user.email, name: user.name, username: user.username, nesubsEmail: user.nesubsEmail },
      token: sessionId
    });
  } catch (error) {
    return c.json({ success: false, message: "Failed to verify OTP" }, 500);
  }
});

app.post("/login", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) return c.json({ success: false, message: "Email is required" }, 400);
    const emailLower = email.toLowerCase();
    
    const user = await prisma.user.findUnique({ where: { email: emailLower } });
    if (!user) return c.json({ success: false, message: "User not found. Please sign up first." }, 404);
    if (user.status !== "active") return c.json({ success: false, message: "Account is suspended" }, 403);
    
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000;
    otpStore.set(emailLower, { otp, expires, userData: { email: emailLower, userId: user.id } });
    
    const emailResult = await emailService.sendLoginOTP(email, otp);
    if (!emailResult.success) {
      return c.json({ success: false, message: "Failed to send OTP email. Please try again." }, 500);
    }
    
    return c.json({ success: true, message: "OTP sent to your email.", requireOtp: true });
  } catch (error) {
    return c.json({ success: false, message: "Failed to login" }, 500);
  }
});

app.post("/verify-login-otp", async (c) => {
  try {
    const { email, otp } = await c.req.json();
    if (!email || !otp) return c.json({ success: false, message: "Email and OTP are required" }, 400);
    const emailLower = email.toLowerCase();
    
    const storedData = otpStore.get(emailLower);
    if (!storedData) return c.json({ success: false, message: "OTP not found or expired. Please request a new one." }, 400);
    if (Date.now() > storedData.expires) {
      otpStore.delete(emailLower);
      return c.json({ success: false, message: "OTP expired. Please request a new one." }, 400);
    }
    if (storedData.otp !== otp) return c.json({ success: false, message: "Invalid OTP. Please try again." }, 400);

    const user = await prisma.user.update({
      where: { id: storedData.userData.userId },
      data: { lastLoginAt: new Date() }
    });

    let updatedUser = user;
    if (!user.nesubsEmail) {
      const nesubsEmail = await generateUniqueNesubsEmail(user.name);
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { nesubsEmail }
      });
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const session = await prisma.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        email: emailLower,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    });
    
    otpStore.delete(emailLower);

    return c.json({
      success: true,
      message: "Login successful",
      user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, nesubsEmail: updatedUser.nesubsEmail },
      token: sessionId,
    });
  } catch (error) {
    return c.json({ success: false, message: "Failed to verify OTP" }, 500);
  }
});

app.get("/me", async (c) => {
  try {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return c.json({ success: false, message: "No token provided" }, 401);
    
    const session = await prisma.userSession.findUnique({ where: { id: token } });
    if (!session) return c.json({ success: false, message: "Invalid or expired session" }, 401);
    
    if (session.expiresAt < new Date()) {
      await prisma.userSession.delete({ where: { id: token } });
      return c.json({ success: false, message: "Session expired" }, 401);
    }
    
    let user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return c.json({ success: false, message: "User not found" }, 404);
    
    if (!user.nesubsEmail) {
      const nesubsEmail = await generateUniqueNesubsEmail(user.name);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { nesubsEmail }
      });
    }
    
    return c.json({ success: true, user: { id: user.id, email: user.email, name: user.name, nesubsEmail: user.nesubsEmail } });
  } catch (error) {
    return c.json({ success: false, message: "Failed to get user" }, 500);
  }
});

app.post("/logout", async (c) => {
  try {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      await prisma.userSession.deleteMany({ where: { id: token } });
      await prisma.adminSession.deleteMany({ where: { id: token } });
    }
    return c.json({ success: true, message: "Logged out" });
  } catch (error) {
    return c.json({ success: false, message: "Logout failed" }, 500);
  }
});

app.post("/admin-login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ success: false, error: "Email and password are required" }, 400);

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return c.json({ success: false, error: "Admin credentials not configured on server" }, 503);
    }

    if (email.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
      return c.json({ success: false, error: "Invalid admin credentials" }, 401);
    }

    const sessionId = `admin_session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    await prisma.adminSession.create({
      data: {
        id: sessionId,
        email: adminEmail,
        name: "Super Admin",
        role: "super_admin",
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      }
    });

    return c.json({
      success: true,
      admin: { id: "super_admin", email: adminEmail, name: "Super Admin", role: "super_admin" },
      token: sessionId,
    });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

export default app;
