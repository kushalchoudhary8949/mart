import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as CardContent, t as Card } from "./card-BXjpJ96D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StatCard-CwGDFElW.js
var import_jsx_runtime = require_jsx_runtime();
var toneClasses = {
	default: "bg-accent text-accent-foreground",
	success: "bg-success/15 text-success",
	warning: "bg-warning/20 text-warning-foreground",
	destructive: "bg-destructive/10 text-destructive"
};
function StatCard({ title, value, sub, icon: Icon, tone = "default" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "flex items-start justify-between gap-3 p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-display text-2xl font-bold",
					children: value
				}),
				sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: sub
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneClasses[tone]),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
		})]
	}) });
}
//#endregion
export { StatCard as t };
