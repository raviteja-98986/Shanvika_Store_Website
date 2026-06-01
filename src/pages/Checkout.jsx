import { useState } from "react";
import { saveOrder } from "../firebase";
import { MessageSquare, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function Checkout({ 
  cartItems, 
  clearCart, 
  setCurrentTab, 
  setOrdersNeedRefresh,
  whatsappNumber = "919701882084"
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    landmark: ""
  });
  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.offerPrice || item.price;
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal >= 499 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return alert("Please enter your name");
    if (!formData.phone.trim() || formData.phone.length < 10) {
      return alert("Please enter a valid 10-digit phone number");
    }
    if (!formData.address.trim() || formData.address.length < 8) {
      return alert("Please enter a detailed delivery address");
    }

    setLoading(true);
    try {
      const orderData = {
        customerName: formData.name.trim(),
        phone: formData.phone.trim(),
        address: `${formData.address.trim()}${formData.landmark.trim() ? ` (Landmark: ${formData.landmark.trim()})` : ""}`,
        items: cartItems,
        totalAmount: grandTotal
      };

      const savedOrder = await saveOrder(orderData);
      
      const formattedMessage = generateWhatsAppMessage(savedOrder);
      
      setPlacedOrderDetails({
        order: savedOrder,
        whatsappMessage: formattedMessage
      });

      setOrderCompleted(true);
      setOrdersNeedRefresh(prev => !prev);
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`;
      
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
        clearCart();
      }, 1500);

    } catch (err) {
      console.error("Order processing error:", err);
      alert("Failed to register your order. Please check internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppMessage = (order) => {
    const header = `*Order from Shanvika Rice and General Store*\n\n`;
    
    const customerInfo = `*Customer Name:* ${order.customerName}\n*Phone:* ${order.phone}\n*Delivery Address:* ${order.address}\n\n`;
    
    let itemsList = `*Items Ordered:*\n`;
    order.items.forEach((item, index) => {
      const activePrice = item.offerPrice || item.price;
      const weightStr = item.weight ? ` (${item.weight})` : "";
      itemsList += `${index + 1}. _${item.name}${weightStr}_ x *${item.quantity}* = ₹${activePrice * item.quantity}\n`;
    });
    
    const totals = `\n*Delivery Fee:* ₹${deliveryFee === 0 ? "FREE" : deliveryFee}\n*Total Amount:* ₹${order.totalAmount}\n\n`;
    const footer = `_Please confirm receipt and estimate delivery time. Thank you!_`;

    return `${header}${customerInfo}${itemsList}${totals}${footer}`;
  };

  if (cartItems.length === 0 && !orderCompleted) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <span className="text-5xl">Cart</span>
        <h2 className="font-display font-extrabold text-2xl text-gray-800 mt-4">No groceries to checkout</h2>
        <button onClick={() => setCurrentTab("shop")} className="mt-4 px-6 py-2 bg-secondary text-white rounded-full font-sans font-bold text-xs">
          Browse Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-left">
      
      <div className="border-b border-gray-100 pb-4 mb-6">
        <button 
          onClick={() => setCurrentTab("cart")}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-sans font-bold text-gray-400 hover:text-secondary mb-3 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </button>
        <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-gray-800 tracking-tight">
          Secure Checkout
        </h1>
        <p className="font-sans text-xs sm:text-sm text-gray-500 font-light mt-1">
          Provide delivery coordinates to dispatch your order directly on WhatsApp
        </p>
      </div>

      {orderCompleted ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 text-center shadow-lg max-w-xl mx-auto flex flex-col items-center gap-5 my-6 animate-pulse-subtle">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-inner">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 stroke-[2.5]" />
          </div>
          
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-800">
            Order Registered Successfully!
          </h2>
          
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-sans text-amber-800 leading-relaxed max-w-md">
            <strong>Redirecting to WhatsApp...</strong> We have generated the receipt and stored the entry. If WhatsApp did not open automatically, tap the button below to submit the list to our WhatsApp chat.
          </div>

          {placedOrderDetails && (
            <div className="w-full text-left bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs text-gray-600 font-mono whitespace-pre-line mt-2 max-h-48 overflow-y-auto">
              {placedOrderDetails.whatsappMessage}
            </div>
          )}

          <button
            onClick={() => {
              if (placedOrderDetails) {
                const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(placedOrderDetails.whatsappMessage)}`;
                window.open(url, "_blank");
              }
            }}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-extrabold text-sm sm:text-base rounded-full shadow transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <MessageSquare className="h-5 w-5" />
            Send Order via WhatsApp Now
          </button>

          <button
            onClick={() => setCurrentTab("home")}
            className="text-xs font-sans font-bold text-secondary hover:underline cursor-pointer"
          >
            Go back to Home Page
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
            
            <h3 className="font-display font-bold text-gray-800 text-base sm:text-lg border-b border-gray-50 pb-2.5 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Delivery Details
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-bold text-xs text-gray-500">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Enter your first and last name"
                value={formData.name}
                onChange={handleChange}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-bold text-xs text-gray-500">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans font-semibold text-sm text-gray-400">
                  +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-14 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full font-semibold"
                />
              </div>
              <p className="text-[10px] text-gray-400">
                We will contact this number for delivery coordinates or UPI payment.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-bold text-xs text-gray-500">
                Detailed Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                required
                rows="3"
                placeholder="Flat No, Street Name, Building Name, Pragathi Nagar Road..."
                value={formData.address}
                onChange={handleChange}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm leading-normal resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-bold text-xs text-gray-500">
                Landmark / Delivery Instructions <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                name="landmark"
                placeholder="e.g. opposite temple, near water tank"
                value={formData.landmark}
                onChange={handleChange}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-4 bg-secondary hover:bg-secondary-hover text-white font-sans font-extrabold text-sm sm:text-base rounded-full shadow hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Order...
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5" />
                  Confirm & Place Order on WhatsApp
                </>
              )}
            </button>

          </form>

          <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5 sticky top-24">
            
            <h3 className="font-display font-extrabold text-lg text-gray-800 border-b border-gray-100 pb-3">
              Order Items Summary
            </h3>

            <div className="flex flex-col gap-3.5 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const activePrice = item.offerPrice || item.price;
                return (
                  <div key={item.id} className="flex justify-between items-center gap-4 text-xs font-sans text-gray-600">
                    <div className="truncate flex-1">
                      <span className="font-bold text-gray-800">{item.name}</span>
                      {item.weight && <span className="text-gray-400 block text-[10px]">Size: {item.weight}</span>}
                    </div>
                    <span className="text-gray-400 flex-shrink-0">
                      ₹{activePrice} x {item.quantity}
                    </span>
                    <span className="font-bold text-gray-800 flex-shrink-0">
                      ₹{activePrice * item.quantity}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 text-xs font-sans text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
              <span className="font-display font-extrabold text-sm text-gray-800">
                Grand Total Amount
              </span>
              <span className="font-display font-black text-xl text-secondary">
                ₹{grandTotal}
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-[11px] font-sans text-emerald-800 leading-normal flex items-start gap-2">
              <span>Note</span>
              <p>
                <strong>No pre-payment required!</strong> Place the order, chat with us on WhatsApp, and pay comfortably via PhonePe/GPay or Cash upon delivery!
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
