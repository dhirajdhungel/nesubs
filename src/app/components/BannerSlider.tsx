import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Sparkles, Tag, Trophy, Star } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  buttonText: string;
  icon: any;
  tag?: string;
}

const banners: Banner[] = [
  {
    id: "1",
    title: "New Games Released!",
    subtitle: "Get the latest games at the best prices",
    backgroundColor: "from-purple-600 to-purple-800",
    textColor: "text-white",
    buttonText: "Browse Games",
    icon: Trophy,
    tag: "NEW"
  },
  {
    id: "2",
    title: "Limited Time Offer!",
    subtitle: "Up to 30% off on selected subscriptions",
    backgroundColor: "from-red-500 to-orange-600",
    textColor: "text-white",
    buttonText: "View Deals",
    icon: Tag,
    tag: "SALE"
  },
  {
    id: "3",
    title: "Premium Subscriptions",
    subtitle: "Netflix, Spotify & more at special prices",
    backgroundColor: "from-blue-600 to-cyan-600",
    textColor: "text-white",
    buttonText: "Explore Now",
    icon: Star,
  },
  {
    id: "4",
    title: "Gift Cards Available",
    subtitle: "Perfect gifts for gamers and movie lovers",
    backgroundColor: "from-green-600 to-teal-600",
    textColor: "text-white",
    buttonText: "Shop Cards",
    icon: Sparkles,
  }
];

export function BannerSlider() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  // Auto-play functionality
  useEffect(() => {
    if (!emblaApi) return;
    
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

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
          {banners.map((banner) => {
            const Icon = banner.icon;
            return (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0">
                <div
                  className={`relative bg-gradient-to-r ${banner.backgroundColor} rounded-xl overflow-hidden mx-1`}
                  style={{ minHeight: "200px" }}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  
                  <div className="relative px-6 py-8 lg:px-10 lg:py-10 flex items-center justify-between">
                    <div className="flex-1">
                      {banner.tag && (
                        <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-white mb-3">
                          {banner.tag}
                        </div>
                      )}
                      <h2 className={`text-2xl lg:text-3xl font-bold ${banner.textColor} mb-2`}>
                        {banner.title}
                      </h2>
                      <p className={`${banner.textColor} opacity-90 mb-4 text-sm lg:text-base max-w-md`}>
                        {banner.subtitle}
                      </p>
                      <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                        {banner.buttonText}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="hidden lg:block">
                      <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                        <Icon className={`w-16 h-16 ${banner.textColor}`} />
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
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 text-gray-800" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 text-gray-800" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 z-10">
        <div className="flex items-center justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded transition-all ${
                index === selectedIndex ? "bg-white w-6" : "bg-white/50 w-2"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}