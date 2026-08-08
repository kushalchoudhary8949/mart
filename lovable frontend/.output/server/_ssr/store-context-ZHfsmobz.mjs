import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-context-ZHfsmobz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var initialCategories = [
	{
		id: "c1",
		name: "Fruits & Vegetables",
		emoji: "🥦",
		description: "Fresh farm produce"
	},
	{
		id: "c2",
		name: "Dairy & Eggs",
		emoji: "🥛",
		description: "Milk, curd, cheese, eggs"
	},
	{
		id: "c3",
		name: "Bakery",
		emoji: "🍞",
		description: "Breads, buns and cakes"
	},
	{
		id: "c4",
		name: "Snacks & Beverages",
		emoji: "🥤",
		description: "Chips, biscuits, drinks"
	},
	{
		id: "c5",
		name: "Staples",
		emoji: "🌾",
		description: "Rice, flour, pulses, oil"
	},
	{
		id: "c6",
		name: "Personal Care",
		emoji: "🧼",
		description: "Soaps, shampoo, hygiene"
	}
];
var initialProducts = [
	{
		id: "p1",
		name: "Fresh Tomatoes",
		emoji: "🍅",
		categoryId: "c1",
		unit: "1 kg",
		price: 32,
		mrp: 40,
		stock: 120,
		lowStockThreshold: 20,
		active: true
	},
	{
		id: "p2",
		name: "Bananas (Robusta)",
		emoji: "🍌",
		categoryId: "c1",
		unit: "1 dozen",
		price: 48,
		mrp: 55,
		stock: 14,
		lowStockThreshold: 15,
		active: true
	},
	{
		id: "p3",
		name: "Onions",
		emoji: "🧅",
		categoryId: "c1",
		unit: "1 kg",
		price: 28,
		mrp: 35,
		stock: 200,
		lowStockThreshold: 30,
		active: true
	},
	{
		id: "p4",
		name: "Full Cream Milk",
		emoji: "🥛",
		categoryId: "c2",
		unit: "500 ml",
		price: 33,
		mrp: 33,
		stock: 85,
		lowStockThreshold: 25,
		active: true
	},
	{
		id: "p5",
		name: "Farm Eggs",
		emoji: "🥚",
		categoryId: "c2",
		unit: "6 pcs",
		price: 42,
		mrp: 48,
		stock: 8,
		lowStockThreshold: 12,
		active: true
	},
	{
		id: "p6",
		name: "Paneer",
		emoji: "🧀",
		categoryId: "c2",
		unit: "200 g",
		price: 89,
		mrp: 99,
		stock: 30,
		lowStockThreshold: 10,
		active: true
	},
	{
		id: "p7",
		name: "Whole Wheat Bread",
		emoji: "🍞",
		categoryId: "c3",
		unit: "400 g",
		price: 45,
		mrp: 50,
		stock: 22,
		lowStockThreshold: 10,
		active: true
	},
	{
		id: "p8",
		name: "Potato Chips",
		emoji: "🍟",
		categoryId: "c4",
		unit: "90 g",
		price: 20,
		mrp: 20,
		stock: 150,
		lowStockThreshold: 30,
		active: true
	},
	{
		id: "p9",
		name: "Orange Juice",
		emoji: "🧃",
		categoryId: "c4",
		unit: "1 L",
		price: 110,
		mrp: 125,
		stock: 4,
		lowStockThreshold: 10,
		active: true
	},
	{
		id: "p10",
		name: "Basmati Rice",
		emoji: "🍚",
		categoryId: "c5",
		unit: "5 kg",
		price: 425,
		mrp: 499,
		stock: 45,
		lowStockThreshold: 10,
		active: true
	},
	{
		id: "p11",
		name: "Sunflower Oil",
		emoji: "🛢️",
		categoryId: "c5",
		unit: "1 L",
		price: 135,
		mrp: 155,
		stock: 60,
		lowStockThreshold: 15,
		active: true
	},
	{
		id: "p12",
		name: "Herbal Shampoo",
		emoji: "🧴",
		categoryId: "c6",
		unit: "180 ml",
		price: 145,
		mrp: 180,
		stock: 0,
		lowStockThreshold: 8,
		active: false
	}
];
var initialOffers = [
	{
		id: "o1",
		title: "Weekend Fresh Sale",
		code: "FRESH20",
		type: "percent",
		value: 20,
		minOrder: 499,
		validTill: "2026-07-20",
		active: true
	},
	{
		id: "o2",
		title: "First Order Discount",
		code: "WELCOME50",
		type: "flat",
		value: 50,
		minOrder: 299,
		validTill: "2026-12-31",
		active: true
	},
	{
		id: "o3",
		title: "Staples Super Saver",
		code: "STAPLE10",
		type: "percent",
		value: 10,
		minOrder: 999,
		validTill: "2026-07-31",
		active: true
	},
	{
		id: "o4",
		title: "Summer Coolers",
		code: "COOL15",
		type: "percent",
		value: 15,
		minOrder: 350,
		validTill: "2026-06-30",
		active: false
	}
];
var initialOrders = [
	{
		id: "ORD-1042",
		customerName: "Priya Sharma",
		items: 8,
		total: 742,
		status: "pending",
		payment: "UPI",
		date: "2026-07-12"
	},
	{
		id: "ORD-1041",
		customerName: "Rahul Verma",
		items: 3,
		total: 215,
		status: "ready_for_pickup",
		payment: "COD",
		date: "2026-07-12"
	},
	{
		id: "ORD-1040",
		customerName: "Anita Desai",
		items: 12,
		total: 1380,
		status: "out_for_delivery",
		payment: "Card",
		date: "2026-07-12"
	},
	{
		id: "ORD-1039",
		customerName: "Vikram Singh",
		items: 5,
		total: 460,
		status: "delivered",
		payment: "UPI",
		date: "2026-07-11"
	},
	{
		id: "ORD-1038",
		customerName: "Meera Nair",
		items: 7,
		total: 890,
		status: "delivered",
		payment: "UPI",
		date: "2026-07-11"
	},
	{
		id: "ORD-1037",
		customerName: "Arjun Patel",
		items: 2,
		total: 96,
		status: "cancelled",
		payment: "COD",
		date: "2026-07-11"
	},
	{
		id: "ORD-1036",
		customerName: "Sunita Rao",
		items: 9,
		total: 1120,
		status: "delivered",
		payment: "Card",
		date: "2026-07-10"
	},
	{
		id: "ORD-1035",
		customerName: "Karan Mehta",
		items: 4,
		total: 385,
		status: "delivered",
		payment: "UPI",
		date: "2026-07-10"
	},
	{
		id: "ORD-1034",
		customerName: "Divya Iyer",
		items: 6,
		total: 640,
		status: "delivered",
		payment: "COD",
		date: "2026-07-09"
	},
	{
		id: "ORD-1033",
		customerName: "Priya Sharma",
		items: 10,
		total: 980,
		status: "delivered",
		payment: "UPI",
		date: "2026-07-09"
	}
];
var initialCustomers = [
	{
		id: "u1",
		name: "Priya Sharma",
		phone: "+91 98200 12345",
		email: "priya.s@gmail.com",
		orders: 24,
		totalSpent: 18450,
		joined: "2025-11-02"
	},
	{
		id: "u2",
		name: "Rahul Verma",
		phone: "+91 99870 55510",
		email: "rahul.v@gmail.com",
		orders: 11,
		totalSpent: 6320,
		joined: "2026-01-15"
	},
	{
		id: "u3",
		name: "Anita Desai",
		phone: "+91 98111 88221",
		email: "anita.d@yahoo.com",
		orders: 31,
		totalSpent: 27800,
		joined: "2025-08-20"
	},
	{
		id: "u4",
		name: "Vikram Singh",
		phone: "+91 90040 33445",
		email: "vikram.s@gmail.com",
		orders: 7,
		totalSpent: 3150,
		joined: "2026-03-08"
	},
	{
		id: "u5",
		name: "Meera Nair",
		phone: "+91 98450 77889",
		email: "meera.n@outlook.com",
		orders: 18,
		totalSpent: 14200,
		joined: "2025-12-12"
	},
	{
		id: "u6",
		name: "Arjun Patel",
		phone: "+91 99300 22110",
		email: "arjun.p@gmail.com",
		orders: 3,
		totalSpent: 890,
		joined: "2026-05-25"
	},
	{
		id: "u7",
		name: "Sunita Rao",
		phone: "+91 98670 44556",
		email: "sunita.r@gmail.com",
		orders: 15,
		totalSpent: 11670,
		joined: "2026-02-01"
	},
	{
		id: "u8",
		name: "Karan Mehta",
		phone: "+91 98220 66778",
		email: "karan.m@gmail.com",
		orders: 9,
		totalSpent: 5480,
		joined: "2026-04-17"
	}
];
var weeklySales = [
	{
		day: "Mon",
		sales: 12400,
		orders: 38
	},
	{
		day: "Tue",
		sales: 10800,
		orders: 32
	},
	{
		day: "Wed",
		sales: 14650,
		orders: 45
	},
	{
		day: "Thu",
		sales: 13200,
		orders: 41
	},
	{
		day: "Fri",
		sales: 16900,
		orders: 52
	},
	{
		day: "Sat",
		sales: 21400,
		orders: 68
	},
	{
		day: "Sun",
		sales: 18750,
		orders: 59
	}
];
var monthlySales = [
	{
		month: "Feb",
		sales: 312e3
	},
	{
		month: "Mar",
		sales: 345e3
	},
	{
		month: "Apr",
		sales: 328e3
	},
	{
		month: "May",
		sales: 396e3
	},
	{
		month: "Jun",
		sales: 421e3
	},
	{
		month: "Jul",
		sales: 188e3
	}
];
var categorySales = [
	{
		name: "Fruits & Veg",
		value: 32
	},
	{
		name: "Dairy & Eggs",
		value: 24
	},
	{
		name: "Staples",
		value: 18
	},
	{
		name: "Snacks",
		value: 14
	},
	{
		name: "Bakery",
		value: 7
	},
	{
		name: "Personal Care",
		value: 5
	}
];
var StoreContext = (0, import_react.createContext)(null);
function StoreProvider({ children }) {
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [products, setProducts] = (0, import_react.useState)([]);
	const [offers, setOffers] = (0, import_react.useState)([]);
	const [orders, setOrders] = (0, import_react.useState)([]);
	const [customers, setCustomers] = (0, import_react.useState)([]);
	const [apiError, setApiError] = (0, import_react.useState)(null);
	const hasLoadedOnce = (0, import_react.useRef)(false);
	const api = async (path, init, isRetry = false) => {
		const token = typeof window === "undefined" ? null : localStorage.getItem("admin_token");
		const baseUrl = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:5001" : "https://vrindawan-mart-redis.onrender.com";
		const response = await fetch(`${baseUrl}/api/v1${path}`, {
			...init,
			headers: {
				"Content-Type": "application/json",
				...token ? { Authorization: `Bearer ${token}` } : {},
				...init?.headers
			}
		});
		if (response.status === 401 && !isRetry && typeof window !== "undefined") {
			const refreshToken = localStorage.getItem("admin_refresh_token");
			if (refreshToken) try {
				const refreshRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ refreshToken })
				});
				const refreshBody = await refreshRes.json();
				if (refreshRes.ok && refreshBody.data?.accessToken) {
					localStorage.setItem("admin_token", refreshBody.data.accessToken);
					if (refreshBody.data.refreshToken) localStorage.setItem("admin_refresh_token", refreshBody.data.refreshToken);
					return api(path, init, true);
				}
			} catch {}
			localStorage.removeItem("admin_token");
			localStorage.removeItem("admin_refresh_token");
			window.location.reload();
			throw new Error("Session expired. Please sign in again.");
		}
		const body = await response.json();
		if (!response.ok) throw new Error(body.message ?? "Request failed");
		return body.data;
	};
	const load = (0, import_react.useCallback)(async () => {
		try {
			const [categoryData, productData, offerData, orderData, customerData] = await Promise.all([
				api("/admin/categories"),
				api("/admin/products"),
				api("/admin/offers"),
				api("/admin/orders?limit=100"),
				api("/admin/customers")
			]);
			setCategories(categoryData.categories.map((c) => ({
				id: String(c.id),
				name: c.name,
				emoji: c.icon ?? "🏷️",
				description: c.slug
			})));
			setProducts(productData.products.map((p) => ({
				id: String(p.id),
				name: p.name,
				emoji: "📦",
				categoryId: String(p.category_id),
				unit: p.unit,
				price: p.price,
				mrp: p.mrp,
				stock: p.stock,
				lowStockThreshold: p.low_stock_threshold ?? 10,
				active: Boolean(p.is_active)
			})));
			setOffers(offerData.offers.map((o) => ({
				id: String(o.id),
				title: o.name,
				code: o.code ?? "",
				type: o.type === "FLAT" ? "flat" : "percent",
				value: o.value,
				minOrder: o.minCartValue ?? 0,
				validTill: o.endDate,
				active: o.isActive
			})));
			setOrders(orderData.orders.map((o) => ({
				id: String(o.id),
				customerName: o.user?.name ?? o.user?.phone ?? "Customer",
				items: o.items?.length ?? 0,
				total: o.total,
				status: o.status.toLowerCase(),
				payment: o.paymentMethod,
				date: o.placedAt ? o.placedAt.split("T")[0] : ""
			})));
			setCustomers(customerData.customers.map((c) => ({
				id: String(c.id),
				name: c.name ?? "Customer",
				phone: c.phone,
				email: c.email ?? "",
				orders: c.orders,
				totalSpent: c.totalSpent,
				joined: c.createdAt
			})));
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
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined" || !localStorage.getItem("admin_token")) return;
		load();
		const connect = () => {
			const io = window.io;
			const socketUrl = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:5001" : "https://vrindawan-mart-redis.onrender.com";
			return io?.(socketUrl, { auth: { token: localStorage.getItem("admin_token") } });
		};
		let socket = connect();
		let script;
		if (!socket) {
			script = document.createElement("script");
			script.src = "https://cdn.socket.io/4.8.1/socket.io.min.js";
			script.onload = () => {
				socket = connect();
				socket?.onAny(load);
			};
			document.head.appendChild(script);
		} else socket.onAny(load);
		const refresh = window.setInterval(load, 15e3);
		return () => {
			window.clearInterval(refresh);
			socket?.disconnect();
			script?.remove();
		};
	}, [load]);
	const value = {
		categories,
		products,
		offers,
		orders,
		customers,
		apiError,
		addProduct: (p) => {
			api("/admin/products", {
				method: "POST",
				body: JSON.stringify({
					category_id: Number(p.categoryId),
					name: p.name,
					slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
					unit: p.unit,
					price: p.price,
					mrp: p.mrp,
					stock: p.stock
				})
			}).then(load);
		},
		updateProduct: (p) => {
			api(`/admin/products/${p.id}`, {
				method: "PUT",
				body: JSON.stringify({
					name: p.name,
					unit: p.unit,
					price: p.price,
					mrp: p.mrp,
					stock: p.stock,
					is_active: p.active
				})
			}).then(load);
		},
		deleteProduct: (id) => {
			api(`/admin/products/${id}`, { method: "DELETE" }).then(load);
		},
		addCategory: (c) => {
			api("/admin/categories", {
				method: "POST",
				body: JSON.stringify({
					name: c.name,
					slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
				})
			}).then(load);
		},
		updateCategory: (c) => {
			api(`/admin/categories/${c.id}`, {
				method: "PUT",
				body: JSON.stringify({ name: c.name })
			}).then(load);
		},
		deleteCategory: (id) => {
			api(`/admin/categories/${id}`, { method: "DELETE" }).then(load);
		},
		adjustStock: (id, delta) => {
			const product = products.find((p) => p.id === id);
			if (product) api(`/admin/products/${id}/adjust-stock`, {
				method: "POST",
				body: JSON.stringify({
					quantity: Math.max(0, product.stock + delta),
					reason: "Admin dashboard adjustment"
				})
			}).then(load);
		},
		addOffer: (o) => {
			api("/admin/offers", {
				method: "POST",
				body: JSON.stringify({
					name: o.title,
					code: o.code,
					type: o.type === "flat" ? "FLAT" : "PERCENTAGE",
					value: o.value,
					min_cart_value: o.minOrder,
					start_date: (/* @__PURE__ */ new Date()).toISOString(),
					end_date: new Date(o.validTill).toISOString(),
					is_active: o.active
				})
			}).then(load);
		},
		toggleOffer: (id) => {
			const offer = offers.find((o) => o.id === id);
			if (offer) api(`/admin/offers/${id}`, {
				method: "PUT",
				body: JSON.stringify({ is_active: !offer.active })
			}).then(load);
		},
		deleteOffer: (id) => {
			api(`/admin/offers/${id}`, { method: "DELETE" }).then(load);
		},
		updateOrderStatus: (id, status) => {
			api(`/admin/orders/${id}/status`, {
				method: "PATCH",
				body: JSON.stringify({ status: status.toUpperCase() })
			}).then(load);
		},
		sendNotification: async (userId, title, message, type = "promo") => {
			await api("/admin/notifications", {
				method: "POST",
				body: JSON.stringify({
					userId: Number(userId),
					title,
					message,
					type
				})
			});
		},
		broadcastOffer: async (id) => {
			await api(`/admin/offers/${id}/broadcast`, { method: "POST" });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StoreContext.Provider, {
		value,
		children: [apiError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				background: "#fef2f2",
				border: "1px solid #fca5a5",
				color: "#991b1b",
				padding: "12px 16px",
				fontSize: "14px",
				display: "flex",
				alignItems: "center",
				gap: "8px",
				position: "sticky",
				top: 0,
				zIndex: 50
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: { fontWeight: 600 },
					children: "⚠️ Backend unreachable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"— ",
					apiError,
					". Showing offline data. Check Render dashboard."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						setApiError(null);
						load();
					},
					style: {
						marginLeft: "auto",
						background: "#991b1b",
						color: "white",
						border: "none",
						borderRadius: "6px",
						padding: "4px 12px",
						cursor: "pointer",
						fontSize: "13px"
					},
					children: "Retry"
				})
			]
		}), children]
	});
}
function useStore() {
	const ctx = (0, import_react.useContext)(StoreContext);
	if (!ctx) throw new Error("useStore must be used within StoreProvider");
	return ctx;
}
var formatINR = (n) => `₹${n.toLocaleString("en-IN")}`;
//#endregion
export { useStore as a, monthlySales as i, categorySales as n, weeklySales as o, formatINR as r, StoreProvider as t };
