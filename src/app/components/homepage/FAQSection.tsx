import { useState, useEffect } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { API_BASE_URL, publicAnonKey } from "../../utils/api";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Default FAQs (fallback if database is empty)
  const defaultFaqs: FAQ[] = [
    {
      id: "1",
      question: "How fast is the delivery?",
      answer: "Most orders are delivered to your email within 60 seconds. During peak hours, it may take up to 5 minutes. We guarantee delivery within 24 hours or you get a full refund."
    },
    {
      id: "2",
      question: "Which payment methods do you accept?",
      answer: "We accept eSewa, Khalti, ConnectIPS, IME Pay, and all major credit/debit cards (Visa, Mastercard). All payments are secured with bank-level encryption."
    },
    {
      id: "3",
      question: "Can I get a refund if I change my mind?",
      answer: "Yes! If we haven't delivered your order yet, you can cancel for a full refund. Once delivered, refunds depend on the product type. Contact our 24/7 support team for assistance."
    },
    {
      id: "4",
      question: "Is it safe to buy from Nesubs?",
      answer: "Absolutely! We use bank-level encryption for all transactions. Your payment information is never stored on our servers. We've served 15,000+ customers since 2019 with a 4.8/5 rating."
    },
    {
      id: "5",
      question: "Do you provide customer support in Nepali?",
      answer: "Yes! Our support team speaks both Nepali and English. You can reach us 24/7 via chat, email, or phone. We're here to help anytime."
    },
    {
      id: "6",
      question: "What if my product code doesn't work?",
      answer: "This is extremely rare, but if it happens, contact us immediately. We'll replace it within 1 hour or issue a full refund. Your satisfaction is our priority."
    },
    {
      id: "7",
      question: "Can I buy multiple products at once?",
      answer: "Yes! You can purchase multiple products and receive all codes instantly. Each purchase is processed separately for faster delivery."
    },
    {
      id: "8",
      question: "Do prices include all taxes and fees?",
      answer: "Yes! The price you see is the final price in Rs. There are no hidden fees, conversion charges, or surprises at checkout."
    }
  ];

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/website-content`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.content && data.content.homeFAQs && data.content.homeFAQs.length > 0) {
          setFaqs(data.content.homeFAQs);
        } else {
          // Use default FAQs if database is empty
          setFaqs(defaultFaqs);
        }
      } else {
        setFaqs(defaultFaqs);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      // Use default FAQs on error
      setFaqs(defaultFaqs);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-gray-50 py-12 lg:py-20 px-4">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#0A64BC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading FAQs...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-12 lg:py-20 px-4">
      <div className="max-w-[900px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-[#0A64BC] px-4 py-2 rounded-lg text-sm font-semibold mb-4">
            <HelpCircle className="w-4 h-4" />
            Got Questions?
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about buying from Nesubs
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden hover:border-[#0A64BC] transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#0A64BC] flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-5 pt-2">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#0A64BC] to-[#084d92] rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Still Have Questions?</h3>
          <p className="text-blue-100 mb-6">
            Our support team is available 24/7 to help you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@nesubs.com"
              className="bg-white text-[#0A64BC] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Email Support
            </a>
            <a
              href="tel:+9771234567890"
              className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              Call Us Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}