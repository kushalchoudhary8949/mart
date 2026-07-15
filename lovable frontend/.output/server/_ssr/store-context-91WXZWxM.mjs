import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-context-91WXZWxM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
	const api = async (path, init) => {
		const token = typeof window === "undefined" ? null : localStorage.getItem("admin_token");
		const response = await fetch(`http://localhost:5001/api/v1${path}`, {
			...init,
			headers: {
				"Content-Type": "application/json",
				...token ? { Authorization: `Bearer ${token}` } : {},
				...init?.headers
			}
		});
		const body = await response.json();
		if (!response.ok) throw new Error(body.message ?? "Request failed");
		return body.data;
	};
	const load = async () => {
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
		} catch {}
	};
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined" || !localStorage.getItem("admin_token")) return;
		load();
		const connect = () => {
			const io = window.io;
			return io?.("http://localhost:5001", { auth: { token: localStorage.getItem("admin_token") } });
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
	}, []);
	const value = {
		categories,
		products,
		offers,
		orders,
		customers,
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
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreContext.Provider, {
		value,
		children
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
