import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, type Product } from "@/lib/store-context";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

const empty = {
  name: "",
  emoji: "🛒",
  categoryId: "",
  unit: "",
  price: 0,
  mrp: 0,
  stock: 0,
  lowStockThreshold: 10,
  active: true,
};

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const { categories, addProduct, updateProduct } = useStore();
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (open) {
      setForm(product ? { ...product } : { ...empty, categoryId: categories[0]?.id ?? "" });
    }
  }, [open, product, categories]);

  const set = (key: string, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  const save = () => {
    if (!form.name.trim() || !form.categoryId || !form.unit.trim()) {
      toast.error("Please fill name, category and unit");
      return;
    }
    if (form.price <= 0 || form.mrp < form.price) {
      toast.error("MRP must be greater than or equal to selling price");
      return;
    }
    if (product) {
      updateProduct({ ...form, id: product.id } as Product);
      toast.success("Product updated");
    } else {
      addProduct(form);
      toast.success("Product added");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <div className="grid gap-1.5">
              <Label>Emoji</Label>
              <Input value={form.emoji} maxLength={4} onChange={(e) => set("emoji", e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Product name</Label>
              <Input
                value={form.name}
                maxLength={100}
                placeholder="e.g. Fresh Tomatoes"
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Unit / pack size</Label>
              <Input
                value={form.unit}
                maxLength={30}
                placeholder="e.g. 1 kg"
                onChange={(e) => set("unit", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Selling price (₹)</Label>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>MRP (₹)</Label>
              <Input
                type="number"
                min={0}
                value={form.mrp}
                onChange={(e) => set("mrp", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Stock quantity</Label>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set("stock", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Low stock alert at</Label>
              <Input
                type="number"
                min={0}
                value={form.lowStockThreshold}
                onChange={(e) => set("lowStockThreshold", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Active on store</p>
              <p className="text-xs text-muted-foreground">Inactive products are hidden from customers</p>
            </div>
            <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{product ? "Save changes" : "Add product"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
