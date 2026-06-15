import nodemailer from 'nodemailer';
import { prisma } from './db.js';

const BRAND_COLOR = '#0A64BC';
const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || 'Nesubs <support@nesubs.com>';

let transporter: any = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.resend.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || 'resend';
  const pass = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY;

  if (!pass) {
    console.error('SMTP authentication password (EMAIL_API_KEY or RESEND_API_KEY) is not set.');
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

async function sendEmail(to: string, subject: string, html: string, type: string = "other") {
  const result = { success: false, data: null as any, error: null as any };
  try {
    const smtpTransporter = getTransporter();
    const info = await smtpTransporter.sendMail({
      from: SENDER_EMAIL,
      to,
      subject,
      html,
    });
    result.success = true;
    result.data = info;
  } catch (error: any) {
    console.error('SMTP error sending email:', error);
    result.success = false;
    result.error = error.message || 'Failed to send email';
  }

  // Always log the email attempt in key-value store under key email:{emailId}
  try {
    const toLower = to.toLowerCase().trim();
    // Look up user by email to associate
    const user = await prisma.user.findUnique({ where: { email: toLower } });
    if (user) {
      const emailId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      // Extract plaintext preview
      const preview = html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 100) + '...';

      await prisma.kv_store_f9b2f90e.create({
        data: {
          key: `email:${emailId}`,
          value: {
            id: emailId,
            userId: user.id,
            to: toLower,
            nesubsEmail: user.nesubsEmail || `${user.name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, "")}${user.id.split("-")[0]}@nesubs.com`,
            from: SENDER_EMAIL,
            subject,
            body: html,
            preview,
            date: new Date().toISOString(),
            read: false,
            type,
            status: result.success ? "success" : "failed",
          }
        }
      });
    }
  } catch (logError) {
    console.error('Failed to log email to database:', logError);
  }

  return result;
}

// Base Template Wrapper for consistency
const getBaseTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
      color: #111827;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background-color: ${BRAND_COLOR};
      padding: 30px 40px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px;
    }
    .footer {
      background-color: #f3f4f6;
      padding: 20px 40px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .card {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NESUBS</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Nesubs Platform. All rights reserved.</p>
      <p>Kathmandu, Nepal</p>
    </div>
  </div>
</body>
</html>
`;

export const sendSignupOTP = async (email: string, name: string, otp: string) => {
  try {
    const content = `
      <h2 style="color: #111827; margin-top: 0;">Account Verification</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hello ${name},</p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Thank you for registering with Nesubs. To securely verify your email address and activate your account, please use the following One-Time Password (OTP):</p>
      
      <div style="text-align: center; margin: 35px 0;">
        <span style="background-color: #f3f4f6; border: 1px solid #e5e7eb; padding: 15px 30px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: ${BRAND_COLOR}; border-radius: 8px; font-family: monospace;">${otp}</span>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; text-align: center;">This code will expire in 10 minutes. If you did not request this verification, please safely ignore this email.</p>
    `;
    return await sendEmail(email, 'Nesubs Account Verification', getBaseTemplate('Verify your email', content), 'otp');
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

export const sendLoginOTP = async (email: string, otp: string) => {
  try {
    const content = `
      <h2 style="color: #111827; margin-top: 0;">Login Verification</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hello,</p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">To securely access your Nesubs account, please use the following One-Time Password (OTP):</p>
      
      <div style="text-align: center; margin: 35px 0;">
        <span style="background-color: #f3f4f6; border: 1px solid #e5e7eb; padding: 15px 30px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: ${BRAND_COLOR}; border-radius: 8px; font-family: monospace;">${otp}</span>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; text-align: center;">This code will expire in 10 minutes. If you did not request this login, please secure your account.</p>
    `;
    return await sendEmail(email, 'Nesubs Login Verification', getBaseTemplate('Login to your account', content), 'otp');
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

export const sendOrderStatusUpdate = async (email: string, orderData: any) => {
  try {
    const isPaid = orderData.status === 'Paid';
    const statusColor = isPaid ? '#059669' : '#d97706';
    
    const content = `
      <h2 style="color: #111827; margin-top: 0;">Order Status Update</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hello,</p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">The status of your recent order has been updated.</p>
      
      <div class="card">
        <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px; text-transform: uppercase; font-weight: 600;">Order Reference</p>
          <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 600; color: #111827; font-family: monospace;">${orderData.id}</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div>
            <span style="color: #6b7280; font-size: 14px;">Product:</span>
            <span style="color: #111827; font-weight: 600; margin-left: 5px;">${orderData.productName}</span>
          </div>
          <div>
            <span style="color: #6b7280; font-size: 14px;">Total Amount:</span>
            <span style="color: #111827; font-weight: 600; margin-left: 5px;">Rs. ${orderData.totalAmount}</span>
          </div>
          <div style="margin-top: 10px;">
            <span style="color: #6b7280; font-size: 14px;">Current Status:</span>
            <span style="background-color: ${statusColor}15; color: ${statusColor}; padding: 4px 12px; border-radius: 999px; font-size: 14px; font-weight: 600; margin-left: 8px;">${orderData.status}</span>
          </div>
        </div>
      </div>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">If you have any questions regarding your order, please do not hesitate to contact our support team.</p>
    `;
    return await sendEmail(email, `Order Update: ${orderData.id}`, getBaseTemplate('Order Update', content), 'order');
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

export const sendProductCredentials = async (email: string, orderData: any) => {
  try {
    const creds = orderData.credentials || {};
    let credentialsHtml = '';
    
    if (Object.keys(creds).length > 0) {
      credentialsHtml = Object.entries(creds).map(([key, value]) => `
        <div style="margin-bottom: 12px;">
          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px; text-transform: capitalize; font-weight: 600;">${key.replace(/([A-Z])/g, ' $1').trim()}</p>
          <div style="background-color: #ffffff; border: 1px solid #d1d5db; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 16px; color: #111827; word-break: break-all;">
            ${value}
          </div>
        </div>
      `).join('');
    } else {
      credentialsHtml = '<p style="color: #4b5563; font-style: italic;">Your credentials have been securely provisioned. Please check your order dashboard.</p>';
    }

    const content = `
      <h2 style="color: #111827; margin-top: 0;">Your Product Details</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hello,</p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Your order for <strong>${orderData.productName}</strong> has been successfully processed. Please find your secure product credentials below.</p>
      
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 25px; margin: 25px 0;">
        <h3 style="margin-top: 0; margin-bottom: 20px; color: #166534; font-size: 18px; border-bottom: 1px solid #bbf7d0; padding-bottom: 10px;">Secure Access Credentials</h3>
        ${credentialsHtml}
      </div>
      
      <div style="background-color: #fffbeb; border: 1px solid #fef08a; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">Security Notice</p>
        <p style="margin: 5px 0 0 0; color: #92400e; font-size: 13px;">Please keep these credentials strictly confidential. Do not share this email with anyone.</p>
      </div>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-top: 30px;">Thank you for choosing Nesubs.</p>
    `;
    return await sendEmail(email, `Your Credentials for ${orderData.productName}`, getBaseTemplate('Product Credentials', content), 'order');
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};
