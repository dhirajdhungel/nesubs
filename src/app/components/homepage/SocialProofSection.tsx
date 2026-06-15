import { Star, Quote, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export function SocialProofSection() {
  const testimonials = [
    {
      name: "Rajesh Sharma",
      location: "Kathmandu",
      avatar: "RS",
      rating: 5,
      text: "Got my PlayStation Plus subscription in literally 30 seconds! eSewa payment was super smooth. Best service in Nepal!",
      purchase: "PlayStation Plus - 1 Year"
    },
    {
      name: "Priya Gurung",
      location: "Pokhara",
      avatar: "PG",
      rating: 5,
      text: "Finally a platform that accepts Khalti! Bought Netflix and got it instantly. Customer support answered my questions in Nepali.",
      purchase: "Netflix Premium - 1 Month"
    },
    {
      name: "Amir Khan",
      location: "Lalitpur",
      avatar: "AK",
      rating: 5,
      text: "Transparent pricing, instant delivery, and 24/7 support. This is exactly what Nepal needed. Highly recommended!",
      purchase: "Spotify Premium - 3 Months"
    }
  ];

  const stats = [
    { number: "15,420+", label: "Happy Customers" },
    { number: "98.5%", label: "Satisfaction Rate" },
    { number: "23 sec", label: "Avg Delivery Time" },
    { number: "24/7", label: "Support Available" }
  ];

  // Live purchase notifications
  const [recentPurchases, setRecentPurchases] = useState([
    "Arun from Kathmandu just bought Netflix Premium",
    "Sita from Bhaktapur just bought Spotify Family",
    "Krishna from Pokhara just bought Xbox Game Pass"
  ]);

  const [currentNotification, setCurrentNotification] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNotification((prev) => (prev + 1) % recentPurchases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [recentPurchases.length]);

  return (
    <section className="bg-white py-12 lg:py-20 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-semibold mb-4">
            Trusted by Thousands
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600">
            Real reviews from real customers across Nepal
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-[#0A64BC] to-[#084d92] rounded-2xl p-6 text-center text-white shadow-lg"
            >
              <p className="text-3xl lg:text-4xl font-bold mb-1">{stat.number}</p>
              <p className="text-sm text-blue-200">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-[#0A64BC] transition-all relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-[#0A64BC]/20" />

              {/* Avatar & Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0A64BC] to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>

              {/* Purchase Badge */}
              <div className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-lg text-xs border border-gray-200">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Verified Purchase: {testimonial.purchase}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Purchase Notification */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-center gap-3 animate-pulse">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <p className="text-green-800 font-medium">
              {recentPurchases[currentNotification]}
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-2xl font-bold text-[#0A64BC] mb-1">4.8/5</p>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-2xl font-bold text-[#0A64BC] mb-1">50K+</p>
            <p className="text-sm text-gray-600">Orders Delivered</p>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-2xl font-bold text-[#0A64BC] mb-1">99.9%</p>
            <p className="text-sm text-gray-600">Uptime</p>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-2xl font-bold text-[#0A64BC] mb-1">2019</p>
            <p className="text-sm text-gray-600">Serving Since</p>
          </div>
        </div>
      </div>
    </section>
  );
}