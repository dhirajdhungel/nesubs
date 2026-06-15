import { Star, Zap } from "lucide-react";
import { Link } from "react-router";
import { Product } from "../utils/api";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Get the lowest price from packages
  const lowestPrice = product.packages && product.packages.length > 0
    ? Math.min(...product.packages.map(pkg => pkg.price))
    : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
    >
      {/* Product Image */}
      <div className="aspect-video bg-gray-100 overflow-hidden">
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

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 flex-1 line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-700">4.8</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {lowestPrice > 0 && (
              <span className="text-lg font-bold text-gray-900">
                From Rs. {lowestPrice}
              </span>
            )}
          </div>
          <div
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#0A64BC', color: 'white' }}
          >
            Buy Now
          </div>
        </div>
      </div>
    </Link>
  );
}