# 🚀 QUICK START GUIDE - NESUBS.COM

**For Developers & Stakeholders**

---

## 📋 TABLE OF CONTENTS

1. [What's Working Now](#whats-working-now)
2. [How to Test](#how-to-test)
3. [What's Next](#whats-next)
4. [Common Issues](#common-issues)
5. [Quick Commands](#quick-commands)

---

## ✅ WHAT'S WORKING NOW

### **✅ User Can Do:**
- Browse all products without login
- Search products
- View product details
- **Signup with email + OTP**
- **Login with email + OTP**
- Make purchases (requires login)
- View their own orders only
- Edit profile (UI ready)
- Change password (UI ready)
- Logout

### **✅ Admin Can Do:**
- Login to admin dashboard
- Manage categories (CRUD + reorder)
- Manage products (CRUD + images)
- View all orders
- Update order status
- View all users
- Manage user status
- View payment history
- Update payment settings
- Manage website content (FAQs, etc.)
- View emails sent

### **✅ System Features:**
- Mobile-first responsive design
- OTP authentication (dev mode)
- Payment QR generation
- Order tracking
- Email inbox (dummy data for now)
- Category icons upload
- Product images upload
- Custom form fields per product
- Real-time order sync
- Session management

---

## 🧪 HOW TO TEST

### **Test 1: New User Signup & Purchase**

```
1. Open app in browser
2. Click any product "Buy Now"
3. Fill product details
4. Click "Proceed to Payment"
5. See signup modal
6. Enter:
   - Email: test@example.com
   - Name: Test User
7. Click "Send OTP"
8. **LOOK FOR YELLOW BOX** - Copy 6-digit OTP
9. Enter OTP
10. ✅ You're logged in!
11. Complete purchase flow
```

### **Test 2: View My Orders**

```
1. After purchase, click "Account" tab
2. Click "My Orders"
3. ✅ See your orders only
4. Search/filter orders
```

### **Test 3: Settings Page**

```
1. Click "Account" tab
2. Click "Settings"
3. ✅ See your profile
4. Edit name
5. Click "Change Password"
6. See password modal
```

### **Test 4: Logout & Login**

```
1. Click "Account" tab
2. Click "Logout"
3. ✅ Logged out
4. Click "Account" again
5. Click "Login to Your Account"
6. Enter your email
7. Get OTP (yellow box)
8. Enter OTP
9. ✅ Logged in!
```

### **Test 5: Protected Routes**

```
1. Logout
2. Try to visit /orders directly
3. ✅ Redirected to account
4. ✅ See "Login Required" message
```

### **Test 6: Admin Dashboard**

```
1. Go to /admin/login
2. Email: dhirazdhungel@gmail.com
3. Password: Dhiraj@123
4. ✅ See admin dashboard
5. Test all admin features
```

---

## 🔑 TEST CREDENTIALS

### **User Accounts (Created via Signup):**
- Email: Any valid email
- Name: Any name
- OTP: Check yellow dev box

### **Admin Accounts (Pre-configured):**

**Admin 1:**
- Email: `dhirazdhungel@gmail.com`
- Password: `Dhiraj@123`

**Admin 2:**
- Email: `pankha92singh@gmail.com`
- Password: `Pankh@123`

---

## ⚡ QUICK COMMANDS

### **Check if Backend is Running:**
```bash
# Visit health check endpoint
curl ${VITE_API_BASE_URL}/health

# Should return: {"status":"ok"}
```

### **Test Auth API:**
```bash
# Send OTP
curl -X POST ${VITE_API_BASE_URL}/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Check dev_otp in response
```

### **Check Current User:**
```bash
# Get current user (need token)
curl ${VITE_API_BASE_URL}/auth/me \
  -H "Authorization: Bearer YOUR-SESSION-TOKEN"
```

---

## 🐛 COMMON ISSUES & FIXES

### **Issue: OTP Not Showing**
**Symptom:** No yellow box after clicking "Send OTP"  
**Fix:** 
- Check browser console for `dev_otp`
- OTP is also in console.log
- Check if email service returns error

### **Issue: "Please login to view orders"**
**Symptom:** Redirected to account after clicking My Orders  
**Fix:**
- This is correct behavior!
- User needs to login first
- Click "Login" and complete flow

### **Issue: Can't See My Orders**
**Symptom:** Orders page is empty  
**Fix:**
- Make sure you created an order while logged in
- Old orders may not have userId
- Check if user.id matches order.userId

### **Issue: Payment QR Not Working**
**Symptom:** QR generated but no verification  
**Fix:**
- This is expected (Phase 3 will fix)
- For now, click "Check Payment Status"
- Use manual verification in admin

### **Issue: Admin Login Not Working**
**Symptom:** "Invalid email or password"  
**Fix:**
- Use exact credentials above
- Check if admins are initialized
- Visit `/init-admins` endpoint once

### **Issue: Session Lost on Refresh**
**Symptom:** Logged out after page refresh  
**Fix:**
- Check if localStorage has `authToken`
- Token might have expired
- Login again

---

## 📂 IMPORTANT FILES

### **Authentication:**
```
/supabase/functions/server/auth.tsx - Auth API
/src/app/contexts/AuthContext.tsx - Auth state
/src/app/components/LoginModal.tsx - Login UI
/src/app/components/SignupModal.tsx - Signup UI
```

### **Pages:**
```
/src/app/pages/AccountPage.tsx - User profile
/src/app/pages/MyOrdersPage.tsx - User orders
/src/app/pages/SettingsPage.tsx - User settings
/src/app/pages/ProductDetailPage.tsx - Product page
```

### **Components:**
```
/src/app/components/PaymentModal.tsx - Payment flow
/src/app/components/Layout.tsx - App layout
/src/app/components/BottomNav.tsx - Bottom navigation
```

### **Backend:**
```
/supabase/functions/server/index.tsx - Main server
/supabase/functions/server/payment.tsx - Payment API
/supabase/functions/server/kv_store.tsx - Database
```

### **Configuration:**
```
/src/app/routes.tsx - Route definitions
/src/app/App.tsx - App entry point
/utils/supabase/info.tsx - Supabase config
```

---

## 🔍 DEBUGGING TIPS

### **Check Auth State:**
```javascript
// In browser console:
localStorage.getItem('authToken') // Should show token if logged in
```

### **Check User Data:**
```javascript
// In React DevTools:
// Find AuthContext
// Check user state
```

### **Check API Calls:**
```javascript
// In Network tab:
// Filter by "make-server-f9b2f90e"
// Check request/response
```

### **Check Console Logs:**
```javascript
// Backend logs show:
// - OTP codes (dev mode)
// - API errors
// - Database queries

// Frontend console shows:
// - Auth errors
// - API responses
// - Component errors
```

---

## 📊 SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────┐
│           FRONTEND (React)              │
│  - HomePage, Search, Account            │
│  - PaymentModal, LoginModal             │
│  - AuthContext (Global State)           │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
               ↓
┌─────────────────────────────────────────┐
│      BACKEND (Supabase Edge Function)   │
│  - Auth API (/auth/*)                   │
│  - Orders API (/orders/*)               │
│  - Products API (/products/*)           │
│  - Payment API (/payment/*)             │
└──────────────┬──────────────────────────┘
               │ KV Store Operations
               ↓
┌─────────────────────────────────────────┐
│      DATABASE (Supabase KV Store)       │
│  - users, orders, products              │
│  - categories, payments, emails         │
│  - Sessions, OTPs (in-memory)           │
└─────────────────────────────────────────┘
```

---

## 🎯 WHAT'S NEXT

### **Phase 2: Email System (Next)**
- Integrate Resend
- Send real OTP emails
- Order confirmation emails
- Email inbox with real data

**What You Need:**
- Resend API key

### **Phase 3: Payment Gateway**
- Khalti/eSewa integration
- Auto payment verification
- Refund system

**What You Need:**
- Merchant account
- Gateway credentials

### **Phase 4: Admin Protection**
- Secure admin routes
- Session management
- Audit logs

---

## 📞 NEED HELP?

### **For Bugs:**
1. Check browser console
2. Check Network tab
3. Check backend logs
4. Report with screenshots

### **For Features:**
1. Check ROADMAP.md
2. See if it's planned
3. Suggest improvements

### **For Questions:**
1. Check SYSTEM_AUDIT.md
2. Check PHASE_1_COMPLETION.md
3. Check this guide

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before going live:

- [ ] All tests passing
- [ ] Email service connected (Resend)
- [ ] Payment gateway live
- [ ] Admin routes protected
- [ ] Error tracking setup
- [ ] Analytics connected
- [ ] Backup strategy
- [ ] Support system ready
- [ ] Terms & Privacy pages
- [ ] SSL certificate active
- [ ] Domain configured
- [ ] DNS records set

---

## 🎉 SUCCESS!

**Phase 1 is COMPLETE!**
- ✅ Authentication working
- ✅ Orders protected
- ✅ Settings functional
- ✅ Beautiful UI
- ✅ Mobile responsive

**Ready for Phase 2!**

Get your Resend API key and let's add real email functionality! 🚀

---

**Questions? Issues? Let's fix them together!**
