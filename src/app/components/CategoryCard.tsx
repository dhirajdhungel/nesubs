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
      className={`rounded-2xl p-4 aspect-square flex flex-col items-center justify-center transition-all duration-300 border-2 w-full ${
        isActive
          ? "bg-[#0A64BC] text-white border-[#0A64BC] shadow-lg scale-105"
          : "bg-white text-gray-700 border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 hover:shadow-md hover:scale-102"
      }`}
    >
      {/* Icon display logic (Made bigger) */}
      {Icon ? (
        <Icon className={`w-12 h-12 lg:w-14 lg:h-14 mb-2 transition-colors ${isActive ? "text-white" : "text-[#0A64BC]"}`} />
      ) : category.icon.startsWith("http") ? (
        <img
          src={category.icon}
          alt={category.name}
          className="w-12 h-12 lg:w-14 lg:h-14 mb-2 object-contain"
        />
      ) : (
        <span className="text-4xl lg:text-5xl mb-2">{category.icon}</span>
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
        className="w-full focus:outline-none cursor-pointer"
        type="button"
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link
      to={`/search?category=${category.id}`}
      className="w-full"
    >
      {cardContent}
    </Link>
  );
}