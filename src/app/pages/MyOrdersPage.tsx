import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Key,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link } from "react-router";
import { getOrders, getProducts, Order, Product, API_BASE_URL, publicAnonKey } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
};

type OrderStatus = keyof typeof statusConfig;

export function MyOrdersPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    OrderStatus | "all"
  >("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const [expandedCreds, setExpandedCreds] = useState<Record<string, boolean>>({});
  const [showValues, setShowValues] = useState<Record<string, Record<number, boolean>>>({});

  useEffect(() => {
    if (authLoading || !user) return;

    async function fetchData() {
      try {
        setLoading(true);
        const [fetchedOrders, fetchedProducts] = await Promise.all([
          getOrders(),
          getProducts(),
        ]);
        
        const userEmail = user?.email?.toLowerCase().trim();
        const userNesubsEmail = user?.nesubsEmail?.toLowerCase().trim();
        const userOrders = fetchedOrders.filter(
          (o) =>
            o.userId === user.id ||
            o.customerEmail?.toLowerCase().trim() === userEmail ||
            (userNesubsEmail && o.customerEmail?.toLowerCase().trim() === userNesubsEmail)
        );

        setOrders(userOrders);
        setProducts(fetchedProducts);
        setError(null);
        
        // Fetch credentials for all user orders
        const creds: Record<string, any> = {};
        await Promise.all(
          userOrders.map(async (o) => {
            try {
              const res = await fetch(`${API_BASE_URL}/orders/${o.id}/credentials`, {
                headers: { Authorization: `Bearer ${publicAnonKey}` },
              });
              const data = await res.json();
              if (data.success && data.credentials) creds[o.id] = data.credentials;
            } catch (_) {}
          })
        );
        setCredentials(creds);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, authLoading]);

  const getProductImage = (order: Order) => {
    if (order.productImage) return order.productImage;
    const prod = products.find((p) => p.id === order.productId);
    return prod?.image || "";
  };

  const renderEmailDetail = (label: string, value: string, status: string) => {
    const isEmail = label.toLowerCase().includes("email") || value.includes("@");
    if (isEmail) {
      const displayLabel = status === "completed" ? "Sent to" : "Will send to";
      const displayValue = status === "completed" ? `[${value}]` : `(${value})`;
      const textColor = status === "completed" ? "text-green-600 font-semibold" : "text-blue-600 font-semibold";
      return (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{displayLabel}:</span>
          <span className={`font-mono text-sm ml-2 truncate ${textColor}`} title={value}>
            {displayValue}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}:</span>
        <span className="font-medium text-gray-900 truncate ml-2">
          {value}
        </span>
      </div>
    );
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.productName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.id
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" ||
      order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysRemaining = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(
      diffTime / (1000 * 60 * 60 * 24),
    );
    return diffDays;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0A64BC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view and track your orders.</p>
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0A64BC] to-[#084d92] text-white sticky z-40">
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
              <h1 className="text-2xl font-bold">My Orders</h1>
              <p className="text-blue-100 text-sm">
                {filteredOrders.length} orders found
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/4 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by product or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 focus:border-white focus:bg-white/20 outline-none transition-all text-white placeholder:text-white/60"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4">
        {/* Status Filters */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedStatus === "all"
                  ? "bg-[#0A64BC] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({orders.length})
            </button>
            {(Object.keys(statusConfig) as OrderStatus[]).map(
              (status) => {
                const count = orders.filter(
                  (o) => o.status === status,
                ).length;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedStatus === status
                        ? "bg-[#0A64BC] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {statusConfig[status].label} ({count})
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-[#0A64BC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-red-600 font-medium mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#0A64BC] text-white rounded-lg hover:bg-[#084d92]"
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              No orders found
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery || selectedStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Start shopping to see your orders here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const StatusIcon =
                statusConfig[order.status as OrderStatus]?.icon || CheckCircle;
              
              // Get first custom field value for display
              const customFieldEntries = Object.entries(order.customFields || {});
              const firstField = customFieldEntries[0];

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Order Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#0A64BC] to-[#084d92]">
                      {getProductImage(order) ? (
                        <img
                          src={getProductImage(order)}
                          alt={order.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                          {order.productName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {order.productName}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono">
                        #{order.id}
                      </p>
                      {order.packageName && (
                        <p className="text-xs text-[#0A64BC] font-medium mt-1">
                          {order.packageName}
                        </p>
                      )}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                        statusConfig[
                          order.status as OrderStatus
                        ]?.color || statusConfig.pending.color
                      }`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {
                        statusConfig[
                          order.status as OrderStatus
                        ]?.label || order.status
                      }
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-2 mb-3">
                    {/* Customer Name and Main Email */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium text-gray-900 truncate ml-2">
                        {order.userActualName || order.customerName || user?.name} ({order.userMainEmail || order.customerEmail || user?.email})
                      </span>
                    </div>
                    {/* Nesubs Email */}
                    {(order.userNesubsEmail || user?.nesubsEmail) && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Nesubs Email:</span>
                        <span className="font-mono text-sm text-blue-600 font-semibold ml-2">
                          {order.userNesubsEmail || user?.nesubsEmail}
                        </span>
                      </div>
                    )}
                    {/* Show first custom field */}
                    {firstField && renderEmailDetail(firstField[0], firstField[1], order.status)}
                    {/* Order Date */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Order Date:
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    {/* Payment Method */}
                    {order.paymentMethod && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Payment:
                        </span>
                        <span className="font-medium text-gray-900">
                          {order.paymentMethod}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="text-xl font-bold text-[#0A64BC]">Rs. {order.price.toLocaleString()}</span>
                  </div>

                  {/* View Credentials/Details Toggle */}
                  {credentials[order.id] && (
                    <div className="mt-3">
                      <button
                        onClick={() => setExpandedCreds(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-50 text-[#0A64BC] rounded-xl font-semibold text-sm border border-blue-100 hover:bg-blue-100/50 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Eye className="w-4 h-4" /> 
                          {expandedCreds[order.id] ? "Hide Order Details" : "Show Order Details"}
                        </span>
                        {expandedCreds[order.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {expandedCreds[order.id] && (
                        <div className="mt-2 bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-2">
                          <p className="text-xs text-blue-700 font-medium mb-2">Keep these credentials safe and private.</p>
                          {Object.entries(credentials[order.id].credentials as Record<string, string>).map(([key, value], idx) => (
                            <div key={key} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-blue-50">
                              <span className="text-xs font-semibold text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-gray-900">
                                  {showValues[order.id]?.[idx] ? String(value) : "••••••••"}
                                </span>
                                <button
                                  onClick={() => setShowValues(prev => ({
                                    ...prev,
                                    [order.id]: { ...(prev[order.id] || {}), [idx]: !prev[order.id]?.[idx] }
                                  }))}
                                  className="text-gray-400 hover:text-gray-700"
                                >
                                  {showValues[order.id]?.[idx] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}