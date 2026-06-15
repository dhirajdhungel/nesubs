import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Phone,
  Clock,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { API_BASE_URL, publicAnonKey } from "../utils/api";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface HelpSupportSettings {
  heroTitle: string;
  heroSubtitle: string;
  supportEmail: string;
  whatsappNumber: string;
  whatsappMessage: string;
  supportHours: Array<{ day: string; hours: string }>;
  timezone: string;
  stillNeedHelpTitle: string;
  stillNeedHelpSubtitle: string;
}

export function HelpSupportPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [settings, setSettings] = useState<HelpSupportSettings>({
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
  const [loading, setLoading] = useState(true);

  // Default FAQs (fallback if database is empty)
  const defaultFaqs: FAQ[] = [
    {
      id: "1",
      question: "How long does delivery take?",
      answer: "Most digital products are delivered instantly after payment confirmation. For subscription services like Netflix or Spotify, activation may take up to 1-2 hours."
    },
    {
      id: "2",
      question: "What payment methods do you accept?",
      answer: "We accept payments through Fonepay. All transactions are secure and encrypted."
    },
    {
      id: "3",
      question: "Can I get a refund?",
      answer: "Refunds are available within 2-4 days if the product hasn't been delivered or activated. Please contact support immediately if you face any issues."
    },
    {
      id: "4",
      question: "How do I track my order?",
      answer: "Go to \"My Orders\" in your account to see all your orders, their status, and delivery details. You'll also receive email notifications for order updates."
    }
  ];

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
          if (data.content.helpFAQs && data.content.helpFAQs.length > 0) {
            setFaqs(data.content.helpFAQs);
          } else {
            setFaqs(defaultFaqs);
          }

          if (data.content.helpSupportSettings) {
            setSettings(data.content.helpSupportSettings);
          }
        } else {
          setFaqs(defaultFaqs);
        }
      } else {
        setFaqs(defaultFaqs);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      setFaqs(defaultFaqs);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSupport = () => {
    window.location.href =
      `mailto:${settings.supportEmail}?subject=Help%20Request%20from%20Nesubs%20App`;
    toast.success("Opening email client...");
  };

  const handleWhatsAppSupport = () => {
    window.open(
      `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`,
      "_blank",
    );
    toast.success("Opening WhatsApp...");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0A64BC] to-[#084d92] text-white sticky z-40">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/account"
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                Help & Support
              </h1>
              <p className="text-blue-100 text-sm">
                We're here to help you
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#E8F3FC] to-white rounded-2xl p-6 mb-6 border border-[#0A64BC]/20 text-center">
          <div className="w-16 h-16 bg-[#0A64BC] rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {settings.heroTitle}
          </h2>
          <p className="text-sm text-gray-600">
            {settings.heroSubtitle}
          </p>
        </div>

        {/* Contact Options */}
        <div className="space-y-4 mb-6">
          {/* Email Support */}
          <button
            onClick={handleEmailSupport}
            className="w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-[#0A64BC]" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Email Support
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Send us an email and we'll respond within 24
                  hours
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-[#0A64BC]" />
                  <span className="text-[#0A64BC] font-medium">
                    {settings.supportEmail}
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* WhatsApp Support */}
          <button
            onClick={handleWhatsAppSupport}
            className="w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  WhatsApp Support
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Chat with us instantly on WhatsApp for quick
                  help
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    +977 981-234-5678
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">
                    Usually replies instantly
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Support Hours */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#0A64BC] mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Support Hours
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                {settings.supportHours.map((hour) => (
                  <p key={hour.day}>{hour.day}: {hour.hours}</p>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {settings.timezone}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Frequently Asked Questions
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-[#0A64BC] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Loading FAQs...</p>
              </div>
            ) : (
              faqs.map((faq) => (
                <details key={faq.id} className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                    <span className="transition group-open:rotate-180">
                      <svg
                        fill="none"
                        height="24"
                        shapeRendering="geometricPrecision"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        width="24"
                        className="text-gray-500"
                      >
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <div className="px-3 pt-3 pb-1 text-sm text-gray-600">
                    {faq.answer}
                  </div>
                </details>
              ))
            )}
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="mt-6 bg-gradient-to-br from-[#0A64BC] to-[#084d92] text-white rounded-2xl p-6 text-center">
          <h3 className="text-lg font-bold mb-2">
            {settings.stillNeedHelpTitle}
          </h3>
          <p className="text-sm text-blue-100 mb-4">
            {settings.stillNeedHelpSubtitle}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleEmailSupport}
              className="px-6 py-3 bg-white text-[#0A64BC] rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Email Us
            </button>
            <button
              onClick={handleWhatsAppSupport}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}