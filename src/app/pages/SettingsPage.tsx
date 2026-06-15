import { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Copy,
  Check,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../utils/api";

export function SettingsPage() {
  const { user, loading: authLoading, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "", // Primary login email
    nesubsEmail: "", // System-generated email
    phone: "",
  });



  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        nesubsEmail: user.nesubsEmail || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(formData.nesubsEmail);
      setEmailCopied(true);
      toast.success("Email copied to clipboard!");
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy email");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone && !formData.phone.match(/^\+?[0-9\s-]+$/)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await refreshUser();
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Failed to update profile");
    }
  };



  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0A64BC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to manage your settings.</p>
          <Link
            to="/account"
            className="px-6 py-3 bg-[#0A64BC] hover:bg-[#084d92] text-white font-semibold rounded-xl inline-block transition-colors"
          >
            Go to Account & Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0A64BC] to-[#084d92] text-white sticky z-40 top-0">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center gap-3">
            <Link
              to="/account"
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
              <p className="text-blue-100 text-sm md:text-base">
                Manage your account details
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 md:px-8 md:py-8 space-y-4 md:space-y-6">
        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-sm md:max-w-3xl md:mx-auto">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Profile Information
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Update your personal details
            </p>
          </div>

          <form
            onSubmit={handleSaveProfile}
            className="p-4 md:p-6 space-y-4 md:space-y-5"
          >
            {/* Primary Login Email - Read-only */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Mail className="w-4 h-4 text-[#0A64BC]" />
                Login Email (Account ID)
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed text-base font-mono"
              />
              <p className="text-xs text-amber-600 mt-2 font-medium">
                ⚠️ This is your primary login email and cannot be changed.
              </p>
            </div>

            {/* Nesubs Email - Read-only with Copy */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Mail className="w-4 h-4 text-[#0A64BC]" />
                Nesubs Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.nesubsEmail}
                  disabled
                  className="w-full px-4 py-3 pr-24 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed text-base font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0A64BC] hover:bg-[#084d92] text-white text-xs rounded-lg transition-colors flex items-center gap-1.5 font-semibold"
                >
                  {emailCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This is your system-generated email address
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <User className="w-4 h-4 text-[#0A64BC]" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-base"
              />
            </div>

            {/* Phone Number - Optional */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Phone className="w-4 h-4 text-[#0A64BC]" />
                Phone Number
                <span className="text-xs text-gray-500 font-normal">
                  (Optional)
                </span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
                placeholder="+977 98XXXXXXXX"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-base"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-white text-lg bg-[#0A64BC] hover:bg-[#084d92] shadow-lg active:scale-[0.98] transition-all min-h-[56px] flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}