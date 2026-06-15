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
        relative w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer focus:outline-none
        ${selected 
          ? 'border-[#0A64BC] bg-blue-50/40 shadow-md shadow-blue-100/50 scale-[1.01]' 
          : 'border-gray-200/80 bg-white hover:border-blue-300 hover:bg-gray-50/40 hover:shadow-sm active:scale-[0.99]'
        }
      `}
      type="button"
    >
      {/* Selected Check Indicator */}
      {selected && (
        <div className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-[#0A64BC] rounded-full flex items-center justify-center shadow-md z-10 animate-in zoom-in duration-155">
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3.5} />
        </div>
      )}

      <div className="flex flex-col h-full justify-between gap-3">
        <div>
          {/* Package Name */}
          <h3 className={`text-base font-bold transition-colors duration-150 ${selected ? 'text-[#0A64BC]' : 'text-gray-900'}`}>
            {pkg.name}
          </h3>

          {/* Duration Badge */}
          {pkg.duration && (
            <div className="mt-1.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide ${
                selected ? 'bg-[#0A64BC]/10 text-[#0A64BC]' : 'bg-gray-100 text-gray-500'
              }`}>
                {pkg.duration}
              </span>
            </div>
          )}
        </div>

        {/* Price Tag */}
        <div className="pt-2 border-t border-dashed border-gray-100">
          <span className={`text-xl font-extrabold tracking-tight transition-colors duration-150 ${selected ? 'text-[#0A64BC]' : 'text-gray-900'}`}>
            Rs. {pkg.price.toLocaleString()}
          </span>
        </div>
      </div>
    </button>
  );
}