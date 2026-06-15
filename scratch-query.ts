import dotenv from 'dotenv';
dotenv.config();
import { prisma } from './server/db.js';

async function test() {
  const users = await prisma.user.findMany();
  console.log("USERS IN DB:", JSON.stringify(users, null, 2));

  const orders = await prisma.order.findMany();
  console.log("ORDERS IN DB:", JSON.stringify(orders, null, 2));
}

test();
