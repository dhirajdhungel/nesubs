import { Hono } from "hono";
import { prisma } from "../db.js";

const app = new Hono();

app.get("/", async (c) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        categoryId: true,
        packages: true,
        packageGroups: true,
        customFields: true,
        status: true,
        createdAt: true,
      }
    });
    return c.json({ success: true, products });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) return c.json({ success: false, error: "Product not found" }, 404);
    return c.json({ success: true, product });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        image: body.image,
        categoryId: body.categoryId,
        packages: body.packages || [],
        packageGroups: body.packageGroups || [],
        customFields: body.customFields || [],
        status: body.status || "active",
      },
    });
    return c.json({ success: true, product });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return c.json({ success: false, error: "Product not found" }, 404);
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        image: body.image,
        categoryId: body.categoryId,
        packages: body.packages !== undefined ? body.packages : existing.packages,
        packageGroups: body.packageGroups !== undefined ? body.packageGroups : existing.packageGroups,
        customFields: body.customFields !== undefined ? body.customFields : existing.customFields,
        status: body.status !== undefined ? body.status : existing.status,
      },
    });
    return c.json({ success: true, product });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await prisma.product.delete({ where: { id } });
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

export default app;
