import { Star, Zap } from "lucide-react";
import { Link } from "react-router";
import { Product } from "../utils/api";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Extract all package prices from both direct packages array and packageGroups
  const prices: number[] = [];

  if (product.packages && Array.isArray(product.packages)) {
    product.packages.forEach((pkg: any) => {
      if (pkg && typeof pkg.price === "number") {
        prices.push(pkg.price);
      }
    });
  }

  if (product.packageGroups && Array.isArray(product.packageGroups)) {
    product.packageGroups.forEach((group: any) => {
      if (group && Array.isArray(group.packages)) {
        group.packages.forEach((pkg: any) => {
          if (pkg && typeof pkg.price === "number") {
            prices.push(pkg.price);
          }
        });
      }
    });
  }

  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col h-full group"
    >
      {/* Product Image Cover */}
      <div className="aspect-video bg-gray-100 overflow-hidden relative flex-shrink-0">
        {/* Instant Delivery Badge */}
        <span className="absolute top-3 left-3 px-2 py-1 bg-[#0A64BC] text-white text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 shadow-md z-10">
          <Zap className="w-3 h-3 fill-white text-white" />
          Instant
        </span>

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A64BC] to-[#084d92] text-white font-bold text-2xl">
            {product.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Product Content info */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-semibold text-gray-950 text-sm sm:text-base line-clamp-1 group-hover:text-[#0A64BC] transition-colors mb-1.5">
            {product.name}
          </h3>
          
          {/* Subtle Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-gray-700">4.9</span>
            <span className="text-[10px] text-gray-400">(Auto-Verified)</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-500 font-medium">Starting from</p>
            <span className="text-sm sm:text-base font-bold text-gray-900">
              {lowestPrice > 0 ? `Rs. ${lowestPrice.toLocaleString()}` : "Free / Offer"}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-[#E8F3FC] group-hover:bg-[#0A64BC] text-[#0A64BC] group-hover:text-white rounded-xl text-xs font-bold transition-all duration-300">
            Order
          </div>
        </div>
      </div>
    </Link>
  );
}