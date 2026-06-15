import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  CreditCard,
  Download,
  Filter,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  DollarSign,
  Briefcase,
  X,
  Save,
  Loader2,
  RefreshCw
} from "lucide-react";
import { API_BASE_URL, publicAnonKey } from "../../utils/api";
import { toast } from "sonner";

interface PaymentHistory {
  id: string;
  transactionRef: string;
  orderId: string;
  amount: string;
  status: "qr_generated" | "payment_success" | "payment_failed";
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  updatedAt: string;
  transactionId: string | null;
  paymentCompletedAt: string | null;
  bankName: string;
  remarks: string;
}

interface PaymentStats {
  totalTransactions: number;
  paymentSuccess: number;
  totalAmount: number;
}

export function AdminPaymentHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(null);
  
  // Modal Edit Form State
  const [editStatus, setEditStatus] = useState<"qr_generated" | "payment_success" | "payment_failed">("qr_generated");
  const [editTransactionId, setEditTransactionId] = useState("");
  const [editBankName, setEditBankName] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  // Advanced Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/payment/history`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      } else {
        toast.error("Failed to load payment history");
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (payment: PaymentHistory) => {
    setSelectedPayment(payment);
    setEditStatus(payment.status);
    setEditTransactionId(payment.transactionId || "");
    setEditBankName(payment.bankName || payment.paymentMethod || "");
    setEditRemarks(payment.remarks || "");
  };

  const handleSaveDetails = async () => {
    if (!selectedPayment) return;
    
    setSavingDetails(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payment/history/${selectedPayment.orderId}/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          transactionId: editTransactionId,
          bankName: editBankName,
          remarks: editRemarks,
          status: editStatus
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Payment details saved successfully");
        setSelectedPayment(null);
        fetchData(); // Refresh history
      } else {
        toast.error(data.error || "Failed to save payment details");
      }
    } catch (error) {
      console.error("Error saving payment details:", error);
      toast.error("Failed to save payment details");
    } finally {
      setSavingDetails(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "qr_generated":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Pending QR
          </span>
        );
      case "payment_success":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Paid Success
          </span>
        );
      case "payment_failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  // Client Side Filtering based on Advanced Filters
  const filteredHistory = history.filter((item) => {
    // Search query matching
    const matchesSearch =
      item.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.customerEmail && item.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.customerName && item.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.transactionId && item.transactionId.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter matching
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    // Provider / Bank matching
    const matchesProvider =
      providerFilter === "all" ||
      item.paymentMethod?.toLowerCase() === providerFilter.toLowerCase() ||
      item.bankName?.toLowerCase() === providerFilter.toLowerCase();

    // Date matching
    let matchesDate = true;
    if (startDate) {
      const start = new Date(startDate).getTime();
      const itemTime = new Date(item.createdAt).getTime();
      matchesDate = matchesDate && itemTime >= start;
    }
    if (endDate) {
      // Set to end of target day
      const end = new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1);
      const itemTime = new Date(item.createdAt).getTime();
      matchesDate = matchesDate && itemTime <= end;
    }

    // Amount matching
    let matchesAmount = true;
    const amountVal = parseFloat(item.amount);
    if (minAmount) {
      matchesAmount = matchesAmount && amountVal >= parseFloat(minAmount);
    }
    if (maxAmount) {
      matchesAmount = matchesAmount && amountVal <= parseFloat(maxAmount);
    }

    return matchesSearch && matchesStatus && matchesProvider && matchesDate && matchesAmount;
  });

  // Dynamic stats calculation based on current filtered history
  const totalTransactions = filteredHistory.length;
  const paymentSuccessCount = filteredHistory.filter((h) => h.status === "payment_success").length;
  const totalRevenue = filteredHistory
    .filter((h) => h.status === "payment_success")
    .reduce((sum, h) => sum + parseFloat(h.amount), 0);
  const successRate = totalTransactions > 0 ? (paymentSuccessCount / totalTransactions) * 100 : 0;

  const exportToCSV = () => {
    const headers = [
      "Transaction Ref",
      "Order ID",
      "Amount",
      "Status",
      "Customer Name",
      "Customer Email",
      "Bank/Channel",
      "Transaction ID",
      "Remarks",
      "Created At",
      "Payment Completed At"
    ];

    const rows = filteredHistory.map((item) => [
      item.transactionRef,
      item.orderId,
      item.amount,
      item.status,
      item.customerName || "-",
      item.customerEmail || "-",
      item.bankName || "-",
      item.transactionId || "-",
      item.remarks || "-",
      formatDate(item.createdAt),
      item.paymentCompletedAt ? formatDate(item.paymentCompletedAt) : "-"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payment-history-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setProviderFilter("all");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment History & Auditing</h1>
            <p className="text-sm text-gray-600 mt-1">
              Verify transactions, map custom checkout payments, and manage manual confirmations.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="flex items-center justify-center p-2.5 border-2 border-gray-200 hover:border-gray-400 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
            <p className="text-xs text-gray-500 mt-1">Based on current filter criteria</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Paid Success Transactions</p>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{paymentSuccessCount}</p>
            <p className="text-xs text-gray-500 mt-1">Manual confirmations + verified callbacks</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Success Revenue</p>
              <TrendingUp className="w-5 h-5 text-[#0A64BC]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">Rs. {totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Calculated from success state</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{successRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Completed vs QR generated ratio</p>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-gray-900">Advanced Filter Transactions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Search query */}
            <div className="md:col-span-2 relative">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Search Keywords</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ID, Ref, email, customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 h-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A64BC] outline-none"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg text-sm px-3 focus:ring-2 focus:ring-[#0A64BC] outline-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="qr_generated">Pending QR</option>
                <option value="payment_success">Paid Success</option>
                <option value="payment_failed">Failed / Cancelled</option>
              </select>
            </div>

            {/* Provider */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Provider / Bank</label>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg text-sm px-3 focus:ring-2 focus:ring-[#0A64BC] outline-none bg-white"
              >
                <option value="all">All Channels</option>
                <option value="Fonepay">Fonepay</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 h-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A64BC] outline-none"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 h-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A64BC] outline-none"
                />
              </div>
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Min Price (Rs.)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full pl-9 pr-3 h-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A64BC] outline-none"
                />
              </div>
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Max Price (Rs.)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full pl-9 pr-3 h-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A64BC] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Transaction ID / Ref
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Customer Details
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Bank Name
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-[#0A64BC] animate-spin" />
                        <p className="text-gray-500 font-semibold text-sm">Loading transactions...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <CreditCard className="w-12 h-12 text-gray-300" />
                        <p className="text-sm font-semibold text-gray-500">No payment records match filters</p>
                        <p className="text-xs text-gray-400">Try loosening your search terms or date ranges</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetails(item)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-mono font-bold text-gray-900">
                          {item.transactionRef}
                        </p>
                        {item.transactionId && (
                          <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                            Bank Trc: {item.transactionId}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900 font-medium">{item.orderId.substring(0, 18)}...</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-gray-900">
                          Rs. {Number(item.amount).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{item.customerName || "-"}</p>
                        <p className="text-xs text-gray-500">{item.customerEmail || "-"}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">{formatDate(item.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                          {item.bankName || "Fonepay"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(item);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View/Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mapped Count */}
        {filteredHistory.length > 0 && (
          <p className="text-sm text-gray-600 text-center font-medium">
            Showing {filteredHistory.length} of {history.length} audit records
          </p>
        )}

        {/* Transaction Details Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl border border-gray-200 max-w-xl w-full p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#0A64BC]" />
                  <h2 className="text-xl font-bold text-gray-900">Audit Transaction Details</h2>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mapped Transaction summary */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 text-sm border border-gray-200">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Transaction Ref</p>
                  <p className="font-mono font-bold text-gray-900 mt-0.5">{selectedPayment.transactionRef}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Order ID</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedPayment.orderId}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Amount Due</p>
                  <p className="font-bold text-[#0A64BC] text-base mt-0.5">Rs. {Number(selectedPayment.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Gateway Setup</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedPayment.paymentMethod || "Fonepay"}</p>
                </div>
                <div className="col-span-2 border-t border-gray-200/60 pt-3 mt-1">
                  <p className="text-xs font-bold text-gray-500 uppercase">Customer Information</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedPayment.customerName || "N/A"}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{selectedPayment.customerEmail || "N/A"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Phone: {selectedPayment.customerPhone || "N/A"}</p>
                </div>
                <div className="col-span-2 border-t border-gray-200/60 pt-3">
                  <p className="text-xs font-bold text-gray-500 uppercase">Creation Date</p>
                  <p className="text-xs text-gray-700 mt-0.5">{formatDate(selectedPayment.createdAt)}</p>
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  {/* Status Dropdown */}
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Audit Payment Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0A64BC]"
                    >
                      <option value="qr_generated">Pending QR</option>
                      <option value="payment_success">Paid Success</option>
                      <option value="payment_failed">Failed / Cancelled</option>
                    </select>
                  </div>

                  {/* Bank Select */}
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Channel / Bank Name</label>
                    <select
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0A64BC]"
                    >
                      <option value="Fonepay">Fonepay</option>
                    </select>
                  </div>
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Transaction ID (Bank Reference)</label>
                  <input
                    type="text"
                    value={editTransactionId}
                    onChange={(e) => setEditTransactionId(e.target.value)}
                    placeholder="Enter transaction ref number from bank callback"
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0A64BC] outline-none"
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Internal Remarks / Audit Notes</label>
                  <textarea
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    rows={3}
                    placeholder="Add manual verification remarks, trace audit logs, or approval descriptions..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A64BC] outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="flex-1 h-11 border border-gray-300 hover:bg-gray-50 rounded-xl font-semibold text-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDetails}
                  disabled={savingDetails}
                  className="flex-1 h-11 bg-[#0A64BC] hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {savingDetails ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Details
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}