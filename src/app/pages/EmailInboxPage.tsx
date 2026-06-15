import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Mail,
  MailOpen,
  Trash2,
  Calendar,
  X,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { API_BASE_URL } from "../utils/api";

// Dummy email data
const dummyEmails = [
  {
    id: "1",
    from: "Nesubs <noreply@nesubs.com>",
    subject: "Welcome to Nesubs!",
    preview: "Thank you for joining Nesubs. Your account has been successfully created...",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A64BC;">Welcome to Nesubs!</h2>
        <p>Thank you for joining Nesubs. Your account has been successfully created.</p>
        <p>Your Nesubs Email: <strong>pankh321@nesubs.com</strong></p>
        <p>You can now start purchasing digital services and subscriptions.</p>
        <br/>
        <p>Best regards,<br/>Nesubs Team</p>
      </div>
    `,
    date: "2025-02-27T10:30:00",
    read: true,
    type: "account",
  },
  {
    id: "2",
    from: "Nesubs Security <security@nesubs.com>",
    subject: "OTP for Password Change",
    preview: "Your OTP for password change is: 842196. This code will expire in 10 minutes...",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A64BC;">Password Change Verification</h2>
        <p>You requested to change your password. Please use the following OTP:</p>
        <div style="background: #f0f9ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #0A64BC; font-size: 32px; letter-spacing: 8px; margin: 0;">842196</h1>
        </div>
        <p style="color: #666;">This code will expire in 10 minutes.</p>
        <p style="color: #dc2626;"><strong>If you didn't request this, please ignore this email.</strong></p>
        <br/>
        <p>Best regards,<br/>Nesubs Security Team</p>
      </div>
    `,
    date: "2025-02-27T09:15:00",
    read: false,
    type: "otp",
  },
  {
    id: "3",
    from: "Nesubs Orders <orders@nesubs.com>",
    subject: "Order Confirmation - Netflix Premium",
    preview: "Your order #NPY1709012345ABC has been confirmed. Payment of Rs. 1200 received...",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A64BC;">Order Confirmation</h2>
        <p>Your order has been confirmed and payment received.</p>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> NPY1709012345ABC</p>
          <p><strong>Product:</strong> Netflix Premium</p>
          <p><strong>Amount:</strong> Rs. 1,200</p>
          <p><strong>Status:</strong> <span style="color: #16a34a;">Active</span></p>
          <p><strong>Valid Until:</strong> March 15, 2025</p>
        </div>
        <p>You can check your order status anytime in the "My Orders" section.</p>
        <br/>
        <p>Best regards,<br/>Nesubs Team</p>
      </div>
    `,
    date: "2025-02-26T14:20:00",
    read: true,
    type: "order",
  },
  {
    id: "4",
    from: "Nesubs Security <security@nesubs.com>",
    subject: "Login Verification Code",
    preview: "Your verification code is: 561032. Use this code to complete your login...",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A64BC;">Login Verification</h2>
        <p>You're trying to log in to your Nesubs account. Please use the following verification code:</p>
        <div style="background: #f0f9ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #0A64BC; font-size: 32px; letter-spacing: 8px; margin: 0;">561032</h1>
        </div>
        <p style="color: #666;">This code will expire in 10 minutes.</p>
        <p style="color: #dc2626;"><strong>If this wasn't you, please secure your account immediately.</strong></p>
        <br/>
        <p>Best regards,<br/>Nesubs Security Team</p>
      </div>
    `,
    date: "2025-02-25T08:45:00",
    read: true,
    type: "otp",
  },
  {
    id: "5",
    from: "Nesubs Notifications <notify@nesubs.com>",
    subject: "Your Subscription is Expiring Soon",
    preview: "Your YouTube Premium subscription will expire on Feb 25, 2025. Renew now to continue...",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A64BC;">Subscription Expiry Notice</h2>
        <p>This is a friendly reminder that your subscription is expiring soon:</p>
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p><strong>Product:</strong> YouTube Premium</p>
          <p><strong>Expires:</strong> February 25, 2025</p>
          <p><strong>Days Remaining:</strong> 2 days</p>
        </div>
        <p>Renew your subscription now to avoid interruption in service.</p>
        <br/>
        <p>Best regards,<br/>Nesubs Team</p>
      </div>
    `,
    date: "2025-02-23T16:00:00",
    read: true,
    type: "notification",
  },
];

type EmailType = "all" | "otp" | "order" | "account" | "notification";

export function EmailInboxPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showDateFilter, setShowDateFilter] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("You must be logged in to view your inbox");
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const [sentRes, receivedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/emails/me`, { headers }),
        fetch(`${API_BASE_URL}/emails/receiving`, { headers })
      ]);
      const [sentData, receivedData] = await Promise.all([
        sentRes.json(),
        receivedRes.json()
      ]);

      let combined: any[] = [];
      if (sentData.success) {
        combined = [...combined, ...sentData.emails];
      }
      if (receivedData.success) {
        const mappedReceived = receivedData.emails.map((email: any) => ({
          id: email.id,
          from: email.from,
          subject: email.subject,
          preview: `${email.subject} - Click to load dynamic received message contents.`,
          date: email.created_at || email.date,
          read: localStorage.getItem(`read_email_${email.id}`) === 'true',
          type: "inbound",
          isInbound: true
        }));
        combined = [...combined, ...mappedReceived];
      }

      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEmails(combined);
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast.error("Failed to fetch emails");
    } finally {
      setLoading(false);
    }
  };

  // Filter emails
  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateRange.from && dateRange.to) {
      const emailDate = new Date(email.date);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      matchesDate = emailDate >= fromDate && emailDate <= toDate;
    }
    
    return matchesSearch && matchesDate;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const handleDeleteEmail = async (emailId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/${emailId}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        setEmails(emails.filter((e) => e.id !== emailId));
        if (selectedEmail?.id === emailId) {
          setSelectedEmail(null);
        }
        toast.success("Email deleted");
      } else {
        toast.error(data.error || "Failed to delete email");
      }
    } catch (error) {
      console.error("Error deleting email:", error);
      toast.error("Failed to delete email");
    }
  };

  const handleMarkAsRead = async (emailId: string, isInbound: boolean = false) => {
    setEmails(emails.map((e) => 
      e.id === emailId ? { ...e, read: true } : e
    ));
    localStorage.setItem(`read_email_${emailId}`, 'true');

    if (isInbound) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE_URL}/emails/receiving/${emailId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setSelectedEmail({
            id: data.email.id,
            from: data.email.from,
            subject: data.email.subject,
            body: data.email.html || `<p>${data.email.text}</p>`,
            date: data.email.created_at,
            type: "inbound",
            attachments: data.email.attachments || [],
            isInbound: true
          });
        }
      } catch (error) {
        console.error("Failed to fetch inbound email content:", error);
      }
    } else {
      try {
        await fetch(`${API_BASE_URL}/emails/${emailId}/read`, {
          method: "PUT"
        });
      } catch (error) {
        console.error("Error marking email as read:", error);
      }
    }
  };

  const unreadCount = emails.filter((e) => !e.read).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0A64BC] to-[#084d92] text-white sticky z-40 top-0">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link
              to="/account"
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Email Inbox</h1>
              <p className="text-blue-100 text-sm">
                {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 focus:border-white focus:bg-white/20 outline-none transition-all text-white placeholder:text-white/60"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4">
        {/* Date Filter */}
        <button
          onClick={() => setShowDateFilter(!showDateFilter)}
          className="w-full bg-white rounded-xl p-3 flex items-center justify-center gap-2 mb-4 shadow-sm hover:shadow-md transition-all"
        >
          <Calendar className="w-5 h-5 text-[#0A64BC]" />
          <span className="font-medium text-gray-900">Date Range Filter</span>
        </button>

        {showDateFilter && (
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-sm"
                />
              </div>
            </div>
            <button
              onClick={() => setDateRange({ from: "", to: "" })}
              className="mt-3 w-full py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Email List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-[#0A64BC] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading emails...</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No emails found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email);
                  handleMarkAsRead(email.id, email.isInbound);
                }}
                className={`bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  !email.read ? "border-l-4 border-[#0A64BC]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`mt-1 ${email.read ? "text-gray-400" : "text-[#0A64BC]"}`}>
                      {email.read ? (
                        <MailOpen className="w-5 h-5" />
                      ) : (
                        <Mail className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={`text-sm truncate ${email.read ? "text-gray-600" : "text-gray-900 font-semibold"}`}>
                          {email.from}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(email.date)}
                        </span>
                      </div>
                      <h3 className={`font-semibold mb-1 truncate ${email.read ? "text-gray-700" : "text-gray-900"}`}>
                        {email.subject}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {email.preview}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEmail(email.id);
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-900 pr-8">
                {selectedEmail.subject}
              </h2>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedEmail.from}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(selectedEmail.date).toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteEmail(selectedEmail.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                >
                  <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                </button>
              </div>

              {selectedEmail.type === "otp" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    <strong>Security Notice:</strong> Never share OTP codes with anyone. Nesubs will never ask for your OTP.
                  </p>
                </div>
              )}

              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
              />

              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    Attachments ({selectedEmail.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedEmail.attachments.map((att: any) => (
                      <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {att.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {att.size ? `${(att.size / 1024).toFixed(1)} KB` : ""}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem("authToken");
                              const response = await fetch(`${API_BASE_URL}/emails/receiving/${selectedEmail.id}/attachments/${att.id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              const data = await response.json();
                              if (data.success && data.attachment?.download_url) {
                                window.open(data.attachment.download_url, "_blank");
                              } else {
                                toast.error("Failed to generate download URL");
                              }
                            } catch {
                              toast.error("Failed to download attachment");
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-[#0A64BC] border-2 border-[#0A64BC] rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}