import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Edit,
  ImagePlus,
  LayoutGrid,
  Loader2,
  LogOut,
  PackagePlus,
  Plus,
  Shield,
  Trash2,
  Upload,
  X,
  Phone
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  deleteBanner,
  deleteCategory,
  deleteProduct,
  loginAdmin,
  logoutAdmin,
  changeAdminEmail,
  changeAdminPassword,
  saveBanner,
  saveCategory,
  saveProduct,
  saveStoreSettings,
  subscribeToAdminAuth,
  subscribeToStoreSettings,
  subscribeToBanners,
  subscribeToCategories,
  subscribeToOrders,
  subscribeToProducts,
  updateOrderStatus,
  uploadImage,
  resetCloudSync,
  usesFirebaseCloud
} from "../firebase";

const emptyProduct = {
  id: null,
  name: "",
  price: "",
  offerPrice: "",
  category: "Rice",
  stock: "10",
  weight: "1 Kg",
  imageUrl: ""
};

const emptyBanner = {
  id: null,
  title: "",
  subtitle: "",
  description: "",
  buttonText: "Shop Now",
  category: "All",
  imageUrl: "",
  sortOrder: 0
};

const emptyCategory = {
  id: null,
  name: "",
  icon: "",
  imageUrl: ""
};

export default function Admin() {
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("banners");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  const [productForm, setProductForm] = useState(emptyProduct);
  const [bannerForm, setBannerForm] = useState(emptyBanner);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [storeSettings, setStoreSettings] = useState({
    whatsappNumber: "919701882084",
    displayPhone: "+91 9701882084",
    name: "Shanvika Store",
    address: "",
    email: "",
    openingHours: ""
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [accountForm, setAccountForm] = useState({
    currentPassword: "",
    newEmail: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [accountMessage, setAccountMessage] = useState("");
  const [cloudSync, setCloudSync] = useState(usesFirebaseCloud);

  useEffect(() => {
    const syncCloudMode = () => setCloudSync(usesFirebaseCloud());
    syncCloudMode();
    window.addEventListener("shanvika_cloud_mode_changed", syncCloudMode);
    return () => window.removeEventListener("shanvika_cloud_mode_changed", syncCloudMode);
  }, []);

  useEffect(() => {
    return subscribeToAdminAuth((user) => {
      setAuthUser(user);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!authReady) return undefined;
    if (!authUser && cloudSync) return undefined;

    const unsubscribeProducts = subscribeToProducts(setProducts);
    const unsubscribeOrders = subscribeToOrders(setOrders);
    const unsubscribeBanners = subscribeToBanners(setBanners);
    const unsubscribeCategories = subscribeToCategories(setCategories);
    const unsubscribeSettings = subscribeToStoreSettings(setStoreSettings);

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeBanners();
      unsubscribeCategories();
      unsubscribeSettings();
    };
  }, [authUser, authReady, cloudSync]);

  const formattedWhatsAppNumber = useMemo(() => {
    return String(storeSettings.whatsappNumber || "").replace(/\D/g, "");
  }, [storeSettings.whatsappNumber]);

  const whatsappTestLink = useMemo(() => {
    if (!formattedWhatsAppNumber) {
      return "https://api.whatsapp.com";
    }
    return `https://api.whatsapp.com/send?phone=${formattedWhatsAppNumber}&text=${encodeURIComponent("Test order from Shanvika Store admin")}`;
  }, [formattedWhatsAppNumber]);

  const submitStoreSettings = async (event) => {
    event.preventDefault();
    if (formattedWhatsAppNumber.length < 10) {
      return alert("Enter a valid WhatsApp number with country code (e.g. 919701882084).");
    }
    setSaving(true);
    setSettingsSaved(false);
    try {
      const saved = await saveStoreSettings({
        whatsappNumber: formattedWhatsAppNumber,
        displayPhone: storeSettings.displayPhone,
        name: storeSettings.name,
        address: storeSettings.address,
        email: storeSettings.email,
        openingHours: storeSettings.openingHours
      });
      setStoreSettings(saved);
      setSettingsSaved(true);
    } catch (error) {
      console.error("Store settings save failed:", error);
      alert(error.message || "Could not save store settings. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const submitEmailChange = async (event) => {
    event.preventDefault();
    const { currentPassword, newEmail } = accountForm;

    if (!currentPassword.trim()) {
      return alert("Current password is required to update the admin email.");
    }
    if (!newEmail.trim()) {
      return alert("New admin email is required.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return alert("Enter a valid email address.");
    }

    setSaving(true);
    setAccountMessage("");
    try {
      await changeAdminEmail(newEmail, currentPassword);
      setAccountMessage("Admin email updated successfully.");
      setAccountForm((prev) => ({ ...prev, currentPassword: "", newEmail: "" }));
    } catch (error) {
      console.error("Admin email update failed:", error);
      setAccountMessage(error.message || "Could not update admin email. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const submitPasswordChange = async (event) => {
    event.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = accountForm;

    if (!currentPassword.trim()) {
      return alert("Current password is required to update the admin password.");
    }
    if (!newPassword) {
      return alert("New password is required.");
    }
    if (newPassword !== confirmPassword) {
      return alert("New password and confirmation do not match.");
    }
    if (newPassword.length < 6) {
      return alert("New password must be at least 6 characters.");
    }

    setSaving(true);
    setAccountMessage("");
    try {
      await changeAdminPassword(currentPassword, newPassword);
      setAccountMessage("Admin password updated successfully.");
      setAccountForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (error) {
      console.error("Admin password update failed:", error);
      setAccountMessage(error.message || "Could not update admin password. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const revenue = orders.reduce((total, order) => total + Number(order.totalAmount || 0), 0);
    const lowStock = products.filter((product) => Number(product.stock || 0) <= 3).length;
    return { revenue, lowStock };
  }, [orders, products]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      await loginAdmin(loginForm.email, loginForm.password);
    } catch (error) {
      console.error("Admin login failed:", error);
      setLoginError("Login failed. Check the Firebase Auth email and password.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleProductImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const imageUrl = await uploadImage(file, "products");
      setProductForm((prev) => ({ ...prev, imageUrl }));
    } catch (error) {
      console.error("Product image upload failed:", error);
      alert(`Product image upload failed. ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBannerImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const imageUrl = await uploadImage(file, "banners", "carousel");
      setBannerForm((prev) => ({ ...prev, imageUrl }));
    } catch (error) {
      console.error("Banner image upload failed:", error);
      alert(`Banner image upload failed. ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const imageUrl = await uploadImage(file, "categories");
      setCategoryForm((prev) => ({ ...prev, imageUrl }));
    } catch (error) {
      console.error("Category image upload failed:", error);
      alert(`Category image upload failed. ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    if (!productForm.name.trim()) return alert("Product name is required.");
    if (!productForm.price) return alert("Product price is required.");

    setSaving(true);
    try {
      await saveProduct(productForm);
      setProductForm(emptyProduct);
    } catch (error) {
      console.error("Product save failed:", error);
      alert("Product save failed.");
    } finally {
      setSaving(false);
    }
  };

  const submitBanner = async (event) => {
    event.preventDefault();
    if (!bannerForm.title.trim() && !bannerForm.imageUrl) {
      return alert("Please add either a title or an image.");
    }

    setSaving(true);
    try {
      await saveBanner(bannerForm);
      setBannerForm(emptyBanner);
    } catch (error) {
      console.error("Banner save failed:", error);
      alert("Banner save failed.");
    } finally {
      setSaving(false);
    }
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) return alert("Category name is required.");

    setSaving(true);
    try {
      await saveCategory({
        ...categoryForm,
        icon: categoryForm.icon || categoryForm.name
      });
      setCategoryForm(emptyCategory);
    } catch (error) {
      console.error("Category save failed:", error);
      alert(error.message || "Category save failed. Sign in on /admin and publish Firestore rules in Firebase Console.");
    } finally {
      setSaving(false);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-secondary animate-spin" />
      </div>
    );
  }

  if (!authUser && cloudSync) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="bg-secondary text-primary p-3 rounded-xl">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-gray-800">Admin Login</h1>
              <p className="font-sans text-xs text-gray-500">Sign in with your Firebase Auth admin account.</p>
            </div>
          </div>

          <label className="flex flex-col gap-1.5 font-sans text-sm text-gray-600">
            <span className="font-bold text-xs text-gray-500">Email</span>
            <input
              type="email"
              required
              value={loginForm.email}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
              className="px-4 py-3 border border-gray-200 rounded-xl"
            />
          </label>

          <label className="flex flex-col gap-1.5 font-sans text-sm text-gray-600">
            <span className="font-bold text-xs text-gray-500">Password</span>
            <input
              type="password"
              required
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              className="px-4 py-3 border border-gray-200 rounded-xl"
            />
          </label>

          {loginError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-sans rounded-xl p-3">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="py-3 bg-secondary hover:bg-secondary-hover text-white rounded-xl font-sans font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-left">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-xl text-gray-800">Shanvika Admin</h1>
            <p className="font-sans text-xs text-gray-500">Products, banners, and order management</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-sans font-bold text-xs flex items-center gap-2"
            >
              <span className="text-base">🌐</span>
              Website
            </a>
            {authUser ? (
              <button
                onClick={logoutAdmin}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-sans font-bold text-xs flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <span className="px-3 py-2 bg-amber-50 text-amber-800 rounded-xl font-sans font-bold text-xs">
                Local mode
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {!cloudSync && (
          <div className="bg-amber-50 border border-amber-100 text-amber-900 font-sans text-xs rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="flex-1">
              Cloud sync is paused. Data is saved in this browser only. After deploying rules, click Retry cloud sync
              (do not use Storage — run <code className="font-mono">npm run deploy</code> only).
            </p>
            <button
              type="button"
              onClick={() => {
                resetCloudSync().then(() => window.location.reload());
              }}
              className="shrink-0 px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg font-bold"
            >
              Retry cloud sync
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Products" value={products.length} />
          <Stat label="Categories" value={categories.length} />
          <Stat label="Carousel Slides" value={banners.length} />
          <Stat label="Orders" value={orders.length} />
        </div>

        <div className="flex flex-wrap gap-2 bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
          {[
            { id: "banners", label: "Carousel Images", icon: ImagePlus },
            { id: "categories", label: "Categories", icon: LayoutGrid },
            { id: "products", label: "Products", icon: PackagePlus },
            { id: "orders", label: "Orders", icon: AlertTriangle },
            { id: "settings", label: "WhatsApp", icon: Phone }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl font-sans font-bold text-xs flex items-center gap-2 ${
                  activeTab === tab.id ? "bg-secondary text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "settings" && (
          <section className="max-w-2xl">
            <form
              onSubmit={submitStoreSettings}
              className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5"
            >
              <PanelTitle title="WhatsApp order number" hideClear />
              <p className="font-sans text-sm text-gray-500 -mt-2">
                Checkout opens WhatsApp with the cart list sent to this number. Update it here if you change or lose your phone.
              </p>

              <label className="flex flex-col gap-1.5 font-sans text-sm text-gray-600">
                <span className="font-bold text-xs text-gray-500">WhatsApp number (with country code, no +)</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder="919701882084"
                  value={storeSettings.whatsappNumber || ""}
                  onChange={(event) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      whatsappNumber: event.target.value.replace(/[^\d]/g, "")
                    }))
                  }
                  className="px-4 py-2.5 border border-gray-200 rounded-xl"
                />
                <span className="text-[11px] text-gray-400">
                  India example: 91 followed by 10-digit mobile (91XXXXXXXXXX).
                </span>
              </label>

              <TextInput
                label="Display phone (shown on website footer)"
                value={storeSettings.displayPhone}
                onChange={(value) => setStoreSettings((prev) => ({ ...prev, displayPhone: value }))}
              />

              <TextInput
                label="Store name"
                value={storeSettings.name}
                onChange={(value) => setStoreSettings((prev) => ({ ...prev, name: value }))}
              />

              <TextInput
                label="Store email"
                value={storeSettings.email}
                onChange={(value) => setStoreSettings((prev) => ({ ...prev, email: value }))}
              />

              <TextArea
                label="Store address"
                value={storeSettings.address}
                onChange={(value) => setStoreSettings((prev) => ({ ...prev, address: value }))}
              />

              <TextInput
                label="Opening hours"
                value={storeSettings.openingHours}
                onChange={(value) => setStoreSettings((prev) => ({ ...prev, openingHours: value }))}
              />

              <div className="flex flex-wrap items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <FaWhatsapp className="h-6 w-6 text-emerald-600 shrink-0" />
                <div className="min-w-0 flex-1 font-sans text-xs text-gray-600">
                  <p className="font-bold text-gray-800 mb-1">Test link</p>
                  <a
                    href={whatsappTestLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary font-bold hover:underline break-all"
                  >
                    Open WhatsApp with current number
                  </a>
                </div>
              </div>

              {settingsSaved && (
                <p className="text-xs font-sans font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  Saved. New checkouts will use this number.
                </p>
              )}

              <SaveButton saving={saving} label="Save WhatsApp number" />
            </form>

            <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
              <PanelTitle title="Admin account" hideClear />
              <p className="font-sans text-sm text-gray-500 -mt-2">
                Change the admin login email or password for the control panel.
              </p>

              {!authUser ? (
                <p className="text-sm text-gray-500">Sign in to update admin credentials.</p>
              ) : (
                <>
                  <form onSubmit={submitEmailChange} className="flex flex-col gap-4">
                    <TextInput
                      type="password"
                      label="Current password"
                      value={accountForm.currentPassword}
                      onChange={(value) => setAccountForm((prev) => ({ ...prev, currentPassword: value }))}
                    />
                    <TextInput
                      type="email"
                      label="New admin email"
                      value={accountForm.newEmail}
                      onChange={(value) => setAccountForm((prev) => ({ ...prev, newEmail: value }))}
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="py-3 bg-secondary hover:bg-secondary-hover text-white rounded-xl font-sans font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      Update email
                    </button>
                  </form>

                  <div className="h-px bg-gray-100 my-4" />

                  <form onSubmit={submitPasswordChange} className="flex flex-col gap-4">
                    <TextInput
                      type="password"
                      label="Current password"
                      value={accountForm.currentPassword}
                      onChange={(value) => setAccountForm((prev) => ({ ...prev, currentPassword: value }))}
                    />
                    <TextInput
                      type="password"
                      label="New password"
                      value={accountForm.newPassword}
                      onChange={(value) => setAccountForm((prev) => ({ ...prev, newPassword: value }))}
                    />
                    <TextInput
                      type="password"
                      label="Confirm new password"
                      value={accountForm.confirmPassword}
                      onChange={(value) => setAccountForm((prev) => ({ ...prev, confirmPassword: value }))}
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="py-3 bg-secondary hover:bg-secondary-hover text-white rounded-xl font-sans font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      Update password
                    </button>
                  </form>
                </>
              )}

              {accountMessage && (
                <p className="text-xs font-sans font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  {accountMessage}
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === "banners" && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form onSubmit={submitBanner} className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <PanelTitle title={bannerForm.id ? "Edit Carousel Slide" : "Add Carousel Slide"} onClear={() => setBannerForm(emptyBanner)} />
              <TextInput label="Title (optional)" value={bannerForm.title} onChange={(value) => setBannerForm((prev) => ({ ...prev, title: value }))} />
              <TextInput label="Subtitle (optional)" value={bannerForm.subtitle} onChange={(value) => setBannerForm((prev) => ({ ...prev, subtitle: value }))} />
              <TextArea label="Description (optional)" value={bannerForm.description} onChange={(value) => setBannerForm((prev) => ({ ...prev, description: value }))} />
              <TextInput label="Button Text" value={bannerForm.buttonText} onChange={(value) => setBannerForm((prev) => ({ ...prev, buttonText: value }))} />
              <SelectInput label="Button Category" value={bannerForm.category} onChange={(value) => setBannerForm((prev) => ({ ...prev, category: value }))} options={["All", ...categories.map((item) => item.name)]} />
              <TextInput label="Sort Order" value={bannerForm.sortOrder} onChange={(value) => setBannerForm((prev) => ({ ...prev, sortOrder: value }))} />
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-sans">
                <p className="font-bold mb-1">💡 Image Tips</p>
                <p>Best aspect ratio: <strong>16:9</strong> (widescreen)</p>
                <p>Recommended size: <strong>1920×1080px</strong> or <strong>1440×810px</strong></p>
                <p>Images will be automatically cropped to fit 16:9 ratio.</p>
              </div>
              <ImageUpload imageUrl={bannerForm.imageUrl} onChange={handleBannerImage} />
              {bannerForm.imageUrl && (
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-xs text-gray-500">Preview (16:9 carousel)</p>
                  <div className="relative w-full aspect-video overflow-hidden rounded-xl border-2 border-blue-200 bg-gray-100 shadow-md">
                    <img
                      src={bannerForm.imageUrl}
                      alt="Carousel preview"
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                  </div>
                </div>
              )}
              <SaveButton saving={saving} label="Save Slide" />
            </form>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((banner) => (
                <div key={banner.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="h-44 bg-secondary relative">
                    {banner.imageUrl ? (
                      <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-r from-secondary to-primary" />
                    )}
                    <div className="absolute inset-0 bg-black/35" />
                    <div className="absolute left-4 bottom-4 right-4 text-white">
                      <p className="text-xs font-bold uppercase">{banner.subtitle}</p>
                      <h3 className="font-display font-extrabold text-xl">{banner.title}</h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-3">
                    <p className="font-sans text-xs text-gray-500 line-clamp-2">{banner.description || "No description"}</p>
                    <RowActions
                      onEdit={() => setBannerForm({ ...emptyBanner, ...banner })}
                      onDelete={() => deleteBanner(banner.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "categories" && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form onSubmit={submitCategory} className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <PanelTitle title={categoryForm.id ? "Edit Category" : "Add Category"} onClear={() => setCategoryForm(emptyCategory)} />
              <TextInput label="Category Name" value={categoryForm.name} onChange={(value) => setCategoryForm((prev) => ({ ...prev, name: value }))} />
              <TextInput label="Short Label" value={categoryForm.icon} onChange={(value) => setCategoryForm((prev) => ({ ...prev, icon: value }))} />
              <ImageUpload imageUrl={categoryForm.imageUrl} onChange={handleCategoryImage} />
              <SaveButton saving={saving} label="Save Category" />
            </form>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                  {category.imageUrl ? (
                    <img src={category.imageUrl} alt={category.name} className="h-16 w-16 rounded-xl object-cover border border-gray-100" />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-primary/20 text-secondary flex items-center justify-center font-display font-extrabold">
                      {category.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-extrabold text-gray-800 truncate">{category.name}</p>
                    <p className="font-sans text-xs text-gray-400 truncate">{category.icon || category.name}</p>
                  </div>
                  <RowActions
                    onEdit={() => setCategoryForm({ ...emptyCategory, ...category })}
                    onDelete={() => deleteCategory(category.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "products" && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form onSubmit={submitProduct} className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <PanelTitle title={productForm.id ? "Edit Product" : "Add Product"} onClear={() => setProductForm(emptyProduct)} />
              <TextInput label="Name" value={productForm.name} onChange={(value) => setProductForm((prev) => ({ ...prev, name: value }))} />
              <SelectInput label="Category" value={productForm.category} onChange={(value) => setProductForm((prev) => ({ ...prev, category: value }))} options={categories.map((item) => item.name)} />
              <TextInput label="Weight / Volume" value={productForm.weight} onChange={(value) => setProductForm((prev) => ({ ...prev, weight: value }))} />
              <NumberInput label="Price" value={productForm.price} onChange={(value) => setProductForm((prev) => ({ ...prev, price: value }))} />
              <NumberInput label="Offer Price" value={productForm.offerPrice} onChange={(value) => setProductForm((prev) => ({ ...prev, offerPrice: value }))} />
              <NumberInput label="Stock" value={productForm.stock} onChange={(value) => setProductForm((prev) => ({ ...prev, stock: value }))} />
              <ImageUpload imageUrl={productForm.imageUrl} onChange={handleProductImage} />
              <SaveButton saving={saving} label="Save Product" />
            </form>

            <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm overflow-x-auto">
              <table className="w-full text-left font-sans text-xs sm:text-sm">
                <thead className="text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="py-3 pr-3">Product</th>
                    <th className="py-3 pr-3">Category</th>
                    <th className="py-3 pr-3">Price</th>
                    <th className="py-3 pr-3">Stock</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <ProductThumb product={product} />
                          <div>
                            <p className="font-bold text-gray-800">{product.name}</p>
                            <p className="text-[10px] text-gray-400">{product.weight}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-gray-600">{product.category}</td>
                      <td className="py-3 pr-3 font-bold text-secondary">₹{product.offerPrice || product.price}</td>
                      <td className="py-3 pr-3 text-gray-600">{product.stock}</td>
                      <td className="py-3 text-right">
                        <RowActions
                          onEdit={() => setProductForm({ ...emptyProduct, ...product })}
                          onDelete={() => deleteProduct(product.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stats.lowStock > 0 && (
                <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  {stats.lowStock} product{stats.lowStock > 1 ? "s are" : " is"} low in stock.
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === "orders" && (
          <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            {orders.length === 0 && <p className="text-sm text-gray-500">No orders yet.</p>}
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-100 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-4">
                  <p className="font-bold text-gray-800">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.phone}</p>
                  <p className="text-xs text-gray-500 mt-1">{order.address}</p>
                </div>
                <div className="lg:col-span-5 text-xs text-gray-600">
                  {order.items?.map((item, index) => (
                    <p key={`${order.id}-${index}`}>
                      {item.name} x {item.quantity} = ₹{(item.offerPrice || item.price) * item.quantity}
                    </p>
                  ))}
                </div>
                <div className="lg:col-span-3 flex lg:justify-end items-start gap-3">
                  <span className="font-display font-extrabold text-secondary">₹{order.totalAmount}</span>
                  <select
                    value={order.status}
                    onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <p className="font-sans text-xs text-gray-400 font-bold uppercase">{label}</p>
      <p className="font-display text-2xl font-extrabold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

function PanelTitle({ title, onClear, hideClear = false }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
      <h2 className="font-display font-extrabold text-lg text-gray-800">{title}</h2>
      {!hideClear && (
        <button type="button" onClick={onClear} className="p-1.5 text-gray-400 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function TextInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="flex flex-col gap-1.5 font-sans text-sm text-gray-600">
      <span className="font-bold text-xs text-gray-500">{label}</span>
      <input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="px-4 py-2.5 border border-gray-200 rounded-xl"
      />
    </label>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5 font-sans text-sm text-gray-600">
      <span className="font-bold text-xs text-gray-500">{label}</span>
      <input type="number" min="0" value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl" />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5 font-sans text-sm text-gray-600">
      <span className="font-bold text-xs text-gray-500">{label}</span>
      <textarea rows="3" value={value || ""} onChange={(event) => onChange(event.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl resize-none" />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  const safeOptions = options.length > 0 ? options : ["Rice", "Pulses", "Oils", "Essentials"];

  return (
    <label className="flex flex-col gap-1.5 font-sans text-sm text-gray-600">
      <span className="font-bold text-xs text-gray-500">{label}</span>
      <select value={value || safeOptions[0]} onChange={(event) => onChange(event.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white">
        {safeOptions.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ImageUpload({ imageUrl, onChange }) {
  return (
    <div className="flex flex-col gap-2 border border-gray-100 rounded-xl p-3 bg-gray-50/60">
      <label className="font-bold text-xs text-gray-500 flex items-center gap-2">
        <Upload className="h-4 w-4" />
        Image Upload
      </label>
      <input type="file" accept="image/*" onChange={onChange} className="text-xs file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-primary file:text-secondary-dark file:font-bold" />
      {imageUrl && <img src={imageUrl} alt="Preview" className="h-24 w-full object-cover rounded-lg border border-gray-200" />}
    </div>
  );
}

function SaveButton({ saving, label }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="py-3 bg-secondary hover:bg-secondary-hover text-white rounded-xl font-sans font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
    >
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      {label}
    </button>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button type="button" onClick={onEdit} className="p-2 text-gray-400 hover:text-secondary hover:bg-emerald-50 rounded-lg">
        <Edit className="h-4 w-4" />
      </button>
      <button type="button" onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function ProductThumb({ product }) {
  if (product.imageUrl) {
    return <img src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-lg object-cover border border-gray-100" />;
  }

  return (
    <div className="h-12 w-12 rounded-lg bg-primary/20 text-secondary flex items-center justify-center font-display font-extrabold text-sm">
      {product.name?.slice(0, 2).toUpperCase() || "PR"}
    </div>
  );
}
