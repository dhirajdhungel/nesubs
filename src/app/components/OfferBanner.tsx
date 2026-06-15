import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Percent, TrendingUp, Zap, Gift } from "lucide-react";

interface Offer {
  id: string;
  title: string;
  discount: string;
  description: string;
  backgroundColor: string;
  icon: any;
}

const offers: Offer[] = [
  {
    id: "1",
    title: "Weekend Special",
    discount: "25% OFF",
    description: "On all gaming subscriptions",
    backgroundColor: "from-orange-500 to-pink-600",
    icon: Percent,
  },
  {
    id: "2",
    title: "Trending Now",
    discount: "Hot Deals",
    description: "Most popular items this week",
    backgroundColor: "from-indigo-600 to-purple-700",
    icon: TrendingUp,
  },
  {
    id: "3",
    title: "Flash Sale",
    discount: "Limited Time",
    description: "Grab before it's gone!",
    backgroundColor: "from-yellow-500 to-red-600",
    icon: Zap,
  },
  {
    id: "4",
    title: "Gift Cards",
    discount: "Special Price",
    description: "Perfect for any occasion",
    backgroundColor: "from-teal-500 to-green-600",
    icon: Gift,
  },
];

export function OfferBanner() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  // Auto-play functionality
  useEffect(() => {
    if (!emblaApi) return;
    
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 3500);

    return () => clearInterval(interval);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {offers.map((offer) => {
            const Icon = offer.icon;
            return (
              <div key={offer.id} className="flex-[0_0_100%] min-w-0">
                <div
                  className={`relative bg-gradient-to-r ${offer.backgroundColor} rounded-xl overflow-hidden mx-1`}
                  style={{ height: "140px" }}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                  
                  <div className="relative px-6 py-6 flex items-center justify-between h-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{offer.title}</h3>
                          <p className="text-xs text-white/90">{offer.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold text-white">{offer.discount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
        aria-label="Previous offer"
      >
        <ChevronLeft className="w-4 h-4 text-gray-800" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
        aria-label="Next offer"
      >
        <ChevronRight className="w-4 h-4 text-gray-800" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-0 right-0 z-10">
        <div className="flex items-center justify-center gap-2">
          {offers.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded transition-all ${
                index === selectedIndex ? "bg-white w-6" : "bg-white/50 w-2"
              }`}
              aria-label={`Go to offer ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
