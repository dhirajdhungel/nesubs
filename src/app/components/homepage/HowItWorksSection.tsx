import { Search, CreditCard, Mail, ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      icon: Search,
      title: "Choose Your Service",
      description: "Browse games, subscriptions, or gift cards. Clear pricing in Rs.",
      color: "from-blue-500 to-blue-600"
    },
    {
      number: "2",
      icon: CreditCard,
      title: "Pay Securely",
      description: "Use eSewa, Khalti, ConnectIPS, or your card. 100% secure checkout.",
      color: "from-purple-500 to-purple-600"
    },
    {
      number: "3",
      icon: Mail,
      title: "Get It Instantly",
      description: "Delivered to your email in under 60 seconds. No waiting.",
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <section className="bg-white py-12 lg:py-20 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-[#E8F3FC] text-[#0A64BC] px-4 py-2 rounded-lg text-sm font-semibold mb-4">
            Simple Process
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get your digital products in 3 easy steps. No complications, no delays.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#0A64BC] transition-all hover:shadow-lg group">
                  {/* Step Number */}
                  <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-xl">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-[#0A64BC]" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>

                {/* Arrow between steps (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-6 py-3 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-semibold">Average delivery time: 23 seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
}