import { Home, Search, User } from "lucide-react";
import { Link, useLocation } from "react-router";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/account", icon: User, label: "Account" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden z-50">
      <div className="h-16 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-0"
            >
              <Icon
                className="w-5 h-5 transition-colors"
                style={{ color: isActive ? '#0A64BC' : '#6B7280' }}
              />
              <span
                className="text-xs truncate transition-colors"
                style={{ color: isActive ? '#0A64BC' : '#6B7280' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}