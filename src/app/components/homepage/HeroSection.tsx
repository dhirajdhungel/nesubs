import { Link } from "react-router";
import { Star, Shield, Users, CheckCircle2, TrendingUp, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export function HeroSection() {
  const [userCount, setUserCount] = useState(15420);

  // Simulate live user count increment
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-[#0A64BC] to-[#084d92] text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32" />
      
      <div className="max-w-[1200px] mx-auto px-4 py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* Strong Value-Focused Headline */}
            <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
              Get Your Digital Services in <span className="text-yellow-300">Under 30 Seconds</span>
            </h1>
            
            {/* Subheadline with Benefits */}
            <p className="text-lg lg:text-xl text-blue-100 mb-6">
              Netflix, Spotify, Gaming - Instant delivery, Guaranteed.
            </p>
            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-300" />
                <span className="text-blue-100">100% Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-blue-100">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-300" />
                <span className="text-blue-100">{userCount.toLocaleString()}+ Users</span>
              </div>
            </div>
          </div>

          {/* Right: Visual Mockup */}
          <div className="relative hidden lg:block">
            <div className="relative z-10">
              {/* Main Card - Dashboard Preview */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 transform rotate-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0A64BC] to-purple-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold">Order Confirmed</p>
                    <p className="text-xs text-gray-500">Instant Delivery</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Your purchase</p>
                  <p className="text-xl font-bold text-gray-900 mb-2">Netflix Premium - 1 Month</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delivered to</span>
                    <span className="text-sm font-semibold text-gray-900">your@email.com</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Delivered in 23 seconds</span>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm">
                Instant Delivery
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-3xl transform -rotate-3 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}