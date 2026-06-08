import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  query,
  runTransaction,
  setDoc
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Spark (free) plan: Firestore + Auth are enough. Storage bucket is optional.
const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let firestore = null;
let storage = null;
let auth = null;

const CLOUD_DISABLED_KEY = "shanvika_cloud_disabled";
const ADMIN_SESSION_KEY = "shanvika_admin_session";
const USE_FIREBASE_STORAGE = import.meta.env.VITE_USE_FIREBASE_STORAGE === "true";

function isCloudDisabled() {
  return sessionStorage.getItem(CLOUD_DISABLED_KEY) === "1";
}

function disableCloud(reason) {
  if (!isCloudDisabled()) {
    sessionStorage.setItem(CLOUD_DISABLED_KEY, "1");
    console.warn("Firebase cloud unavailable — using browser storage.", reason?.message || reason);
    window.dispatchEvent(new Event("shanvika_cloud_mode_changed"));
  }
}

export function usesFirebaseCloud() {
  return Boolean(isFirebaseConfigured && firestore && !isCloudDisabled());
}

function shouldUseCloud() {
  return usesFirebaseCloud();
}

function isPermissionError(error) {
  return error?.code === "permission-denied" || error?.code === "storage/unauthorized";
}

if (isFirebaseConfigured) {
  try {
    const initializedApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    firestore = getFirestore(initializedApp);
    auth = getAuth(initializedApp);
    if (USE_FIREBASE_STORAGE && firebaseConfig.storageBucket) {
      storage = getStorage(initializedApp);
    }
    console.log(
      isCloudDisabled()
        ? "Firebase initialized. Local data mode (cloud paused)."
        : USE_FIREBASE_STORAGE && storage
          ? "Firebase initialized. Cloud + Storage enabled."
          : "Firebase initialized. Free-tier cloud (Firestore + Auth; images saved in Firestore)."
    );
  } catch (error) {
    console.error("Firebase initialization failed. Local mode enabled:", error);
  }
} else {
  console.log("Firebase config missing. Local mode enabled.");
}

async function probeCloudAccess() {
  if (!firestore) {
    return;
  }

  try {
    await getDocs(query(collection(firestore, "products"), limit(1)));
    if (isCloudDisabled()) {
      sessionStorage.removeItem(CLOUD_DISABLED_KEY);
      window.dispatchEvent(new Event("shanvika_cloud_mode_changed"));
      console.log("Firebase cloud sync restored.");
    }
  } catch (error) {
    if (isPermissionError(error)) {
      disableCloud(error);
    }
  }
}

export function resetCloudSync() {
  sessionStorage.removeItem(CLOUD_DISABLED_KEY);
  window.dispatchEvent(new Event("shanvika_cloud_mode_changed"));
  return probeCloudAccess();
}

probeCloudAccess();

const DEFAULT_CATEGORIES = [
  { id: "c1", name: "Rice", icon: "Rice", imageUrl: "" },
  { id: "c2", name: "Pulses", icon: "Pulses", imageUrl: "" },
  { id: "c3", name: "Oils", icon: "Oils", imageUrl: "" },
  { id: "c4", name: "Essentials", icon: "Essentials", imageUrl: "" }
];

const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    name: "Sona Masoori Rice",
    price: 1550,
    offerPrice: 1420,
    category: "Rice",
    stock: 25,
    weight: "26 Kg",
    imageUrl: ""
  },
  {
    id: "p2",
    name: "Premium Toor Dal",
    price: 180,
    offerPrice: 155,
    category: "Pulses",
    stock: 40,
    weight: "1 Kg",
    imageUrl: ""
  },
  {
    id: "p3",
    name: "Sunflower Oil",
    price: 155,
    offerPrice: 135,
    category: "Oils",
    stock: 45,
    weight: "1 Litre",
    imageUrl: ""
  }
];

const DEFAULT_BANNERS = [
  {
    id: "b1",
    title: "Store Discount",
    subtitle: "Fresh rice and grocery offers",
    description: "Upload offer artwork from the admin panel and keep store announcements current.",
    buttonText: "Shop Offers",
    category: "All",
    imageUrl: ""
  },
  {
    id: "b2",
    title: "About Shanvika Store",
    subtitle: "Rice and general essentials",
    description: "Share store updates, delivery details, and customer information from the admin panel.",
    buttonText: "Browse Store",
    category: "Essentials",
    imageUrl: ""
  }
];

const DEFAULT_ORDERS = [];

const DEFAULT_STORE_SETTINGS = {
  whatsappNumber: "919701882084",
  displayPhone: "+91 9701882084",
  name: "Shanvika Store",
  address: "",
  email: "",
  openingHours: ""
};

const ensureLocalDefaults = () => {
  if (!localStorage.getItem("shanvika_categories")) {
    localStorage.setItem("shanvika_categories", JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (!localStorage.getItem("shanvika_products")) {
    localStorage.setItem("shanvika_products", JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem("shanvika_orders")) {
    localStorage.setItem("shanvika_orders", JSON.stringify(DEFAULT_ORDERS));
  }
  if (!localStorage.getItem("shanvika_banners")) {
    localStorage.setItem("shanvika_banners", JSON.stringify(DEFAULT_BANNERS));
  }
  if (!localStorage.getItem("shanvika_store_settings")) {
    localStorage.setItem("shanvika_store_settings", JSON.stringify(DEFAULT_STORE_SETTINGS));
  }
};

ensureLocalDefaults();

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function isAdminSignedIn() {
  return Boolean(auth?.currentUser);
}

function requireAdminForWrite(action) {
  if (!isAdminSignedIn()) {
    throw new Error("Admin sign-in required. Log in on /admin before saving to Firebase.");
  }
}

function subscribeToCollection(collectionName, localKey, defaults, callback, sortFn) {
  let unsubscribeFirestore = () => {};

  const loadLocal = () => {
    const localList = JSON.parse(localStorage.getItem(localKey) || "[]");
    const sorted =
      localList.length > 0 ? localList.sort(sortFn) : [...defaults].sort(sortFn);
    callback(sorted);
  };

  if (shouldUseCloud()) {
    try {
      const q = collection(firestore, collectionName);
      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const list = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });

          if (list.length === 0 && defaults.length > 0 && isAdminSignedIn()) {
            Promise.all(
              defaults.map((item) => {
                const { id, ...data } = item;
                return setDoc(doc(firestore, collectionName, id), data);
              })
            ).catch((seedError) => {
              if (isPermissionError(seedError)) {
                disableCloud(seedError);
                unsubscribeFirestore();
                loadLocal();
              } else {
                console.error(`Firestore ${collectionName} seed error:`, seedError);
              }
            });
            callback([...defaults].sort(sortFn));
            return;
          }

          callback(list.length > 0 ? list.sort(sortFn) : [...defaults].sort(sortFn));
        },
        (error) => {
          if (isPermissionError(error)) {
            disableCloud(error);
            unsubscribeFirestore();
          } else {
            console.error(`Firestore ${collectionName} subscription error:`, error);
          }
          loadLocal();
        }
      );
    } catch (error) {
      console.error(`Firestore ${collectionName} setup error:`, error);
      if (isPermissionError(error)) {
        disableCloud(error);
      }
    }
  }

  loadLocal();
  const eventName = `${localKey}_changed`;
  window.addEventListener(eventName, loadLocal);
  return () => {
    unsubscribeFirestore();
    window.removeEventListener(eventName, loadLocal);
  };
}

function localUpsert(localKey, item) {
  const list = JSON.parse(localStorage.getItem(localKey) || "[]");
  const index = list.findIndex((entry) => entry.id === item.id);

  if (index >= 0) {
    list[index] = item;
  } else {
    list.push(item);
  }

  localStorage.setItem(localKey, JSON.stringify(list));
  window.dispatchEvent(new Event(`${localKey}_changed`));
}

function localDelete(localKey, id) {
  const list = JSON.parse(localStorage.getItem(localKey) || "[]")
    .filter((entry) => entry.id !== id);
  localStorage.setItem(localKey, JSON.stringify(list));
  window.dispatchEvent(new Event(`${localKey}_changed`));
}

export function subscribeToCategories(callback) {
  return subscribeToCollection(
    "categories",
    "shanvika_categories",
    DEFAULT_CATEGORIES,
    callback,
    (a, b) => a.name.localeCompare(b.name)
  );
}

export async function saveCategory(category) {
  const categoryId = category.id || `c-${Date.now()}`;
  const cleanCategory = {
    name: category.name || "Essentials",
    icon: category.icon || category.name || "Category",
    imageUrl: category.imageUrl || ""
  };

  if (shouldUseCloud()) {
    try {
      requireAdminForWrite("save category");
      await setDoc(doc(firestore, "categories", categoryId), cleanCategory);
      return { id: categoryId, ...cleanCategory };
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }
      disableCloud(error);
    }
  }

  await delay();
  const finalCategory = { id: categoryId, ...cleanCategory };
  localUpsert("shanvika_categories", finalCategory);
  return finalCategory;
}

export async function deleteCategory(categoryId) {
  if (shouldUseCloud()) {
    try {
      requireAdminForWrite("delete category");
      await deleteDoc(doc(firestore, "categories", categoryId));
      return;
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }
      disableCloud(error);
    }
  }

  await delay();
  localDelete("shanvika_categories", categoryId);
}

export function subscribeToBanners(callback) {
  return subscribeToCollection(
    "banners",
    "shanvika_banners",
    DEFAULT_BANNERS,
    callback,
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
  );
}

export async function saveBanner(banner) {
  const bannerId = banner.id || `b-${Date.now()}`;
  const cleanBanner = {
    title: banner.title || "Store Offer",
    subtitle: banner.subtitle || "",
    description: banner.description || "",
    buttonText: banner.buttonText || "Shop Now",
    category: banner.category || "All",
    imageUrl: banner.imageUrl || "",
    sortOrder: Number(banner.sortOrder) || 0
  };

  if (shouldUseCloud()) {
    try {
      requireAdminForWrite("save banner");
      await setDoc(doc(firestore, "banners", bannerId), cleanBanner);
      return { id: bannerId, ...cleanBanner };
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }
      disableCloud(error);
    }
  }

  await delay();
  const finalBanner = { id: bannerId, ...cleanBanner };
  localUpsert("shanvika_banners", finalBanner);
  return finalBanner;
}

export async function deleteBanner(bannerId) {
  if (shouldUseCloud()) {
    try {
      requireAdminForWrite("delete banner");
      await deleteDoc(doc(firestore, "banners", bannerId));
      return;
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }
      disableCloud(error);
    }
  }

  await delay();
  localDelete("shanvika_banners", bannerId);
}

export function subscribeToProducts(callback) {
  return subscribeToCollection(
    "products",
    "shanvika_products",
    DEFAULT_PRODUCTS,
    callback,
    (a, b) => a.name.localeCompare(b.name)
  );
}

export async function saveProduct(product) {
  const productId = product.id || `p-${Date.now()}`;
  const cleanProduct = {
    name: product.name || "Unnamed Product",
    price: Number(product.price) || 0,
    offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
    category: product.category || "Essentials",
    stock: Number(product.stock) || 0,
    weight: product.weight || "1 Kg",
    imageUrl: product.imageUrl || ""
  };

  if (shouldUseCloud()) {
    try {
      requireAdminForWrite("save product");
      await setDoc(doc(firestore, "products", productId), cleanProduct);
      return { id: productId, ...cleanProduct };
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }
      disableCloud(error);
    }
  }

  await delay();
  const finalProduct = { id: productId, ...cleanProduct };
  localUpsert("shanvika_products", finalProduct);
  return finalProduct;
}

export async function deleteProduct(productId) {
  if (shouldUseCloud()) {
    try {
      requireAdminForWrite("delete product");
      await deleteDoc(doc(firestore, "products", productId));
      return;
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }
      disableCloud(error);
    }
  }

  await delay();
  localDelete("shanvika_products", productId);
}

export function subscribeToOrders(callback) {
  return subscribeToCollection(
    "orders",
    "shanvika_orders",
    DEFAULT_ORDERS,
    callback,
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}

export async function saveOrder(order) {
  const orderId = `o-${Date.now()}`;
  const cleanOrder = {
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price) || 0,
      offerPrice: item.offerPrice ? Number(item.offerPrice) : null,
      quantity: Number(item.quantity) || 1,
      weight: item.weight || ""
    })),
    totalAmount: Number(order.totalAmount) || 0,
    createdAt: new Date().toISOString(),
    status: "Pending"
  };

  if (shouldUseCloud()) {
    try {
      await setDoc(doc(firestore, "orders", orderId), cleanOrder);

      for (const item of cleanOrder.items) {
        await runTransaction(firestore, async (transaction) => {
          const productRef = doc(firestore, "products", item.id);
          const productSnap = await transaction.get(productRef);

          if (!productSnap.exists()) {
            return;
          }

          const currentStock = Number(productSnap.data().stock || 0);
          transaction.update(productRef, {
            stock: Math.max(0, currentStock - item.quantity)
          });
        });
      }

      return { id: orderId, ...cleanOrder };
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }
      disableCloud(error);
    }
  }

  await delay(300);
  const finalOrder = { id: orderId, ...cleanOrder };
  localUpsert("shanvika_orders", finalOrder);

  const localProducts = JSON.parse(localStorage.getItem("shanvika_products") || "[]");
  cleanOrder.items.forEach((item) => {
    const product = localProducts.find((entry) => entry.id === item.id);
    if (product) {
      product.stock = Math.max(0, Number(product.stock || 0) - item.quantity);
    }
  });
  localStorage.setItem("shanvika_products", JSON.stringify(localProducts));
  window.dispatchEvent(new Event("shanvika_products_changed"));

  return finalOrder;
}

export async function updateOrderStatus(orderId, status) {
  if (shouldUseCloud()) {
    try {
      requireAdminForWrite("update order");
      await setDoc(doc(firestore, "orders", orderId), { status }, { merge: true });
      return;
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }
      disableCloud(error);
    }
  }

  await delay();
  const orders = JSON.parse(localStorage.getItem("shanvika_orders") || "[]");
  const order = orders.find((entry) => entry.id === orderId);
  if (order) {
    order.status = status;
    localStorage.setItem("shanvika_orders", JSON.stringify(orders));
    window.dispatchEvent(new Event("shanvika_orders_changed"));
  }
}

export async function deleteOrder(orderId) {
  if (shouldUseCloud()) {
    try {
      requireAdminForWrite("delete order");
      await deleteDoc(doc(firestore, "orders", orderId));
      return;
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }
      disableCloud(error);
    }
  }

  await delay();
  localDelete("shanvika_orders", orderId);
}

export function sendWhatsAppNotification(phoneNumber, message) {
  if (!phoneNumber || !message) {
    console.warn("WhatsApp notification skipped: missing phone or message");
    return;
  }
  
  const formattedPhone = String(phoneNumber).replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
  
  window.open(whatsappUrl, "_blank");
}

export function subscribeToStoreSettings(callback) {
  let unsubscribeFirestore = () => {};

  const loadLocalSettings = () => {
    callback(
      JSON.parse(localStorage.getItem("shanvika_store_settings") || JSON.stringify(DEFAULT_STORE_SETTINGS))
    );
  };

  if (shouldUseCloud()) {
    try {
      const settingsRef = doc(firestore, "settings", "store");
      unsubscribeFirestore = onSnapshot(
        settingsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            callback({ ...DEFAULT_STORE_SETTINGS, ...snapshot.data() });
            return;
          }

          if (isAdminSignedIn()) {
            setDoc(settingsRef, DEFAULT_STORE_SETTINGS).catch((seedError) => {
              if (isPermissionError(seedError)) {
                disableCloud(seedError);
                unsubscribeFirestore();
                loadLocalSettings();
              } else {
                console.error("Store settings seed error:", seedError);
              }
            });
          }

          callback(DEFAULT_STORE_SETTINGS);
        },
        (error) => {
          if (isPermissionError(error)) {
            disableCloud(error);
            unsubscribeFirestore();
          } else {
            console.error("Store settings subscription error:", error);
          }
          loadLocalSettings();
        }
      );
    } catch (error) {
      console.error("Store settings setup error:", error);
      if (isPermissionError(error)) {
        disableCloud(error);
      }
    }
  }

  loadLocalSettings();
  window.addEventListener("shanvika_store_settings_changed", loadLocalSettings);
  return () => {
    unsubscribeFirestore();
    window.removeEventListener("shanvika_store_settings_changed", loadLocalSettings);
  };
}

export async function saveStoreSettings(settings) {
  const cleanNumber = String(settings.whatsappNumber || "").replace(/\D/g, "");
  const cleanSettings = {
    whatsappNumber: cleanNumber || DEFAULT_STORE_SETTINGS.whatsappNumber,
    displayPhone: settings.displayPhone || `+${cleanNumber || DEFAULT_STORE_SETTINGS.whatsappNumber}`,
    name: settings.name || DEFAULT_STORE_SETTINGS.name,
    address: settings.address || DEFAULT_STORE_SETTINGS.address,
    email: settings.email || DEFAULT_STORE_SETTINGS.email,
    openingHours: settings.openingHours || DEFAULT_STORE_SETTINGS.openingHours
  };

  if (shouldUseCloud()) {
    try {
      requireAdminForWrite("save store settings");
      await setDoc(doc(firestore, "settings", "store"), cleanSettings, { merge: true });
      return cleanSettings;
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }
      disableCloud(error);
    }
  }

  await delay();
  localStorage.setItem("shanvika_store_settings", JSON.stringify(cleanSettings));
  window.dispatchEvent(new Event("shanvika_store_settings_changed"));
  return cleanSettings;
}

export async function uploadImage(file, folder = "products", imageType = "product") {
  const embeddedUrl = await compressImageToDataUrl(file, imageType);

  if (!USE_FIREBASE_STORAGE || !shouldUseCloud() || !storage) {
    return embeddedUrl;
  }

  if (!isAdminSignedIn()) {
    return embeddedUrl;
  }

  try {
    await auth.currentUser.getIdToken(true);
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, "_");
    const fileRef = ref(storage, `${folder}/${Date.now()}_${safeName}`);
    const metadata = { contentType: file.type || "image/jpeg" };
    await uploadBytes(fileRef, file, metadata);
    return getDownloadURL(fileRef);
  } catch (error) {
    console.warn("Storage upload skipped; using embedded image.", error?.code || error?.message);
    return embeddedUrl;
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImageToDataUrl(file, imageType = "product") {
  const originalDataUrl = await readFileAsDataUrl(file);

  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      if (imageType === "carousel" || imageType === "banner") {
        // Enforce strict 16:9 aspect ratio for carousel
        // Target: 1440x810 (16:9)
        const targetRatio = 16 / 9; // ≈ 1.778
        const imageRatio = image.width / image.height;
        
        let sourceWidth = image.width;
        let sourceHeight = image.height;
        let sourceX = 0;
        let sourceY = 0;

        if (imageRatio > targetRatio) {
          // Image is wider than 16:9 - crop width
          sourceWidth = Math.round(image.height * targetRatio);
          sourceX = Math.round((image.width - sourceWidth) / 2);
        } else if (imageRatio < targetRatio) {
          // Image is taller than 16:9 - crop height
          sourceHeight = Math.round(image.width / targetRatio);
          sourceY = Math.round((image.height - sourceHeight) / 2);
        }
        // If imageRatio === targetRatio, no cropping needed

        // Set canvas to 1440x810 (16:9)
        canvas.width = 1440;
        canvas.height = 810;

        // Draw cropped image to fill canvas
        context.drawImage(
          image,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
      } else {
        // Products, categories: maintain aspect ratio, max 800x600
        const maxWidth = 800;
        const maxHeight = 600;
        const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const width = Math.round(image.width * ratio);
        const height = Math.round(image.height * ratio);

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
      }

      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };

    image.onerror = () => resolve(originalDataUrl);
    image.src = originalDataUrl;
  });
}

export function subscribeToAdminAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export async function loginAdmin(email, password) {
  if (!auth) {
    throw new Error("Firebase Auth is not configured.");
  }

  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function logoutAdmin() {
  if (auth) {
    await signOut(auth);
  }
  clearAdminSession();
}

export function setAdminSession() {
  sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function hasAdminSession() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

async function reauthenticateAdmin(currentPassword) {
  if (!auth?.currentUser) {
    throw new Error("Admin is not signed in.");
  }

  const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
  await reauthenticateWithCredential(auth.currentUser, credential);
}

export async function changeAdminEmail(newEmail, currentPassword) {
  if (!auth?.currentUser) {
    throw new Error("Admin is not signed in.");
  }

  await reauthenticateAdmin(currentPassword);
  await updateEmail(auth.currentUser, newEmail.trim());
  return newEmail.trim();
}

export async function changeAdminPassword(currentPassword, newPassword) {
  if (!auth?.currentUser) {
    throw new Error("Admin is not signed in.");
  }

  await reauthenticateAdmin(currentPassword);
  await updatePassword(auth.currentUser, newPassword);
}
