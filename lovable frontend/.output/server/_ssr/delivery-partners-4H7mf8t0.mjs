import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { a as ToggleLeft, k as Bike, s as Star, y as MapPin } from "../_libs/lucide-react.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BXjpJ96D.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/delivery-partners-4H7mf8t0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var initial = [{
	id: "dp1",
	name: "Rohan Gupta",
	phone: "+91 98765 10101",
	vehicle: "Bike · DL 8S AB 1080",
	active: true,
	available: true,
	rating: 4.9,
	orders: 18,
	earnings: 3240
}, {
	id: "dp2",
	name: "Kavita Singh",
	phone: "+91 98765 20202",
	vehicle: "Scooter · UP 80 CM 2091",
	active: true,
	available: false,
	rating: 4.8,
	orders: 14,
	earnings: 2520
}];
function DeliveryPartnersPage() {
	const [partners, setPartners] = (0, import_react.useState)(initial);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold",
				children: "Delivery management"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Monitor partners, assignments and delivery performance."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm",
						children: "Active partners"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "text-3xl font-bold",
						children: partners.filter((p) => p.active).length
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm",
						children: "Available now"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "text-3xl font-bold",
						children: partners.filter((p) => p.available).length
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm",
						children: "Completed today"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "text-3xl font-bold",
						children: partners.reduce((n, p) => n + p.orders, 0)
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: partners.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center justify-between text-base",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bike, { className: "h-4 w-4" }), p.name]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: p.available ? "default" : "secondary",
						children: p.available ? "Available" : "On delivery"
					})]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							p.phone,
							" · ",
							p.vehicle
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-4 w-4 fill-yellow-400 text-yellow-400" }), p.rating]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [p.orders, " completed"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹", p.earnings.toLocaleString("en-IN")] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => setPartners((xs) => xs.map((x) => x.id === p.id ? {
									...x,
									active: !x.active
								} : x)),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleLeft, { className: "mr-1 h-4 w-4" }), p.active ? "Deactivate" : "Activate"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mr-1 h-4 w-4" }), "Track"]
							})]
						})
					]
				})] }, p.id))
			})
		]
	});
}
//#endregion
export { DeliveryPartnersPage as component };
