import { Check } from "lucide-react";
import { Package } from "../utils/api";

interface PackageCardProps {
  package: Package;
  selected: boolean;
  onSelect: () => void;
}

export function PackageCard({ package: pkg, selected, onSelect }: PackageCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative w-full min-h-[96px] p-4 rounded-xl border-2 transition-all text-left
        ${selected 
          ? 'border-[#0A64BC] bg-[#E8F3FC] shadow-lg scale-[1.02]' 
          : 'border-gray-200 bg-white hover:border-[#0A64BC] hover:shadow-md active:scale-[0.98]'
        }
      `}
    >
      {/* Selected Check */}
      {selected && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#0A64BC] rounded-full flex items-center justify-center shadow-lg z-10">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {/* Package Name */}
        <h3 className={`text-lg font-bold ${selected ? 'text-[#0A64BC]' : 'text-gray-900'}`}>
          {pkg.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${selected ? 'text-[#0A64BC]' : 'text-gray-900'}`}>
            Rs. {pkg.price.toLocaleString()}
          </span>
        </div>

        {/* Duration (if available) */}
        {pkg.duration && (
          <p className="text-xs text-gray-500">
            {pkg.duration}
          </p>
        )}
      </div>
    </button>
  );
}