import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertCircle,
  Eye,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, publicAnonKey } from "../../utils/api";
import { HolidayModeModal } from "../../components/admin/HolidayModeModal";

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  categoryId: string;
  categoryName: string;
  packages: {
    id: string;
    name: string;
    price: number;
  }[];
  status: string;
  createdAt: string;
}

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [isHolidayMode, setIsHolidayMode] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
      return;
    }

    fetchProducts();
    fetchHolidayMode();
  }, [navigate]);

  const fetchHolidayMode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/website-content`);
      const data = await response.json();
      if (data.success && data.content?.holidayMode) {
        const config = data.content.holidayMode;
        if (config.enabled) {
          const now = new Date().getTime();
          const startTime = config.startNow ? 0 : new Date(config.startDate).getTime();
          const endTime = new Date(config.endDate).getTime();
          
          if (now >= startTime && now < endTime) {
            setIsHolidayMode(true);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch holiday mode status:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    setDeleting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/products/${selectedProduct.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Product deleted successfully!");
        setShowDeleteModal(false);
        setSelectedProduct(null);
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const filteredProducts = products.filter(
    (prod) =>
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPackageCount = (product: Product) => {
    return product.packages?.length || 0;
  };

  const getLowestPrice = (product: Product) => {
    if (!product.packages || product.packages.length === 0) return 0;
    return Math.min(...product.packages.map((pkg) => pkg.price));
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Products Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage products and packages for your platform
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHolidayModal(true)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl font-semibold transition-all shadow-sm ${
                  isHolidayMode 
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                    : "bg-blue-50 text-[#0A64BC] border-blue-200 hover:bg-blue-100"
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                {isHolidayMode ? "Holiday Enabled" : "Holiday Mode"}
              </button>
              <button
                onClick={() => navigate("/admin/products/add")}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or category..."
              className="w-full h-12 pl-12 pr-4 bg-white border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-gray-900"
            />
          </div>
        </div>

        {/* Products List */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? "No products found" : "No products yet"}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Start by adding your first product"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate("/admin/products/add")}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider w-20">
                      Image
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Packages
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Price From
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {product.name}
                          </p>
                          {product.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">
                          {product.categoryName}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {getPackageCount(product)} package
                        {getPackageCount(product) !== 1 ? "s" : ""}
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                        Rs. {getLowestPrice(product)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg ${
                            product.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {product.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/products/edit/${product.id}`)
                            }
                            className="p-2 text-gray-600 hover:text-[#0A64BC] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
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
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Delete Product
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-900">
                    {selectedProduct.name}
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 h-12 px-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    disabled={deleting}
                    className="flex-1 h-12 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-all"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <HolidayModeModal 
          isOpen={showHolidayModal} 
          onClose={() => {
            setShowHolidayModal(false);
            fetchHolidayMode();
          }} 
        />
      </div>
    </AdminLayout>
  );
}
