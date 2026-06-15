import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  Mail,
  Search,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Inbox,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, publicAnonKey } from "../../utils/api";

interface NesubsEmail {
  id: string;
  email: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: "active" | "expired";
  assignedAt: string;
  expiresAt: string;
  messageCount: number;
}

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  read: boolean;
  hasAttachment: boolean;
  isInbound?: boolean;
  attachments?: any[];
}

export function AdminEmailsPage() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState<NesubsEmail[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<NesubsEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Mailbox view state
  const [viewingMailbox, setViewingMailbox] = useState<NesubsEmail | null>(null);
  const [mailboxMessages, setMailboxMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
      return;
    }

    fetchEmails();
  }, [navigate]);

  useEffect(() => {
    filterEmails();
  }, [searchQuery, statusFilter, emails]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/emails`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setEmails(data.emails);
      } else {
        toast.error(data.error || "Failed to load emails");
      }
    } catch (error) {
      console.error("Error loading emails:", error);
      toast.error("Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  const loadMailboxMessages = async (email: NesubsEmail) => {
    try {
      const headers = { Authorization: `Bearer ${publicAnonKey}` };
      const [dbRes, receivedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/emails/user/${email.userId}`, { headers }),
        fetch(`${API_BASE_URL}/emails/receiving?email=${email.email}`, { headers })
      ]);
      const [dbData, receivedData] = await Promise.all([
        dbRes.json(),
        receivedRes.json()
      ]);

      let combined: EmailMessage[] = [];
      if (dbData.success) {
        combined = [...combined, ...dbData.emails.map((msg: any) => ({
          id: msg.id,
          from: msg.from,
          subject: msg.subject,
          body: msg.body,
          receivedAt: msg.date,
          read: msg.read,
          hasAttachment: false,
          isInbound: false
        }))];
      }
      if (receivedData.success) {
        const mappedReceived = receivedData.emails.map((msg: any) => ({
          id: msg.id,
          from: msg.from,
          subject: msg.subject,
          body: `${msg.subject} - Click to load dynamic received message contents.`,
          receivedAt: msg.created_at || msg.date,
          read: true,
          hasAttachment: msg.attachments && msg.attachments.length > 0,
          isInbound: true,
          attachments: msg.attachments || []
        }));
        combined = [...combined, ...mappedReceived];
      }
      combined.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
      setMailboxMessages(combined);
    } catch (error) {
      console.error("Error loading mailbox messages:", error);
      toast.error("Failed to load mailbox messages");
    }
  };

  const handleSelectMessage = async (message: EmailMessage) => {
    if (message.isInbound) {
      try {
        const headers = { Authorization: `Bearer ${publicAnonKey}` };
        const response = await fetch(`${API_BASE_URL}/emails/receiving/${message.id}`, { headers });
        const data = await response.json();
        if (data.success) {
          setSelectedMessage({
            id: data.email.id,
            from: data.email.from,
            subject: data.email.subject,
            body: data.email.html || `<p>${data.email.text}</p>`,
            receivedAt: data.email.created_at,
            read: true,
            hasAttachment: data.email.attachments && data.email.attachments.length > 0,
            isInbound: true,
            attachments: data.email.attachments || []
          });
        } else {
          toast.error(data.error || "Failed to load received email body");
        }
      } catch (error) {
        console.error("Error loading received email details:", error);
        toast.error("Failed to load received email details");
      }
    } else {
      setSelectedMessage(message);
    }
  };

  const filterEmails = () => {
    let filtered = [...emails];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (email) =>
          email.email.toLowerCase().includes(query) ||
          email.userName.toLowerCase().includes(query) ||
          email.userEmail.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((email) => email.status === statusFilter);
    }

    setFilteredEmails(filtered);
  };

  const handleViewMailbox = (email: NesubsEmail) => {
    setViewingMailbox(email);
    loadMailboxMessages(email);
    setSelectedMessage(null);
  };

  const handleCloseMailbox = () => {
    setViewingMailbox(null);
    setMailboxMessages([]);
    setSelectedMessage(null);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-50 text-green-700 border-green-200",
      expired: "bg-red-50 text-red-700 border-red-200",
    };

    const icons = {
      active: <CheckCircle className="w-3 h-3" />,
      expired: <XCircle className="w-3 h-3" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg border ${
          styles[status as keyof typeof styles]
        }`}
      >
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: emails.length,
    active: emails.filter((e) => e.status === "active").length,
    expired: emails.filter((e) => e.status === "expired").length,
    totalMessages: emails.reduce((sum, e) => sum + e.messageCount, 0),
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 max-w-[1400px] mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading emails...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Mailbox View
  if (viewingMailbox) {
    return (
      <AdminLayout>
        <div className="p-6 max-w-[1400px] mx-auto">
          {/* Mailbox Header */}
          <div className="mb-6">
            <button
              onClick={handleCloseMailbox}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Emails</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Mailbox: {viewingMailbox.email}
                </h1>
                <p className="text-sm text-gray-600">
                  {viewingMailbox.userName} ({viewingMailbox.userEmail})
                </p>
              </div>
              {getStatusBadge(viewingMailbox.status)}
            </div>
          </div>

          {/* Mailbox Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-900">
                  <Inbox className="w-5 h-5" />
                  <span className="font-bold">Inbox ({mailboxMessages.length})</span>
                </div>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {mailboxMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedMessage?.id === message.id ? "bg-blue-50" : ""
                    } ${!message.read ? "bg-blue-50/30" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-semibold text-sm text-gray-900 truncate flex-1">
                        {message.from}
                      </div>
                      {message.hasAttachment && (
                        <Paperclip className="w-3 h-3 text-gray-400 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <div className={`text-sm mb-1 truncate ${!message.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                      {message.subject}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(message.receivedAt)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-semibold text-gray-900">
                          From: {selectedMessage.from}
                        </div>
                        <div className="text-gray-600">
                          To: {viewingMailbox.email}
                        </div>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {formatDateTime(selectedMessage.receivedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <div
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedMessage.body }}
                    />
                  </div>
                  {selectedMessage.hasAttachment && selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                        <Paperclip className="w-4 h-4" />
                        Attachments ({selectedMessage.attachments.length})
                      </div>
                      <div className="space-y-2">
                        {selectedMessage.attachments.map((att: any) => (
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
                                  const response = await fetch(`${API_BASE_URL}/emails/receiving/${selectedMessage.id}/attachments/${att.id}`, {
                                    headers: { Authorization: `Bearer ${publicAnonKey}` }
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
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    Select a message to view
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Main Email List View
  return (
    <AdminLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Nesubs Email Management
            </h1>
            <p className="text-sm text-gray-600">
              View customer email addresses and mailboxes
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Total Emails</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-sm text-green-700 mb-1">Active</div>
            <div className="text-2xl font-bold text-green-900">
              {stats.active}
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-sm text-red-700 mb-1">Expired</div>
            <div className="text-2xl font-bold text-red-900">
              {stats.expired}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-sm text-blue-700 mb-1">Total Messages</div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.totalMessages}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-blue-900 text-sm mb-1">
                How Nesubs Emails Work
              </div>
              <div className="text-sm text-blue-700">
                When a user signs up on Nesubs.com, a temporary email address (like user001@nesubs.com) 
                is automatically created and assigned to them. This email is used to receive subscription 
                confirmations and access digital services without exposing their personal email.
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, user name, or user email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Emails Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {filteredEmails.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">
                {searchQuery || statusFilter !== "all"
                  ? "No emails found matching your filters"
                  : "No emails yet"}
              </p>
              {searchQuery || statusFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="mt-3 text-sm text-[#0A64BC] hover:underline font-medium"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Nesubs Email
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      User Info
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Assigned Date
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmails.map((email) => (
                    <tr
                      key={email.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0A64BC] text-white flex items-center justify-center">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {email.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {email.userName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {email.userEmail}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(email.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Inbox className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">
                            {email.messageCount}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-600">
                          {formatDate(email.assignedAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-600">
                          {formatDate(email.expiresAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewMailbox(email)}
                            className="p-2 text-gray-600 hover:text-[#0A64BC] hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Mailbox"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
