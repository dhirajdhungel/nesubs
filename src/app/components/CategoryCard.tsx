import { Gamepad2, Tv, Gift, Coins, Ticket } from "lucide-react";
import { Link } from "react-router";
import { Category } from "../utils/api";

const iconMap = {
  Gamepad2,
  Tv,
  Gift,
  Coins,
  Ticket,
};

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
  isActive?: boolean;
}

export function CategoryCard({ category, onClick, isActive = false }: CategoryCardProps) {
  const Icon = iconMap[category.icon as keyof typeof iconMap];

  const cardContent = (
    <div
      className={`rounded-2xl p-4 aspect-square flex flex-col items-center justify-center transition-all duration-300 border-2 ${
        isActive
          ? "bg-[#0A64BC] text-white border-[#0A64BC] shadow-lg scale-105"
          : "bg-white text-gray-700 border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 hover:shadow-md hover:scale-102"
      }`}
    >
      {/* Icon display logic */}
      {Icon ? (
        <Icon className={`w-8 h-8 lg:w-10 lg:h-10 mb-2 transition-colors ${isActive ? "text-white" : "text-[#0A64BC]"}`} />
      ) : category.icon.startsWith("http") ? (
        <img
          src={category.icon}
          alt={category.name}
          className="w-8 h-8 lg:w-10 lg:h-10 mb-2 object-contain"
        />
      ) : (
        <span className="text-3xl lg:text-4xl mb-2">{category.icon}</span>
      )}
      <span className={`text-xs lg:text-sm font-semibold text-center transition-colors ${isActive ? "text-white" : "text-gray-900"}`}>
        {category.name}
      </span>
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex-shrink-0 w-24 lg:w-32 focus:outline-none cursor-pointer"
        type="button"
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link
      to={`/search?category=${category.id}`}
      className="flex-shrink-0 w-24 lg:w-32"
    >
      {cardContent}
    </Link>
  );
}