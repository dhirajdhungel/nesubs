import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search as SearchIcon,
  Gamepad2,
  Tv,
  Gift,
  Briefcase,
} from "lucide-react";
import { useSearchParams } from "react-router";
import { getCategories, getProducts, Category, Product } from "../utils/api";
import { AppIcon } from "../components/AppIcon";

const iconMap = {
  Gamepad2,
  Tv,
  Gift,
  Briefcase,
};

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [categoriesData, productsData] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);
        setCategories(categoriesData.filter(cat => cat.name !== "Unknown").sort((a, b) => a.order - b.order));
        setProducts(productsData.filter(p => p.status === 'active'));
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Update selected category when URL changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Auto-focus search input when page loads
  useEffect(() => {
    // Small delay to ensure the page is fully rendered
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) => p.categoryId === selectedCategory,
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory, products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0A64BC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#0A64BC] text-white rounded-lg hover:bg-[#084d92]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky min-h-screen bg-gray-50 pb-20">
      {/* Search Bar - Sticky below header (h-14 = 56px) */}
      <div className="z-40 bg-white shadow-md">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-gray-100 rounded-lg border-2 border-transparent focus:border-[#0A64BC] focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-500"
              ref={searchInputRef}
            />
          </div>
        </div>
      </div>

      {/* Categories with Icons - Scrollable */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Categories
          </h3>

          {/* Horizontal Scrollable Categories */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-2">
              {/* All Button - First in the list */}
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-w-[100px] ${
                  selectedCategory === "all"
                    ? "bg-[#0A64BC] text-white"
                    : "bg-[#E8F3FC] text-gray-700 hover:bg-[#d0e7f8]"
                }`}
              >
                <Briefcase
                  className={`w-6 h-6 ${selectedCategory === "all" ? "text-white" : "text-[#0A64BC]"}`}
                />
                <span className="text-xs font-medium text-center whitespace-nowrap">
                  All
                </span>
              </button>

              {/* Category Buttons */}
              {categories.map((category) => {
                const Icon = iconMap[category.icon as keyof typeof iconMap];
                const isSelected = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-w-[100px] ${
                      isSelected
                        ? "bg-[#0A64BC] text-white"
                        : "bg-[#E8F3FC] text-gray-700 hover:bg-[#d0e7f8]"
                    }`}
                  >
                    {/* Display icon - could be emoji, URL, or Lucide icon */}
                    {Icon ? (
                      <Icon className={`w-6 h-6 ${isSelected ? "text-white" : "text-[#0A64BC]"}`} />
                    ) : category.icon.startsWith('http') ? (
                      <img src={category.icon} alt={category.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="text-2xl">{category.icon}</span>
                    )}
                    <span className="text-xs font-medium text-center whitespace-nowrap">
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-[1200px] mx-auto p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "result"
              : "results"}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No products found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try a different search or category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredProducts.map((product) => (
              <AppIcon key={product.id} product={product} showPrice={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}