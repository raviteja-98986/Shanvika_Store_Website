import { Store, MapPin, Phone, Clock, ChevronRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function Footer({
  setCurrentTab,
  storeSettings = {
    whatsappNumber: "919701882084",
    displayPhone: "+91 9701882084",
    address: "H.NO:4-99 Burrilanka,Ramalayam street,Lalitha Nilayam,Kadiyam Mandal"
  }
}) {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = storeSettings.whatsappNumber || "919701882084";
  const displayPhone = storeSettings.displayPhone || "+91 9701882084";
  const address = storeSettings.address || "H.NO:4-99 Burrilanka,Ramalayam street,Lalitha Nilayam,Kadiyam Mandal";
  const storeName = storeSettings.name || "Shanvika Store";

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t-4 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

        <div className="flex flex-col items-start gap-4 text-left">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Store className="h-5 w-5 text-secondary-dark" />
            </div>
            <span className="font-display font-extrabold text-xl text-white tracking-tight">
              {storeName}
            </span>
          </div>
          <p className="font-sans text-sm text-gray-400 font-light leading-relaxed">
            Your neighborhood trusted grocery partner. We specialize in finest Sona Masoori and Basmati Rice bags directly sourced from premium mills, plus fresh daily general store essentials.
          </p>
          <div className="flex gap-3 mt-2">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi! I have a question about groceries at Shanvika Store.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all hover:scale-105"
              title="Message on WhatsApp"
            >
              <FaWhatsapp className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 text-left">
          <h3 className="font-display font-bold text-white text-base uppercase tracking-wider">
            Quick Navigation
          </h3>
          <ul className="flex flex-col gap-2.5 text-sm font-sans text-gray-400">
            {[
              { id: "home", label: "Home / Deals" },
              { id: "shop", label: "Browse Grocery Catalog" },
              { id: "cart", label: "My Shopping Cart" }
            ].map(link => (
              <li key={link.id}>
                <button
                  onClick={() => setCurrentTab(link.id)}
                  className="hover:text-primary transition-all flex items-center gap-1 group text-left cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-start gap-4 text-left">
          <h3 className="font-display font-bold text-white text-base uppercase tracking-wider">
            Operational Hours
          </h3>
          <div className="flex flex-col gap-3 text-sm text-gray-400">
            <div className="flex items-start gap-2.5">
              <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Monday - Sunday</p>
                <p className="text-xs">7:00 AM - 10:00 PM</p>
                <p className="text-[10px] text-emerald-400 mt-1 italic font-semibold">Open 365 Days a Year</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 border-t border-gray-800 pt-3">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Service Area</p>
                <p className="text-xs">Free delivery within 5 KM radius!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 text-left">
          <h3 className="font-display font-bold text-white text-base uppercase tracking-wider">
            Get In Touch
          </h3>
          <div className="flex flex-col gap-3 text-sm text-gray-400">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="leading-snug">
                {address}
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-1.5 border-t border-gray-800">
              <Phone className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">{displayPhone}</p>
                <p className="text-[10px] text-gray-500">Call for bulk order inquiries</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-800 pt-8 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p className="font-sans">
          © {currentYear} Shanvika Rice and General Store. All rights reserved.
        </p>
        <div className="flex gap-4">
          <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
