# 🔧 EMAIL NOT RECEIVED - TROUBLESHOOTING GUIDE

## 📋 **CHECKLIST - Follow These Steps:**

### **Step 1: Check Server Logs**
When you try to sign up, check your browser console and server logs for:
```
✅ RESEND_API_KEY is set: re_jJ4iRKG...
📧 Email send result: { success: true, messageId: '...' }
✅ OTP sent to user@example.com
```

**If you see this instead:**
```
❌ RESEND_API_KEY is not set!
❌ Failed to send OTP email: [error message]
```
→ **Problem:** API key not configured correctly

---

### **Step 2: Test the Email System**

I've added a test endpoint. Use this to diagnose the issue:

**Make a POST request to:**
```
${VITE_API_BASE_URL}/test-email
```

**Request body:**
```json
{
  "email": "YOUR_REAL_EMAIL@gmail.com"
}
```

**Headers:**
```
Authorization: Bearer [your-supabase-anon-key]
Content-Type: application/json
```

**Expected response if working:**
```json
{
  "success": true,
  "message": "Test email sent!",
  "details": {
    "success": true,
    "messageId": "abc123..."
  }
}
```

**If you get an error:**
The response will show exactly what went wrong.

---

### **Step 3: Common Issues & Solutions**

#### **Issue #1: API Key Not Set**
**Error:** `RESEND_API_KEY is not set`

**Solution:**
1. Go to your Supabase dashboard
2. Settings → Edge Functions → Secrets
3. Add secret: `RESEND_API_KEY` = `re_jJ4iRKGV_EB8CzJyS8vaU64W3RZa5AJ8c`
4. Restart your Edge Function

---

#### **Issue #2: Invalid API Key**
**Error:** `Invalid API key` or `Unauthorized`

**Solution:**
1. Go to https://resend.com/api-keys
2. Verify your API key is correct
3. Copy the key exactly (starts with `re_`)
4. Update in Supabase secrets

---

#### **Issue #3: Email Domain Not Verified**
**Error:** `Domain not verified` or `From address not allowed`

**Current "from" address:** `Nesubs <onboarding@resend.dev>`

**This is Resend's test domain and should work!**

If it doesn't work:
1. Go to https://resend.com/domains
2. Check if `resend.dev` is listed
3. Try using `delivered@resend.dev` as test recipient first

---

#### **Issue #4: Rate Limiting**
**Error:** `Too many requests`

**Solution:**
- Resend free tier: 100 emails/day
- Wait a few minutes and try again
- Check your Resend dashboard for usage

---

#### **Issue #5: Email in Spam**
**Possible issue:** Email sent but went to spam folder

**Solution:**
1. Check your spam/junk folder
2. Look for emails from `onboarding@resend.dev`
3. Mark as "Not Spam"

---

#### **Issue #6: Wrong Email Address**
**Check:** Did you enter the correct email?

**Solution:**
- Use an email you have access to
- Try a different email provider (Gmail, Outlook, etc.)
- Check for typos

---

### **Step 4: Debug with Console Logs**

When you try to sign up, you should see these logs:

**In Browser Console:**
```
Sending OTP to: user@example.com
```

**In Server Logs:**
```
✅ RESEND_API_KEY is set: re_jJ4iRKG...
🧪 Testing email send to: user@example.com
📧 Email send result: { success: true, messageId: '...' }
✅ Signup OTP email sent to user@example.com
```

---

### **Step 5: Manual Test with Resend**

Test if your Resend account works at all:

1. Go to https://resend.com/emails/send
2. Fill in:
   - From: `onboarding@resend.dev`
   - To: YOUR_EMAIL
   - Subject: Test
   - Body: Testing
3. Click "Send"
4. Check if you receive it

**If this works:** Problem is in our code  
**If this doesn't work:** Problem is with your Resend account

---

### **Step 6: Check Resend Dashboard**

1. Go to https://resend.com/emails
2. Look for recent sent emails
3. Check delivery status:
   - ✅ **Delivered** = Email sent successfully
   - ❌ **Bounced** = Email address invalid
   - ⏳ **Pending** = Still sending
   - ❗ **Failed** = Error occurred

---

## 🐛 **DEBUGGING COMMANDS**

### **Test Email Endpoint (Copy/Paste):**

```bash
curl -X POST ${VITE_API_BASE_URL}/test-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"YOUR_EMAIL@gmail.com"}'
```

Replace:
- `YOUR_PROJECT_ID` with your Supabase project ID
- `YOUR_ANON_KEY` with your Supabase anon key
- `YOUR_EMAIL@gmail.com` with your real email

---

## 📧 **EXPECTED EMAIL CONTENT**

When it works, you should receive an email that looks like this:

```
┌─────────────────────────────────┐
│  [BLUE HEADER]                  │
│  NESUBS                         │
│  Digital Services for Nepal     │
├─────────────────────────────────┤
│                                 │
│  Welcome to Nesubs! 🎉         │
│                                 │
│  Hi Test User,                  │
│                                 │
│  [BLUE BOX]                     │
│   Your Verification Code        │
│      123456                     │
│   ⏱️ Valid for 10 minutes       │
│                                 │
│  [YELLOW BOX]                   │
│  🔒 Security Notice             │
│                                 │
├─────────────────────────────────┤
│  NESUBS.COM                     │
│  support@nesubs.com             │
└─────────────────────────────────┘
```

---

## ✅ **QUICK FIX CHECKLIST**

Try these in order:

- [ ] **Check spam folder**
- [ ] **Verify API key is set in Supabase**
- [ ] **Test with the /test-email endpoint**
- [ ] **Check Resend dashboard for logs**
- [ ] **Try a different email address**
- [ ] **Wait 2-3 minutes (sometimes delayed)**
- [ ] **Check browser console for errors**
- [ ] **Check server logs for errors**
- [ ] **Verify internet connection**
- [ ] **Try again (might be temporary issue)**

---

## 🚨 **STILL NOT WORKING?**

### **Send me this information:**

1. **Server logs** when you click "Send OTP"
2. **Browser console** output
3. **Test email endpoint** response
4. **Your email provider** (Gmail, Outlook, etc.)
5. **Resend dashboard** screenshot (emails page)

### **What to check in Server Logs:**

Look for lines starting with:
- `✅` = Success
- `❌` = Error
- `📧` = Email activity
- `🧪` = Test

---

## 💡 **MOST COMMON ISSUE:**

**99% of the time it's one of these:**

1. ⚠️ **API key not set in Supabase** → Set it in Edge Functions secrets
2. ⚠️ **Wrong API key** → Copy exactly from Resend dashboard
3. ⚠️ **Email in spam** → Check spam folder
4. ⚠️ **Typo in email address** → Double-check spelling

---

## 🎯 **NEXT STEPS:**

1. **First:** Use the test email endpoint
2. **Then:** Check the response
3. **Finally:** Report what you see

---

## 📞 **NEED HELP?**

If none of this works, share:
- Test endpoint response
- Server logs
- Resend dashboard screenshot

I'll help you fix it! 🚀
