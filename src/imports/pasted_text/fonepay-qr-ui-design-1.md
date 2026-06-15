Design a modern fintech dashboard and dynamic QR payment system UI for a Nepal-based application integrating Fonepay Dynamic QR payments.

The UI must strictly follow Fonepay’s API-based workflow (QR generation + WebSocket payment tracking). Avoid Stripe-style webhook assumptions.

---

1. PAYMENT GATEWAY CONFIGURATION PAGE (ADMIN)

Create a clean card-based settings page with the following fields:

Section: Gateway Configuration

* Gateway Provider (readonly): Fonepay (Dynamic QR)

* Merchant Code (text input)

* Username (text input)

* Password (password input)

* Secret Key (secure/password input)

Helper text:
"Credentials are provided by Fonepay or your bank. Secret Key is used for secure HMAC signature generation."

* Environment selector:

  * Sandbox (Dev)
  * Live (Production)

* Gateway Status toggle:

  * Active / Disabled

* Button: "Test Connection"

  * Simulates API request and shows result:

    * Success: "Connection Verified"
    * Error: "Invalid Credentials"

* Connection Status Display:

  * API Reachable: Yes/No
  * Credentials Valid: Yes/No
  * Last Tested: Timestamp

---

2. PAYMENT RULES & AUTOMATION

Create a separate settings card:

* Enable Dynamic QR (toggle)

* QR Expiry Time:

  * Input (number)
  * Unit: Minutes

* Auto Cancel Unpaid Orders:

  * Toggle
  * Cancel after (minutes input)

* Auto Confirm Payment:
  Label:
  "Auto confirm payment after successful Fonepay verification (via WebSocket or status API)"

* Transaction Fee (%) [optional input]

---

3. CREATE PAYMENT / BILLING PAGE

Design a simple form interface:

* Amount (NPR) input

* Remarks 1 (text input, required)

* Remarks 2 (text input, optional)

* Generate QR button

On click:

* Show loading state: "Generating QR..."

After generation:

* Display:

  * PRN (unique transaction ID)
  * Status: Pending

---

4. QR PAYMENT SCREEN (USER-FACING)

Design a centered, clean payment screen:

* Large QR Code (generated dynamically from backend qrMessage)

Below QR:

* Merchant Name
* Amount (NPR)
* Remarks

Add real-time status section:

* Status badge:

  * Waiting for Scan (default)
  * QR Verified (user scanned)
  * Payment Successful
  * Payment Failed

* Animated indicator for live updates

* Countdown Timer:
  "QR expires in X minutes"

* Buttons:

  * Refresh Status
  * Regenerate QR

---

5. REAL-TIME PAYMENT STATUS (IMPORTANT UX)

Clearly indicate system uses:

* WebSocket for live updates
* Backup polling via status API

Add small note:
"Payment status updates automatically in real-time"

---

6. PAYMENT SUCCESS SCREEN

* Large success icon (green)
* Message: "Payment Completed Successfully"

Display:

* PRN (Transaction ID)
* Amount
* Date & Time

Optional:

* Button: "Back to Dashboard"

---

7. PAYMENT FAILED SCREEN

* Red icon
* Message: "Payment Failed or Cancelled"

Display:

* PRN
* Amount

Button:

* Retry Payment

---

8. PAYMENT HISTORY TABLE (DASHBOARD)

Columns:

* PRN
* Amount
* Remarks
* Status:

  * Pending
  * Verified
  * Success
  * Failed
* Date

Add filters:

* Status dropdown
* Date range picker

---

9. DESIGN STYLE

* Clean fintech UI

* Rounded cards, soft shadows

* Minimal and professional

* Color system:

  * Yellow → Pending
  * Blue → Verified
  * Green → Success
  * Red → Failed

* Mobile responsive layout

---

IMPORTANT IMPLEMENTATION NOTES (FOR DESIGN CONTEXT)

* QR is generated from backend API response (qrMessage)

* Do NOT design static QR codes

* Do NOT include webhook-based flow

* System uses:

  * HMAC SHA512 signing (backend only)
  * WebSocket for live payment updates
  * API fallback for status check

* Secret Key must never be exposed in frontend

---

Goal:
Design a production-ready Fonepay dynamic QR billing system UI that supports real-time payment tracking and secure merchant configuration.
