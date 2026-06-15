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
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon as keyof typeof iconMap];

  return (
    <Link
      to={`/search?category=${category.id}`}
      className="flex-shrink-0 w-24 lg:w-32"
    >
      <div className="bg-[#E8F3FC] rounded-2xl p-4 aspect-square flex flex-col items-center justify-center hover:bg-[#d0e7f8] transition-colors">
        {/* Display icon - could be emoji, URL, or Lucide icon */}
        {Icon ? (
          <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-[#0A64BC] mb-2" />
        ) : category.icon.startsWith('http') ? (
          <img src={category.icon} alt={category.name} className="w-8 h-8 lg:w-10 lg:h-10 mb-2 object-contain" />
        ) : (
          <span className="text-3xl lg:text-4xl mb-2">{category.icon}</span>
        )}
        <span className="text-xs lg:text-sm font-medium text-gray-900 text-center">
          {category.name}
        </span>
      </div>
    </Link>
  );
}