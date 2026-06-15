Create 4 Card Sections stacked vertically with spacing between them.

SECTION 1: Payment Gateway Configuration

Card Title:
Payment Gateway Configuration

Fields:

Gateway Provider (Dropdown)
Options:

NepalPay (Dynamic QR)

FonePay

eSewa

Khalti

Merchant ID (Text Input)
Placeholder: Provided by Bank

API Key (Password Input with Show/Hide toggle)

API Secret (Password Input with Show/Hide toggle)

Environment (Dropdown)
Options:

Sandbox

Production

Gateway Status (Toggle Switch)
Label: Active / Disabled

Primary Button:
Save Gateway

Add helper text under API fields:
"Credentials provided by your bank or payment provider."

SECTION 2: Payment Rules & Automation

Card Title:
Payment Rules & Automation

Fields:

Enable Dynamic QR (Toggle Switch)

QR Expiry Time
Number Input
Suffix: Minutes
Default value: 10

Auto Cancel Unpaid Orders (Toggle)
If ON → show:
Cancel after (Number Input)
Suffix: Minutes

Auto Confirm Payment (Toggle)
Helper text:
"Automatically mark order as Paid after successful bank callback."

Transaction Fee (%)
Number Input
Placeholder: Optional

Primary Button:
Save Rules

SECTION 3: Bank Webhook / Callback

Card Title:
Bank Callback Configuration

Display read-only input field:

https://yourdomain.com/api/payment/webhook

Buttons:

Copy URL

Regenerate Secret

Add small info text:
"Provide this URL to your bank to receive payment confirmation events."

SECTION 4: Gateway Connection Status

Card Title:
Connection Status

Display:

Last API Test: 12 Feb 2026, 10:45 AM

Status Badge:
Green: Connected
Red: Not Connected

Button:
Test Connection

DESIGN REQUIREMENTS:

Use modern admin dashboard style

Neutral background (#F8F9FA)

White cards with soft shadow

Rounded corners (8px radius)

Clear section spacing (24px–32px)

Use status badges with color coding:
Green = Paid/Connected
Yellow = Pending
Red = Failed
Gray = Disabled

Use consistent input component style

Toggle switches should be modern pill style

Buttons:
Primary = solid brand color
Secondary = outline style

Also design component states:

Empty State:
"No Gateway Configured Yet"
Show illustration + Setup Gateway button

Error State:
Show red error message below API Key:
"Invalid API Credentials"

Success State:
Show green inline message:
"Gateway Connected Successfully"

Make the design scalable and ready for Supabase backend integration.

Use professional fintech SaaS UI style.