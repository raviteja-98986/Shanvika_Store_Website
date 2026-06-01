import { Plus, Minus, Trash2, ArrowLeft, ArrowRight, ShieldCheck, ShoppingCart } from "lucide-react";

export default function Cart({ 
  cartItems, 
  onAddToCart, 
  onRemoveFromCart, 
  onUpdateCartQuantity, 
  setCurrentTab 
}) {
  
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.offerPrice || item.price;
    return acc + price * item.quantity;
  }, 0);

  const originalTotal = cartItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const totalSavings = originalTotal - subtotal;
  
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-5">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl animate-bounce">
          <ShoppingCart className="h-10 w-10 text-gray-500" />
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-800">
          Your Shopping Cart is Empty
        </h2>
        <p className="font-sans text-sm text-gray-500 font-light leading-relaxed">
          Looks like you haven't added any quality grains or general essentials to your cart yet. Explore our fresh collection and mill-fresh rice bags!
        </p>
        <button
          onClick={() => setCurrentTab("shop")}
          className="mt-2 px-8 py-3.5 bg-secondary hover:bg-secondary-hover text-white font-sans font-extrabold text-sm sm:text-base rounded-full shadow hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Start Shopping Groceries
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 text-left">
      
      <div className="border-b border-gray-100 pb-4">
        <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-gray-800 tracking-tight">
          Shopping Cart
        </h1>
        <p className="font-sans text-xs sm:text-sm text-gray-500 font-light mt-1">
          Review your selected items before placing the order on WhatsApp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-8 flex flex-col gap-4">
          {cartItems.map((item) => {
            const activePrice = item.offerPrice || item.price;
            return (
              <div 
                key={item.id} 
                className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm flex gap-4 items-center relative hover:shadow transition-shadow"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/20 text-secondary flex items-center justify-center font-display font-extrabold">
                      {item.name?.slice(0, 2).toUpperCase() || "PR"}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <span className="text-[10px] font-sans font-bold text-gray-400 block uppercase">
                    {item.category} • {item.weight || "1 Bag"}
                  </span>
                  <h3 className="font-display font-bold text-gray-800 text-sm sm:text-base truncate">
                    {item.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-display font-extrabold text-sm sm:text-base text-secondary">
                      ₹{activePrice}
                    </span>
                    {item.offerPrice && (
                      <span className="font-sans text-xs text-gray-400 line-through">
                        ₹{item.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-6 ml-auto">
                  
                  <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50/50">
                    <button
                      onClick={() => onUpdateCartQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 rounded text-gray-500 cursor-pointer transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-sans font-bold text-sm px-3.5 text-gray-700 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onAddToCart(item)}
                      disabled={item.stock && item.quantity >= item.stock}
                      className="p-1 hover:bg-gray-200 rounded text-gray-500 cursor-pointer transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-display font-extrabold text-base text-gray-800 min-w-[60px] text-right">
                      ₹{activePrice * item.quantity}
                    </span>
                    <button
                      onClick={() => onRemoveFromCart(item.id)}
                      className="p-1.5 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-lg transition-colors cursor-pointer"
                      title="Remove product"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}

          <button
            onClick={() => setCurrentTab("shop")}
            className="flex items-center gap-2 text-sm font-sans font-bold text-secondary hover:text-secondary-hover mt-2 mr-auto cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shopping groceries
          </button>
        </div>

        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 sticky top-24">
          
          <h3 className="font-display font-extrabold text-lg text-gray-800 border-b border-gray-100 pb-3">
            Bill Details
          </h3>

          <div className="flex flex-col gap-3 font-sans text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-gray-800">₹{subtotal}</span>
            </div>
            
            {totalSavings > 0 && (
              <div className="flex justify-between text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100">
                <span className="font-semibold">Offer Discounts Saved</span>
                <span className="font-bold">-₹{totalSavings}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Local Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-100">
                  FREE Delivery
                </span>
              ) : (
                <span className="font-bold text-gray-800">₹{deliveryFee}</span>
              )}
            </div>

            {deliveryFee > 0 && (
              <p className="text-[10px] text-gray-400 leading-normal italic">
                Add worth <span className="font-bold text-secondary">₹{499 - subtotal}</span> more groceries to get FREE Local Delivery.
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
            <span className="font-display font-extrabold text-base text-gray-800">
              Total Amount
            </span>
            <span className="font-display font-black text-2xl text-secondary">
              ₹{grandTotal}
            </span>
          </div>

          <button
            onClick={() => setCurrentTab("checkout")}
            className="w-full py-3.5 bg-secondary hover:bg-secondary-hover text-white font-sans font-extrabold text-sm sm:text-base rounded-full shadow hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 group"
          >
            Proceed to Checkout
            <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center gap-2 text-xs font-sans text-gray-400 border-t border-gray-50 pt-4">
            <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="leading-tight">
              Pay securely via UPI / Cash on Delivery once your groceries arrive!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
