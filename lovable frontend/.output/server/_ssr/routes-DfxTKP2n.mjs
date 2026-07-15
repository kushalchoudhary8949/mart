import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as useStore, r as formatINR } from "./store-context-91WXZWxM.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { S as IndianRupee, _ as PackageX, c as ShoppingCart, n as Users } from "../_libs/lucide-react.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BXjpJ96D.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as StatCard } from "./StatCard-CwGDFElW.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DfxTKP2n.js
var import_jsx_runtime = require_jsx_runtime();
var statusLabel = {
	pending: "Pending",
	accepted: "Accepted",
	packing: "Packing",
	ready_for_pickup: "Ready for pickup",
	out_for_delivery: "Out for delivery",
	delivered: "Delivered",
	cancelled: "Cancelled"
};
var statusVariant = {
	pending: "bg-warning/20 text-warning-foreground",
	accepted: "bg-blue-100 text-blue-700",
	packing: "bg-accent text-accent-foreground",
	ready_for_pickup: "bg-violet-100 text-violet-700",
	out_for_delivery: "bg-chart-3/20 text-foreground",
	delivered: "bg-success/15 text-success",
	cancelled: "bg-destructive/10 text-destructive"
};
function Dashboard() {
	const { orders, products, customers } = useStore();
	const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const todayOrders = orders.filter((o) => o.date === todayStr);
	const todayRevenue = todayOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
	const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold);
	const pendingCount = orders.filter((o) => [
		"pending",
		"accepted",
		"packing",
		"ready_for_pickup"
	].includes(o.status)).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold",
				children: "Good morning 👋"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Here's what's happening at your store today."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Today's revenue",
						value: formatINR(todayRevenue),
						sub: `${todayOrders.length} orders today`,
						icon: IndianRupee,
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Orders to fulfil",
						value: String(pendingCount),
						sub: "Pending + packed",
						icon: ShoppingCart
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Low stock items",
						value: String(lowStock.length),
						sub: "Need restocking",
						icon: PackageX,
						tone: lowStock.length ? "warning" : "default"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Customers",
						value: String(customers.length),
						sub: "Registered shoppers",
						icon: Users
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Recent orders"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/orders",
								children: "View all"
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Order" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Customer" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Total"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: orders.slice(0, 6).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: o.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: o.customerName }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: formatINR(o.total)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: statusVariant[o.status],
							children: statusLabel[o.status]
						}) })
					] }, o.id)) })] }) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Low stock alerts"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/inventory",
							children: "Restock"
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3",
					children: [lowStock.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "All items are well stocked 🎉"
					}), lowStock.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-lg border px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-lg",
								children: p.emoji
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium leading-tight",
								children: p.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: p.unit
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: p.stock === 0 ? "bg-destructive/10 text-destructive" : "bg-warning/20 text-warning-foreground",
							children: p.stock === 0 ? "Out of stock" : `${p.stock} left`
						})]
					}, p.id))]
				})] })]
			})
		]
	});
}
//#endregion
export { Dashboard as component };
