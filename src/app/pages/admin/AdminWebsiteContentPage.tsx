import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  FileText,
  HelpCircle,
  Shield,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, publicAnonKey } from "../../utils/api";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface ContentSection {
  title: string;
  content: string;
}

interface WebsiteContent {
  homeFAQs: FAQ[];
  helpFAQs: FAQ[];
  termsAndConditions: string;
  privacyPolicy: string;
  refundPolicy: string;
  helpSupportSettings?: {
    heroTitle: string;
    heroSubtitle: string;
    supportEmail: string;
    whatsappNumber: string;
    whatsappMessage: string;
    supportHours: Array<{ day: string; hours: string }>;
    timezone: string;
    stillNeedHelpTitle: string;
    stillNeedHelpSubtitle: string;
  };
}

export function AdminWebsiteContentPage() {
  const [activeTab, setActiveTab] = useState<
    "home-faq" | "help-faq" | "help-support" | "terms" | "privacy" | "refund"
  >("home-faq");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for FAQs
  const [homeFAQs, setHomeFAQs] = useState<FAQ[]>([]);
  const [helpFAQs, setHelpFAQs] = useState<FAQ[]>([]);

  // State for Policy Pages
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [refundPolicy, setRefundPolicy] = useState("");

  // State for Help & Support Settings
  const [helpSupportSettings, setHelpSupportSettings] = useState({
    heroTitle: "Need Assistance?",
    heroSubtitle: "Choose your preferred way to reach our support team",
    supportEmail: "support@nesubs.com",
    whatsappNumber: "9779812345678",
    whatsappMessage: "Hi, I need help with my Nesubs order.",
    supportHours: [
      { day: "Monday - Friday", hours: "9:00 AM - 8:00 PM" },
      { day: "Saturday", hours: "10:00 AM - 6:00 PM" },
      { day: "Sunday", hours: "10:00 AM - 4:00 PM" }
    ],
    timezone: "Nepal Standard Time (NPT)",
    stillNeedHelpTitle: "Still need help?",
    stillNeedHelpSubtitle: "Our friendly support team is ready to assist you"
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/website-content`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.content) {
          setHomeFAQs(data.content.homeFAQs || []);
          setHelpFAQs(data.content.helpFAQs || []);
          setTermsAndConditions(data.content.termsAndConditions || "");
          setPrivacyPolicy(data.content.privacyPolicy || "");
          setRefundPolicy(data.content.refundPolicy || "");
          if (data.content.helpSupportSettings) {
            setHelpSupportSettings(data.content.helpSupportSettings);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/website-content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          homeFAQs,
          helpFAQs,
          termsAndConditions,
          privacyPolicy,
          refundPolicy,
          helpSupportSettings,
        }),
      });

      if (response.ok) {
        toast.success("Content saved successfully!");
      } else {
        throw new Error("Failed to save content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  // FAQ Management Functions
  const addFAQ = (type: "home" | "help") => {
    const newFAQ: FAQ = {
      id: `faq_${Date.now()}`,
      question: "",
      answer: "",
    };

    if (type === "home") {
      setHomeFAQs([...homeFAQs, newFAQ]);
    } else {
      setHelpFAQs([...helpFAQs, newFAQ]);
    }
  };

  const updateFAQ = (
    type: "home" | "help",
    id: string,
    field: "question" | "answer",
    value: string
  ) => {
    const updateList = (faqs: FAQ[]) =>
      faqs.map((faq) =>
        faq.id === id ? { ...faq, [field]: value } : faq
      );

    if (type === "home") {
      setHomeFAQs(updateList(homeFAQs));
    } else {
      setHelpFAQs(updateList(helpFAQs));
    }
  };

  const deleteFAQ = (type: "home" | "help", id: string) => {
    if (type === "home") {
      setHomeFAQs(homeFAQs.filter((faq) => faq.id !== id));
    } else {
      setHelpFAQs(helpFAQs.filter((faq) => faq.id !== id));
    }
    toast.success("FAQ deleted");
  };

  const tabs = [
    { id: "home-faq", label: "Home FAQs", icon: HelpCircle },
    { id: "help-faq", label: "Help & Support FAQs", icon: HelpCircle },
    { id: "help-support", label: "Help & Support Settings", icon: HelpCircle },
    { id: "terms", label: "Terms & Conditions", icon: FileText },
    { id: "privacy", label: "Privacy Policy", icon: Shield },
    { id: "refund", label: "Refund Policy", icon: RefreshCw },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0A64BC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/settings"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Website Content Editor
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage FAQs and policy pages
                </p>
              </div>
            </div>
            <button
              onClick={saveContent}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0A64BC] text-white rounded-lg hover:bg-[#084d92] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as typeof activeTab
                    )
                  }
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[#0A64BC] text-[#0A64BC] bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Home FAQs */}
          {activeTab === "home-faq" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Homepage FAQs
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    These FAQs appear on the homepage
                  </p>
                </div>
                <button
                  onClick={() => addFAQ("home")}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0A64BC] text-white rounded-lg hover:bg-[#084d92] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add FAQ
                </button>
              </div>

              <div className="space-y-4">
                {homeFAQs.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">
                      No FAQs added yet
                    </p>
                    <button
                      onClick={() => addFAQ("home")}
                      className="text-[#0A64BC] font-medium hover:underline"
                    >
                      Add your first FAQ
                    </button>
                  </div>
                ) : (
                  homeFAQs.map((faq, index) => (
                    <div
                      key={faq.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-500">
                          FAQ #{index + 1}
                        </span>
                        <button
                          onClick={() => deleteFAQ("home", faq.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question
                          </label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) =>
                              updateFAQ(
                                "home",
                                faq.id,
                                "question",
                                e.target.value
                              )
                            }
                            placeholder="Enter question..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Answer
                          </label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) =>
                              updateFAQ(
                                "home",
                                faq.id,
                                "answer",
                                e.target.value
                              )
                            }
                            placeholder="Enter answer..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Help & Support FAQs */}
          {activeTab === "help-faq" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Help & Support FAQs
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    These FAQs appear on the Help & Support page
                  </p>
                </div>
                <button
                  onClick={() => addFAQ("help")}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0A64BC] text-white rounded-lg hover:bg-[#084d92] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add FAQ
                </button>
              </div>

              <div className="space-y-4">
                {helpFAQs.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">
                      No FAQs added yet
                    </p>
                    <button
                      onClick={() => addFAQ("help")}
                      className="text-[#0A64BC] font-medium hover:underline"
                    >
                      Add your first FAQ
                    </button>
                  </div>
                ) : (
                  helpFAQs.map((faq, index) => (
                    <div
                      key={faq.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-500">
                          FAQ #{index + 1}
                        </span>
                        <button
                          onClick={() => deleteFAQ("help", faq.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question
                          </label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) =>
                              updateFAQ(
                                "help",
                                faq.id,
                                "question",
                                e.target.value
                              )
                            }
                            placeholder="Enter question..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Answer
                          </label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) =>
                              updateFAQ(
                                "help",
                                faq.id,
                                "answer",
                                e.target.value
                              )
                            }
                            placeholder="Enter answer..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Help & Support Settings */}
          {activeTab === "help-support" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Help & Support Settings
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure the help and support settings for your platform
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={helpSupportSettings.heroTitle}
                    onChange={(e) =>
                      setHelpSupportSettings({
                        ...helpSupportSettings,
                        heroTitle: e.target.value,
                      })
                    }
                    placeholder="Enter hero title..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Subtitle
                  </label>
                  <input
                    type="text"
                    value={helpSupportSettings.heroSubtitle}
                    onChange={(e) =>
                      setHelpSupportSettings({
                        ...helpSupportSettings,
                        heroSubtitle: e.target.value,
                      })
                    }
                    placeholder="Enter hero subtitle..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={helpSupportSettings.supportEmail}
                    onChange={(e) =>
                      setHelpSupportSettings({
                        ...helpSupportSettings,
                        supportEmail: e.target.value,
                      })
                    }
                    placeholder="Enter support email..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={helpSupportSettings.whatsappNumber}
                    onChange={(e) =>
                      setHelpSupportSettings({
                        ...helpSupportSettings,
                        whatsappNumber: e.target.value,
                      })
                    }
                    placeholder="Enter WhatsApp number..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Message
                  </label>
                  <input
                    type="text"
                    value={helpSupportSettings.whatsappMessage}
                    onChange={(e) =>
                      setHelpSupportSettings({
                        ...helpSupportSettings,
                        whatsappMessage: e.target.value,
                      })
                    }
                    placeholder="Enter WhatsApp message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Hours
                  </label>
                  <div className="space-y-2">
                    {helpSupportSettings.supportHours.map((hour, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <input
                          type="text"
                          value={hour.day}
                          onChange={(e) =>
                            setHelpSupportSettings({
                              ...helpSupportSettings,
                              supportHours: helpSupportSettings.supportHours.map(
                                (h, i) =>
                                  i === index ? { ...h, day: e.target.value } : h
                              ),
                            })
                          }
                          placeholder="Enter day..."
                          className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={hour.hours}
                          onChange={(e) =>
                            setHelpSupportSettings({
                              ...helpSupportSettings,
                              supportHours: helpSupportSettings.supportHours.map(
                                (h, i) =>
                                  i === index ? { ...h, hours: e.target.value } : h
                              ),
                            })
                          }
                          placeholder="Enter hours..."
                          className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={helpSupportSettings.timezone}
                    onChange={(e) =>
                      setHelpSupportSettings({
                        ...helpSupportSettings,
                        timezone: e.target.value,
                      })
                    }
                    placeholder="Enter timezone..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Still Need Help Title
                  </label>
                  <input
                    type="text"
                    value={helpSupportSettings.stillNeedHelpTitle}
                    onChange={(e) =>
                      setHelpSupportSettings({
                        ...helpSupportSettings,
                        stillNeedHelpTitle: e.target.value,
                      })
                    }
                    placeholder="Enter still need help title..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Still Need Help Subtitle
                  </label>
                  <input
                    type="text"
                    value={helpSupportSettings.stillNeedHelpSubtitle}
                    onChange={(e) =>
                      setHelpSupportSettings({
                        ...helpSupportSettings,
                        stillNeedHelpSubtitle: e.target.value,
                      })
                    }
                    placeholder="Enter still need help subtitle..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {activeTab === "terms" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Terms & Conditions
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Legal terms and conditions for your platform
                </p>
              </div>
              <textarea
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                placeholder="Enter your terms and conditions..."
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent resize-none font-mono text-sm"
              />
            </div>
          )}

          {/* Privacy Policy */}
          {activeTab === "privacy" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Privacy Policy
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  How you collect, use, and protect user data
                </p>
              </div>
              <textarea
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                placeholder="Enter your privacy policy..."
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent resize-none font-mono text-sm"
              />
            </div>
          )}

          {/* Refund Policy */}
          {activeTab === "refund" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Refund & Return Policy
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Your refund and return policy details
                </p>
              </div>
              <textarea
                value={refundPolicy}
                onChange={(e) => setRefundPolicy(e.target.value)}
                placeholder="Enter your refund and return policy..."
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A64BC] focus:border-transparent resize-none font-mono text-sm"
              />
            </div>
          )}
        </div>

        {/* Save Button (Bottom) */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveContent}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-[#0A64BC] text-white rounded-lg hover:bg-[#084d92] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}