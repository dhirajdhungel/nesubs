# 🗺️ Implementation Roadmap - Quick Reference

## 🎯 Goal: Launch-Ready Platform in 6-9 Days

---

## 📅 Day-by-Day Plan

### **Day 1-2: User Authentication** 🔐
```
Backend (Day 1):
✓ Install bcrypt + jsonwebtoken
✓ Create /auth/signup endpoint
✓ Create /auth/login endpoint
✓ Create /auth/logout endpoint
✓ Create /auth/me endpoint
✓ Password hashing
✓ JWT token generation

Frontend (Day 2):
✓ Create AuthContext.tsx
✓ Create SignupPage.tsx
✓ Create LoginPage.tsx
✓ Update AccountPage.tsx (use real user)
✓ Create ProtectedRoute.tsx
✓ Add routes to routes.tsx
✓ Test full flow

Deliverable: Users can sign up, log in, and access protected pages
```

### **Day 3-4: Email System** 📧
```
Setup (Day 3 Morning):
✓ Create Resend account
✓ Get API key
✓ Add RESEND_API_KEY secret

Backend (Day 3):
✓ Install Resend
✓ Create email-service.tsx
✓ Create 4 email templates:
  - Welcome email
  - Order confirmation
  - Order status update
  - Product delivery
✓ Create POST /emails/send endpoint
✓ Log emails to database

Integration (Day 4):
✓ Send welcome email on signup
✓ Send confirmation on order create
✓ Send status update on order change
✓ Update admin emails page

Deliverable: Automated emails sent for all key events
```

### **Day 5-6: Product Delivery** 📦
```
Backend (Day 5):
✓ Update Order schema (add deliveryData)
✓ Create PUT /orders/:id/delivery endpoint
✓ Create GET /orders/:id/delivery endpoint
✓ Add security checks (user owns order)

Admin UI (Day 5):
✓ Add delivery form to AdminOrderDetailsPage
✓ Support product types:
  - Game codes
  - Account credentials
  - Download links
✓ Bulk code upload
✓ Save & deliver button

User UI (Day 6):
✓ Create DeliveryModal.tsx
✓ Add "View Details" button to completed orders
✓ Show codes/credentials
✓ Add copy buttons
✓ Trigger delivery email on save

Deliverable: Complete product delivery system
```

### **Day 7-8: Payment Verification** 💳
```
Backend (Day 7):
✓ Create POST /payment/webhook endpoint
✓ Add webhook signature verification
✓ Create GET /payment/check/:orderId
✓ Create POST /payment/manual-verify (admin)
✓ Auto-update orders on payment
✓ Send confirmation email

Frontend (Day 8):
✓ Update PaymentModal with polling
✓ Poll /payment/check every 5 seconds
✓ Show "Waiting for payment..."
✓ Auto-redirect on success
✓ Add timeout (10 min)

Admin UI (Day 8):
✓ Add manual verification form
✓ Transaction ID input
✓ "Mark as Paid" button

Deliverable: Automated payment verification + manual fallback
```

### **Day 9: Admin Security** 🔒
```
Backend:
✓ Update /admin-login to return JWT
✓ Create verifyAdminToken middleware
✓ Protect all admin routes
✓ Create initial super admin

Frontend:
✓ Create AdminAuthContext.tsx
✓ Create adminFetch utility
✓ Update all admin pages to use adminFetch
✓ Update AdminLoginPage
✓ Add logout functionality
✓ Handle token expiry

Deliverable: Secure admin access with JWT
```

---

## 🎯 MVP Feature Priority

### Must Have (Day 1-6)
1. ✅ User Auth (signup, login)
2. ✅ Email System (confirmations)
3. ✅ Product Delivery (codes/credentials)

### Should Have (Day 7-9)
4. ✅ Payment Verification (webhook)
5. ✅ Admin Security (JWT)

### Nice to Have (Post-MVP)
6. ⏳ Policy pages
7. ⏳ Image uploads
8. ⏳ Order notifications
9. ⏳ Analytics

---

## 🔧 Quick Start Commands

### Install Dependencies
```bash
# Backend will auto-install via npm: prefix
# Frontend uses install_package tool
```

### Environment Variables Needed
```env
RESEND_API_KEY=re_xxxxx
JWT_SECRET=your-secret-key-here
WEBHOOK_SECRET=your-webhook-secret
ADMIN_PASSWORD=your-admin-password
```

### Test URLs
```
User:
- /signup
- /login
- /orders (protected)
- /account (protected)

Admin:
- /admin/login
- /admin/orders
- /admin/products
```

---

## 📋 Daily Checklist

### Start of Day
```
[ ] Pull latest code
[ ] Review plan for the day
[ ] Set up environment variables (if needed)
[ ] Run backend server
[ ] Open browser dev tools
```

### End of Day
```
[ ] Test implemented features
[ ] Commit code with clear message
[ ] Update progress in ROADMAP.md
[ ] Note any blockers for next day
[ ] Push code to repository
```

---

## 🚨 Common Issues & Solutions

### Issue: JWT Token not working
```
Solution:
1. Check JWT_SECRET is set
2. Verify token format: "Bearer {token}"
3. Check token expiry
4. Console.log the token
```

### Issue: Emails not sending
```
Solution:
1. Verify RESEND_API_KEY is correct
2. Check Resend dashboard for errors
3. Check "from" email is verified
4. Test with your own email first
```

### Issue: Payment webhook not working
```
Solution:
1. Use manual verification for testing
2. Simulate webhook with Postman
3. Check signature verification
4. Log webhook payload
```

### Issue: CORS errors
```
Solution:
1. Check backend CORS headers
2. Verify origin is allowed
3. Check credentials: 'include' if using cookies
```

---

## 🧪 Testing Checklist (End of Each Day)

### Day 1-2: Auth ✅
```
[ ] Signup with valid data → success
[ ] Signup with duplicate email → error
[ ] Login with valid creds → success
[ ] Login with invalid creds → error
[ ] Access protected route without login → redirect
[ ] Logout → clear session
```

### Day 3-4: Email ✅
```
[ ] Signup → receive welcome email
[ ] Place order → receive confirmation
[ ] Admin changes status → receive update
[ ] Check spam folder if not received
[ ] Email has correct branding
```

### Day 5-6: Delivery ✅
```
[ ] Admin adds codes → saved
[ ] User views completed order → sees codes
[ ] Copy button works
[ ] Delivery email sent
[ ] Only order owner can view
```

### Day 7-8: Payment ✅
```
[ ] Generate QR → order created
[ ] Simulate webhook → order updated
[ ] Poll endpoint → status changes
[ ] Manual verify → order completed
[ ] Confirmation email sent
```

### Day 9: Security ✅
```
[ ] Admin login → token returned
[ ] Access admin route with token → success
[ ] Access admin route without token → 401
[ ] Token expires → redirect to login
[ ] Logout → token cleared
```

---

## 📊 Progress Tracking

Mark with ✅ as you complete:

### Day 1: Auth Backend
- [ ] bcrypt + jwt installed
- [ ] /auth/signup endpoint
- [ ] /auth/login endpoint
- [ ] Password hashing
- [ ] JWT generation
- [ ] Tested with Postman

### Day 2: Auth Frontend
- [ ] AuthContext created
- [ ] SignupPage created
- [ ] LoginPage created
- [ ] AccountPage updated
- [ ] Routes added
- [ ] Full flow tested

### Day 3: Email Backend
- [ ] Resend account setup
- [ ] Email service created
- [ ] 4 templates created
- [ ] /emails/send endpoint
- [ ] Test email sent

### Day 4: Email Integration
- [ ] Welcome email on signup
- [ ] Order confirmation email
- [ ] Status update email
- [ ] Admin page updated
- [ ] All emails received

### Day 5: Delivery Backend + Admin
- [ ] Order schema updated
- [ ] Delivery endpoints created
- [ ] Admin form added
- [ ] Bulk upload works
- [ ] Save triggers email

### Day 6: Delivery User UI
- [ ] DeliveryModal created
- [ ] MyOrders updated
- [ ] Copy buttons work
- [ ] Full flow tested
- [ ] Delivery email received

### Day 7: Payment Backend
- [ ] Webhook endpoint created
- [ ] Signature verification
- [ ] Check endpoint created
- [ ] Manual verify endpoint
- [ ] Tested with simulation

### Day 8: Payment Frontend
- [ ] PaymentModal updated
- [ ] Polling implemented
- [ ] Success animation
- [ ] Admin manual verify UI
- [ ] Full payment flow tested

### Day 9: Admin Security
- [ ] JWT middleware created
- [ ] All routes protected
- [ ] AdminAuthContext created
- [ ] adminFetch utility
- [ ] All admin pages updated
- [ ] Token expiry handled

---

## 🎉 Launch Day Checklist

Before announcing to users:

### Technical
- [ ] All 5 features implemented
- [ ] Full user journey tested (signup → buy → receive)
- [ ] All emails sending correctly
- [ ] Admin panel accessible and secure
- [ ] Error handling on all pages
- [ ] Mobile responsive

### Content
- [ ] Welcome email reviewed
- [ ] Order confirmation email reviewed
- [ ] Delivery email reviewed
- [ ] Help & Support page updated
- [ ] FAQs accurate

### Business
- [ ] At least 5 products added with stock
- [ ] Prices verified
- [ ] Payment gateway configured
- [ ] Refund policy clear
- [ ] Support email monitored

### Security
- [ ] All passwords hashed
- [ ] JWT tokens working
- [ ] Admin routes protected
- [ ] Webhooks verified
- [ ] HTTPS enabled

---

## 💬 Need Help?

### During Implementation:
1. Check `/IMPLEMENTATION_PLAN.md` for detailed specs
2. Review `/TODO.md` for complete task list
3. Check console logs for errors
4. Test each feature before moving to next

### Debugging:
```javascript
// Add extensive logging
console.log('Step 1: User data received:', userData);
console.log('Step 2: Password hashed');
console.log('Step 3: Token generated:', token);
```

### Stuck?
- Start with simplest version first
- Use mock data for testing
- Skip optional features for MVP
- Payment can use manual verification initially

---

**You've got this! 🚀**

**Remember:**
- Take breaks
- Test as you go
- Commit often
- One feature at a time
- Mobile-first always

Ready to start? **Begin with Day 1: User Authentication**
