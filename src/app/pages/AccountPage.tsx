import { useState } from "react";
import { User, ShoppingBag, Settings, HelpCircle, LogOut, ChevronRight, Mail, Shield, LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { LoginModal } from "../components/LoginModal";
import { SignupModal } from "../components/SignupModal";
import { toast } from "sonner";

export function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const menuItems = [
    { icon: ShoppingBag, label: "My Orders", badge: null, href: "/orders" },
    { icon: Settings, label: "Settings", badge: null, href: "/settings" },
    { icon: Mail, label: "Email Inbox", badge: null, href: "/email-inbox" },
    { icon: HelpCircle, label: "Help & Support", badge: null, href: "/help" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  // Logged Out State
  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="max-w-[1200px] mx-auto">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#0A64BC] to-[#084d92] text-white px-6 py-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                  <User className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Welcome to Nesubs</h1>
                <p className="text-blue-100 text-sm mb-6">
                  Login or create an account to access your orders
                </p>
              </div>
            </div>

            {/* Login/Signup Buttons */}
            <div className="p-4 space-y-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full bg-[#0A64BC] text-white rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-[#0850a0] transition-colors shadow-lg"
              >
                <LogIn className="w-5 h-5" />
                <span className="font-semibold">Login to Your Account</span>
              </button>

              <button
                onClick={() => setShowSignupModal(true)}
                className="w-full bg-white border-2 border-[#0A64BC] text-[#0A64BC] rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                <span className="font-semibold">Create New Account</span>
              </button>
            </div>

            {/* Features */}
            <div className="p-4 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 px-2">
                Why Create an Account?
              </h3>
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-5 h-5 text-[#0A64BC]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Track Your Orders</h4>
                    <p className="text-sm text-gray-600">
                      View all your purchases and order history in one place
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Instant Notifications</h4>
                    <p className="text-sm text-gray-600">
                      Get email updates about your orders and deliveries
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">24/7 Support</h4>
                    <p className="text-sm text-gray-600">
                      Access our customer support team anytime you need help
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Browse as Guest */}
            <div className="p-4">
              <div className="bg-gray-100 rounded-2xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  You can browse products without an account
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-[#0A64BC] font-semibold text-sm hover:underline"
                >
                  Browse Products
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Admin Link */}
            <div className="p-4 pt-0">
              <Link
                to="/admin/login"
                className="w-full bg-black text-white rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md"
              >
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Admin Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Modals */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
        />
        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      </>
    );
  }

  // Logged In State
  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-[1200px] mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-[#0A64BC] to-[#084d92] text-white p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Welcome Back, {user?.name}!</h2>
                <div className="space-y-0.5 text-sm">
                  <p className="text-blue-100 font-mono">Main: {user?.email}</p>
                  {user?.nesubsEmail && (
                    <p className="text-blue-100 font-mono">Nesubs: {user?.nesubsEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <span className="flex-1 text-left font-medium text-gray-900">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="px-2 py-1 bg-[#0A64BC] text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <div className="p-4">
            <button 
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>

          {/* Admin Dashboard Link */}
          <div className="p-4 pt-0">
            <Link
              to="/admin/login"
              className="w-full bg-black text-white rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md"
            >
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
}
