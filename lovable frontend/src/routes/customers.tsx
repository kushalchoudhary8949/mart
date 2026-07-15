import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Bell, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore, formatINR } from "@/lib/store-context";
import { toast } from "sonner";

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
  const { customers, sendNotification } = useStore();
  const [search, setSearch] = useState("");
  const [notifTarget, setNotifTarget] = useState<any | null>(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("promo");
  const [sending, setSending] = useState(false);

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
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="inline-flex items-center gap-1 h-8"
                      onClick={() => {
                        setNotifTarget(c);
                        setNotifTitle("");
                        setNotifMessage("");
                        setNotifType("promo");
                      }}
                    >
                      <Bell className="h-3.5 w-3.5 text-brand-600" />
                      Notify
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!notifTarget} onOpenChange={(open) => !open && setNotifTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Notification to {notifTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Special Discount for You!"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your notification message here…"
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="notifType"
                    value="promo"
                    checked={notifType === "promo"}
                    onChange={() => setNotifType("promo")}
                    className="accent-brand-600"
                  />
                  Promo
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="notifType"
                    value="system"
                    checked={notifType === "system"}
                    onChange={() => setNotifType("system")}
                    className="accent-brand-600"
                  />
                  System
                </label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setNotifTarget(null)} disabled={sending}>
              Cancel
            </Button>
            <Button
              className="bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-1.5"
              disabled={sending || !notifTitle.trim() || !notifMessage.trim()}
              onClick={async () => {
                if (!notifTarget) return;
                setSending(true);
                try {
                  await sendNotification(notifTarget.id, notifTitle, notifMessage, notifType);
                  toast.success("Notification sent successfully!");
                  setNotifTarget(null);
                } catch (err) {
                  toast.error("Failed to send notification.");
                } finally {
                  setSending(false);
                }
              }}
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
