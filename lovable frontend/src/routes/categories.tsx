import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore, type Category } from "@/lib/store-context";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — GroceryMart Admin" },
      { name: "description", content: "Organise your grocery catalogue into categories." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", emoji: "🛒", description: "" });

  const openDialog = (cat?: Category) => {
    setEditing(cat ?? null);
    setForm(cat ? { name: cat.name, emoji: cat.emoji, description: cat.description } : { name: "", emoji: "🛒", description: "" });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (editing) {
      updateCategory({ ...editing, ...form });
      toast.success("Category updated");
    } else {
      addCategory(form);
      toast.success("Category added");
    }
    setOpen(false);
  };

  const remove = (cat: Category) => {
    const count = products.filter((p) => p.categoryId === cat.id).length;
    if (count > 0) {
      toast.error(`Cannot delete — ${count} product(s) use this category`);
      return;
    }
    deleteCategory(cat.id);
    toast.success("Category deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4" /> Add category
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((cat) => {
          const count = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <Card key={cat.id}>
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-2xl">
                    {cat.emoji}
                  </div>
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                    <p className="mt-1 text-xs font-medium text-primary">{count} products</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(cat)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(cat)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <div className="grid gap-1.5">
                <Label>Emoji</Label>
                <Input value={form.emoji} maxLength={4} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  maxLength={60}
                  placeholder="e.g. Frozen Foods"
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Input
                value={form.description}
                maxLength={120}
                placeholder="Short description"
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add category"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
