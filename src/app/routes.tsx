import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ErrorPage } from "./components/ErrorPage";
import { AdminErrorPage } from "./components/AdminErrorPage";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { AccountPage } from "./pages/AccountPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { MyOrdersPage } from "./pages/MyOrdersPage";
import { SettingsPage } from "./pages/SettingsPage";
import { HelpSupportPage } from "./pages/HelpSupportPage";
import { EmailInboxPage } from "./pages/EmailInboxPage";
import { EmailTestPage } from "./pages/EmailTestPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminAddProductPage } from "./pages/admin/AdminAddProductPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminOrderDetailsPage } from "./pages/admin/AdminOrderDetailsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminUserDetailsPage } from "./pages/admin/AdminUserDetailsPage";
import { AdminEmailsPage } from "./pages/admin/AdminEmailsPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { AdminPaymentHistoryPage } from "./pages/admin/AdminPaymentHistoryPage";
import { AdminWebsiteContentPage } from "./pages/admin/AdminWebsiteContentPage";
import { AdminNotFoundPage } from "./pages/admin/AdminNotFoundPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: HomePage },
      { path: "search", Component: SearchPage },
      { path: "account", Component: AccountPage },
      { path: "product/:id", Component: ProductDetailPage },
      { path: "orders", Component: MyOrdersPage },
      { path: "settings", Component: SettingsPage },
      { path: "email-inbox", Component: EmailInboxPage },
      { path: "email-test", Component: EmailTestPage },
      { path: "help", Component: HelpSupportPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "/admin",
    errorElement: <AdminErrorPage />,
    children: [
      { path: "login", Component: AdminLoginPage },
      { path: "dashboard", Component: AdminDashboardPage },
      { path: "categories", Component: AdminCategoriesPage },
      { path: "products", Component: AdminProductsPage },
      { path: "products/add", Component: AdminAddProductPage },
      { path: "products/edit/:id", Component: AdminAddProductPage },
      { path: "orders", Component: AdminOrdersPage },
      { path: "orders/:id", Component: AdminOrderDetailsPage },
      { path: "users", Component: AdminUsersPage },
      { path: "users/:id", Component: AdminUserDetailsPage },
      { path: "emails", Component: AdminEmailsPage },
      { path: "settings", Component: AdminSettingsPage },
      { path: "payment-history", Component: AdminPaymentHistoryPage },
      { path: "website-content", Component: AdminWebsiteContentPage },
      { path: "*", Component: AdminNotFoundPage },
    ],
  },
]);