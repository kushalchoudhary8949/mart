import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as useStore, r as formatINR } from "./store-context-C7Cjby2t.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { u as Search } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-BXjpJ96D.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { n as TabsList, r as TabsTrigger, t as Tabs } from "./tabs-Cc1SNP8P.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-Dn--xgmc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
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
var statusClass = {
	pending: "bg-warning/20 text-warning-foreground",
	accepted: "bg-blue-100 text-blue-700",
	packing: "bg-accent text-accent-foreground",
	ready_for_pickup: "bg-violet-100 text-violet-700",
	out_for_delivery: "bg-chart-3/20 text-foreground",
	delivered: "bg-success/15 text-success",
	cancelled: "bg-destructive/10 text-destructive"
};
function OrdersPage() {
	const { orders, updateOrderStatus } = useStore();
	const [tab, setTab] = (0, import_react.useState)("all");
	const [search, setSearch] = (0, import_react.useState)("");
	const filtered = orders.filter((o) => {
		const matchesTab = tab === "all" || o.status === tab;
		const q = search.toLowerCase();
		return matchesTab && (o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
	});
	const count = (s) => orders.filter((o) => o.status === s).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold",
				children: "Orders"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [orders.length, " orders in the last 4 days"]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
					value: tab,
					onValueChange: setTab,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "flex-wrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "all",
								children: "All"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "pending",
								children: [
									"Pending (",
									count("pending"),
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "accepted",
								children: [
									"Accepted (",
									count("accepted"),
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "packing",
								children: [
									"Packing (",
									count("packing"),
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "ready_for_pickup",
								children: [
									"Ready (",
									count("ready_for_pickup"),
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "out_for_delivery",
								children: [
									"On the way (",
									count("out_for_delivery"),
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "delivered",
								children: [
									"Delivered (",
									count("delivered"),
									")"
								]
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 min-w-52",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "pl-9",
						placeholder: "Search order ID or customer…",
						value: search,
						onChange: (e) => setSearch(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Order ID" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Customer" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Items"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Total"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Payment" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Delivery partner" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "w-44",
						children: "Update"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [filtered.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: o.id
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: o.customerName }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm text-muted-foreground",
						children: o.date
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: o.items
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right font-medium",
						children: formatINR(o.total)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: o.payment
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm text-muted-foreground",
						children: o.status === "out_for_delivery" ? "Assigned partner" : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: statusClass[o.status],
						children: statusLabel[o.status]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: o.status,
						onValueChange: (v) => {
							updateOrderStatus(o.id, v);
							toast.success(`${o.id} → ${statusLabel[v]}`);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.keys(statusLabel).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: s,
							children: statusLabel[s]
						}, s)) })]
					}) })
				] }, o.id)), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 9,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "No orders found."
				}) })] })] })
			}) })
		]
	});
}
//#endregion
export { OrdersPage as component };
