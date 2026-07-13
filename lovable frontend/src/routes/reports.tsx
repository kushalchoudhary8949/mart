import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, ShoppingBag, Receipt, Percent } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { weeklySales, monthlySales, categorySales, formatINR, useStore } from "@/lib/store-context";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Sales Reports — GroceryMart Admin" },
      { name: "description", content: "Weekly and monthly sales trends, category share and top products." },
    ],
  }),
  component: ReportsPage,
});

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

const topProducts = [
  { name: "Full Cream Milk", units: 412, revenue: 13596 },
  { name: "Fresh Tomatoes", units: 286, revenue: 9152 },
  { name: "Farm Eggs", units: 231, revenue: 9702 },
  { name: "Basmati Rice", units: 64, revenue: 27200 },
  { name: "Whole Wheat Bread", units: 198, revenue: 8910 },
];

function ReportsPage() {
  const { orders } = useStore();
  const weekTotal = weeklySales.reduce((s, d) => s + d.sales, 0);
  const weekOrders = weeklySales.reduce((s, d) => s + d.orders, 0);
  const avgOrder = Math.round(weekTotal / weekOrders);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Sales Reports</h1>
        <p className="text-sm text-muted-foreground">Performance for the week of Jul 6 – Jul 12, 2026</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Weekly revenue" value={formatINR(weekTotal)} sub="+12.4% vs last week" icon={TrendingUp} tone="success" />
        <StatCard title="Weekly orders" value={String(weekOrders)} sub="+8.1% vs last week" icon={ShoppingBag} />
        <StatCard title="Avg order value" value={formatINR(avgOrder)} sub="Across all channels" icon={Receipt} />
        <StatCard
          title="Cancellation rate"
          value={`${Math.round((orders.filter((o) => o.status === "cancelled").length / orders.length) * 100)}%`}
          sub="Last 4 days"
          icon={Percent}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily sales this week</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(v: number) => [formatINR(v), "Sales"]}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
                <Bar dataKey="sales" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly revenue trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(v: number) => [formatINR(v), "Revenue"]}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
                <Line type="monotone" dataKey="sales" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ fill: "var(--chart-1)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales by category</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySales} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {categorySales.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`${v}%`, "Share"]}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top selling products</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right">{p.units}</TableCell>
                    <TableCell className="text-right">{formatINR(p.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
