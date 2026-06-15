import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { getCategories, getProducts, Category, Product } from "../utils/api";
import { ProductCard } from "../components/ProductCard";
import { CategoryCard } from "../components/CategoryCard";
import { HeroSection } from "../components/homepage/HeroSection";
import { FAQSection } from "../components/homepage/FAQSection";

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [categoriesData, productsData] = await Promise.all([
        getCategories(),
        getProducts(),
      ]);
      setCategories(categoriesData.filter(cat => cat.name !== "Unknown").sort((a, b) => a.order - b.order));
      setProducts(productsData.filter(p => p.status === "active"));
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // Filtered list when category selected
  const activeFilteredProducts = selectedCategoryId
    ? products.filter((p) => p.categoryId === selectedCategoryId)
    : [];

  const selectedCategoryName = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)?.name || ""
    : "";

  // Group products by category (used for the "All Services" grid view)
  const productsByCategory = categories.map((category) => ({
    category,
    products: products.filter((p) => p.categoryId === category.id),
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0A64BC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-600 mb-4 font-semibold">{error}</p>
          <button
            onClick={() => fetchData()}
            className="px-6 py-3 bg-[#0A64BC] text-white rounded-xl hover:bg-[#084d92] transition-colors font-semibold"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Horizontal Selector / Tabs */}
      <section className="bg-white py-6 border-b border-gray-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-[1200px] mx-auto">
          <div className="px-4 mb-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base lg:text-lg">Product Categories</h2>
          </div>
          
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex content-center gap-3 px-4 pb-2">
              {/* All Services Pill */}
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="flex-shrink-0 w-24 lg:w-32 focus:outline-none cursor-pointer"
                type="button"
              >
                <div
                  className={`rounded-2xl p-4 aspect-square flex flex-col items-center justify-center transition-all duration-300 border-2 ${
                    selectedCategoryId === null
                      ? "bg-[#0A64BC] text-white border-[#0A64BC] shadow-lg scale-105"
                      : "bg-white text-gray-700 border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 hover:shadow-md hover:scale-102"
                  }`}
                >
                  <span className="text-3xl mb-2">🛍️</span>
                  <span className={`text-xs lg:text-sm font-semibold text-center ${selectedCategoryId === null ? "text-white" : "text-gray-950"}`}>
                    All Services
                  </span>
                </div>
              </button>

              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => setSelectedCategoryId(category.id)}
                  isActive={selectedCategoryId === category.id}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Products Catalog */}
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {selectedCategoryId ? (
          // FILTERED STATE: Single category unified grid
          <section className="animate-fadeIn">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-950">{selectedCategoryName}</h2>
                <p className="text-sm text-gray-500 mt-1">Found {activeFilteredProducts.length} items</p>
              </div>
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="text-sm text-[#0A64BC] hover:underline font-semibold"
              >
                Clear Filter
              </button>
            </div>

            {activeFilteredProducts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 font-medium shadow-xs">
                No active products in this category at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {activeFilteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        ) : (
          // DEFAULT STATE: Categories Grouped List (shows all categories with cards)
          <div className="space-y-10">
            {productsByCategory.map(({ category, products: categoryProducts }) => {
              if (categoryProducts.length === 0) return null;

              return (
                <section key={category.id} className="animate-fadeIn">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-950">{category.name}</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Premium instant service listings</p>
                    </div>
                    <Link
                      to={`/search?category=${category.id}`}
                      className="text-[#0A64BC] text-sm flex items-center gap-1 font-bold hover:underline"
                    >
                      View All ({categoryProducts.length})
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
                    {categoryProducts.slice(0, 8).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}