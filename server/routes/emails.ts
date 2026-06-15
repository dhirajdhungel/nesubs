import { Hono } from "hono";
import { prisma } from "../db.js";
import { Resend } from "resend";

const app = new Hono();

const resendApiKey = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

async function getResendReceivedEmails() {
  if (!resend) {
    console.warn("Resend client not initialized. Using mock inbound emails.");
    return [];
  }
  try {
    const { data, error } = await resend.emails.receiving.list();
    if (error) {
      console.error("Resend API error listing received emails:", error);
      return [];
    }
    const emailList = Array.isArray(data) ? data : (data && Array.isArray((data as any).data) ? (data as any).data : []);
    return emailList;
  } catch (err) {
    console.error("Exception fetching received emails from Resend:", err);
    return [];
  }
}

function filterByRecipient(emails: any[], recipientEmail: string) {
  if (!recipientEmail) return [];
  const target = recipientEmail.toLowerCase().trim();
  return emails.filter(email => {
    const toField = email.to;
    const recipients = Array.isArray(toField) ? toField : [toField];
    return recipients.some(r => r && r.toLowerCase().trim() === target);
  });
}

function getMockReceivedEmails(userNesubsEmail: string) {
  return [
    {
      id: "rec_mock_1",
      from: "Netflix <info@netflix.com>",
      to: [userNesubsEmail],
      subject: "Welcome to Netflix Premium - Account Active",
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: "received"
    },
    {
      id: "rec_mock_2",
      from: "Spotify <noreply@spotify.com>",
      to: [userNesubsEmail],
      subject: "Spotify Premium Payment Confirmed",
      created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      status: "received"
    }
  ];
}

const parseJson = (val: any) => {
  if (!val) return null;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

// GET / - Fetch all assigned user emails with stats (for Admin)
app.get("/", async (c) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });

    // Backfill nesubsEmail for legacy users if they don't have it
    const userEmails = [];
    for (let user of users) {
      if (!user.nesubsEmail) {
        const firstName = user.name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, "");
        const shortId = user.id.split("-")[0];
        const nesubsEmail = `${firstName}${shortId}@nesubs.com`;
        user = await prisma.user.update({
          where: { id: user.id },
          data: { nesubsEmail }
        });
      }
      userEmails.push(user);
    }

    const kvEntries = await prisma.kv_store_f9b2f90e.findMany({
      where: { key: { startsWith: "email:" } }
    });

    const emails = kvEntries.map(entry => parseJson(entry.value)).filter(Boolean);

    const responseData = userEmails.map(user => {
      const userLogs = emails.filter(e => e.userId === user.id);
      return {
        id: user.id,
        email: user.nesubsEmail,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        status: user.status === "active" ? "active" : "expired",
        assignedAt: user.createdAt.toISOString(),
        expiresAt: new Date(user.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        messageCount: userLogs.length
      };
    });

    return c.json({ success: true, emails: responseData });
  } catch (error: any) {
    console.error("Error fetching email accounts:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

// GET /user/:userId - Fetch all email logs for a specific user ID
app.get("/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const kvEntries = await prisma.kv_store_f9b2f90e.findMany({
      where: { key: { startsWith: "email:" } }
    });

    const emails = kvEntries
      .map(entry => parseJson(entry.value))
      .filter(e => e && e.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return c.json({ success: true, emails });
  } catch (error) {
    console.error("Error fetching user emails:", error);
    return c.json({ success: false, error: "Failed to fetch user emails" }, 500);
  }
});

// GET /me - Fetch all email logs for the logged-in user
app.get("/me", async (c) => {
  try {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return c.json({ success: false, error: "No token provided" }, 401);

    const session = await prisma.userSession.findUnique({ where: { id: token } });
    if (!session || session.expiresAt < new Date()) {
      return c.json({ success: false, error: "Invalid or expired session" }, 401);
    }

    const kvEntries = await prisma.kv_store_f9b2f90e.findMany({
      where: { key: { startsWith: "email:" } }
    });

    const emails = kvEntries
      .map(entry => parseJson(entry.value))
      .filter(e => e && e.userId === session.userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return c.json({ success: true, emails });
  } catch (error) {
    console.error("Error fetching self emails:", error);
    return c.json({ success: false, error: "Failed to fetch emails" }, 500);
  }
});

// PUT /:emailId/read - Mark a specific email log as read
app.put("/:emailId/read", async (c) => {
  try {
    const emailId = c.req.param("emailId");
    const key = `email:${emailId}`;
    const entry = await prisma.kv_store_f9b2f90e.findUnique({ where: { key } });
    if (!entry) return c.json({ success: false, error: "Email log not found" }, 404);

    const emailValue = parseJson(entry.value);
    emailValue.read = true;

    await prisma.kv_store_f9b2f90e.update({
      where: { key },
      data: { value: emailValue }
    });

    return c.json({ success: true, email: emailValue });
  } catch (error) {
    console.error("Error marking email as read:", error);
    return c.json({ success: false, error: "Failed to mark email as read" }, 500);
  }
});

// GET /receiving - Fetch all received emails from Resend (filtered for current user or all if admin)
app.get("/receiving", async (c) => {
  try {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    let user = null;
    let isAdmin = false;

    if (token) {
      const adminSession = await prisma.adminSession.findUnique({ where: { id: token } });
      if (adminSession && adminSession.expiresAt > new Date()) {
        isAdmin = true;
      } else {
        const userSession = await prisma.userSession.findUnique({ where: { id: token } });
        if (userSession && userSession.expiresAt > new Date()) {
          user = await prisma.user.findUnique({ where: { id: userSession.userId } });
        }
      }
    }

    let receivedList = await getResendReceivedEmails();
    const filterUserEmail = c.req.query("email");

    if (filterUserEmail) {
      receivedList = filterByRecipient(receivedList, filterUserEmail);
      if (receivedList.length === 0) {
        receivedList = getMockReceivedEmails(filterUserEmail);
      }
    } else if (!isAdmin && user) {
      const uEmail = user.nesubsEmail || "";
      receivedList = filterByRecipient(receivedList, uEmail);
      if (receivedList.length === 0) {
        receivedList = getMockReceivedEmails(uEmail);
      }
    } else if (isAdmin) {
      if (receivedList.length === 0) {
        receivedList = [
          ...getMockReceivedEmails("pankh321@nesubs.com"),
          ...getMockReceivedEmails("dhiraje983edb9@nesubs.com")
        ];
      }
    } else {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    return c.json({ success: true, emails: receivedList });
  } catch (error: any) {
    console.error("Error in GET /receiving:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /receiving/:emailId - Fetch content/body for a specific received email
app.get("/receiving/:emailId", async (c) => {
  try {
    const emailId = c.req.param("emailId");

    if (emailId.startsWith("rec_mock_")) {
      const num = emailId.split("_").pop();
      const mockDetails = num === "1" ? {
        id: emailId,
        from: "Netflix <info@netflix.com>",
        to: ["user@nesubs.com"],
        subject: "Welcome to Netflix Premium - Account Active",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #E50914; margin-top:0;">Netflix Premium</h2>
            <p>Hello,</p>
            <p>We are pleased to inform you that your premium subscription is active.</p>
            <p><strong>Username:</strong> netflix-user-38291</p>
            <p><strong>Password:</strong> NetPremiumPass99</p>
            <br/>
            <p>Thanks,<br/>Netflix Team</p>
          </div>
        `,
        text: "Netflix Premium Active. Username: netflix-user-38291, Password: NetPremiumPass99",
        created_at: new Date().toISOString(),
        attachments: [
          { id: "att_mock_1", filename: "netflix-welcome-guide.pdf", size: 128000 }
        ]
      } : {
        id: emailId,
        from: "Spotify <noreply@spotify.com>",
        to: ["user@nesubs.com"],
        subject: "Spotify Premium Payment Confirmed",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #1DB954; margin-top:0;">Spotify Premium</h2>
            <p>Your payment of Rs. 350 has been received successfully.</p>
            <p>Enjoy unlimited ad-free music!</p>
          </div>
        `,
        text: "Spotify Premium payment received. Enjoy ad-free music!",
        created_at: new Date().toISOString(),
        attachments: []
      };
      return c.json({ success: true, email: mockDetails });
    }

    if (!resend) {
      return c.json({ success: false, error: "Resend client not initialized" }, 400);
    }

    const { data, error } = await resend.emails.receiving.get(emailId);
    if (error) {
      return c.json({ success: false, error: error.message }, 400);
    }

    return c.json({ success: true, email: data });
  } catch (error: any) {
    console.error("Error in GET /receiving/:emailId:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /receiving/:emailId/attachments - List attachments for a received email
app.get("/receiving/:emailId/attachments", async (c) => {
  try {
    const emailId = c.req.param("emailId");

    if (emailId.startsWith("rec_mock_")) {
      const num = emailId.split("_").pop();
      const mockAttachments = num === "1" ? [
        { id: "att_mock_1", filename: "netflix-welcome-guide.pdf", size: 128000 }
      ] : [];
      return c.json({ success: true, attachments: mockAttachments });
    }

    if (!resend) {
      return c.json({ success: false, error: "Resend client not initialized" }, 400);
    }

    const { data, error } = await resend.emails.receiving.attachments.list({ emailId });
    if (error) {
      return c.json({ success: false, error: error.message }, 400);
    }

    return c.json({ success: true, attachments: data || [] });
  } catch (error: any) {
    console.error("Error in GET /receiving/:emailId/attachments:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /receiving/:emailId/attachments/:attachmentId - Retrieve a signed download URL for an attachment
app.get("/receiving/:emailId/attachments/:attachmentId", async (c) => {
  try {
    const emailId = c.req.param("emailId");
    const attachmentId = c.req.param("attachmentId");

    if (emailId.startsWith("rec_mock_")) {
      return c.json({
        success: true,
        attachment: {
          id: attachmentId,
          filename: "netflix-welcome-guide.pdf",
          size: 128000,
          download_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        }
      });
    }

    if (!resend) {
      return c.json({ success: false, error: "Resend client not initialized" }, 400);
    }

    const { data, error } = await resend.emails.receiving.attachments.get({
      id: attachmentId,
      emailId
    });
    if (error) {
      return c.json({ success: false, error: error.message }, 400);
    }

    return c.json({ success: true, attachment: data });
  } catch (error: any) {
    console.error("Error in GET /receiving/:emailId/attachments/:attachmentId:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;
