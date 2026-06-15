import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  ArrowLeft,
  Package,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Send,
  Plus,
  Trash2,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, publicAnonKey } from "../../utils/api";

interface Order {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productImage?: string;
  packageName: string;
  price: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  userNesubsEmail?: string;
  userMainEmail?: string;
  userActualName?: string;
  customFieldData?: Record<string, string>;
  paymentMethod: string;
  transactionId?: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface CredentialRecord {
  orderId: string;
  credentials: Record<string, string>;
  sentBy: string;
  sentAt: string;
  productName: string;
}

export function AdminOrderDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Credentials state
  const [credentialRecord, setCredentialRecord] = useState<CredentialRecord | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendingCreds, setSendingCreds] = useState(false);
  const [credFields, setCredFields] = useState([{ key: "", value: "" }]);
  const [showValues, setShowValues] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) { navigate("/admin/login"); return; }
    if (id) { fetchOrder(); fetchCredentials(); }
  }, [navigate, id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      if (data.success) { setOrder(data.order); }
      else { toast.error("Order not found"); navigate("/admin/orders"); }
    } catch (error) {
      toast.error("Failed to load order"); navigate("/admin/orders");
    } finally { setLoading(false); }
  };

  const fetchCredentials = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/credentials`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success && data.credentials) setCredentialRecord(data.credentials);
    } catch (_) {}
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/orders/${order.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) { toast.success("Order status updated"); setOrder(data.order); }
      else toast.error(data.error || "Failed to update status");
    } catch (error) {
      toast.error("Failed to update status");
    } finally { setUpdating(false); }
  };

  const handleSendCredentials = async () => {
    const valid = credFields.filter(f => f.key.trim() && f.value.trim());
    if (valid.length === 0) { toast.error("Add at least one credential field"); return; }

    const credentials: Record<string, string> = {};
    valid.forEach(f => { credentials[f.key.trim()] = f.value.trim(); });

    setSendingCreds(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/send-credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ credentials, sentBy: "admin" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Credentials sent to customer email!");
        setCredentialRecord(data.credentialRecord);
        setShowSendModal(false);
        setCredFields([{ key: "", value: "" }]);
      } else {
        toast.error(data.error || "Failed to send credentials");
      }
    } catch (_) {
      toast.error("Failed to send credentials");
    } finally { setSendingCreds(false); }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-5 h-5 text-yellow-600" />;
      case "processing": return <Package className="w-5 h-5 text-blue-600" />;
      case "completed": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "cancelled": return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg border ${styles[status] || styles.pending}`}>
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
            <p className="text-gray-600 font-medium">Loading order...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) return null;

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate("/admin/orders")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Orders</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Order {order.orderNumber}</h1>
              <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" /> Product Details
              </h2>
              <div className="flex items-start gap-4">
                {order.productImage && (
                  <img src={order.productImage} alt={order.productName} className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200" />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{order.productName}</h3>
                  <div className="text-sm text-gray-600 mb-2">Package: <span className="font-semibold">{order.packageName}</span></div>
                  <div className="text-2xl font-bold text-gray-900">Rs. {order.price.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" /> Customer Information
              </h2>
              <div className="space-y-3">
                {(order.userActualName || order.customerName) && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Actual Name</div>
                      <div className="font-medium text-gray-900">{order.userActualName || order.customerName}</div>
                    </div>
                  </div>
                )}
                {(order.userMainEmail || order.customerEmail) && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Main Email</div>
                      <div className="font-medium text-gray-900 font-mono">{order.userMainEmail || order.customerEmail}</div>
                    </div>
                  </div>
                )}
                {order.userNesubsEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Nesubs Email</div>
                      <div className="font-medium text-blue-600 font-mono">{order.userNesubsEmail}</div>
                    </div>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Phone</div>
                      <div className="font-medium text-gray-900">{order.customerPhone}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Fields */}
            {order.customFieldData && Object.keys(order.customFieldData).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Custom Fields</h2>
                <div className="space-y-3">
                  {Object.entries(order.customFieldData).map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">{key}</div>
                      <div className="text-sm text-gray-900 font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sent Credentials Panel */}
            {credentialRecord && (
              <div className="bg-white border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-green-600" /> Sent Credentials
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      Sent {formatDate(credentialRecord.sentAt)}
                    </span>
                    <button
                      onClick={() => {
                        // Pre-fill with existing credentials for re-send
                        setCredFields(Object.entries(credentialRecord.credentials).map(([k, v]) => ({ key: k, value: v })));
                        setShowSendModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Send className="w-3 h-3" /> Re-send
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(credentialRecord.credentials).map(([key, value], idx) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-semibold text-gray-700">{key}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-gray-900">
                          {showValues[idx] ? value : "••••••••"}
                        </span>
                        <button onClick={() => setShowValues(prev => ({ ...prev, [idx]: !prev[idx] }))} className="text-gray-400 hover:text-gray-700">
                          {showValues[idx] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Send Credentials Button */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Send className="w-5 h-5" /> Deliver Credentials
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Send product login credentials (email, password, PIN, etc.) directly to the customer.
              </p>
              <button
                onClick={() => setShowSendModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0A64BC] text-white rounded-xl font-semibold hover:bg-[#084d92] transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
                {credentialRecord ? "Update & Re-send Credentials" : "Send Credentials"}
              </button>
            </div>

            {/* Status Management */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Status</h2>
              <div className="space-y-2">
                {["pending", "processing", "completed", "cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updating || order.status === status}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      order.status === status
                        ? status === "pending" ? "bg-yellow-50 text-yellow-700 border-2 border-yellow-200"
                          : status === "processing" ? "bg-blue-50 text-blue-700 border-2 border-blue-200"
                          : status === "completed" ? "bg-green-50 text-green-700 border-2 border-green-200"
                          : "bg-red-50 text-red-700 border-2 border-red-200"
                        : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100"
                    } disabled:opacity-50`}
                  >
                    {getStatusIcon(status)}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {order.status === status && <span className="ml-auto text-xs">(Current)</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Payment
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Payment Method</div>
                  <div className="font-semibold text-gray-900">{order.paymentMethod}</div>
                </div>
                {order.transactionId && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Transaction ID</div>
                    <div className="font-mono text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{order.transactionId}</div>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="text-xl font-bold text-gray-900">Rs. {order.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Timeline
              </h2>
              <div className="space-y-3">
                <div><div className="text-xs text-gray-500 mb-1">Created</div><div className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</div></div>
                <div><div className="text-xs text-gray-500 mb-1">Last Updated</div><div className="text-sm font-medium text-gray-900">{formatDate(order.updatedAt)}</div></div>
                {order.completedAt && (
                  <div><div className="text-xs text-gray-500 mb-1">Completed</div><div className="text-sm font-medium text-gray-900">{formatDate(order.completedAt)}</div></div>
                )}
                {credentialRecord && (
                  <div><div className="text-xs text-gray-500 mb-1">Credentials Sent</div><div className="text-sm font-medium text-green-700">{formatDate(credentialRecord.sentAt)}</div></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send Credentials Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#0A64BC]" /> Send Credentials
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Credentials will be emailed to <strong>{order.customerEmail || "customer"}</strong>
                  </p>
                </div>
                <button onClick={() => setShowSendModal(false)} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">X</button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-gray-600">Add the credential fields to send to the customer (e.g. Email, Password, PIN, Serial Key):</p>
              {credFields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={field.key}
                    onChange={e => {
                      const updated = [...credFields];
                      updated[idx].key = e.target.value;
                      setCredFields(updated);
                    }}
                    placeholder="Label (e.g. Email)"
                    className="flex-1 h-10 px-3 border-2 border-gray-200 rounded-lg text-sm focus:border-[#0A64BC] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={e => {
                      const updated = [...credFields];
                      updated[idx].value = e.target.value;
                      setCredFields(updated);
                    }}
                    placeholder="Value (e.g. user@email.com)"
                    className="flex-1 h-10 px-3 border-2 border-gray-200 rounded-lg text-sm font-mono focus:border-[#0A64BC] focus:outline-none"
                  />
                  <button
                    onClick={() => setCredFields(credFields.filter((_, i) => i !== idx))}
                    disabled={credFields.length === 1}
                    className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setCredFields([...credFields, { key: "", value: "" }])}
                className="flex items-center gap-2 text-sm text-[#0A64BC] font-semibold hover:underline"
              >
                <Plus className="w-4 h-4" /> Add another field
              </button>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 h-11 px-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendCredentials}
                disabled={sendingCreds}
                className="flex-1 h-11 px-4 bg-[#0A64BC] text-white rounded-xl font-semibold hover:bg-[#084d92] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {sendingCreds ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send to Customer</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}