import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bike, MapPin, Star, ToggleLeft, Plus, Trash2, Phone, Navigation, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useStore, type DeliveryPartner } from "@/lib/store-context";

export const Route = createFileRoute("/delivery-partners")({
  head: () => ({
    meta: [
      { title: "Delivery Partners — GroceryMart Admin" },
      { name: "description", content: "Manage delivery partners, track locations, and monitor performance." },
    ],
  }),
  component: DeliveryPartnersPage,
});

function AddPartnerDialog({ onAdd }: { onAdd: (data: { name: string; phone: string; password: string; vehicleType: string; vehicleNumber: string }) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", password: "", vehicleType: "", vehicleNumber: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password || !form.vehicleType || !form.vehicleNumber) {
      toast.error("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      await onAdd(form);
      toast.success(`${form.name} added as delivery partner.`);
      setForm({ name: "", phone: "", password: "", vehicleType: "", vehicleNumber: "" });
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add delivery partner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Partner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Delivery Partner</DialogTitle>
            <DialogDescription>Create a new delivery partner account with login credentials.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dp-name">Full Name</Label>
              <Input id="dp-name" placeholder="Rohan Gupta" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dp-phone">Phone Number</Label>
              <Input id="dp-phone" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dp-password">Password</Label>
              <Input id="dp-password" type="password" placeholder="Minimum 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="dp-vehicle-type">Vehicle Type</Label>
                <Input id="dp-vehicle-type" placeholder="Bike" value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dp-vehicle-number">Vehicle Number</Label>
                <Input id="dp-vehicle-number" placeholder="DL 8S AB 1080" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Add Partner
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TrackLocationDialog({ partner, getPartnerLocation }: { partner: DeliveryPartner; getPartnerLocation: (id: number) => Promise<{ partner: any; location: any } | null> }) {
  const [open, setOpen] = useState(false);
  const [locationData, setLocationData] = useState<{ partner: any; location: any } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const data = await getPartnerLocation(partner.id);
      setLocationData(data);
    } catch {
      toast.error("Failed to fetch location.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MapPin className="mr-1 h-4 w-4" />
          Track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Track — {partner.name}
          </DialogTitle>
          <DialogDescription>Real-time delivery partner location and status.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Partner Info */}
          <Card>
            <CardContent className="grid grid-cols-2 gap-3 p-4 text-sm">
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="flex items-center gap-1 font-medium"><Phone className="h-3.5 w-3.5" />{partner.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vehicle</p>
                <p className="font-medium">{partner.vehicleType} · {partner.vehicleNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-block h-2 w-2 rounded-full ${partner.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                  <span className="font-medium">{partner.isOnline ? "Online" : "Offline"}</span>
                  {partner.isOnline && (
                    <Badge variant={partner.isAvailable ? "default" : "secondary"} className="ml-1 text-xs">
                      {partner.isAvailable ? "Available" : "On delivery"}
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Rating</p>
                <p className="flex items-center gap-1 font-medium"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />{partner.rating.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Live Location</span>
                <Button size="sm" variant="ghost" onClick={fetchLocation} disabled={loading} className="h-7 text-xs">
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : locationData?.location ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground">Latitude</p>
                      <p className="font-mono font-medium">{Number(locationData.location.latitude).toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Longitude</p>
                      <p className="font-mono font-medium">{Number(locationData.location.longitude).toFixed(6)}</p>
                    </div>
                  </div>
                  {locationData.location.updatedAt && (
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(locationData.location.updatedAt).toLocaleString("en-IN")}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps?q=${locationData.location.latitude},${locationData.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Open in Google Maps
                  </a>
                </div>
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  No location data available. Partner may be offline or location has not been shared yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeliveryPartnersPage() {
  const { deliveryPartners, addDeliveryPartner, removeDeliveryPartner, getPartnerLocation } = useStore();

  const activeCount = deliveryPartners.filter((p) => p.isOnline).length;
  const availableCount = deliveryPartners.filter((p) => p.isAvailable && p.isOnline).length;
  const totalOrders = deliveryPartners.reduce((n, p) => n + p.orderCount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Delivery Management</h1>
          <p className="text-sm text-muted-foreground">Manage partners, assignments and delivery performance.</p>
        </div>
        <AddPartnerDialog onAdd={addDeliveryPartner} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Active Partners</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{activeCount}<span className="text-base font-normal text-muted-foreground"> / {deliveryPartners.length}</span></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Available Now</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{availableCount}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Orders Assigned</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{totalOrders}</CardContent>
        </Card>
      </div>

      {/* Partner List */}
      {deliveryPartners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bike className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p className="font-medium">No delivery partners yet</p>
            <p className="text-sm">Click "Add Partner" to create your first delivery partner.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {deliveryPartners.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${p.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                    <Bike className="h-4 w-4" />
                    {p.name}
                  </span>
                  <Badge variant={p.isAvailable && p.isOnline ? "default" : "secondary"}>
                    {!p.isOnline ? "Offline" : p.isAvailable ? "Available" : "On delivery"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>{p.phone} · {p.vehicleType} · {p.vehicleNumber}</p>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{p.rating.toFixed(1)}</span>
                  <span>{p.orderCount} orders</span>
                </div>
                <div className="flex gap-2">
                  <TrackLocationDialog partner={p} getPartnerLocation={getPartnerLocation} />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove {p.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove {p.name} as a delivery partner. Their active orders will be unassigned. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={async () => {
                            try {
                              await removeDeliveryPartner(p.id);
                              toast.success(`${p.name} has been removed.`);
                            } catch (err: any) {
                              toast.error(err.message || "Failed to remove partner.");
                            }
                          }}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
