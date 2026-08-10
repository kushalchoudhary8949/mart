import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Bike } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, formatINR, type OrderStatus } from "@/lib/store-context";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders — GroceryMart Admin" },
      { name: "description", content: "Track and update customer orders across fulfilment stages." },
    ],
  }),
  component: OrdersPage,
});

const statusLabel: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  packing: "Packing",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusClass: Record<OrderStatus, string> = {
  pending: "bg-warning/20 text-warning-foreground",
  accepted: "bg-blue-100 text-blue-700",
  packing: "bg-accent text-accent-foreground",
  ready_for_pickup: "bg-violet-100 text-violet-700",
  out_for_delivery: "bg-chart-3/20 text-foreground",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const assignableStatuses = new Set<OrderStatus>(["accepted", "packing", "ready_for_pickup"]);

function OrdersPage() {
  const { orders, updateOrderStatus, deliveryPartners, assignDeliveryPartner } = useStore();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = orders.filter((o) => {
    const matchesTab = tab === "all" || o.status === tab;
    const q = search.toLowerCase();
    return matchesTab && (o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
  });

  const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length;

  const availablePartners = deliveryPartners.filter((p) => p.isAvailable);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} orders in the last 4 days</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending ({count("pending")})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({count("accepted")})</TabsTrigger>
            <TabsTrigger value="packing">Packing ({count("packing")})</TabsTrigger>
            <TabsTrigger value="ready_for_pickup">Ready ({count("ready_for_pickup")})</TabsTrigger>
            <TabsTrigger value="out_for_delivery">On the way ({count("out_for_delivery")})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({count("delivered")})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search order ID or customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Delivery Partner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-44">Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="text-right">{o.items}</TableCell>
                  <TableCell className="text-right font-medium">{formatINR(o.total)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{o.payment}</Badge>
                  </TableCell>
                  <TableCell>
                    {o.deliveryPartnerName ? (
                      <div className="flex items-center gap-1.5">
                        <Bike className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{o.deliveryPartnerName}</span>
                      </div>
                    ) : assignableStatuses.has(o.status) && availablePartners.length > 0 ? (
                      <Select
                        onValueChange={(partnerId) => {
                          const partner = deliveryPartners.find((p) => p.id === Number(partnerId));
                          assignDeliveryPartner(o.id, Number(partnerId));
                          toast.success(`Assigned ${partner?.name ?? "partner"} to ${o.id}`);
                        }}
                      >
                        <SelectTrigger className="h-7 w-36 text-xs">
                          <SelectValue placeholder="Assign partner" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePartners.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusClass[o.status]}>
                      {statusLabel[o.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={o.status}
                      onValueChange={(v) => {
                        updateOrderStatus(o.id, v as OrderStatus);
                        toast.success(`${o.id} → ${statusLabel[v as OrderStatus]}`);
                      }}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(statusLabel) as OrderStatus[]).map((s) => (
                          <SelectItem key={s} value={s}>
                            {statusLabel[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

