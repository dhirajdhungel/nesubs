import { Search, User } from "lucide-react";
import { Link, useLocation } from "react-router";
import logoFull from "@/assets/75c78a34a843db16d7664c4588b545beb11fc796.png";
import logoIcon from "@/assets/9eb795bc6ab6188ac808e6127f6073f8dd1a67e8.png";

export function TopAppBar() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="h-14 px-4 flex items-center justify-between max-w-[1200px] mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          {/* Full logo for larger screens */}
          <img 
            src={logoFull} 
            alt="Nesubs" 
            className="h-6 hidden sm:block"
          />
          {/* Icon logo for mobile */}
          <img 
            src={logoIcon} 
            alt="Nesubs" 
            className="h-8 sm:hidden"
          />
        </Link>
        
        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <Link
            to="/search"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </Link>

          <Link
            to="/account"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Account"
          >
            <User className="w-5 h-5 text-gray-700" />
          </Link>
        </div>
      </div>
    </header>
  );
}