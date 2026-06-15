import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowRight, X } from "lucide-react";

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isDismissed) return null;

  return (
    <div
      className={`fixed bottom-20 left-0 right-0 z-40 px-4 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-md mx-auto lg:max-w-2xl">
        <div className="bg-gradient-to-r from-[#0A64BC] to-purple-700 rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4 border-2 border-white">
          {/* Content */}
          <div className="flex-1">
            <p className="text-white font-bold mb-1">Ready to get started?</p>
            <p className="text-blue-100 text-sm">Instant delivery • 100% secure</p>
          </div>

          {/* CTA Button */}
          <Link
            to="/search"
            className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
          >
            Browse Now
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Dismiss Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}