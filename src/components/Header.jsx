import { useState } from "react";
import { LockKeyhole, ShoppingCart, Search, Store, Menu, X } from "lucide-react";

export default function Header({
  currentTab,
  setCurrentTab,
  cartCount,
  searchQuery,
  setSearchQuery
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: "home", name: "Home" },
    { id: "shop", name: "Products" },
    { id: "cart", name: "Cart", count: cartCount }
  ];

  const handleNavClick = (tabId) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  const openAdminPage = () => {
    window.location.href = "/admin";
  };

  return (
    <header className="sticky top-0 z-50 glass shadow-sm border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-4">

          {/* Logo & Luxury Brand Styling */}
          <div
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="bg-secondary text-primary p-2.5 rounded-xl shadow-md transition-all duration-300 group-hover:rotate-6 border border-primary/20">
              <Store className="h-6 w-6 stroke-[1.8]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-extrabold text-xl sm:text-2xl text-secondary leading-none tracking-tight">
                Shanvika
              </span>
              <span className="font-sans font-bold text-[9px] sm:text-[10px] text-primary uppercase tracking-[0.2em] mt-0.5">
                Rice & General Store
              </span>
            </div>
          </div>

          {/* Live Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4.5 w-4.5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search sona masoori, pulses, premium oils..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentTab !== "shop") {
                  setCurrentTab("shop");
                }
              }}
              className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50/50 placeholder-gray-400 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300 shadow-inner"
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-4 py-2 rounded-full font-sans font-extrabold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${isActive
                      ? "text-secondary bg-primary/10 border border-primary/20 shadow-sm"
                    : "text-gray-600 hover:text-secondary hover:bg-gray-100/50"
                    }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.name}
                    {link.id === "cart" && cartCount > 0 && (
                      <span className="flex items-center justify-center bg-secondary text-white text-[9px] font-black h-4.5 w-4.5 rounded-full animate-bounce">
                        {cartCount}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Icons (Mobile/Tablet View) */}
          <div className="flex items-center gap-2">

            {/* Search toggler/input on small screens */}
            <div className="flex md:hidden relative max-w-[130px] xs:max-w-[170px]">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentTab !== "shop") {
                    setCurrentTab("shop");
                  }
                }}
                className="block w-full pl-7 pr-2 py-1.5 border border-gray-200 rounded-full bg-gray-50/50 placeholder-gray-400 text-xs focus:bg-white focus:border-primary transition-all duration-300"
              />
            </div>

            {/* Direct Cart Button for tablet screens */}
            <button
              onClick={() => handleNavClick("cart")}
              className="relative p-2 text-gray-600 hover:text-secondary hover:bg-gray-100 rounded-full transition-all cursor-pointer hidden sm:flex lg:hidden"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center bg-secondary text-white text-[9px] font-black h-4 w-4 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={openAdminPage}
              className="p-2 text-gray-500 hover:text-secondary hover:bg-primary/10 rounded-full transition-all cursor-pointer"
              title="Admin Login"
              aria-label="Admin Login"
            >
              <LockKeyhole className="h-5 w-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-secondary hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass border-t border-gray-100 absolute top-full left-0 w-full shadow-lg transition-all duration-300 py-3 px-4 text-left">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl font-sans font-bold text-left transition-all ${isActive
                      ? "text-secondary bg-primary/10 border border-primary/20"
                      : "text-gray-600 hover:text-secondary hover:bg-gray-50"
                    }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.name}
                  </span>
                  {link.id === "cart" && cartCount > 0 && (
                    <span className="bg-secondary text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              );
            })}
            <button
              onClick={openAdminPage}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-sans font-bold text-left transition-all text-gray-600 hover:text-secondary hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4" />
                Admin Login
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
