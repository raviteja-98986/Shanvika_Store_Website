import Carousel from "../components/Carousel";
import ProductCard from "../components/ProductCard";
import { Truck, BadgePercent, CheckCircle, Smartphone } from "lucide-react";

export default function Home({ 
  products, 
  categories,
  banners,
  onAddToCart, 
  cartItems, 
  setCurrentTab, 
  setSelectedCategory 
}) {
  const categoryStyles = [
    "bg-amber-100 text-amber-800",
    "bg-orange-100 text-orange-800",
    "bg-yellow-100 text-yellow-800",
    "bg-blue-100 text-blue-800"
  ];
  const displayCategories = categories.length > 0 ? categories : [
    { name: "Rice" },
    { name: "Pulses" },
    { name: "Oils" },
    { name: "Essentials" }
  ];

  const featuredProducts = products.filter(p => p.stock > 0).slice(0, 4);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setCurrentTab("shop");
  };

  const handleBannerShopClick = (category = "all") => {
    setSelectedCategory(category);
    setCurrentTab("shop");
  };

  return (
    <div className="flex flex-col gap-12 py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. Hero Carousel */}
      <section className="w-full">
        <Carousel banners={banners} onShopClick={handleBannerShopClick} />
      </section>

      {/* 2. Quick Categories Circle Selection */}
      <section className="w-full text-center">
        <div className="flex flex-col items-center gap-2 mb-8">
          <span className="font-sans font-extrabold text-xs text-secondary uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Smart Categories
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-gray-800">
            Browse By Food Type
          </h2>
          <div className="w-16 h-1 bg-primary rounded-full mt-1" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {displayCategories.map((cat, index) => (
            <div
              key={cat.name}
              onClick={() => handleCategorySelect(cat.name)}
              className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className={`w-16 h-16 ${categoryStyles[index % categoryStyles.length]} rounded-full flex items-center justify-center text-sm font-bold shadow-inner group-hover:scale-110 transition-transform overflow-hidden border border-white`}>
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  cat.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <span className="font-display font-bold text-gray-800 group-hover:text-secondary transition-colors text-sm sm:text-base">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="w-full">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <span className="font-sans font-extrabold text-xs text-secondary uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Hot Deals
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-gray-800">
            Featured Products Today
          </h2>
          <div className="w-16 h-1 bg-primary rounded-full mt-1" />
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                cartItem={cartItems.find((item) => item.id === product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-10 text-center text-gray-500 font-sans">
            Loading products or inventory is empty. Refreshing...
          </div>
        )}

        <div className="mt-10 text-center">
          <button
            onClick={() => handleBannerShopClick("all")}
            className="px-8 py-3 bg-secondary hover:bg-secondary-hover text-white font-sans font-extrabold text-sm sm:text-base rounded-full shadow hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Explore Complete Catalog
          </button>
        </div>
      </section>

      {/* 4. Why Shop With Us? / Infographics */}
      <section className="w-full bg-emerald-800 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-700/50 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl -ml-16 -mb-16" />

        <div className="relative z-10 text-center max-w-3xl mx-auto mb-10">
          <h2 className="font-display font-black text-2xl sm:text-4xl text-white mb-3">
            Pure Mill Quality & Local Convenience
          </h2>
          <p className="font-sans text-emerald-100 font-light text-sm sm:text-base">
            We are dedicated to providing the cleanest grains, oils, and essentials. We source directly to eliminate middlemen, offering you the best price in local market!
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-3">
            <div className="p-3 bg-amber-400 text-secondary-dark rounded-xl">
              <Truck className="h-6 w-6" />
            </div>
            <h4 className="font-display font-bold text-white text-base">Free Delivery</h4>
            <p className="font-sans text-xs text-emerald-100/90 font-light">
              Get free home delivery on all orders within 5 kilometers of Burrilanka.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-3">
            <div className="p-3 bg-amber-400 text-secondary-dark rounded-xl">
              <BadgePercent className="h-6 w-6" />
            </div>
            <h4 className="font-display font-bold text-white text-base">Direct Mill Pricing</h4>
            <p className="font-sans text-xs text-emerald-100/90 font-light">
              High quality 26kg Rice bags at wholesale rates directly from rice mills.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-3">
            <div className="p-3 bg-amber-400 text-secondary-dark rounded-xl">
              <Smartphone className="h-6 w-6" />
            </div>
            <h4 className="font-display font-bold text-white text-base">WhatsApp Ordering</h4>
            <p className="font-sans text-xs text-emerald-100/90 font-light">
              Add items, review, and tap place order. A formatted list goes to WhatsApp instantly!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-3">
            <div className="p-3 bg-amber-400 text-secondary-dark rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h4 className="font-display font-bold text-white text-base">100% Hygenic</h4>
            <p className="font-sans text-xs text-emerald-100/90 font-light">
              Unpolished dals and pure sunflower & mustard oils packed with extreme care.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
