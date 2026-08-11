import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  emoji: string;
  categoryId: string;
  unit: string;
  price: number;
  mrp: number;
  stock: number;
  lowStockThreshold: number;
  active: boolean;
}

export interface Offer {
  id: string;
  title: string;
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  validTill: string;
  active: boolean;
}

export type OrderStatus = "pending" | "accepted" | "packing" | "ready_for_pickup" | "out_for_delivery" | "delivered" | "cancelled";

export interface Order {
  id: string;
  customerName: string;
  items: number;
  total: number;
  status: OrderStatus;
  payment: "COD" | "UPI" | "Card";
  date: string;
  deliveryPartnerId: number | null;
  deliveryPartnerName: string | null;
  deliveryPartnerPhone: string | null;
  deliveryPartnerVehicle: string | null;
}

export interface DeliveryPartner {
  id: number;
  userId: number;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  profileImage: string | null;
  rating: number;
  isOnline: boolean;
  isAvailable: boolean;
  currentLatitude: number | null;
  currentLongitude: number | null;
  orderCount: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  orders: number;
  totalSpent: number;
  joined: string;
}

const initialCategories: Category[] = [
  { id: "c1", name: "Fruits & Vegetables", emoji: "🥦", description: "Fresh farm produce" },
  { id: "c2", name: "Dairy & Eggs", emoji: "🥛", description: "Milk, curd, cheese, eggs" },
  { id: "c3", name: "Bakery", emoji: "🍞", description: "Breads, buns and cakes" },
  { id: "c4", name: "Snacks & Beverages", emoji: "🥤", description: "Chips, biscuits, drinks" },
  { id: "c5", name: "Staples", emoji: "🌾", description: "Rice, flour, pulses, oil" },
  { id: "c6", name: "Personal Care", emoji: "🧼", description: "Soaps, shampoo, hygiene" },
];

const initialProducts: Product[] = [
  { id: "p1", name: "Fresh Tomatoes", emoji: "🍅", categoryId: "c1", unit: "1 kg", price: 32, mrp: 40, stock: 120, lowStockThreshold: 20, active: true },
  { id: "p2", name: "Bananas (Robusta)", emoji: "🍌", categoryId: "c1", unit: "1 dozen", price: 48, mrp: 55, stock: 14, lowStockThreshold: 15, active: true },
  { id: "p3", name: "Onions", emoji: "🧅", categoryId: "c1", unit: "1 kg", price: 28, mrp: 35, stock: 200, lowStockThreshold: 30, active: true },
  { id: "p4", name: "Full Cream Milk", emoji: "🥛", categoryId: "c2", unit: "500 ml", price: 33, mrp: 33, stock: 85, lowStockThreshold: 25, active: true },
  { id: "p5", name: "Farm Eggs", emoji: "🥚", categoryId: "c2", unit: "6 pcs", price: 42, mrp: 48, stock: 8, lowStockThreshold: 12, active: true },
  { id: "p6", name: "Paneer", emoji: "🧀", categoryId: "c2", unit: "200 g", price: 89, mrp: 99, stock: 30, lowStockThreshold: 10, active: true },
  { id: "p7", name: "Whole Wheat Bread", emoji: "🍞", categoryId: "c3", unit: "400 g", price: 45, mrp: 50, stock: 22, lowStockThreshold: 10, active: true },
  { id: "p8", name: "Potato Chips", emoji: "🍟", categoryId: "c4", unit: "90 g", price: 20, mrp: 20, stock: 150, lowStockThreshold: 30, active: true },
  { id: "p9", name: "Orange Juice", emoji: "🧃", categoryId: "c4", unit: "1 L", price: 110, mrp: 125, stock: 4, lowStockThreshold: 10, active: true },
  { id: "p10", name: "Basmati Rice", emoji: "🍚", categoryId: "c5", unit: "5 kg", price: 425, mrp: 499, stock: 45, lowStockThreshold: 10, active: true },
  { id: "p11", name: "Sunflower Oil", emoji: "🛢️", categoryId: "c5", unit: "1 L", price: 135, mrp: 155, stock: 60, lowStockThreshold: 15, active: true },
  { id: "p12", name: "Herbal Shampoo", emoji: "🧴", categoryId: "c6", unit: "180 ml", price: 145, mrp: 180, stock: 0, lowStockThreshold: 8, active: false },
];

const initialOffers: Offer[] = [
  { id: "o1", title: "Weekend Fresh Sale", code: "FRESH20", type: "percent", value: 20, minOrder: 499, validTill: "2026-07-20", active: true },
  { id: "o2", title: "First Order Discount", code: "WELCOME50", type: "flat", value: 50, minOrder: 299, validTill: "2026-12-31", active: true },
  { id: "o3", title: "Staples Super Saver", code: "STAPLE10", type: "percent", value: 10, minOrder: 999, validTill: "2026-07-31", active: true },
  { id: "o4", title: "Summer Coolers", code: "COOL15", type: "percent", value: 15, minOrder: 350, validTill: "2026-06-30", active: false },
];

const initialOrders: Order[] = [
  { id: "ORD-1042", customerName: "Priya Sharma", items: 8, total: 742, status: "pending", payment: "UPI", date: "2026-07-12", deliveryPartnerId: null, deliveryPartnerName: null, deliveryPartnerPhone: null, deliveryPartnerVehicle: null },
  { id: "ORD-1041", customerName: "Rahul Verma", items: 3, total: 215, status: "ready_for_pickup", payment: "COD", date: "2026-07-12", deliveryPartnerId: null, deliveryPartnerName: null, deliveryPartnerPhone: null, deliveryPartnerVehicle: null },
  { id: "ORD-1040", customerName: "Anita Desai", items: 12, total: 1380, status: "out_for_delivery", payment: "Card", date: "2026-07-12", deliveryPartnerId: 1, deliveryPartnerName: "Rohan Gupta", deliveryPartnerPhone: "+91 98765 10101", deliveryPartnerVehicle: "Bike · DL 8S AB 1080" },
  { id: "ORD-1039", customerName: "Vikram Singh", items: 5, total: 460, status: "delivered", payment: "UPI", date: "2026-07-11", deliveryPartnerId: null, deliveryPartnerName: null, deliveryPartnerPhone: null, deliveryPartnerVehicle: null },
  { id: "ORD-1038", customerName: "Meera Nair", items: 7, total: 890, status: "delivered", payment: "UPI", date: "2026-07-11", deliveryPartnerId: null, deliveryPartnerName: null, deliveryPartnerPhone: null, deliveryPartnerVehicle: null },
  { id: "ORD-1037", customerName: "Arjun Patel", items: 2, total: 96, status: "cancelled", payment: "COD", date: "2026-07-11", deliveryPartnerId: null, deliveryPartnerName: null, deliveryPartnerPhone: null, deliveryPartnerVehicle: null },
  { id: "ORD-1036", customerName: "Sunita Rao", items: 9, total: 1120, status: "delivered", payment: "Card", date: "2026-07-10", deliveryPartnerId: null, deliveryPartnerName: null, deliveryPartnerPhone: null, deliveryPartnerVehicle: null },
  { id: "ORD-1035", customerName: "Karan Mehta", items: 4, total: 385, status: "delivered", payment: "UPI", date: "2026-07-10", deliveryPartnerId: null, deliveryPartnerName: null, deliveryPartnerPhone: null, deliveryPartnerVehicle: null },
  { id: "ORD-1034", customerName: "Divya Iyer", items: 6, total: 640, status: "delivered", payment: "COD", date: "2026-07-09", deliveryPartnerId: null, deliveryPartnerName: null, deliveryPartnerPhone: null, deliveryPartnerVehicle: null },
  { id: "ORD-1033", customerName: "Priya Sharma", items: 10, total: 980, status: "delivered", payment: "UPI", date: "2026-07-09", deliveryPartnerId: null, deliveryPartnerName: null, deliveryPartnerPhone: null, deliveryPartnerVehicle: null },
];

const initialCustomers: Customer[] = [
  { id: "u1", name: "Priya Sharma", phone: "+91 98200 12345", email: "priya.s@gmail.com", orders: 24, totalSpent: 18450, joined: "2025-11-02" },
  { id: "u2", name: "Rahul Verma", phone: "+91 99870 55510", email: "rahul.v@gmail.com", orders: 11, totalSpent: 6320, joined: "2026-01-15" },
  { id: "u3", name: "Anita Desai", phone: "+91 98111 88221", email: "anita.d@yahoo.com", orders: 31, totalSpent: 27800, joined: "2025-08-20" },
  { id: "u4", name: "Vikram Singh", phone: "+91 90040 33445", email: "vikram.s@gmail.com", orders: 7, totalSpent: 3150, joined: "2026-03-08" },
  { id: "u5", name: "Meera Nair", phone: "+91 98450 77889", email: "meera.n@outlook.com", orders: 18, totalSpent: 14200, joined: "2025-12-12" },
  { id: "u6", name: "Arjun Patel", phone: "+91 99300 22110", email: "arjun.p@gmail.com", orders: 3, totalSpent: 890, joined: "2026-05-25" },
  { id: "u7", name: "Sunita Rao", phone: "+91 98670 44556", email: "sunita.r@gmail.com", orders: 15, totalSpent: 11670, joined: "2026-02-01" },
  { id: "u8", name: "Karan Mehta", phone: "+91 98220 66778", email: "karan.m@gmail.com", orders: 9, totalSpent: 5480, joined: "2026-04-17" },
];

export const weeklySales = [
  { day: "Mon", sales: 12400, orders: 38 },
  { day: "Tue", sales: 10800, orders: 32 },
  { day: "Wed", sales: 14650, orders: 45 },
  { day: "Thu", sales: 13200, orders: 41 },
  { day: "Fri", sales: 16900, orders: 52 },
  { day: "Sat", sales: 21400, orders: 68 },
  { day: "Sun", sales: 18750, orders: 59 },
];

export const monthlySales = [
  { month: "Feb", sales: 312000 },
  { month: "Mar", sales: 345000 },
  { month: "Apr", sales: 328000 },
  { month: "May", sales: 396000 },
  { month: "Jun", sales: 421000 },
  { month: "Jul", sales: 188000 },
];

export const categorySales = [
  { name: "Fruits & Veg", value: 32 },
  { name: "Dairy & Eggs", value: 24 },
  { name: "Staples", value: 18 },
  { name: "Snacks", value: 14 },
  { name: "Bakery", value: 7 },
  { name: "Personal Care", value: 5 },
];

interface StoreState {
  categories: Category[];
  products: Product[];
  offers: Offer[];
  orders: Order[];
  customers: Customer[];
  deliveryPartners: DeliveryPartner[];
  apiError: string | null;
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  addOffer: (o: Omit<Offer, "id">) => void;
  toggleOffer: (id: string) => void;
  deleteOffer: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  sendNotification: (userId: string, title: string, message: string, type?: string) => Promise<void>;
  broadcastOffer: (id: string) => Promise<void>;
  fetchDeliveryPartners: () => Promise<void>;
  addDeliveryPartner: (data: { name: string; phone: string; password: string; vehicleType: string; vehicleNumber: string }) => Promise<void>;
  removeDeliveryPartner: (id: number) => Promise<void>;
  assignDeliveryPartner: (orderId: string, partnerId: number) => Promise<void>;
  getPartnerLocation: (partnerId: number) => Promise<{ partner: any; location: any } | null>;
}

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);
  const api = async (path: string, init?: RequestInit, isRetry = false): Promise<any> => {
    const token = typeof window === "undefined" ? null : localStorage.getItem("admin_token");
    const baseUrl = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:5001"
      : "https://vrindawan-mart-redis.onrender.com";
    const response = await fetch(`${baseUrl}/api/v1${path}`, { ...init, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers } });
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment.");
    }
    if (response.status === 401 && !isRetry && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("admin_refresh_token");
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          const refreshBody = await refreshRes.json();
          if (refreshRes.ok && refreshBody.data?.accessToken) {
            localStorage.setItem("admin_token", refreshBody.data.accessToken);
            if (refreshBody.data.refreshToken) localStorage.setItem("admin_refresh_token", refreshBody.data.refreshToken);
            return api(path, init, true);
          }
        } catch { /* Refresh failed, proceed to logout */ }
      }
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_refresh_token");
      window.location.reload();
      throw new Error("Session expired. Please sign in again.");
    }
    const body = await response.json(); if (!response.ok) throw new Error(body.message ?? "Request failed"); return body.data;
  };
  const load = useCallback(async () => {
    try {
      const [categoryData, productData, offerData, orderData, customerData] = await Promise.all([api("/admin/categories"), api("/admin/products"), api("/admin/offers"), api("/admin/orders?limit=100"), api("/admin/customers")]);
      setCategories(categoryData.categories.map((c: any) => ({ id: String(c.id), name: c.name, emoji: c.icon ?? "🏷️", description: c.slug })));
      setProducts(productData.products.map((p: any) => ({ id: String(p.id), name: p.name, emoji: "📦", categoryId: String(p.category_id), unit: p.unit, price: p.price, mrp: p.mrp, stock: p.stock, lowStockThreshold: p.low_stock_threshold ?? 10, active: Boolean(p.is_active) })));
      setOffers(offerData.offers.map((o: any) => ({ id: String(o.id), title: o.name, code: o.code ?? "", type: o.type === "FLAT" ? "flat" : "percent", value: o.value, minOrder: o.minCartValue ?? 0, validTill: o.endDate, active: o.isActive })));
      setOrders(orderData.orders.map((o: any) => ({ id: String(o.id), customerName: o.user?.name ?? o.user?.phone ?? "Customer", items: o.items?.length ?? 0, total: o.total, status: o.status.toLowerCase(), payment: o.paymentMethod, date: o.placedAt ? o.placedAt.split('T')[0] : "", deliveryPartnerId: o.deliveryPartner?.id ?? null, deliveryPartnerName: o.deliveryPartner?.name ?? null, deliveryPartnerPhone: o.deliveryPartner?.phone ?? null, deliveryPartnerVehicle: o.deliveryPartner ? `${o.deliveryPartner.vehicleType} · ${o.deliveryPartner.vehicleNumber}` : null })));
      try {
        const partnerData = await api("/admin/delivery-partners");
        setDeliveryPartners(partnerData.map((p: any) => ({ id: p.id, userId: p.userId, name: p.name, phone: p.phone, vehicleType: p.vehicleType, vehicleNumber: p.vehicleNumber, profileImage: p.profileImage, rating: p.rating, isOnline: p.isOnline, isAvailable: p.isAvailable, currentLatitude: p.currentLatitude, currentLongitude: p.currentLongitude, orderCount: p._count?.orders ?? 0 })));
      } catch { /* delivery partner list fetch failed, non-critical */ }
      setCustomers(customerData.customers.map((c: any) => ({ id: String(c.id), name: c.name ?? "Customer", phone: c.phone, email: c.email ?? "", orders: c.orders, totalSpent: c.totalSpent, joined: c.createdAt })));
      setApiError(null);
      hasLoadedOnce.current = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to reach backend";
      console.error("[StoreProvider] API load failed:", message);
      setApiError(message);
      if (!hasLoadedOnce.current) {
        setCategories(initialCategories);
        setProducts(initialProducts);
        setOffers(initialOffers);
        setOrders(initialOrders);
        setCustomers(initialCustomers);
      }
    }
  }, []);
  useEffect(() => {
    if (typeof window === "undefined" || !localStorage.getItem("admin_token")) return;
    load();
    let timer: number | undefined;
    const debouncedLoad = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(load, 2000);
    };
    const connect = () => {
      const io = (window as Window & { io?: (url: string, options: unknown) => { onAny: (listener: () => void) => void; disconnect: () => void } }).io;
      const socketUrl = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://localhost:5001"
        : "https://vrindawan-mart-redis.onrender.com";
      return io?.(socketUrl, { auth: { token: localStorage.getItem("admin_token") } });
    };
    let socket = connect();
    let script: HTMLScriptElement | undefined;
    if (!socket) {
      script = document.createElement("script"); script.src = "https://cdn.socket.io/4.8.1/socket.io.min.js"; script.onload = () => { socket = connect(); socket?.onAny(debouncedLoad); }; document.head.appendChild(script);
    } else socket.onAny(debouncedLoad);
    const refresh = window.setInterval(load, 120000);
    return () => { window.clearInterval(refresh); if (timer) window.clearTimeout(timer); socket?.disconnect(); script?.remove(); };
  }, [load]);

  const value: StoreState = {
    categories,
    products,
    offers,
    orders,
    customers,
    deliveryPartners,
    apiError,
    addProduct: (p) => { void api("/admin/products", { method: "POST", body: JSON.stringify({ category_id: Number(p.categoryId), name: p.name, slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), unit: p.unit, price: p.price, mrp: p.mrp, stock: p.stock }) }).then(load); },
    updateProduct: (p) => { void api(`/admin/products/${p.id}`, { method: "PUT", body: JSON.stringify({ name: p.name, unit: p.unit, price: p.price, mrp: p.mrp, stock: p.stock, is_active: p.active }) }).then(load); },
    deleteProduct: (id) => { void api(`/admin/products/${id}`, { method: "DELETE" }).then(load); },
    addCategory: (c) => { void api("/admin/categories", { method: "POST", body: JSON.stringify({ name: c.name, slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") }) }).then(load); },
    updateCategory: (c) => { void api(`/admin/categories/${c.id}`, { method: "PUT", body: JSON.stringify({ name: c.name }) }).then(load); },
    deleteCategory: (id) => { void api(`/admin/categories/${id}`, { method: "DELETE" }).then(load); },
    adjustStock: (id, delta) => { const product = products.find((p) => p.id === id); if (product) void api(`/admin/products/${id}/adjust-stock`, { method: "POST", body: JSON.stringify({ quantity: Math.max(0, product.stock + delta), reason: "Admin dashboard adjustment" }) }).then(load); },
    addOffer: (o) => { void api("/admin/offers", { method: "POST", body: JSON.stringify({ name: o.title, code: o.code, type: o.type === "flat" ? "FLAT" : "PERCENTAGE", value: o.value, min_cart_value: o.minOrder, start_date: new Date().toISOString(), end_date: new Date(o.validTill).toISOString(), is_active: o.active }) }).then(load); },
    toggleOffer: (id) => { const offer = offers.find((o) => o.id === id); if (offer) void api(`/admin/offers/${id}`, { method: "PUT", body: JSON.stringify({ is_active: !offer.active }) }).then(load); },
    deleteOffer: (id) => { void api(`/admin/offers/${id}`, { method: "DELETE" }).then(load); },
    updateOrderStatus: (id, status) => { void api(`/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: status.toUpperCase() }) }).then(load); },
    sendNotification: async (userId, title, message, type = 'promo') => {
      await api("/admin/notifications", {
        method: "POST",
        body: JSON.stringify({ userId: Number(userId), title, message, type })
      });
    },
    broadcastOffer: async (id) => {
      await api(`/admin/offers/${id}/broadcast`, { method: "POST" });
    },
    fetchDeliveryPartners: async () => {
      const partnerData = await api("/admin/delivery-partners");
      setDeliveryPartners(partnerData.map((p: any) => ({ id: p.id, userId: p.userId, name: p.name, phone: p.phone, vehicleType: p.vehicleType, vehicleNumber: p.vehicleNumber, profileImage: p.profileImage, rating: p.rating, isOnline: p.isOnline, isAvailable: p.isAvailable, currentLatitude: p.currentLatitude, currentLongitude: p.currentLongitude, orderCount: p._count?.orders ?? 0 })));
    },
    addDeliveryPartner: async (data) => {
      await api("/admin/delivery-partners", { method: "POST", body: JSON.stringify(data) });
      await load();
    },
    removeDeliveryPartner: async (id) => {
      await api(`/admin/delivery-partners/${id}`, { method: "DELETE" });
      await load();
    },
    assignDeliveryPartner: async (orderId, partnerId) => {
      await api(`/admin/orders/${orderId}/assign`, { method: "POST", body: JSON.stringify({ partnerId }) });
      await load();
    },
    getPartnerLocation: async (partnerId) => {
      try {
        return await api(`/admin/delivery-partners/${partnerId}/location`);
      } catch { return null; }
    },
  };

  return (
    <StoreContext.Provider value={value}>
      {apiError && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", position: "sticky", top: 0, zIndex: 50 }}>
          <span style={{ fontWeight: 600 }}>⚠️ Backend unreachable</span>
          <span>— {apiError}. Showing offline data. Check Render dashboard.</span>
          <button onClick={() => { setApiError(null); load(); }} style={{ marginLeft: "auto", background: "#991b1b", color: "white", border: "none", borderRadius: "6px", padding: "4px 12px", cursor: "pointer", fontSize: "13px" }}>Retry</button>
        </div>
      )}
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
