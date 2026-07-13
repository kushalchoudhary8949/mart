import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useStore } from "@/lib/store-context";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — GroceryMart Admin" },
      { name: "description", content: "Track and adjust stock levels across your grocery store." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const { products, categories, adjustStock } = useStore();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (tab === "low") return matchesSearch && p.stock > 0 && p.stock <= p.lowStockThreshold;
    if (tab === "out") return matchesSearch && p.stock === 0;
    return matchesSearch;
  });

  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          {lowCount} low stock · {outCount} out of stock
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All ({products.length})</TabsTrigger>
            <TabsTrigger value="low">Low stock ({lowCount})</TabsTrigger>
            <TabsTrigger value="out">Out of stock ({outCount})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">In stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Adjust stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{p.emoji}</span>
                      <div>
                        <p className="font-medium leading-tight">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.unit}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{catName(p.categoryId)}</TableCell>
                  <TableCell className="text-right font-display text-lg font-bold">{p.stock}</TableCell>
                  <TableCell>
                    {p.stock === 0 ? (
                      <Badge variant="secondary" className="bg-destructive/10 text-destructive">Out of stock</Badge>
                    ) : p.stock <= p.lowStockThreshold ? (
                      <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">Low stock</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-success/15 text-success">In stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" disabled={p.stock === 0} onClick={() => adjustStock(p.id, -1)}>
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => adjustStock(p.id, 1)}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="secondary" size="sm" className="h-8" onClick={() => adjustStock(p.id, 10)}>
                        +10
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No items found.
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
