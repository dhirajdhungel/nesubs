import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  UserMinus,
  ShoppingBag,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, publicAnonKey } from "../../utils/api";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  nesubsEmail?: string;
  role: string;
  status: "active" | "suspended" | "inactive";
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  productName: string;
  packageName: string;
  price: number;
  status: string;
  createdAt: string;
}

export function AdminUserDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userEmails, setUserEmails] = useState<any[]>([]);
  const [fetchingEmails, setFetchingEmails] = useState(false);
  const [selectedAdminEmail, setSelectedAdminEmail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
      return;
    }

    if (id) {
      fetchUser();
    }
  }, [navigate, id]);

  useEffect(() => {
    // Fetch orders and emails after user data is loaded
    if (user) {
      fetchUserOrders();
      fetchUserEmails();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setFormData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "",
          role: data.user.role,
        });
      } else {
        toast.error("User not found");
        navigate("/admin/users");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user");
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Wait for user to be fetched first, then filter orders
        // Filter orders for this user
        const userOrders = data.orders.filter(
          (order: any) =>
            order.userId === id ||
            (user && order.customerEmail === user.email) ||
            (user && user.nesubsEmail && order.userNesubsEmail === user.nesubsEmail)
        );
        setOrders(userOrders);
      }
    } catch (error) {
      console.error("Error fetching user orders:", error);
    }
  };

  const fetchUserEmails = async () => {
    if (!user) return;
    try {
      setFetchingEmails(true);
      const headers = { Authorization: `Bearer ${publicAnonKey}` };
      const [dbRes, receivedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/emails/user/${id}`, { headers }),
        fetch(`${API_BASE_URL}/emails/receiving?email=${user.nesubsEmail}`, { headers })
      ]);
      const [dbData, receivedData] = await Promise.all([
        dbRes.json(),
        receivedRes.json()
      ]);

      let combined: any[] = [];
      if (dbData.success) {
        combined = [...combined, ...dbData.emails];
      }
      if (receivedData.success) {
        const mappedReceived = receivedData.emails.map((email: any) => ({
          id: email.id,
          from: email.from,
          to: email.to?.[0] || "",
          nesubsEmail: user.nesubsEmail,
          subject: email.subject,
          preview: `${email.subject} - Click to load dynamic received message contents.`,
          date: email.created_at || email.date,
          read: true,
          type: "inbound",
          isInbound: true
        }));
        combined = [...combined, ...mappedReceived];
      }

      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setUserEmails(combined);
    } catch (error) {
      console.error("Error fetching user emails:", error);
    } finally {
      setFetchingEmails(false);
    }
  };

  const handleOpenAdminEmail = async (email: any) => {
    if (email.isInbound) {
      try {
        const headers = { Authorization: `Bearer ${publicAnonKey}` };
        const response = await fetch(`${API_BASE_URL}/emails/receiving/${email.id}`, { headers });
        const data = await response.json();
        if (data.success) {
          setSelectedAdminEmail({
            id: data.email.id,
            from: data.email.from,
            to: data.email.to?.[0] || "",
            nesubsEmail: user?.nesubsEmail || "",
            subject: data.email.subject,
            body: data.email.html || `<p>${data.email.text}</p>`,
            date: data.email.created_at,
            attachments: data.email.attachments || [],
            isInbound: true
          });
        }
      } catch (error) {
        console.error("Failed to load inbound email:", error);
      }
    } else {
      setSelectedAdminEmail(email);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!user) return;

    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("User status updated successfully");
        setUser(data.user);
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("User updated successfully");
        setUser(data.user);
        setEditMode(false);
      } else {
        toast.error(data.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="w-5 h-5 text-green-600" />;
      case "suspended":
        return <UserMinus className="w-5 h-5 text-orange-600" />;
      case "inactive":
        return <UserX className="w-5 h-5 text-gray-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-50 text-green-700 border-green-200",
      suspended: "bg-orange-50 text-orange-700 border-orange-200",
      inactive: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg border ${
          styles[status as keyof typeof styles]
        }`}
      >
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 max-w-[1400px] mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading user...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Users</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#0A64BC] text-white flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.name}
                </h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            {getStatusBadge(user.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Information
                </h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-3 py-1.5 text-sm font-semibold text-[#0A64BC] hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full h-10 px-4 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none text-sm"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          name: user.name,
                          email: user.email,
                          phone: user.phone || "",
                          role: user.role,
                        });
                      }}
                      className="flex-1 h-10 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 h-10 bg-[#0A64BC] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Name</div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="font-medium text-gray-900">{user.email}</div>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="font-medium text-gray-900">
                          {user.phone}
                        </div>
                      </div>
                    </div>
                  )}
                  {user.nesubsEmail && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">Nesubs Email</div>
                        <div className="font-medium text-gray-900">
                          {user.nesubsEmail}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Role</div>
                      <div className="font-medium text-gray-900">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Orders */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order History ({orders.length})
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No orders yet
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                    >
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.productName} - {order.packageName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 text-sm">
                          Rs. {order.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Email Inbox Logs */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#0A64BC]" />
                Assigned Email Inbox Logs ({userEmails.length})
              </h2>

              {fetchingEmails ? (
                <div className="py-8 text-center text-gray-500">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-2" />
                  Loading inbox logs...
                </div>
              ) : userEmails.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No emails sent to this user yet
                </div>
              ) : (
                <div className="space-y-3">
                  {userEmails.map((email: any) => (
                    <div
                      key={email.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleOpenAdminEmail(email)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="font-semibold text-gray-900 text-sm">
                          {email.subject}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(email.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        From: {email.from} | Type: {email.type}
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {email.preview}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Account Status
              </h2>

              <div className="space-y-2">
                {["active", "suspended", "inactive"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updating || user.status === status}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      user.status === status
                        ? status === "active"
                          ? "bg-green-50 text-green-700 border-2 border-green-200"
                          : status === "suspended"
                          ? "bg-orange-50 text-orange-700 border-2 border-orange-200"
                          : "bg-gray-50 text-gray-700 border-2 border-gray-200"
                        : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100"
                    } disabled:opacity-50`}
                  >
                    {getStatusIcon(status)}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {user.status === status && (
                      <span className="ml-auto text-xs">(Current)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Statistics
              </h2>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Orders</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {orders.length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Spent</div>
                  <div className="text-2xl font-bold text-gray-900">
                    Rs.{" "}
                    {orders
                      .reduce((sum, order) => sum + order.price, 0)
                      .toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </h2>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Joined</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(user.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(user.updatedAt)}
                  </div>
                </div>
                {user.lastLogin && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Last Login</div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(user.lastLogin)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Email Detail Modal */}
      {selectedAdminEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-900 pr-8">
                {selectedAdminEmail.subject}
              </h2>
              <button
                onClick={() => setSelectedAdminEmail(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-500"
              >
                X
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    From: {selectedAdminEmail.from}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    To: {selectedAdminEmail.to} ({selectedAdminEmail.nesubsEmail})
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(selectedAdminEmail.date).toLocaleString()}
                  </p>
                </div>
              </div>

              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: selectedAdminEmail.body }}
              />

              {selectedAdminEmail.attachments && selectedAdminEmail.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    Attachments ({selectedAdminEmail.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedAdminEmail.attachments.map((att: any) => (
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
                              const response = await fetch(`${API_BASE_URL}/emails/receiving/${selectedAdminEmail.id}/attachments/${att.id}`, {
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
          </div>
        </div>
      )}
    </AdminLayout>
  );
}