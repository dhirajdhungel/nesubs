import { Clock, AlertCircle, CreditCard, Frown } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      icon: Clock,
      title: "Waiting Days for Delivery",
      description: "Traditional stores take 2-7 days to process your order"
    },
    {
      icon: CreditCard,
      title: "Limited Payment Options",
      description: "Can't use your eSewa or Khalti balance easily"
    },
    {
      icon: AlertCircle,
      title: "Unclear Pricing",
      description: "Hidden fees and confusing conversion rates"
    },
    {
      icon: Frown,
      title: "No Local Support",
      description: "Customer service only in English, no Nepal-specific help"
    }
  ];

  return (
    <section className="bg-gray-100 py-12 lg:py-16 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Problem Statement */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Tired of the Old Way to Buy Digital Products?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We understand the frustrations of buying digital services in Nepal. That's why we built Nesubs.
          </p>
        </div>

        {/* Problem Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{problem.title}</h3>
                <p className="text-sm text-gray-600">{problem.description}</p>
              </div>
            );
          })}
        </div>

        {/* Transition Statement */}
        <div className="text-center mt-12 bg-gradient-to-r from-[#0A64BC] to-[#084d92] text-white rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-2">We Fixed All of This</h3>
          <p className="text-blue-100">
            Instant delivery, local payments, transparent pricing, and support in Nepali. Simple as that.
          </p>
        </div>
      </div>
    </section>
  );
}