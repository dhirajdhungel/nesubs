import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  Settings,
  Building2,
  Mail,
  CreditCard,
  Bell,
  Shield,
  Save,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export function AdminSettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Nesubs",
    tagline: "Digital Services Platform for Nepal",
    supportEmail: "support@nesubs.com",
    supportPhone: "+977-1-234567",
    address: "Kathmandu, Nepal",
    currency: "NPR",
    currencySymbol: "Rs.",
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    emailDomain: "@nesubs.com",
    emailExpiry: "30",
    autoAssign: true,
    notifyOnAssign: true,
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    fonePayEnabled: true,
    fonePayApiKey: "",
  });

  // For displaying masked API key
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [savedApiKey, setSavedApiKey] = useState(""); // Store encrypted/full key

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    orderNotifications: true,
    userNotifications: true,
    emailNotifications: true,
    lowStockAlerts: true,
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
      return;
    }

    // Load settings from localStorage (in production, from backend)
    loadSettings();
  }, [navigate]);

  const loadSettings = () => {
    setLoading(true);
    // Simulate loading from backend
    setTimeout(() => {
      // Load saved API key if exists
      const storedApiKey = localStorage.getItem("fonePayApiKey");
      if (storedApiKey) {
        setSavedApiKey(storedApiKey);
      }
      setLoading(false);
    }, 500);
  };

  // Mask API key for display (show first 3 and last 3 characters)
  const maskApiKey = (key: string) => {
    if (!key || key.length < 7) return key;
    const first3 = key.substring(0, 3);
    const last3 = key.substring(key.length - 3);
    return `${first3}...${last3}`;
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput || apiKeyInput.trim().length < 10) {
      toast.error("Please enter a valid API key (minimum 10 characters)");
      return;
    }

    setLoading(true);
    // Simulate API call to save encrypted key
    setTimeout(() => {
      // In production, send to backend for encryption
      // Here we're simulating by storing in localStorage
      localStorage.setItem("fonePayApiKey", apiKeyInput);
      setSavedApiKey(apiKeyInput);
      setShowApiKeyModal(false);
      setApiKeyInput("");
      toast.success("FonePay API key saved successfully");
      setLoading(false);
    }, 500);
  };

  const handleRemoveApiKey = () => {
    if (!confirm("Are you sure you want to remove the FonePay API key?")) {
      return;
    }

    localStorage.removeItem("fonePayApiKey");
    setSavedApiKey("");
    toast.success("API key removed successfully");
  };

  const handleSaveGeneral = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("General settings saved successfully");
      setLoading(false);
    }, 500);
  };

  const handleSaveEmail = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Email settings saved successfully");
      setLoading(false);
    }, 500);
  };

  const handleSavePayment = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Payment settings saved successfully");
      setLoading(false);
    }, 500);
  };

  const handleSaveNotifications = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Notification settings saved successfully");
      setLoading(false);
    }, 500);
  };

  const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "email", label: "Email", icon: Mail },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
          <p className="text-sm text-gray-600">
            Manage system settings and configurations
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/payment-history")}
            className="bg-gradient-to-br from-[#0A64BC] to-[#084d92] text-white rounded-xl p-6 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <CreditCard className="w-6 h-6" />
              </div>
              <svg
                className="w-5 h-5 text-white/60 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-1">Payment History</h3>
            <p className="text-sm text-blue-100">
              View and filter payment transactions
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/website-content")}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#0A64BC] hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <FileText className="w-6 h-6 text-[#0A64BC]" />
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-[#0A64BC] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Website Content
            </h3>
            <p className="text-sm text-gray-600">
              Manage FAQs and policy pages
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/emails")}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#0A64BC] hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Email Management
            </h3>
            <p className="text-sm text-gray-600">
              Manage email addresses and assignments
            </p>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                    activeTab === tab.id
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    General Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={generalSettings.siteName}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            siteName: e.target.value,
                          })
                        }
                        className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={generalSettings.tagline}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            tagline: e.target.value,
                          })
                        }
                        className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Support Email
                        </label>
                        <input
                          type="email"
                          value={generalSettings.supportEmail}
                          onChange={(e) =>
                            setGeneralSettings({
                              ...generalSettings,
                              supportEmail: e.target.value,
                            })
                          }
                          className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Support Phone
                        </label>
                        <input
                          type="tel"
                          value={generalSettings.supportPhone}
                          onChange={(e) =>
                            setGeneralSettings({
                              ...generalSettings,
                              supportPhone: e.target.value,
                            })
                          }
                          className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={generalSettings.address}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            address: e.target.value,
                          })
                        }
                        className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Currency
                        </label>
                        <select
                          value={generalSettings.currency}
                          onChange={(e) =>
                            setGeneralSettings({
                              ...generalSettings,
                              currency: e.target.value,
                            })
                          }
                          className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
                        >
                          <option value="NPR">NPR - Nepalese Rupee</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="INR">INR - Indian Rupee</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Currency Symbol
                        </label>
                        <input
                          type="text"
                          value={generalSettings.currencySymbol}
                          onChange={(e) =>
                            setGeneralSettings({
                              ...generalSettings,
                              currencySymbol: e.target.value,
                            })
                          }
                          className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveGeneral}
                    disabled={loading}
                    className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-[#0A64BC] text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === "email" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Email Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email Domain
                      </label>
                      <input
                        type="text"
                        value={emailSettings.emailDomain}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            emailDomain: e.target.value,
                          })
                        }
                        className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Domain used for temporary email addresses
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email Expiry (Days)
                      </label>
                      <input
                        type="number"
                        value={emailSettings.emailExpiry}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            emailExpiry: e.target.value,
                          })
                        }
                        className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Number of days before assigned emails expire
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={emailSettings.autoAssign}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              autoAssign: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-[#0A64BC] border-gray-300 rounded focus:ring-[#0A64BC]"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">
                            Auto-assign Emails
                          </div>
                          <div className="text-xs text-gray-500">
                            Automatically assign emails to new users
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={emailSettings.notifyOnAssign}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              notifyOnAssign: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-[#0A64BC] border-gray-300 rounded focus:ring-[#0A64BC]"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">
                            Notify on Assignment
                          </div>
                          <div className="text-xs text-gray-500">
                            Send notification when email is assigned
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveEmail}
                    disabled={loading}
                    className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-[#0A64BC] text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Payment tab content removed */}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Notification Preferences
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure admin notification preferences
                  </p>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={notificationSettings.orderNotifications}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            orderNotifications: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-[#0A64BC] border-gray-300 rounded focus:ring-[#0A64BC]"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">
                          Order Notifications
                        </div>
                        <div className="text-xs text-gray-500">
                          Receive notifications for new orders
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={notificationSettings.userNotifications}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            userNotifications: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-[#0A64BC] border-gray-300 rounded focus:ring-[#0A64BC]"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">
                          User Notifications
                        </div>
                        <div className="text-xs text-gray-500">
                          Notifications for new user registrations
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailNotifications: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-[#0A64BC] border-gray-300 rounded focus:ring-[#0A64BC]"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">
                          Email Notifications
                        </div>
                        <div className="text-xs text-gray-500">
                          Send email notifications to admin
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={notificationSettings.lowStockAlerts}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            lowStockAlerts: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-[#0A64BC] border-gray-300 rounded focus:ring-[#0A64BC]"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">
                          Low Stock Alerts
                        </div>
                        <div className="text-xs text-gray-500">
                          Alert when product stock is low
                        </div>
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveNotifications}
                    disabled={loading}
                    className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-[#0A64BC] text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {savedApiKey ? "Update" : "Add"} FonePay API Key
              </h2>
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                  setApiKeyInput("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <strong>Security Notice:</strong> Your API key will be encrypted before storage. Only the first 3 and last 3 characters will be visible after saving.
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  FonePay API Key <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter your FonePay API key"
                  className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 10 characters required
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-700">
                  Make sure you have obtained this API key from FonePay. Contact FonePay support if you don't have one yet.
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setApiKeyInput("");
                  }}
                  className="flex-1 h-10 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  disabled={loading}
                  className="flex-1 h-10 bg-[#0A64BC] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : savedApiKey ? "Update Key" : "Save Key"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}