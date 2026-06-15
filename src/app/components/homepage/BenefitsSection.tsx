import { Zap, Shield, Clock, Headphones, DollarSign, Gift } from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    {
      icon: Zap,
      title: "Instant Delivery",
      outcome: "Save 6+ hours per week",
      description: "No more waiting days. Get your products in under 60 seconds.",
      iconBg: "from-yellow-400 to-orange-500"
    },
    {
      icon: Shield,
      title: "100% Secure Payment",
      outcome: "Zero fraud risk",
      description: "Bank-level encryption. Your payment data is never stored.",
      iconBg: "from-green-400 to-emerald-600"
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      outcome: "No hidden fees",
      description: "What you see is what you pay. All prices in Rs. including taxes.",
      iconBg: "from-blue-400 to-cyan-600"
    },
    {
      icon: Headphones,
      title: "24/7 Nepal Support",
      outcome: "Get help in Nepali",
      description: "Real humans ready to help you anytime. Chat, call, or email.",
      iconBg: "from-purple-400 to-pink-600"
    },
    {
      icon: Clock,
      title: "Order History",
      outcome: "Never lose a purchase",
      description: "Access all your purchases anytime from your dashboard.",
      iconBg: "from-indigo-400 to-blue-600"
    },
    {
      icon: Gift,
      title: "Loyalty Rewards",
      outcome: "Earn with every purchase",
      description: "Get points on every order and unlock exclusive discounts.",
      iconBg: "from-red-400 to-rose-600"
    }
  ];

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-12 lg:py-20 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Nesubs?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built specifically for Nepal. Designed to save your time and money.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100"
              >
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${benefit.iconBg} rounded-xl shadow-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>

                {/* Outcome (Value Prop) */}
                <div className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded text-sm font-semibold mb-3">
                  {benefit.outcome}
                </div>

                {/* Description */}
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Statement */}
        <div className="text-center mt-12">
          <p className="text-2xl font-bold text-gray-900 mb-2">
            Join 15,000+ Happy Customers
          </p>
          <p className="text-gray-600">
            Nepal's #1 trusted platform for digital services
          </p>
        </div>
      </div>
    </section>
  );
}