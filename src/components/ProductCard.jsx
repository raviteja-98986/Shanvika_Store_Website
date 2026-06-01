import { Plus, Check, ShoppingCart } from "lucide-react";

export default function ProductCard({ product, onAddToCart, cartItem }) {
  const { name, price, offerPrice, category, imageUrl, stock, weight } = product;
  
  // Calculate discount percentage
  const hasDiscount = offerPrice && offerPrice < price;
  const discountPercent = hasDiscount 
    ? Math.round(((price - offerPrice) / price) * 100) 
    : 0;

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 3;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {hasDiscount && !isOutOfStock && (
        <span className="absolute top-3 left-3 z-10 bg-red-500 text-white font-sans text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm">
          Save {discountPercent}%
        </span>
      )}

      <span className="absolute top-3 right-3 z-10 glass text-secondary-dark font-sans text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md border border-gray-100">
        {category}
      </span>

      <div className="relative pt-[100%] bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-primary/20 text-secondary flex items-center justify-center font-display font-extrabold text-3xl">
            {name?.slice(0, 2).toUpperCase() || "PR"}
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-4 py-2 bg-gray-800 text-white font-sans text-xs font-bold uppercase rounded-full tracking-wider shadow">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-sans font-medium text-xs text-gray-400">
            Pack: {weight || "1 Bag"}
          </span>
          {isLowStock && !isOutOfStock && (
            <span className="font-sans font-semibold text-[10px] text-red-500 animate-pulse bg-red-50 px-2 py-0.5 rounded">
              Only {stock} left!
            </span>
          )}
        </div>

        <h3 className="font-display font-bold text-gray-800 text-sm sm:text-base line-clamp-2 hover:text-secondary transition-colors cursor-pointer text-left min-h-[40px] leading-tight">
          {name}
        </h3>

        <div className="mt-auto pt-2 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="font-display font-extrabold text-lg sm:text-xl text-secondary">
                ₹{offerPrice}
              </span>
              <span className="font-sans text-xs text-gray-400 line-through">
                ₹{price}
              </span>
            </>
          ) : (
            <span className="font-display font-extrabold text-lg sm:text-xl text-gray-800">
              ₹{price}
            </span>
          )}
        </div>

        <div className="pt-3">
          {cartItem ? (
            <div className="w-full flex items-center justify-between bg-primary/20 border border-primary text-secondary-dark font-sans text-xs font-extrabold py-2 px-3 rounded-xl transition-all duration-300">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 stroke-[3px] text-secondary" />
                In Cart ({cartItem.quantity})
              </span>
              <button
                onClick={() => onAddToCart(product)}
                disabled={isOutOfStock || cartItem.quantity >= stock}
                className="p-1 hover:bg-primary/40 rounded-full transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                title="Add one more"
              >
                <Plus className="h-4 w-4 stroke-[3px]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`w-full py-2 px-4 font-sans font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer shadow-sm hover:shadow transition-all duration-300 flex items-center justify-center gap-2 border ${
                isOutOfStock
                  ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-hover border-primary-hover text-secondary-dark"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
