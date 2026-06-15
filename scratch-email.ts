import dotenv from 'dotenv';
dotenv.config();

import { sendSignupOTP } from './server/email-service.js';

async function test() {
  const key = process.env.RESEND_API_KEY || 'NOT SET';
  console.log("API Key loaded:", key.substring(0, 10) + "...");
  console.log("Testing email to dhirazdhungel@gmail.com...");
  const result = await sendSignupOTP('dhirazdhungel@gmail.com', 'Dhiraj', '123456');
  console.log("Result:", result);
}

test();
