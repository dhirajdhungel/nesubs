import { Link } from "react-router";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative bg-gradient-to-br from-[#0A64BC] via-purple-700 to-[#084d92] py-16 lg:py-24 px-4 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mt-48" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mb-48" />
      
      <div className="max-w-[900px] mx-auto text-center relative z-10">
        {/* Main Headline */}
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
          Ready to Get Your Digital Services Instantly?
        </h2>

        {/* Subheadline */}
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join 15,000+ happy customers across Nepal. Start saving time and money today.
        </p>

        {/* Key Benefits - Quick Reminder */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <Zap className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
            <p className="text-white font-semibold">Fast delivery</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <Shield className="w-8 h-8 text-green-300 mx-auto mb-2" />
            <p className="text-white font-semibold">100% secure</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <Clock className="w-8 h-8 text-blue-300 mx-auto mb-2" />
            <p className="text-white font-semibold">24/7 support</p>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link
            to="/search"
            className="bg-yellow-400 text-gray-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105 inline-flex items-center justify-center gap-2"
          >
            Start Shopping Now
            <ArrowRight className="w-6 h-6" />
          </Link>
          <Link
            to="/search"
            className="border-2 border-white text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
          >
            Browse Categories
          </Link>
        </div>

        {/* Trust Statement */}
        <div className="text-sm text-blue-200">
          <p className="mb-2">No credit card required to browse</p>
          <p>100% money-back guarantee • Instant delivery or your money back</p>
        </div>

        {/* Social Proof - Final Nudge */}
        <div className="mt-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 inline-block">
          <p className="text-white font-bold mb-1">
            <span className="text-yellow-300 text-2xl">1,247</span> orders in the last 24 hours
          </p>
          <p className="text-blue-200 text-sm">Don't miss out on instant delivery!</p>
        </div>
      </div>
    </section>
  );
}