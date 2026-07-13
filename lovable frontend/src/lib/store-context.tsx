import { createContext, useContext, useState, type ReactNode } from "react";

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

export type OrderStatus = "pending" | "packed" | "out_for_delivery" | "delivered" | "cancelled";

export interface Order {
  id: string;
  customerName: string;
  items: number;
  total: number;
  status: OrderStatus;
  payment: "COD" | "UPI" | "Card";
  date: string;
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
  { id: "ORD-1042", customerName: "Priya Sharma", items: 8, total: 742, status: "pending", payment: "UPI", date: "2026-07-12" },
  { id: "ORD-1041", customerName: "Rahul Verma", items: 3, total: 215, status: "packed", payment: "COD", date: "2026-07-12" },
  { id: "ORD-1040", customerName: "Anita Desai", items: 12, total: 1380, status: "out_for_delivery", payment: "Card", date: "2026-07-12" },
  { id: "ORD-1039", customerName: "Vikram Singh", items: 5, total: 460, status: "delivered", payment: "UPI", date: "2026-07-11" },
  { id: "ORD-1038", customerName: "Meera Nair", items: 7, total: 890, status: "delivered", payment: "UPI", date: "2026-07-11" },
  { id: "ORD-1037", customerName: "Arjun Patel", items: 2, total: 96, status: "cancelled", payment: "COD", date: "2026-07-11" },
  { id: "ORD-1036", customerName: "Sunita Rao", items: 9, total: 1120, status: "delivered", payment: "Card", date: "2026-07-10" },
  { id: "ORD-1035", customerName: "Karan Mehta", items: 4, total: 385, status: "delivered", payment: "UPI", date: "2026-07-10" },
  { id: "ORD-1034", customerName: "Divya Iyer", items: 6, total: 640, status: "delivered", payment: "COD", date: "2026-07-09" },
  { id: "ORD-1033", customerName: "Priya Sharma", items: 10, total: 980, status: "delivered", payment: "UPI", date: "2026-07-09" },
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
}

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [offers, setOffers] = useState(initialOffers);
  const [orders, setOrders] = useState(initialOrders);
  const [customers] = useState(initialCustomers);

  const value: StoreState = {
    categories,
    products,
    offers,
    orders,
    customers,
    addProduct: (p) => setProducts((prev) => [{ ...p, id: `p${Date.now()}` }, ...prev]),
    updateProduct: (p) => setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x))),
    deleteProduct: (id) => setProducts((prev) => prev.filter((x) => x.id !== id)),
    addCategory: (c) => setCategories((prev) => [...prev, { ...c, id: `c${Date.now()}` }]),
    updateCategory: (c) => setCategories((prev) => prev.map((x) => (x.id === c.id ? c : x))),
    deleteCategory: (id) => setCategories((prev) => prev.filter((x) => x.id !== id)),
    adjustStock: (id, delta) =>
      setProducts((prev) =>
        prev.map((x) => (x.id === id ? { ...x, stock: Math.max(0, x.stock + delta) } : x)),
      ),
    addOffer: (o) => setOffers((prev) => [{ ...o, id: `o${Date.now()}` }, ...prev]),
    toggleOffer: (id) =>
      setOffers((prev) => prev.map((x) => (x.id === id ? { ...x, active: !x.active } : x))),
    deleteOffer: (id) => setOffers((prev) => prev.filter((x) => x.id !== id)),
    updateOrderStatus: (id, status) =>
      setOrders((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x))),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
