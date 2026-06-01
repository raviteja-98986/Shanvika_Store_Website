import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

const fallbackSlides = [
  {
    id: "fallback-1",
    title: "Fresh Store Offers",
    subtitle: "Discounts and updates",
    description: "Check current grocery deals and store information from Shanvika Rice and General Store.",
    buttonText: "Browse Store",
    category: "All",
    imageUrl: ""
  }
];

export default function Carousel({ banners = [], onShopClick }) {
  const slides = useMemo(() => {
    const activeSlides = banners.filter((banner) => banner.title || banner.imageUrl);
    return activeSlides.length > 0 ? activeSlides : fallbackSlides;
  }, [banners]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const safeCurrentSlide = Math.min(currentSlide, slides.length - 1);
  const slide = slides[safeCurrentSlide];
  const targetCategory = slide.category || "All";
  const hasTextContent = slide.title || slide.subtitle || slide.description;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-xl bg-secondary text-white min-h-[340px] sm:min-h-[400px] md:max-h-[500px] flex items-center">
      {slide.imageUrl ? (
        <img
          src={slide.imageUrl}
          alt={slide.title || "Carousel slide"}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-emerald-700 to-primary" />
      )}
      {/* Dark overlay - only visible if there's text content or no image */}
      {(hasTextContent || !slide.imageUrl) && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
      )}

      {/* Content section - only show if there's text to display */}
      {hasTextContent && (
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-10 sm:py-16 w-full">
          <div className="max-w-3xl flex flex-col items-start text-left gap-3 sm:gap-4 transition-all duration-700">
            {slide.subtitle && (
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white font-sans text-xs sm:text-sm font-bold rounded-full uppercase border border-white/15">
                {slide.subtitle}
              </span>
            )}
            {slide.title && (
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white leading-tight">
                {slide.title}
              </h1>
            )}
            {slide.description && (
              <p className="font-sans text-sm sm:text-lg text-white/90 max-w-2xl font-light px-12 sm:px-16 md:px-20 relative z-0">
                {slide.description}
              </p>
            )}

            <button
              onClick={() => onShopClick(targetCategory)}
              className="mt-4 px-6 sm:px-8 py-3 bg-white text-secondary-dark hover:bg-primary hover:text-secondary-dark font-sans font-extrabold text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 group cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {slide.buttonText || "Shop Now"}
            </button>
          </div>
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 sm:left-6 z-20 p-2 sm:p-3 bg-black/15 hover:bg-black/35 text-white/80 hover:text-white rounded-full transition-all cursor-pointer border border-white/10 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 sm:right-6 z-20 p-2 sm:p-3 bg-black/15 hover:bg-black/35 text-white/80 hover:text-white rounded-full transition-all cursor-pointer border border-white/10 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {slides.map((item, index) => (
              <button
                key={item.id || index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  safeCurrentSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
