import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as useStore, i as monthlySales, n as categorySales, o as weeklySales, r as formatINR } from "./store-context-DO8gCS2Z.mjs";
import { f as Receipt, l as ShoppingBag, m as Percent, r as TrendingUp } from "../_libs/lucide-react.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BXjpJ96D.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as StatCard } from "./StatCard-CwGDFElW.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Pie, n as BarChart, o as Line, r as LineChart, s as CartesianGrid, t as PieChart, u as Cell } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-DoGhgEQt.js
var import_jsx_runtime = require_jsx_runtime();
var pieColors = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
	"var(--muted-foreground)"
];
var topProducts = [
	{
		name: "Full Cream Milk",
		units: 412,
		revenue: 13596
	},
	{
		name: "Fresh Tomatoes",
		units: 286,
		revenue: 9152
	},
	{
		name: "Farm Eggs",
		units: 231,
		revenue: 9702
	},
	{
		name: "Basmati Rice",
		units: 64,
		revenue: 27200
	},
	{
		name: "Whole Wheat Bread",
		units: 198,
		revenue: 8910
	}
];
function ReportsPage() {
	const { orders } = useStore();
	const weekTotal = weeklySales.reduce((s, d) => s + d.sales, 0);
	const weekOrders = weeklySales.reduce((s, d) => s + d.orders, 0);
	const avgOrder = Math.round(weekTotal / weekOrders);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold",
				children: "Sales Reports"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Performance for the week of Jul 6 – Jul 12, 2026"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Weekly revenue",
						value: formatINR(weekTotal),
						sub: "+12.4% vs last week",
						icon: TrendingUp,
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Weekly orders",
						value: String(weekOrders),
						sub: "+8.1% vs last week",
						icon: ShoppingBag
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Avg order value",
						value: formatINR(avgOrder),
						sub: "Across all channels",
						icon: Receipt
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Cancellation rate",
						value: `${Math.round(orders.filter((o) => o.status === "cancelled").length / orders.length * 100)}%`,
						sub: "Last 4 days",
						icon: Percent,
						tone: "warning"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Daily sales this week"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "h-72",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: weeklySales,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "var(--border)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "day",
										tick: {
											fill: "var(--muted-foreground)",
											fontSize: 12
										},
										axisLine: false,
										tickLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: {
											fill: "var(--muted-foreground)",
											fontSize: 12
										},
										axisLine: false,
										tickLine: false,
										tickFormatter: (v) => `₹${v / 1e3}k`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										formatter: (v) => [formatINR(v), "Sales"],
										contentStyle: {
											background: "var(--card)",
											border: "1px solid var(--border)",
											borderRadius: 8
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "sales",
										fill: "var(--chart-1)",
										radius: [
											6,
											6,
											0,
											0
										]
									})
								]
							})
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Monthly revenue trend"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "h-72",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
								data: monthlySales,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "var(--border)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "month",
										tick: {
											fill: "var(--muted-foreground)",
											fontSize: 12
										},
										axisLine: false,
										tickLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: {
											fill: "var(--muted-foreground)",
											fontSize: 12
										},
										axisLine: false,
										tickLine: false,
										tickFormatter: (v) => `₹${v / 1e3}k`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										formatter: (v) => [formatINR(v), "Revenue"],
										contentStyle: {
											background: "var(--card)",
											border: "1px solid var(--border)",
											borderRadius: 8
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
										type: "monotone",
										dataKey: "sales",
										stroke: "var(--chart-1)",
										strokeWidth: 2.5,
										dot: { fill: "var(--chart-1)" }
									})
								]
							})
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Sales by category"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "h-72",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: categorySales,
								dataKey: "value",
								nameKey: "name",
								innerRadius: 55,
								outerRadius: 90,
								paddingAngle: 3,
								children: categorySales.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: pieColors[i % pieColors.length] }, i))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								formatter: (v) => [`${v}%`, "Share"],
								contentStyle: {
									background: "var(--card)",
									border: "1px solid var(--border)",
									borderRadius: 8
								}
							})] })
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Top selling products"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Product" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Units sold"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Revenue"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: topProducts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-medium",
								children: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: p.units
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: formatINR(p.revenue)
							})
						] }, p.name)) })] })
					})] })
				]
			})
		]
	});
}
//#endregion
export { ReportsPage as component };
