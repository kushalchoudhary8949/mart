import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, BadgePercent, CalendarDays, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, formatINR } from "@/lib/store-context";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers — GroceryMart Admin" },
      { name: "description", content: "Create and manage discount offers and coupon codes." },
    ],
  }),
  component: OffersPage,
});

const emptyForm = {
  title: "",
  code: "",
  type: "percent" as "percent" | "flat",
  value: 10,
  minOrder: 0,
  validTill: "2026-08-31",
  active: true,
};

function OffersPage() {
  const { offers, addOffer, toggleOffer, deleteOffer, broadcastOffer } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const save = () => {
    if (!form.title.trim() || !form.code.trim()) {
      toast.error("Title and coupon code are required");
      return;
    }
    if (form.value <= 0) {
      toast.error("Discount value must be positive");
      return;
    }
    addOffer({ ...form, code: form.code.toUpperCase().replace(/\s+/g, "") });
    toast.success("Offer created");
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Offers & Coupons</h1>
          <p className="text-sm text-muted-foreground">
            {offers.filter((o) => o.active).length} active offers
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Create offer
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {offers.map((o) => (
          <Card key={o.id} className={o.active ? "" : "opacity-60"}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <BadgePercent className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                  {o.active && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={async () => { 
                        try {
                          await broadcastOffer(o.id);
                          toast.success(`Broadcasted offer "${o.title}" to customers! 🎉`);
                        } catch (err) {
                          toast.error("Failed to broadcast offer.");
                        }
                      }}
                      title="Tell Customers"
                    >
                      <Megaphone className="h-4 w-4 text-brand-600" />
                    </Button>
                  )}
                  <Switch checked={o.active} onCheckedChange={() => toggleOffer(o.id)} />
                  <Button variant="ghost" size="icon" onClick={() => { deleteOffer(o.id); toast.success("Offer deleted"); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <p className="mt-3 font-medium">{o.title}</p>
              <p className="font-display text-2xl font-bold text-primary">
                {o.type === "percent" ? `${o.value}% OFF` : `${formatINR(o.value)} OFF`}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-mono">{o.code}</Badge>
                {o.minOrder > 0 && (
                  <span className="text-xs text-muted-foreground">Min order {formatINR(o.minOrder)}</span>
                )}
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> Valid till {o.validTill}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create offer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Offer title</Label>
              <Input
                value={form.title}
                maxLength={80}
                placeholder="e.g. Monsoon Mega Sale"
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Coupon code</Label>
                <Input
                  value={form.code}
                  maxLength={20}
                  placeholder="MONSOON25"
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Discount type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as "percent" | "flat" }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="flat">Flat amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>{form.type === "percent" ? "Discount (%)" : "Discount (₹)"}</Label>
                <Input type="number" min={1} value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Min order (₹)</Label>
                <Input type="number" min={0} value={form.minOrder} onChange={(e) => setForm((f) => ({ ...f, minOrder: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Valid till</Label>
              <Input type="date" value={form.validTill} onChange={(e) => setForm((f) => ({ ...f, validTill: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Create offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
