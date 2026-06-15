import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, Star, Zap, ShieldCheck, Clock, CheckCircle2, HelpCircle, ArrowRight } from "lucide-react";
import { getProduct, Product, Package, PackageGroup } from "../utils/api";
import { PackageCard } from "../components/PackageCard";
import { PaymentModal } from "../components/PaymentModal";
import { API_BASE_URL } from "../utils/api";
import { toast } from "sonner";

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
      <div className="flex items-center justify-center h-screen bg-gray-50/50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0A64BC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50/50">
        <div className="text-center px-4 max-w-md">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Product</h2>
          <p className="text-gray-600 mb-6 text-sm">{error || "Product not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#0A64BC] hover:bg-[#084d92] text-white rounded-xl font-semibold shadow-md transition-colors w-full"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleBuyNow = () => {
    const hasPackages = (product.packages && product.packages.length > 0) || (product.packageGroups && product.packageGroups.length > 0);
    if (hasPackages && !selectedPackage) {
      toast.error("Please select a package first!");
      const element = document.getElementById("packages-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

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
    <div className="min-h-screen bg-gray-50/50 pb-32">
      {/* Header / Breadcrumb navigation */}
      <div className="max-w-[1200px] mx-auto px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors bg-white px-3.5 py-2 rounded-xl border border-gray-200/80 shadow-xs cursor-pointer focus:outline-none"
          type="button"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Catalog
        </button>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Product Info & Guarantees */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            {/* Main Product Card */}
            <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-xs">
              <div className="flex flex-col items-center text-center">
                {/* Logo wrapper */}
                <div className="w-32 h-32 rounded-3xl shadow-lg border-4 border-gray-50 overflow-hidden bg-gray-100 mb-5 relative flex-shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A64BC] to-[#084d92] text-white font-bold text-4xl">
                      {product.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Rating Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100 text-xs font-semibold mb-3">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                  <span className="text-yellow-600 font-medium">(2,459 reviews)</span>
                </div>

                <h1 className="text-2xl font-extrabold text-gray-950 mb-3 tracking-tight">
                  {product.name}
                </h1>
                
                <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Purchase Guide / Steps */}
            <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-xs">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#0A64BC]" />
                How to Purchase
              </h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Select Package", desc: "Choose your preferred package duration or screens from the menu." },
                  { step: "2", title: "Enter Credentials", desc: "Fill in your recipient details (e.g. Player ID / Email) correctly." },
                  { step: "3", title: "Scan & Receive", desc: "Scan Fonepay QR code to complete checkouts instantly." }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-[#0A64BC]/10 text-[#0A64BC] text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-0.5">{item.title}</h4>
                      <p className="text-xs text-gray-500 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Zap, label: "Instant Delivery", color: "text-amber-500 bg-amber-50 border-amber-100" },
                { icon: ShieldCheck, label: "Secure Payments", color: "text-green-600 bg-green-50 border-green-100" },
                { icon: Clock, label: "24/7 Support", color: "text-blue-600 bg-blue-50 border-blue-100" }
              ].map((assur, idx) => {
                const IconComp = assur.icon;
                return (
                  <div key={idx} className="p-3 rounded-2xl border border-gray-200/60 flex flex-col items-center text-center gap-1.5 shadow-2xs bg-white">
                    <div className={`p-2 rounded-xl flex items-center justify-center ${assur.color.split(" ").slice(1).join(" ")}`}>
                      <IconComp className={`w-5 h-5 ${assur.color.split(" ")[0]}`} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-700 leading-tight">
                      {assur.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Packages Section */}
          <div className="lg:col-span-7 space-y-6" id="packages-section">
            {product.packageGroups && product.packageGroups.length > 0 ? (
              <div className="space-y-6">
                {product.packageGroups.map((group) => (
                  <div key={group.id} className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-xs">
                    {/* Group Name */}
                    {group.groupName && (
                      <h3 className="text-lg font-extrabold text-gray-950 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#0A64BC]" />
                        {group.groupName}
                      </h3>
                    )}
                    {/* Packages in this group */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
              <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-xs">
                <h3 className="text-lg font-extrabold text-gray-950 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0A64BC]" />
                  Select Package
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
            ) : (
              /* Simple Product - No Packages */
              <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-xs">
                <div className="bg-[#E8F3FC] rounded-2xl p-6 text-center border border-[#0A64BC]/25">
                  <p className="text-sm text-gray-600 font-medium">
                    No packages available for this product at the moment.
                  </p>
                </div>
              </div>
            )}

            {/* General Instructions Banner */}
            <div className="bg-gradient-to-br from-[#E8F3FC] to-white rounded-3xl p-6 border border-[#0A64BC]/15 shadow-2xs">
              <h4 className="font-bold text-[#0A64BC] text-sm mb-2">Important Instructions</h4>
              <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Double check recipient email and game/player IDs before checkout.</li>
                <li>Refunds are not supported for incorrect account identifiers.</li>
                <li>Digital credentials will be visible inside your account orders dashboard.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Bottom CTA Bar */}
      {((product.packages && product.packages.length > 0) || (product.packageGroups && product.packageGroups.length > 0)) && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[calc(100%-2rem)] lg:max-w-[1168px] bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-2xl rounded-3xl z-40 animate-in slide-in-from-bottom duration-300">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Price Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                  Total Price
                </p>
                <p className="text-2xl font-extrabold text-[#0A64BC]">
                  Rs. {totalPrice.toLocaleString()}
                </p>
                {selectedPackage && (
                  <p className="text-xs text-gray-500 font-medium truncate max-w-[200px] sm:max-w-xs mt-0.5">
                    {selectedPackage.name} {selectedPackage.duration && `• ${selectedPackage.duration}`}
                  </p>
                )}
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className={`px-8 py-4 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-[0.98] cursor-pointer min-h-[56px] text-lg flex items-center gap-2 focus:outline-none ${
                  isHolidayMode 
                    ? "bg-red-500 hover:bg-red-600 shadow-red-200" 
                    : "bg-[#0A64BC] hover:bg-[#084d92] shadow-blue-200"
                }`}
                type="button"
              >
                {isHolidayMode ? "Holiday Enabled" : "Buy Now"}
                <ArrowRight className="w-5 h-5" />
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