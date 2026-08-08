import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as useStore, r as formatINR } from "./store-context-DO8gCS2Z.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { N as BadgePercent, b as Megaphone, i as Trash2, k as CalendarDays, p as Plus } from "../_libs/lucide-react.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as Label, r as DialogFooter, t as Dialog } from "./dialog-DBHicK12.mjs";
import { n as CardContent, t as Card } from "./card-BXjpJ96D.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/offers-DT4sWeuJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emptyForm = {
	title: "",
	code: "",
	type: "percent",
	value: 10,
	minOrder: 0,
	validTill: "2026-08-31",
	active: true
};
function OffersPage() {
	const { offers, addOffer, toggleOffer, deleteOffer, broadcastOffer } = useStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)(emptyForm);
	const save = () => {
		if (!form.title.trim() || !form.code.trim()) {
			toast.error("Title and coupon code are required");
			return;
		}
		if (form.value <= 0) {
			toast.error("Discount value must be positive");
			return;
		}
		addOffer({
			...form,
			code: form.code.toUpperCase().replace(/\s+/g, "")
		});
		toast.success("Offer created");
		setForm(emptyForm);
		setOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold",
					children: "Offers & Coupons"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [offers.filter((o) => o.active).length, " active offers"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Create offer"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: offers.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: o.active ? "" : "opacity-60",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgePercent, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1",
									children: [
										o.active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											onClick: async () => {
												try {
													await broadcastOffer(o.id);
													toast.success(`Broadcasted offer "${o.title}" to customers! 🎉`);
												} catch (err) {
													toast.error("Failed to broadcast offer.");
												}
											},
											title: "Tell Customers",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-4 w-4 text-brand-600" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											checked: o.active,
											onCheckedChange: () => toggleOffer(o.id)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											onClick: () => {
												deleteOffer(o.id);
												toast.success("Offer deleted");
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 font-medium",
								children: o.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl font-bold text-primary",
								children: o.type === "percent" ? `${o.value}% OFF` : `${formatINR(o.value)} OFF`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "font-mono",
									children: o.code
								}), o.minOrder > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: ["Min order ", formatINR(o.minOrder)]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 flex items-center gap-1 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-3.5 w-3.5" }),
									" Valid till ",
									o.validTill
								]
							})
						]
					})
				}, o.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create offer" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Offer title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.title,
										maxLength: 80,
										placeholder: "e.g. Monsoon Mega Sale",
										onChange: (e) => setForm((f) => ({
											...f,
											title: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Coupon code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.code,
											maxLength: 20,
											placeholder: "MONSOON25",
											onChange: (e) => setForm((f) => ({
												...f,
												code: e.target.value.toUpperCase()
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Discount type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.type,
											onValueChange: (v) => setForm((f) => ({
												...f,
												type: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "percent",
												children: "Percentage (%)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "flat",
												children: "Flat amount (₹)"
											})] })]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: form.type === "percent" ? "Discount (%)" : "Discount (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: 1,
											value: form.value,
											onChange: (e) => setForm((f) => ({
												...f,
												value: Number(e.target.value)
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Min order (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: 0,
											value: form.minOrder,
											onChange: (e) => setForm((f) => ({
												...f,
												minOrder: Number(e.target.value)
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Valid till" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.validTill,
										onChange: (e) => setForm((f) => ({
											...f,
											validTill: e.target.value
										}))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: save,
							children: "Create offer"
						})] })
					]
				})
			})
		]
	});
}
//#endregion
export { OffersPage as component };
