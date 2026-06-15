# 🎯 Critical Features - Implementation Plan

**Goal:** Launch-ready Nesubs platform with complete user functionality  
**Timeline:** 6-9 days  
**Features:** 5 Critical User-Facing Features

---

## 📋 Implementation Order & Dependencies

```
Day 1-2: User Authentication (Foundation for everything)
  ↓
Day 3-4: Email System (Needed for delivery & notifications)
  ↓
Day 5-6: Product Delivery System (Core business logic)
  ↓
Day 7-8: Payment Verification (Complete purchase flow)
  ↓
Day 9: Admin Security (Final security hardening)
```

---

# 🔐 FEATURE 1: User Authentication System

**Priority:** CRITICAL (Day 1-2)  
**Dependencies:** None (Must be first)  
**Estimated Time:** 2-3 days

## Technical Specifications

### Database Schema (KV Store)
```typescript
// Key: user:{userId}
interface User {
  id: string;                    // UUID
  email: string;                 // Unique
  password: string;              // Hashed with bcrypt
  name: string;
  phone?: string;
  role: 'user' | 'admin';       // For RBAC
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Key: user:email:{email} → userId (for email lookup)
// Key: session:{sessionId} → userId (for session management)
```

### Backend API Endpoints

#### 1. POST /auth/signup
```typescript
Request: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

Response: {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string; // JWT token
}
```

#### 2. POST /auth/login
```typescript
Request: {
  email: string;
  password: string;
}

Response: {
  success: boolean;
  user: User;
  token: string;
}
```

#### 3. POST /auth/logout
```typescript
Request: {
  headers: { Authorization: "Bearer {token}" }
}

Response: {
  success: boolean;
  message: string;
}
```

#### 4. GET /auth/me
```typescript
Request: {
  headers: { Authorization: "Bearer {token}" }
}

Response: {
  success: boolean;
  user: User;
}
```

#### 5. PUT /auth/profile
```typescript
Request: {
  name?: string;
  phone?: string;
  currentPassword?: string; // Required if changing password
  newPassword?: string;
}

Response: {
  success: boolean;
  user: User;
}
```

#### 6. POST /auth/forgot-password
```typescript
Request: {
  email: string;
}

Response: {
  success: boolean;
  message: "Password reset email sent";
}
```

### Frontend Components

#### 1. `/src/app/pages/SignupPage.tsx`
```tsx
Features:
- Email, password, name, phone inputs
- Password strength indicator
- Terms & Privacy checkbox
- "Already have account? Login" link
- Validation (email format, password min 8 chars)
- Mobile-first design with brand colors
```

#### 2. `/src/app/pages/LoginPage.tsx`
```tsx
Features:
- Email and password inputs
- "Show/hide password" toggle
- "Forgot password?" link
- "Don't have account? Sign up" link
- Remember me checkbox
- Mobile-first design
```

#### 3. `/src/app/pages/ForgotPasswordPage.tsx`
```tsx
Features:
- Email input
- Send reset link button
- Back to login link
```

#### 4. `/src/app/contexts/AuthContext.tsx`
```tsx
Context provides:
- user: User | null
- loading: boolean
- login: (email, password) => Promise<void>
- signup: (data) => Promise<void>
- logout: () => Promise<void>
- updateProfile: (data) => Promise<void>

Stores token in: localStorage (or httpOnly cookie for security)
Auto-refreshes on app load
```

#### 5. Update `/src/app/pages/AccountPage.tsx`
```tsx
Changes:
- Remove hardcoded user data
- Use useAuth() hook to get real user
- Show "Login" button if not authenticated
- Add logout button
- Add edit profile functionality
```

#### 6. `/src/app/components/ProtectedRoute.tsx`
```tsx
Purpose:
- Wrap routes that require authentication
- Redirect to /login if not authenticated
- Show loading spinner while checking auth
```

### Implementation Steps

**Step 1: Backend Auth System**
```
File: /supabase/functions/server/auth.tsx

1. Install dependencies: bcrypt for password hashing, jsonwebtoken for JWT
2. Create signup endpoint:
   - Validate email format
   - Check if email already exists
   - Hash password with bcrypt
   - Create user in KV store
   - Create email lookup: user:email:{email}
   - Generate JWT token
   - Return user + token

3. Create login endpoint:
   - Find user by email
   - Compare password with bcrypt
   - Update lastLoginAt
   - Generate JWT token
   - Return user + token

4. Create middleware to verify JWT tokens
5. Create /auth/me endpoint (get current user)
6. Create /auth/profile endpoint (update user)
7. Create /auth/logout endpoint (invalidate session)
```

**Step 2: Frontend Auth Context**
```
File: /src/app/contexts/AuthContext.tsx

1. Create AuthContext with user state
2. Create login function (call backend, store token)
3. Create signup function
4. Create logout function (clear token, clear state)
5. Auto-load user on app mount (check token)
6. Export useAuth() hook
```

**Step 3: Frontend Pages**
```
1. Create SignupPage.tsx
   - Form with validation
   - Call signup from AuthContext
   - Redirect to home on success
   - Show errors

2. Create LoginPage.tsx
   - Form with validation
   - Call login from AuthContext
   - Redirect to previous page on success

3. Create ForgotPasswordPage.tsx (basic version)

4. Update AccountPage.tsx
   - Use real user from AuthContext
   - Add logout button
   - Add edit profile form
```

**Step 4: Routes & Protection**
```
File: /src/app/routes.tsx

1. Add /signup route
2. Add /login route
3. Add /forgot-password route
4. Wrap /orders route with ProtectedRoute
5. Wrap /account route with ProtectedRoute
6. Update App.tsx to wrap with AuthProvider
```

**Step 5: Integration**
```
1. Update PaymentModal to use real user email
2. Update orders to associate with user ID
3. Update MyOrdersPage to filter by current user
```

---

# 📧 FEATURE 2: Email Sending System

**Priority:** CRITICAL (Day 3-4)  
**Dependencies:** User Authentication  
**Estimated Time:** 1-2 days

## Technical Specifications

### Email Service Options

**Option 1: Resend (Recommended)**
- Free tier: 3,000 emails/month
- Simple API
- Great deliverability
- No SMTP configuration needed

**Option 2: SendGrid**
- Free tier: 100 emails/day
- More complex setup

**We'll use Resend**

### Email Templates

#### 1. Order Confirmation Email
```typescript
Template: order-confirmation
Subject: "Order Confirmed - {orderNumber}"

Content:
- Order number
- Product name + package
- Price
- Payment method
- Estimated delivery time
- Order status link
- Support contact info
```

#### 2. Order Status Update Email
```typescript
Template: order-status-update
Subject: "Order Update - {orderNumber} is now {status}"

Content:
- Order number
- New status (Processing/Completed/Cancelled)
- Status-specific message
- Next steps
- View order link
```

#### 3. Product Delivery Email
```typescript
Template: product-delivery
Subject: "Your {productName} is Ready!"

Content:
- Order number
- Product name
- Delivery codes/credentials
- Instructions for use
- Support contact
- Warning: Don't share codes
```

#### 4. Welcome Email (Signup)
```typescript
Template: welcome
Subject: "Welcome to Nesubs! 🎉"

Content:
- Welcome message
- Quick start guide
- Browse products link
- Support info
```

### Database Schema

```typescript
// Key: email:{emailId}
interface Email {
  id: string;
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>; // Template variables
  status: 'sent' | 'failed' | 'pending';
  sentAt?: string;
  error?: string;
  orderId?: string;
  userId?: string;
}
```

### Backend API Endpoints

#### POST /emails/send
```typescript
Request: {
  to: string;
  template: 'order-confirmation' | 'order-status-update' | 'product-delivery' | 'welcome';
  data: Record<string, any>;
  orderId?: string;
  userId?: string;
}

Response: {
  success: boolean;
  emailId: string;
  message: string;
}
```

#### GET /emails (Admin only)
Already exists, just needs to show real sent emails

### Implementation Steps

**Step 1: Install Resend**
```bash
# In backend
npm:resend
```

**Step 2: Add API Key**
```
1. Get API key from resend.com
2. Store in environment variable: RESEND_API_KEY
3. Use create_supabase_secret tool to let user add key
```

**Step 3: Create Email Service**
```typescript
File: /supabase/functions/server/email-service.tsx

1. Import Resend
2. Create sendEmail function:
   - Accept template name + data
   - Load HTML template
   - Replace variables in template
   - Send via Resend API
   - Log to database (email:*)
   - Return result

3. Create email templates:
   - orderConfirmation(data)
   - orderStatusUpdate(data)
   - productDelivery(data)
   - welcome(data)
```

**Step 4: Create Email Route**
```typescript
File: /supabase/functions/server/emails.tsx

1. POST /emails/send
   - Validate input
   - Call email service
   - Return result

2. Update GET /emails
   - Already exists
   - Now shows real emails
```

**Step 5: Integrate with Orders**
```typescript
File: /supabase/functions/server/orders.tsx

1. When order is created (POST /orders):
   - Send order confirmation email
   
2. When order status changes (PUT /orders/:id/status):
   - Send status update email
   
3. When order is completed:
   - Send product delivery email (with codes)
```

**Step 6: Integrate with Auth**
```typescript
File: /supabase/functions/server/auth.tsx

1. When user signs up:
   - Send welcome email
```

**Step 7: Email Templates HTML**
```
Create HTML templates with inline CSS
Use Nesubs brand colors (#0A64BC)
Mobile-responsive
Clear CTAs
```

---

# 📦 FEATURE 3: Digital Product Delivery System

**Priority:** CRITICAL (Day 5-6)  
**Dependencies:** User Auth, Email System  
**Estimated Time:** 1-2 days

## Technical Specifications

### Database Schema

```typescript
// Add to Order interface
interface Order {
  // ... existing fields
  deliveryData?: {
    codes?: string[];          // Array of codes (e.g., game keys)
    credentials?: {            // Or credentials object
      username?: string;
      password?: string;
      accountEmail?: string;
    };
    instructions?: string;      // How to use the product
    expiresAt?: string;        // If product has expiry
    downloadUrl?: string;      // If it's a downloadable file
    deliveredAt?: string;      // Timestamp of delivery
  };
  deliveryStatus: 'pending' | 'delivered' | 'failed';
}
```

### Admin Functionality

#### 1. Add Delivery Data UI
```
Location: /admin/orders/:id (AdminOrderDetailsPage)

Add section when order is in "processing" or "completed":

[Delivery Information]
┌─────────────────────────────────────┐
│ Product Type: [Dropdown]            │
│   - Game Code                       │
│   - Account Credentials             │
│   - Download Link                   │
│   - Subscription Access             │
├─────────────────────────────────────┤
│ If "Game Code":                     │
│   Code: [________]                  │
│   Add Another [+]                   │
├─────────────────────────────────────┤
│ If "Account Credentials":           │
│   Email: [________]                 │
│   Password: [________]              │
│   Username: [________]              │
├─────────────────────────────────────┤
│ If "Download Link":                 │
│   URL: [________]                   │
│   Expires: [Date Picker]            │
├─────────────────────────────────────┤
│ Instructions:                       │
│ [Textarea]                          │
│                                     │
│ [Save & Deliver] [Save as Draft]   │
└─────────────────────────────────────┘
```

#### 2. Bulk Code Upload
```
[Upload Multiple Codes]
┌─────────────────────────────────────┐
│ Paste codes (one per line):        │
│ ┌─────────────────────────────────┐ │
│ │ CODE1-XXXX-XXXX                 │ │
│ │ CODE2-XXXX-XXXX                 │ │
│ │ CODE3-XXXX-XXXX                 │ │
│ └─────────────────────────────────┘ │
│ [Upload CSV] [Import]              │
└─────────────────────────────────────┘
```

### User Functionality

#### 1. View Delivery in MyOrdersPage
```tsx
When order is completed, show:

[✓ Completed Order]
┌─────────────────────────────────────┐
│ Product Name                        │
│ Package: Premium                    │
│ Rs. 1,500                          │
│                                     │
│ [View Product Details] ← NEW       │
└─────────────────────────────────────┘

Clicking opens delivery modal
```

#### 2. Delivery Modal Component
```tsx
Component: /src/app/components/DeliveryModal.tsx

Features:
- Show product codes with copy button
- Show credentials with copy buttons
- Show download link with download button
- Show instructions
- Show expiry date if applicable
- Warning: "Don't share your codes"
- Support button
```

### Backend API Endpoints

#### PUT /orders/:id/delivery
```typescript
Request: {
  deliveryData: {
    codes?: string[];
    credentials?: {
      username?: string;
      password?: string;
      accountEmail?: string;
    };
    instructions?: string;
    expiresAt?: string;
    downloadUrl?: string;
  }
}

Response: {
  success: boolean;
  message: string;
  order: Order;
}

Actions:
1. Update order with delivery data
2. Set deliveryStatus = 'delivered'
3. Set status = 'completed' if not already
4. Set completedAt timestamp
5. Send product delivery email
```

#### GET /orders/:id/delivery (User-facing)
```typescript
Request: {
  headers: { Authorization: "Bearer {token}" }
}

Response: {
  success: boolean;
  delivery: {
    codes?: string[];
    credentials?: {...};
    instructions?: string;
    expiresAt?: string;
    downloadUrl?: string;
    deliveredAt: string;
  }
}

Security:
- Verify user owns this order
- Only return if order is completed
```

### Implementation Steps

**Step 1: Update Order Schema**
```typescript
File: /supabase/functions/server/orders.tsx

1. Add deliveryData field to Order interface
2. Add deliveryStatus field
3. Update validation
```

**Step 2: Create Delivery API Endpoint**
```typescript
1. PUT /orders/:id/delivery
   - Validate admin access
   - Update order with delivery data
   - Trigger delivery email
   - Return updated order

2. GET /orders/:id/delivery
   - Verify user authentication
   - Verify user owns order
   - Return delivery data only if completed
```

**Step 3: Admin UI - Add Delivery Form**
```tsx
File: /src/app/pages/admin/AdminOrderDetailsPage.tsx

1. Add "Delivery Information" section
2. Create form with different product types
3. Handle form submission
4. Call PUT /orders/:id/delivery
5. Show success/error messages
6. Disable form after delivery
```

**Step 4: User UI - Delivery View**
```tsx
1. Create DeliveryModal.tsx component
2. Update MyOrdersPage.tsx:
   - Add "View Details" button for completed orders
   - Open DeliveryModal on click
   - Fetch delivery data
3. Style with brand colors
4. Add copy buttons for codes
```

**Step 5: Email Integration**
```typescript
File: /supabase/functions/server/email-service.tsx

1. Create productDelivery template
2. Include delivery codes/credentials
3. Add security warnings
4. Trigger on delivery save
```

---

# 💳 FEATURE 4: Payment Verification System

**Priority:** CRITICAL (Day 7-8)  
**Dependencies:** Email System  
**Estimated Time:** 2-3 days

## Technical Specifications

### Payment Flow

```
User: Click "Buy Now"
  ↓
Frontend: Generate QR with order ID
  ↓
Backend: Create pending order + QR data
  ↓
User: Scans QR & pays via Nepal Pay app
  ↓
Nepal Pay: Sends webhook to /payment/webhook
  ↓
Backend: Verify signature, update order status
  ↓
Backend: Send confirmation email
  ↓
Admin: See new order notification
```

### Webhook Handling

#### POST /payment/webhook (Public endpoint)
```typescript
Request: {
  body: {
    orderId: string;
    transactionId: string;
    amount: number;
    status: 'success' | 'failed';
    timestamp: string;
  };
  headers: {
    'X-Webhook-Signature': string; // HMAC signature
  }
}

Response: {
  success: boolean;
  message: string;
}

Actions:
1. Verify webhook signature (security)
2. Find order by orderId
3. Verify amount matches
4. Update order status to 'processing' or 'completed'
5. Set transactionId
6. Send confirmation email
7. Log payment event
```

### Manual Verification (Admin)

For cases where webhook fails or manual payment:

```
Admin can verify payment manually:
1. Customer sends payment screenshot
2. Admin checks transaction ID in payment gateway dashboard
3. Admin clicks "Mark as Paid" in order details
4. System updates order status
```

### Payment Status Checking

#### GET /payment/check/:orderId
```typescript
Request: {
  orderId: string;
}

Response: {
  success: boolean;
  payment: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    transactionId?: string;
    paidAt?: string;
  }
}

Purpose: Frontend polls this endpoint every 5 seconds after QR shown
```

### Implementation Steps

**Step 1: Update Payment Backend**
```typescript
File: /supabase/functions/server/payment.tsx

1. Update POST /payment/generate-qr:
   - Create pending order immediately
   - Return order ID in QR data
   - Store QR-to-order mapping

2. Create POST /payment/webhook:
   - Verify webhook signature (HMAC)
   - Find order by ID
   - Verify amount
   - Update order status
   - Trigger email
   - Return success

3. Create GET /payment/check/:orderId:
   - Return current payment status
   - Used for polling

4. Create POST /payment/manual-verify (Admin only):
   - Allow admin to manually mark as paid
   - Require transaction ID
   - Update order
```

**Step 2: Frontend Payment Flow**
```tsx
File: /src/app/components/PaymentModal.tsx

Current state: Shows QR, manual "I've Paid" button
Update to:

1. Show QR code
2. Start polling /payment/check/:orderId every 5 seconds
3. Show loading state: "Waiting for payment..."
4. When status changes to 'completed':
   - Stop polling
   - Show success animation
   - Redirect to order details
5. Add timeout after 10 minutes
6. Keep "I've Paid" as backup (marks as processing)
```

**Step 3: Admin Manual Verification UI**
```tsx
File: /src/app/pages/admin/AdminOrderDetailsPage.tsx

For orders in 'pending' status, add section:

[Payment Verification]
┌─────────────────────────────────────┐
│ ⚠️ Payment Pending                 │
│                                     │
│ Transaction ID: [________]          │
│                                     │
│ [Mark as Paid] [Mark as Failed]    │
└─────────────────────────────────────┘
```

**Step 4: Webhook Security**
```typescript
File: /supabase/functions/server/payment.tsx

1. Generate webhook secret (stored in env)
2. Verify incoming webhook signature:
   - Get signature from header
   - Compute HMAC of request body
   - Compare with provided signature
   - Reject if mismatch

3. Add webhook logging:
   - Log all webhook attempts
   - Store in kv: webhook:log:{id}
   - Helps debugging
```

**Step 5: Payment Gateway Integration**

**Option A: Test/Demo Mode (For now)**
```
- Use mock webhook for testing
- Create admin button to simulate payment
- Good for development
```

**Option B: Real Integration (Production)**
```
Choose one:
1. Nepal Pay - contact for API access
2. eSewa - https://developer.esewa.com.np/
3. Khalti - https://docs.khalti.com/

Steps:
1. Register merchant account
2. Get API credentials
3. Store credentials in payment gateway settings
4. Implement their API
5. Configure webhook URL
6. Test in sandbox mode
7. Go live
```

**For MVP: Start with Option A (demo mode), plan for Option B**

---

# 🔒 FEATURE 5: Admin Security Enhancement

**Priority:** CRITICAL (Day 9)  
**Dependencies:** User Authentication  
**Estimated Time:** 1 day

## Technical Specifications

### JWT-Based Admin Auth

#### Current Problem
```typescript
// Current (INSECURE):
localStorage.getItem("adminLoggedIn") === "true"

// Anyone can bypass:
localStorage.setItem("adminLoggedIn", "true")
```

#### Solution: JWT Tokens
```typescript
// Secure:
1. Admin logs in → Backend verifies → Returns JWT token
2. Token stored in localStorage (or httpOnly cookie)
3. Every admin API call includes token in header
4. Backend verifies token before processing
5. Token expires after 24 hours
6. Refresh token for extended sessions
```

### Admin User Management

#### Database Schema
```typescript
// Key: admin:{adminId}
interface Admin {
  id: string;
  email: string;
  password: string; // Hashed
  name: string;
  role: 'super_admin' | 'admin' | 'support';
  permissions: string[]; // ['orders.view', 'orders.edit', 'products.edit']
  status: 'active' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
}
```

### Backend Updates

#### 1. Update POST /admin-login
```typescript
Current: Checks hardcoded credentials
Update to:
1. Query admin from database by email
2. Compare password with bcrypt
3. Generate JWT token with:
   - adminId
   - email
   - role
   - expires in 24h
4. Return token
5. Update lastLoginAt
```

#### 2. Create Admin Auth Middleware
```typescript
File: /supabase/functions/server/middleware/adminAuth.tsx

Function: verifyAdminToken(token: string)
1. Decode JWT token
2. Verify signature
3. Check expiration
4. Load admin from database
5. Check status is 'active'
6. Return admin object

Usage:
app.get('/admin/*', async (c) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  const admin = await verifyAdminToken(token);
  if (!admin) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  // Continue with request
});
```

#### 3. Protect All Admin Routes
```typescript
Routes to protect:
- GET/POST/PUT/DELETE /categories
- GET/POST/PUT/DELETE /products
- GET/PUT /orders
- GET/POST/PUT /users
- PUT /website-content
- GET/POST /payment/gateway-config
- GET /emails

Add middleware to verify admin token on all these routes
```

### Frontend Updates

#### 1. Update AdminLoginPage
```tsx
File: /src/app/pages/admin/AdminLoginPage.tsx

Changes:
1. On successful login:
   - Store JWT token: localStorage.setItem('adminToken', token)
   - Store admin info: localStorage.setItem('adminUser', JSON.stringify(user))
   - Remove: localStorage.setItem('adminLoggedIn', 'true')

2. Add token expiry handling
3. Add "Session expired" message
```

#### 2. Create Admin API Utility
```tsx
File: /src/app/utils/adminApi.ts

Purpose: Centralized admin API calls with auth

export async function adminFetch(url: string, options?: RequestInit) {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    window.location.href = '/admin/login';
    throw new Error('No admin token');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }

  return response;
}
```

#### 3. Update All Admin Pages
```tsx
Replace all fetch() calls in admin pages with adminFetch()

Files to update:
- AdminCategoriesPage.tsx
- AdminProductsPage.tsx
- AdminOrdersPage.tsx
- AdminUsersPage.tsx
- AdminPaymentSettingsPage.tsx
- AdminWebsiteContentPage.tsx
- etc.
```

#### 4. Create AdminAuthProvider
```tsx
File: /src/app/contexts/AdminAuthContext.tsx

Similar to AuthContext but for admins:

interface AdminAuthContext {
  admin: Admin | null;
  loading: boolean;
  login: (email, password) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

Features:
- Auto-load admin on mount (verify token)
- Handle token refresh
- Provide admin info to all admin components
```

#### 5. Update Admin Layout
```tsx
File: /src/app/components/admin/AdminLayout.tsx

1. Use AdminAuthProvider
2. Show admin name in header
3. Add logout button
4. Redirect if not authenticated
```

### Role-Based Access Control (RBAC)

#### Permission System
```typescript
Permissions:
- orders.view
- orders.edit
- orders.delete
- products.view
- products.edit
- products.delete
- categories.manage
- users.view
- users.edit
- settings.edit
- emails.view

Roles:
- super_admin: All permissions
- admin: All except users.edit, settings.edit
- support: orders.view, orders.edit only
```

#### Check Permissions
```typescript
// Backend
function hasPermission(admin: Admin, permission: string): boolean {
  if (admin.role === 'super_admin') return true;
  return admin.permissions.includes(permission);
}

// Use in routes
app.delete('/products/:id', async (c) => {
  const admin = await verifyAdminToken(...);
  if (!hasPermission(admin, 'products.delete')) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  // Continue
});
```

### Implementation Steps

**Step 1: Backend JWT System**
```
1. Install: npm:jsonwebtoken, npm:bcrypt
2. Generate JWT secret (store in env)
3. Update /admin-login to return JWT
4. Create verifyAdminToken middleware
5. Apply middleware to all admin routes
```

**Step 2: Admin Database**
```
1. Create admin schema
2. Create initial super admin:
   - Email: admin@nesubs.com
   - Password: (user chooses)
3. Store in: admin:{adminId}
```

**Step 3: Frontend Token Management**
```
1. Update AdminLoginPage to store token
2. Create adminFetch utility
3. Replace all fetch in admin pages
4. Create AdminAuthProvider
5. Wrap admin routes with provider
```

**Step 4: Testing**
```
1. Test login with valid credentials
2. Test login with invalid credentials
3. Test token expiry (set short expiry for testing)
4. Test protected routes without token
5. Test protected routes with invalid token
6. Test logout
```

**Step 5: RBAC (Optional for MVP)**
```
Can be added later, but plan structure now:
1. Define permission constants
2. Add permissions check in routes
3. Hide UI elements based on permissions
```

---

## 📊 Implementation Checklist

### Day 1-2: User Authentication ✅
- [ ] Backend: Auth endpoints (signup, login, logout, profile)
- [ ] Backend: Password hashing with bcrypt
- [ ] Backend: JWT token generation
- [ ] Frontend: SignupPage.tsx
- [ ] Frontend: LoginPage.tsx
- [ ] Frontend: ForgotPasswordPage.tsx
- [ ] Frontend: AuthContext.tsx
- [ ] Frontend: Update AccountPage.tsx
- [ ] Frontend: ProtectedRoute.tsx
- [ ] Routes: Add auth routes
- [ ] Testing: Full auth flow

### Day 3-4: Email System ✅
- [ ] Setup: Resend account + API key
- [ ] Backend: Email service utility
- [ ] Backend: Email templates (4 templates)
- [ ] Backend: /emails/send endpoint
- [ ] Backend: Email logging to database
- [ ] Integration: Send email on order create
- [ ] Integration: Send email on order status change
- [ ] Integration: Send email on signup
- [ ] Frontend: Update admin emails page
- [ ] Testing: Send test emails

### Day 5-6: Product Delivery ✅
- [ ] Backend: Update Order schema with deliveryData
- [ ] Backend: PUT /orders/:id/delivery endpoint
- [ ] Backend: GET /orders/:id/delivery endpoint
- [ ] Admin: Add delivery form to OrderDetailsPage
- [ ] Admin: Support multiple product types (codes, credentials, links)
- [ ] Admin: Bulk code upload
- [ ] User: DeliveryModal.tsx component
- [ ] User: Update MyOrdersPage with "View Details"
- [ ] User: Copy buttons for codes
- [ ] Integration: Trigger delivery email
- [ ] Testing: Full delivery flow

### Day 7-8: Payment Verification ✅
- [ ] Backend: POST /payment/webhook endpoint
- [ ] Backend: Webhook signature verification
- [ ] Backend: GET /payment/check/:orderId endpoint
- [ ] Backend: POST /payment/manual-verify endpoint
- [ ] Backend: Payment logging
- [ ] Frontend: Update PaymentModal with polling
- [ ] Frontend: Auto-detect payment completion
- [ ] Frontend: Success animation
- [ ] Admin: Manual payment verification UI
- [ ] Admin: Transaction ID input
- [ ] Testing: Webhook simulation
- [ ] Testing: Manual verification

### Day 9: Admin Security ✅
- [ ] Backend: JWT token system
- [ ] Backend: Admin database schema
- [ ] Backend: verifyAdminToken middleware
- [ ] Backend: Apply middleware to all admin routes
- [ ] Backend: Create initial super admin
- [ ] Frontend: AdminAuthContext.tsx
- [ ] Frontend: adminFetch utility
- [ ] Frontend: Update all admin pages to use adminFetch
- [ ] Frontend: Update AdminLoginPage token handling
- [ ] Frontend: Update AdminLayout with logout
- [ ] Testing: Token verification
- [ ] Testing: Token expiry handling

---

## 🧪 Testing Strategy

### Unit Tests (Optional but recommended)
```
- Auth functions (signup, login, password hashing)
- Email templates
- JWT token generation/verification
- Payment webhook signature verification
```

### Integration Tests (Essential)
```
Test Scenarios:

1. User Signup → Login → Browse → Buy → Receive Product
2. Admin: Create product → User buys → Admin delivers → User receives
3. Payment: Generate QR → Pay → Webhook → Order complete → Email sent
4. Auth: Login → Token expires → Auto logout → Login again
5. Security: Try admin routes without token → Blocked
```

### Manual Testing Checklist
```
[ ] Signup with valid data
[ ] Signup with duplicate email (should fail)
[ ] Login with valid credentials
[ ] Login with invalid credentials (should fail)
[ ] Logout
[ ] Update profile
[ ] Browse products (authenticated)
[ ] Browse products (not authenticated)
[ ] Buy product (full flow)
[ ] Receive order confirmation email
[ ] Check order in My Orders
[ ] Admin: View new order
[ ] Admin: Add delivery codes
[ ] Receive delivery email
[ ] User: View delivery codes
[ ] Copy codes to clipboard
[ ] Payment webhook (simulate)
[ ] Manual payment verification
[ ] Admin login
[ ] Admin logout
[ ] Access admin without token (should redirect)
```

---

## 🚀 Deployment Checklist

### Environment Variables
```
Required secrets:
- RESEND_API_KEY (for emails)
- JWT_SECRET (for tokens)
- WEBHOOK_SECRET (for payment verification)
- ADMIN_PASSWORD (for initial super admin)
```

### Security Checklist
```
[ ] All admin routes protected with JWT
[ ] Passwords hashed with bcrypt
[ ] JWT tokens expire (24h)
[ ] Webhook signatures verified
[ ] User data validated on backend
[ ] SQL injection prevented (KV store handles this)
[ ] XSS prevention (React handles this)
[ ] CORS configured correctly
[ ] Rate limiting on auth endpoints (optional but recommended)
[ ] HTTPS enforced
```

### Performance Checklist
```
[ ] Database indexes for email lookups
[ ] Email sending is async (doesn't block request)
[ ] Payment polling timeout (10 minutes)
[ ] Token verification cached
[ ] Images optimized
```

---

## 📈 Success Metrics

After implementation, you should be able to:

✅ **User can:**
- Sign up and create account
- Log in and log out
- Buy a product and pay
- Receive order confirmation email
- Receive product codes/credentials
- View order history
- Access delivered products

✅ **Admin can:**
- Log in securely with JWT
- View new orders
- Add delivery codes to orders
- Mark orders as completed
- Verify payments manually
- View all emails sent

✅ **System can:**
- Send emails automatically
- Verify payments via webhook
- Deliver products automatically
- Secure admin routes with JWT
- Handle errors gracefully

---

## 💡 Tips for Implementation

1. **Work incrementally** - Complete one feature fully before moving to next
2. **Test as you go** - Don't wait till end to test
3. **Use console.log** - Debug backend with extensive logging
4. **Handle errors** - Every API call should have try/catch
5. **Mobile-first** - Test on mobile screen sizes
6. **Use TypeScript** - Define interfaces for all data structures
7. **Git commits** - Commit after each feature completion
8. **Ask for help** - If stuck on payment integration, use mock first

---

**Timeline Estimate:** 6-9 days (depends on experience level)  
**Difficulty:** Medium (Auth, Email: Easy | Payment: Medium | Security: Medium)  
**Recommended:** Start with Auth, then Email, then Delivery. Payment can be simplified for MVP.

Ready to start implementation? Which feature would you like to begin with?
