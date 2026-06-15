# Error Handling System

This document explains the comprehensive error handling system implemented in Nesubs.

## Components

### 1. ErrorPage (`/src/app/components/ErrorPage.tsx`)
A beautiful, mobile-first error page for user-facing routes that catches and displays routing errors.

**Features:**
- Mobile-optimized design matching Nesubs branding (#0A64BC)
- Displays error status codes (404, 500, etc.)
- Context-aware messaging (different for 404 vs other errors)
- Quick actions: Go Home, Refresh Page, Go Back, Contact Support
- Development mode: Shows stack traces for debugging
- Smart detection of navigation history to show/hide "Go Back" button

### 2. AdminErrorPage (`/src/app/components/AdminErrorPage.tsx`)
A clean, professional error page for admin routes with desktop-optimized layout.

**Features:**
- Light theme with black accents matching admin dashboard
- Grid layout for action buttons
- Links to Dashboard and Settings
- Development mode debug information
- Professional error messaging

### 3. ErrorBoundary (`/src/app/components/ErrorBoundary.tsx`)
A React class component that can be wrapped around any part of the app to catch JavaScript errors.

**Features:**
- Catches errors in child components
- Customizable fallback UI via `fallback` prop
- "Try Again" button to reset error state
- Works anywhere in the component tree
- Development mode stack traces

## Implementation

### Route-Level Error Handling

Errors in routes are caught by the `errorElement` prop in React Router:

```tsx
// User routes
{
  path: "/",
  Component: Layout,
  errorElement: <ErrorPage />,
  children: [...]
}

// Admin routes
{
  path: "/admin",
  errorElement: <AdminErrorPage />,
  children: [...]
}
```

### Component-Level Error Handling

Wrap any component with ErrorBoundary to catch errors:

```tsx
import { ErrorBoundary } from "./components/ErrorBoundary";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Or with custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

## Error Types Handled

1. **404 Not Found**: Custom messaging encouraging users to go home or search
2. **500 Server Errors**: Technical error messages with support contact options
3. **JavaScript Errors**: Runtime errors caught by ErrorBoundary
4. **Route Errors**: Navigation or data loading errors caught by errorElement

## User Experience

### Mobile (User-Facing)
- Centered layout with gradient background
- Large, touch-friendly action buttons (44px min height)
- Brand color (#0A64BC) for primary actions
- Contextual help text
- Smooth animations on button press

### Desktop (Admin)
- Professional card-based layout
- Color-coded error types (blue for 404, red for errors)
- Grid layout for multiple actions
- Quick access to Dashboard and Settings

## Testing

To test the error pages:

1. **404 Error**: Navigate to `/nonexistent-page`
2. **Admin 404**: Navigate to `/admin/nonexistent-page`
3. **JavaScript Error**: Create a component that throws an error and wrap it in ErrorBoundary

## Development Mode

In development, error pages show additional debug information:
- Full error messages
- Stack traces
- Component trees (where applicable)

This information is automatically hidden in production builds.
