import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore, formatINR } from "@/lib/store-context";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — GroceryMart Admin" },
      { name: "description", content: "View registered customers, order history and spend." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { customers } = useStore();
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground">{customers.length} registered customers</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name, email or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total spent</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                          {initials(c.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium leading-tight">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.phone}</TableCell>
                  <TableCell className="text-right">{c.orders}</TableCell>
                  <TableCell className="text-right font-medium">{formatINR(c.totalSpent)}</TableCell>
                  <TableCell>
                    {c.totalSpent >= 15000 ? (
                      <Badge variant="secondary" className="bg-success/15 text-success">VIP</Badge>
                    ) : c.totalSpent >= 5000 ? (
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">Regular</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">New</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.joined}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No customers found.
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
