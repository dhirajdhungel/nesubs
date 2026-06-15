import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Clock,
  Package,
  ArrowRight,
  Mail,
} from "lucide-react";
import { publicAnonKey } from "../../utils/api";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      // TODO: Replace with actual API calls
      // For now, using dummy data
      setStats({
        totalOrders: 245,
        totalRevenue: 245890,
        activeUsers: 1432,
        pendingOrders: 12,
      });

      setRecentOrders([
        {
          id: "order1",
          orderNumber: "NES001",
          product: "Netflix Premium",
          user: "pankh321",
          price: 450,
          status: "completed",
        },
        {
          id: "order2",
          orderNumber: "NES002",
          product: "Spotify Family",
          user: "dhiraj567",
          price: 250,
          status: "pending",
        },
        {
          id: "order3",
          orderNumber: "NES003",
          product: "YouTube Premium",
          user: "ram123",
          price: 350,
          status: "completed",
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      trend: "+12.5%",
      trendUp: true,
    },
    {
      label: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: "+18.2%",
      trendUp: true,
    },
    {
      label: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      icon: Users,
      trend: "+8.3%",
      trendUp: true,
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders.toString(),
      icon: Clock,
      trend: "-5.2%",
      trendUp: false,
    },
  ];

  const quickActions = [
    {
      label: "Add Product",
      icon: Package,
      href: "/admin/products/add",
    },
    {
      label: "View Orders",
      icon: ShoppingBag,
      href: "/admin/orders",
    },
    {
      label: "Manage Users",
      icon: Users,
      href: "/admin/users",
    },
    {
      label: "Send Email",
      icon: Mail,
      href: "/admin/emails",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-900" />
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      stat.trendUp
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {stat.trend}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-1 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all group"
                >
                  <Icon className="w-8 h-8 text-gray-900 group-hover:text-white mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-white text-center">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-sm font-semibold text-[#0A64BC] hover:text-[#084d92] flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No orders yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Orders will appear here once customers start purchasing.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate("/admin/orders")}
                    >
                      <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                        #{order.orderNumber}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                        {order.product}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 font-mono">
                        {order.user}@nesubs.com
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-gray-900">
                        Rs. {order.price}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status === "completed" ? "Completed" : "Pending"}
                        </span>
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