import { Hono } from "hono";
import { prisma } from "../db.js";

const app = new Hono();

app.get("/", async (c) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        icon: true,
        order: true,
        createdAt: true,
      }
    });
    return c.json({ success: true, categories });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) return c.json({ success: false, error: "Category not found" }, 404);
    return c.json({ success: true, category });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const category = await prisma.category.create({
      data: {
        name: body.name,
        icon: body.icon || "Folder",
        order: body.order || 0,
      },
    });
    return c.json({ success: true, category });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return c.json({ success: false, error: "Category not found" }, 404);
    
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        icon: body.icon,
        order: body.order,
      },
    });
    return c.json({ success: true, category });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await prisma.category.delete({ where: { id } });
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

export default app;
