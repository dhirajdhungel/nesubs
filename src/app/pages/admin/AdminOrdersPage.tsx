import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Search, Eye, Trash2, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, publicAnonKey } from "../../utils/api";

interface Order {
  id: string;
  orderNumber: string;
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
  paymentMethod: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
      return;
    }

    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.productName.toLowerCase().includes(query) ||
          order.customerName?.toLowerCase().includes(query) ||
          order.customerEmail?.toLowerCase().includes(query) ||
          order.userNesubsEmail?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Order status updated successfully");
        fetchOrders();
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderNumber}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Order deleted successfully");
        fetchOrders();
      } else {
        toast.error(data.error || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };

    const icons = {
      pending: <Clock className="w-3 h-3" />,
      processing: <Package className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 max-w-[1400px] mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading orders...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Orders Management
          </h1>
          <p className="text-sm text-gray-600">
            View and manage all customer orders
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="text-sm text-yellow-700 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-900">
              {stats.pending}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-sm text-blue-700 mb-1">Processing</div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.processing}
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-sm text-green-700 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-900">
              {stats.completed}
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-sm text-red-700 mb-1">Cancelled</div>
            <div className="text-2xl font-bold text-red-900">
              {stats.cancelled}
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
                placeholder="Search by order number, product, or customer..."
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
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">
                {searchQuery || statusFilter !== "all"
                  ? "No orders found matching your filters"
                  : "No orders yet"}
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
                      Order
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900 text-sm">
                          {order.orderNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {order.productImage && (
                            <img
                              src={order.productImage}
                              alt={order.productName}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                            />
                          )}
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {order.productName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.packageName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {order.userActualName || order.customerName || "N/A"}
                            {(order.userMainEmail || order.customerEmail) && ` (${order.userMainEmail || order.customerEmail})`}
                          </div>
                          {order.userNesubsEmail && (
                            <div className="text-xs text-blue-600 font-mono font-medium mt-0.5">
                              Nesubs: {order.userNesubsEmail}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900 text-sm">
                          Rs. {(order.price ?? 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {order.paymentMethod}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className="text-xs font-semibold rounded-lg border-2 px-2 py-1 focus:outline-none cursor-pointer bg-white"
                          style={{
                            borderColor:
                              order.status === "pending"
                                ? "#fbbf24"
                                : order.status === "processing"
                                ? "#3b82f6"
                                : order.status === "completed"
                                ? "#10b981"
                                : "#ef4444",
                            color:
                              order.status === "pending"
                                ? "#92400e"
                                : order.status === "processing"
                                ? "#1e3a8a"
                                : order.status === "completed"
                                ? "#065f46"
                                : "#7f1d1d",
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-600">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/orders/${order.id}`)
                            }
                            className="p-2 text-gray-600 hover:text-[#0A64BC] hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteOrder(order.id, order.orderNumber)
                            }
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
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
