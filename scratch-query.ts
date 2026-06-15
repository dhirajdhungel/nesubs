import dotenv from 'dotenv';
dotenv.config();
import { prisma } from './server/db.js';

async function test() {
  const users = await prisma.user.findMany();
  console.log("USERS IN DB:", JSON.stringify(users, null, 2));

  const products = await prisma.product.findMany();
  console.log("PRODUCTS IN DB:", JSON.stringify(products, null, 2));
}

test();
