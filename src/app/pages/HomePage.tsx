import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { getCategories, getProducts, Category, Product } from "../utils/api";
import { AppIcon } from "../components/AppIcon";
import { CategoryCard } from "../components/CategoryCard";
import { BannerSlider } from "../components/BannerSlider";
import { HeroSection } from "../components/homepage/HeroSection";
import { FAQSection } from "../components/homepage/FAQSection";
import { FinalCTA } from "../components/homepage/FinalCTA";

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // fetchData is declared outside useEffect so it can be reused by the Retry button
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
      setProducts(productsData.filter(p => p.status === 'active'));
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // Group products by category
  const productsByCategory = categories.map((category) => ({
    category,
    products: products.filter((p) => p.categoryId === category.id),
  }));

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
            onClick={() => fetchData()}
            className="px-6 py-3 bg-[#0A64BC] text-white rounded-lg hover:bg-[#084d92]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Above the Fold */}
      <HeroSection />

      {/* Quick Categories - Horizontal Scroll */}
      <section className="bg-white py-6 border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto">
          <div className="px-4 mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Categories</h2>
          </div>
          
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex content-center gap-3 px-4 pb-2">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Category Sections */}
      {productsByCategory.map(({ category, products: categoryProducts }, index) => {
        if (categoryProducts.length === 0) return null;

        return (
          <section
            key={category.id}
            className={`py-6 px-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
          >
            <div className="max-w-[1200px] mx-auto">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
                </div>
                <Link
                  to={`/search?category=${category.id}`}
                  className="text-[#0A64BC] text-sm flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 3 icons per row on mobile, more on desktop */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {categoryProducts.slice(0, 6).map((product) => (
                  <AppIcon key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}