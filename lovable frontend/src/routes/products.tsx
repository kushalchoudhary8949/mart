import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { ProductDialog } from "@/components/admin/ProductDialog";
import { useStore, formatINR, type Product } from "@/lib/store-context";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — GroceryMart Admin" },
      { name: "description", content: "Add, edit and price products in your grocery catalogue." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { products, categories, deleteProduct } = useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || p.categoryId === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products in catalogue</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">MRP</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const discount = p.mrp > 0 ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
                return (
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
                    <TableCell className="text-right font-medium">{formatINR(p.price)}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground line-through">
                      {p.mrp !== p.price ? formatINR(p.mrp) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {discount > 0 ? (
                        <Badge variant="secondary" className="bg-success/15 text-success">{discount}% off</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{p.stock}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={p.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}>
                        {p.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { deleteProduct(p.id); toast.success("Product deleted"); }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editing} />
    </div>
  );
}
