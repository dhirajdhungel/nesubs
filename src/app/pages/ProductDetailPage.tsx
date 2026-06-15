import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, Star } from "lucide-react";
import { getProduct, Product, Package, PackageGroup } from "../utils/api";
import { PackageCard } from "../components/PackageCard";
import { PaymentModal } from "../components/PaymentModal";
import { API_BASE_URL } from "../utils/api";

interface HolidayModeConfig {
  enabled: boolean;
  startNow: boolean;
  startDate: string;
  endDate: string;
}

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      
      try {
        setLoading(true);
        const productData = await getProduct(id);
        setProduct(productData);
        setError(null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
    fetchHolidayMode();
  }, [id]);

  const [isHolidayMode, setIsHolidayMode] = useState(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0A64BC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center px-4">
          <p className="text-red-600 mb-4">{error || "Product not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#0A64BC] text-white rounded-lg hover:bg-[#084d92]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleBuyNow = () => {
    // For products with packages, require package selection
    if (product.packages && product.packages.length > 0 && !selectedPackage) {
      // Auto-scroll to packages section with smooth animation
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    // Open payment modal
    setIsPaymentModalOpen(true);
  };

    // If no selected package, try to find the first package across flat packages or groups
    let firstPackagePrice = 0;
    if (product.packages && product.packages.length > 0) {
      firstPackagePrice = product.packages[0].price;
    } else if (product.packageGroups && product.packageGroups.length > 0 && product.packageGroups[0].packages.length > 0) {
      firstPackagePrice = product.packageGroups[0].packages[0].price;
    }

    const totalPrice = selectedPackage
      ? selectedPackage.price
      : firstPackagePrice;

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="max-w-[1200px] mx-auto">
        {/* Product Header Section */}
        <div className="p-4 bg-white border-b border-gray-100">
          <div className="flex gap-4 items-start">
            {/* App Logo - Circular */}
            <div className="w-20 h-20 rounded-2xl shadow-lg overflow-hidden flex-shrink-0 bg-gray-200">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A64BC] to-[#084d92] text-white font-bold text-2xl">
                  {product.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Name and Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {product.name}
                </h2>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm text-gray-900">
                    4.8
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  (2,459 reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Packages Section */}
        {product.packageGroups && product.packageGroups.length > 0 ? (
          <div className="px-4 py-6 space-y-4 bg-gray-50">
            {product.packageGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-2xl p-4 shadow-sm">
                {/* Group Name */}
                {group.groupName && (
                  <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                    {group.groupName}
                  </h3>
                )}
                {/* Packages in this group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.packages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      package={pkg}
                      selected={selectedPackage?.id === pkg.id}
                      onSelect={() => setSelectedPackage(pkg)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : product.packages && product.packages.length > 0 ? (
          /* Fallback: Display flat packages if no groups */
          <div className="px-4 py-6 space-y-8 bg-gray-50">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Select Package
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {product.packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    package={pkg}
                    selected={selectedPackage?.id === pkg.id}
                    onSelect={() => setSelectedPackage(pkg)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Simple Product - No Packages */
          <div className="p-4">
            <div className="bg-[#E8F3FC] rounded-2xl p-4 mb-4">
              <p className="text-sm text-gray-600">
                No packages available for this product.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA Bar */}
      {((product.packages && product.packages.length > 0) || (product.packageGroups && product.packageGroups.length > 0)) && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-10">
          <div className="max-w-[1200px] mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              {/* Price Info */}
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-0.5">
                  Total Price
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs. {totalPrice.toLocaleString()}
                </p>
                {selectedPackage && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedPackage.name} {selectedPackage.duration && `- ${selectedPackage.duration}`}
                  </p>
                )}
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className={`px-8 py-4 rounded-xl font-bold text-white transition-all min-h-[56px] text-lg shadow-lg active:scale-[0.98] ${
                  isHolidayMode 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-[#0A64BC] hover:bg-[#084d92]"
                }`}
              >
                {isHolidayMode ? "Holiday Enabled" : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        packageName={selectedPackage?.name}
        totalPrice={totalPrice}
        productId={product.id}
        productName={product.name}
        customFields={product.customFields}
        productImage={product.image}
      />
    </div>
  );
}