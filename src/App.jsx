import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import { subscribeToProducts, subscribeToCategories, subscribeToBanners, subscribeToStoreSettings } from "./firebase";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function App() {
  const isAdminRoute = window.location.pathname.replace(/\/+$/, "") === "/admin";
  const [currentTab, setCurrentTab] = useState("home");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [storeSettings, setStoreSettings] = useState({
    whatsappNumber: "919701882084",
    displayPhone: "+91 9701882084"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [ordersNeedRefresh, setOrdersNeedRefresh] = useState(false);

  const [cartItems, setCartItems] = useState(() => {
    const localCart = localStorage.getItem("shanvika_cart");
    return localCart ? JSON.parse(localCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("shanvika_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((prodList) => {
      setProducts(prodList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToCategories((catList) => {
      setCategories(catList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToBanners((bannerList) => {
      setBanners(bannerList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToStoreSettings((settings) => {
      setStoreSettings(settings);
    });
    return () => unsubscribe();
  }, []);

  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      const currentQty = existingItem ? existingItem.quantity : 0;
      if (product.stock && currentQty >= product.stock) {
        alert(`Only ${product.stock} units available in stock!`);
        return prevItems;
      }

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && product.stock && newQuantity > product.stock) {
      alert(`Only ${product.stock} units available in stock!`);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartAmount = cartItems.reduce((acc, item) => {
    const price = item.offerPrice || item.price;
    return acc + price * item.quantity;
  }, 0);

  if (isAdminRoute) {
    return <Admin ordersNeedRefresh={ordersNeedRefresh} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] font-sans pb-16 lg:pb-0">

      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cartCount={totalCartCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-grow">
        {currentTab === "home" && (
          <Home
            products={products}
            categories={categories}
            banners={banners}
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
            setCurrentTab={setCurrentTab}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {currentTab === "shop" && (
          <Shop
            products={products}
            categories={categories}
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {currentTab === "cart" && (
          <Cart
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQuantity={handleUpdateCartQuantity}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === "checkout" && (
          <Checkout
            cartItems={cartItems}
            clearCart={clearCart}
            setCurrentTab={setCurrentTab}
            setOrdersNeedRefresh={setOrdersNeedRefresh}
            whatsappNumber={storeSettings.whatsappNumber}
          />
        )}
      </main>

      <Footer setCurrentTab={setCurrentTab} storeSettings={storeSettings} />

      {totalCartCount > 0 && currentTab !== "cart" && currentTab !== "checkout" && (
        <div className="fixed bottom-16 sm:bottom-20 lg:hidden left-0 w-full z-40 px-4 py-2 animate-bounce-subtle">
          <div
            onClick={() => setCurrentTab("cart")}
            className="w-full max-w-lg mx-auto bg-secondary text-white p-3 rounded-2xl flex items-center justify-between shadow-xl cursor-pointer hover:bg-secondary-hover transition-colors border border-primary/20"
          >
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 p-2 rounded-xl">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-sans font-bold text-xs">
                  {totalCartCount} item{totalCartCount > 1 ? "s" : ""} added
                </span>
                <span className="font-display font-extrabold text-sm text-primary">
                  Total: ₹{totalCartAmount}
                </span>
              </div>
            </div>

            <span className="flex items-center gap-1 font-sans font-extrabold text-xs bg-white text-secondary-dark px-3 py-1.5 rounded-xl shadow-sm uppercase tracking-wider">
              View Cart
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full z-40 lg:hidden bg-white border-t border-gray-100 shadow-lg grid grid-cols-4 py-2 text-center">
        {[
          { id: "home", label: "Home", icon: "Home" },
          { id: "shop", label: "Shop", icon: "Shop" },
          { id: "cart", label: "Cart", icon: "Cart", badge: totalCartCount },
          { id: "checkout", label: "Checkout", icon: "✓" }
        ].map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center relative cursor-pointer ${isActive ? "text-secondary font-bold" : "text-gray-400 font-medium"
                }`}
            >
              <span className="text-[10px] font-black mb-0.5">{tab.icon}</span>
              <span className="text-[10px] font-sans tracking-tight">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute top-0 right-1/2 translate-x-4 bg-secondary text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute top-0 w-6 h-0.5 bg-secondary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <a
        href={`https://wa.me/${storeSettings.whatsappNumber}?text=Hi!%20I%20have%20a%20question%20about%20groceries%20at%20Shanvika%20Store.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-4 bottom-20 lg:bottom-6 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 hover:bg-[#20ba5a] transition-all duration-300 flex items-center justify-center"
        title="WhatsApp Support Inquiries"
      >
        <FaWhatsapp className="h-6 w-6" />
      </a>

    </div>
  );
}
