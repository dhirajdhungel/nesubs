import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Mail,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { API_BASE_URL } from "../../utils/api";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHolidayMode, setIsHolidayMode] = useState(false);

  useEffect(() => {
    fetchHolidayMode();
    
    // Listen for custom event when holiday mode is toggled anywhere in the app
    const handleHolidayChange = () => fetchHolidayMode();
    window.addEventListener("holiday-mode-changed", handleHolidayChange);
    
    return () => {
      window.removeEventListener("holiday-mode-changed", handleHolidayChange);
    };
  }, []);

  const fetchHolidayMode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/website-content`);
      const data = await response.json();
      if (data.success && data.content?.holidayMode) {
        const config = data.content.holidayMode;
        if (config.enabled) {
          const now = new Date().getTime();
          const startTime = config.startNow ? 0 : new Date(config.startDate).getTime();
          const endTime = new Date(config.endDate).getTime();
          
          if (now >= startTime && now < endTime) {
            setIsHolidayMode(true);
          } else {
            setIsHolidayMode(false);
          }
        } else {
          setIsHolidayMode(false);
        }
      } else {
        setIsHolidayMode(false);
      }
    } catch (error) {
      console.error("Failed to fetch holiday mode status:", error);
    }
  };

  const adminEmail = localStorage.getItem("adminEmail") || "";
  const adminName = localStorage.getItem("adminName") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin/login");
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      icon: Tag,
      label: "Categories",
      href: "/admin/categories",
    },
    {
      icon: Package,
      label: "Products",
      href: "/admin/products",
    },
    {
      icon: ShoppingBag,
      label: "Orders",
      href: "/admin/orders",
    },
    {
      icon: CreditCard,
      label: "Payments",
      href: "/admin/payment-history",
    },
    {
      icon: Users,
      label: "Users",
      href: "/admin/users",
    },
    {
      icon: Mail,
      label: "Emails",
      href: "/admin/emails",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 w-64 bg-white border-r border-gray-200 z-30">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0">
          <Shield className="w-6 h-6 mr-2 text-[#0A64BC]" />
          <span className="text-xl font-bold text-gray-900">NESUBS</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Info */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0">
          {isHolidayMode && (
            <div className="mb-3 px-3 py-2.5 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-0.5">Holiday Mode Active</p>
                <p className="text-[10px] text-yellow-700 leading-tight">Payments are currently paused across all products.</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 mb-3 px-3 py-2">
            <div className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">
                {adminName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{adminName}</p>
              <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-900"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-xl">
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
              <div className="flex items-center">
                <Shield className="w-6 h-6 mr-2 text-[#0A64BC]" />
                <span className="text-xl font-bold text-gray-900">NESUBS</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Admin Info */}
            <div className="p-3 border-t border-gray-200">
              {isHolidayMode && (
                <div className="mb-3 px-3 py-2.5 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-0.5">Holiday Mode Active</p>
                    <p className="text-[10px] text-yellow-700 leading-tight">Payments are currently paused across all products.</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 mb-3 px-3 py-2">
                <div className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {adminName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {adminName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Bar - Mobile */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:hidden sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-900 hover:text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0A64BC]" />
            <span className="font-bold text-gray-900">NESUBS</span>
          </div>
          <div className="w-6" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}