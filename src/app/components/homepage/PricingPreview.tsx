import { Link } from "react-router";
import { Check, ArrowRight, Zap, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { getProducts, Product } from "../utils/api";

export function PricingPreview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productsData = await getProducts();
        // Get first 3 active products with packages
        const activeProducts = productsData
          .filter(p => p.status === 'active' && p.packages && p.packages.length > 0)
          .slice(0, 3);
        setProducts(activeProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Fallback hardcoded data if no products from backend
  const popularProducts = products.length > 0 ? products.map((product, index) => {
    const lowestPrice = product.packages && product.packages.length > 0
      ? Math.min(...product.packages.map(pkg => pkg.price))
      : 0;
    const originalPrice = Math.round(lowestPrice * 1.15); // Show 15% discount
    const badges = ["POPULAR", "BEST VALUE", "TRENDING"];
    
    return {
      id: product.id,
      name: product.name,
      originalPrice: originalPrice,
      price: lowestPrice,
      period: product.packages[0]?.duration || "1 Month",
      badge: badges[index % badges.length],
      features: [
        "Instant delivery",
        "24/7 Support",
        "Nepal verified",
        "Secure payment"
      ],
      discount: "15% OFF"
    };
  }) : [
    {
      id: "1",
      name: "Netflix Premium",
      originalPrice: 1899,
      price: 1699,
      period: "1 Month",
      badge: "POPULAR",
      features: [
        "4K Ultra HD streaming",
        "4 screens at once",
        "Instant delivery",
        "Nepal support"
      ],
      discount: "11% OFF"
    },
    {
      id: "2",
      name: "Spotify Premium",
      originalPrice: 599,
      price: 499,
      period: "1 Month",
      badge: "BEST VALUE",
      features: [
        "Ad-free music",
        "Unlimited skips",
        "Offline download",
        "High quality audio"
      ],
      discount: "17% OFF"
    },
    {
      id: "3",
      name: "PlayStation Plus",
      originalPrice: 4999,
      price: 4499,
      period: "1 Year",
      badge: "TRENDING",
      features: [
        "Monthly free games",
        "Online multiplayer",
        "Exclusive discounts",
        "Cloud storage"
      ],
      discount: "10% OFF"
    }
  ];

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-[#0A64BC] to-[#084d92] py-12 lg:py-20 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-[#0A64BC] to-[#084d92] py-12 lg:py-20 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-semibold mb-4">
            Transparent Pricing
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Popular Services at Best Prices
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            All prices in Rs. No hidden fees. What you see is what you pay.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {popularProducts.map((product, index) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Badge */}
              <div className="absolute top-0 right-0">
                <div className={`px-4 py-1 text-xs font-bold text-white rounded-bl-2xl ${
                  product.badge === "POPULAR" ? "bg-orange-500" :
                  product.badge === "BEST VALUE" ? "bg-green-500" :
                  "bg-purple-500"
                }`}>
                  {product.badge}
                </div>
              </div>

              {/* Product Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-4">
                {product.name}
              </h3>
              <p className="text-gray-600 mb-4">{product.period}</p>

              {/* Pricing with Anchoring */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-gray-400 line-through text-lg">
                    Rs. {product.originalPrice}
                  </span>
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                    {product.discount}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#0A64BC]">
                    Rs. {product.price}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to={`/product/${product.id}`}
                className="block w-full bg-gradient-to-r from-[#0A64BC] to-[#084d92] text-white py-3 rounded-xl font-bold text-center hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Buy Now
                <ArrowRight className="w-5 h-5" />
              </Link>

              {/* Trust Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Delivered in 60 seconds</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View All Products
            <Star className="w-5 h-5" />
          </Link>
        </div>

        {/* Money-back guarantee */}
        <div className="mt-8 text-center">
          <p className="text-white text-sm">
            <span className="font-bold">100% Money-Back Guarantee</span> • If we can't deliver, you get a full refund instantly
          </p>
        </div>
      </div>
    </section>
  );
}