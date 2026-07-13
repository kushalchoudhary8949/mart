import { createFileRoute, Link } from "@tanstack/react-router";
import { IndianRupee, ShoppingCart, PackageX, Users } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore, formatINR, type OrderStatus } from "@/lib/store-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — GroceryMart Admin" },
      { name: "description", content: "Today's sales, orders and stock alerts for GroceryMart." },
    ],
  }),
  component: Dashboard,
});

const statusLabel: Record<OrderStatus, string> = {
  pending: "Pending",
  packed: "Packed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusVariant: Record<OrderStatus, string> = {
  pending: "bg-warning/20 text-warning-foreground",
  packed: "bg-accent text-accent-foreground",
  out_for_delivery: "bg-chart-3/20 text-foreground",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

function Dashboard() {
  const { orders, products, customers } = useStore();

  const todayOrders = orders.filter((o) => o.date === "2026-07-12");
  const todayRevenue = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold);
  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "packed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Good morning 👋</h1>
        <p className="text-sm text-muted-foreground">Here's what's happening at your store today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today's revenue" value={formatINR(todayRevenue)} sub={`${todayOrders.length} orders today`} icon={IndianRupee} tone="success" />
        <StatCard title="Orders to fulfil" value={String(pendingCount)} sub="Pending + packed" icon={ShoppingCart} />
        <StatCard title="Low stock items" value={String(lowStock.length)} sub="Need restocking" icon={PackageX} tone={lowStock.length ? "warning" : "default"} />
        <StatCard title="Customers" value={String(customers.length)} sub="Registered shoppers" icon={Users} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent orders</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 6).map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell className="text-right">{formatINR(o.total)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusVariant[o.status]}>
                        {statusLabel[o.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Low stock alerts</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/inventory">Restock</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.length === 0 && (
              <p className="text-sm text-muted-foreground">All items are well stocked 🎉</p>
            )}
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{p.emoji}</span>
                  <div>
                    <p className="text-sm font-medium leading-tight">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.unit}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={p.stock === 0 ? "bg-destructive/10 text-destructive" : "bg-warning/20 text-warning-foreground"}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
