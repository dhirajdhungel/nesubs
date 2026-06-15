import { Link } from "react-router";
import { Zap } from "lucide-react";
import { Product } from "../utils/api";

interface AppIconProps {
  product: Product;
  showPrice?: boolean;
}

export function AppIcon({ product, showPrice = true }: AppIconProps) {
  // Get the lowest price from packages
  const lowestPrice = product.packages && product.packages.length > 0
    ? Math.min(...product.packages.map(pkg => pkg.price))
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="flex flex-col items-center gap-2 group">
      {/* Circular App Icon */}
      <div className="relative">
        <div 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105 bg-gray-200"
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A64BC] to-[#084d92] text-white font-bold text-xl">
              {product.name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* App Name */}
      <div className="text-center w-20 sm:w-24">
        <p className="text-xs sm:text-sm text-gray-900 font-medium truncate">
          {product.name}
        </p>
        {showPrice && lowestPrice > 0 && (
          <p className="text-xs text-[#0A64BC] font-semibold">
            From Rs. {lowestPrice}
          </p>
        )}
      </div>
    </Link>
  );
}