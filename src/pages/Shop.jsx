import { useState, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

export default function Shop({ 
  products, 
  categories,
  onAddToCart, 
  cartItems, 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory 
}) {
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  const categoryOptions = ["All", ...categories.map((category) => category.name)];

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setMaxPrice(2000);
    setSortBy("default");
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        const matchesCategory = 
          selectedCategory === "All" || 
          prod.category.toLowerCase() === selectedCategory.toLowerCase();
        
        const matchesSearch = 
          prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          prod.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        const activePrice = prod.offerPrice || prod.price;
        const matchesPrice = activePrice <= maxPrice;

        return matchesCategory && matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        const priceA = a.offerPrice || a.price;
        const priceB = b.offerPrice || b.price;

        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, maxPrice, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
      
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4 text-left">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-gray-800 tracking-tight margin-0">
            Fresh Groceries
          </h1>
          <p className="font-sans text-xs sm:text-sm text-gray-500 font-light mt-1">
            Displaying {filteredProducts.length} high-quality items available in store
          </p>
        </div>

        {/* Filter Controls Toggle (Mobile/Tablet) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full font-sans font-bold text-xs sm:text-sm text-gray-600 hover:text-secondary hover:border-secondary transition-all cursor-pointer bg-white"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {maxPrice < 2000 || selectedCategory !== "All" ? "•" : ""}
          </button>
          
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none block w-40 pl-3 pr-8 py-2 border border-gray-200 rounded-full bg-white font-sans text-xs sm:text-sm text-gray-600 focus:outline-none focus:border-secondary cursor-pointer"
            >
              <option value="default">Sort: Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <ArrowUpDown className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Filters Drawer (Accordion Layout) */}
      {(showFilters || maxPrice < 2000 || selectedCategory !== "All" || searchQuery) && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-end text-left transition-all duration-300">
          
          {/* Category Filter */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="font-display font-bold text-xs text-gray-500 uppercase tracking-wider">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full font-sans font-semibold text-xs transition-all cursor-pointer border ${
                    (selectedCategory === cat || (cat === "All" && selectedCategory === "all"))
                      ? "bg-secondary text-white border-secondary"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="font-display font-bold text-xs text-gray-500 uppercase tracking-wider">
                Max Price
              </label>
              <span className="font-sans font-bold text-sm text-secondary">
                ₹{maxPrice}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="2000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-secondary cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Min: ₹20</span>
              <span>Max: ₹2000</span>
            </div>
          </div>

          {/* Search Criteria */}
          <div className="md:col-span-3 flex flex-col gap-2">
            <label className="font-display font-bold text-xs text-gray-500 uppercase tracking-wider">
              Search Text
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type search word..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 border border-gray-200 rounded-full font-sans text-xs bg-gray-50/50"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Reset Action */}
          <div className="md:col-span-1">
            <button
              onClick={resetFilters}
              className="w-full py-1.5 font-sans font-bold text-xs text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-full transition-all cursor-pointer text-center"
            >
              Reset
            </button>
          </div>

        </div>
      )}

      {/* Product Listing Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              cartItem={cartItems.find((item) => item.id === product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto flex flex-col items-center gap-4 mt-4">
          <span className="text-sm font-display font-extrabold text-secondary bg-primary/20 rounded-full px-4 py-3">No items</span>
          <h3 className="font-display font-bold text-lg sm:text-xl text-gray-800">
            No Grocery Matches Found
          </h3>
          <p className="font-sans text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
            We couldn't find any products matching "{searchQuery || selectedCategory}" under ₹{maxPrice}. Try relaxing your filters or search keywords.
          </p>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 bg-primary text-secondary-dark hover:bg-primary-hover font-sans font-extrabold text-xs sm:text-sm rounded-full transition-all shadow-sm cursor-pointer"
          >
            Clear Filters & Search
          </button>
        </div>
      )}

    </div>
  );
}
