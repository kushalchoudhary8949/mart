import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bike, MapPin, Star, ToggleLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/delivery-partners")({ component: DeliveryPartnersPage });
type Partner = { id: string; name: string; phone: string; vehicle: string; active: boolean; available: boolean; rating: number; orders: number; earnings: number };
const initial: Partner[] = [
  { id: "dp1", name: "Rohan Gupta", phone: "+91 98765 10101", vehicle: "Bike · DL 8S AB 1080", active: true, available: true, rating: 4.9, orders: 18, earnings: 3240 },
  { id: "dp2", name: "Kavita Singh", phone: "+91 98765 20202", vehicle: "Scooter · UP 80 CM 2091", active: true, available: false, rating: 4.8, orders: 14, earnings: 2520 },
];
function DeliveryPartnersPage() {
  const [partners, setPartners] = useState(initial);
  return <div className="space-y-4"><div><h1 className="font-display text-2xl font-bold">Delivery management</h1><p className="text-sm text-muted-foreground">Monitor partners, assignments and delivery performance.</p></div><div className="grid gap-4 md:grid-cols-3"><Card><CardHeader><CardTitle className="text-sm">Active partners</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{partners.filter((p) => p.active).length}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm">Available now</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{partners.filter((p) => p.available).length}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm">Completed today</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{partners.reduce((n, p) => n + p.orders, 0)}</CardContent></Card></div><div className="grid gap-4 md:grid-cols-2">{partners.map((p) => <Card key={p.id}><CardHeader><CardTitle className="flex items-center justify-between text-base"><span className="flex items-center gap-2"><Bike className="h-4 w-4" />{p.name}</span><Badge variant={p.available ? "default" : "secondary"}>{p.available ? "Available" : "On delivery"}</Badge></CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p>{p.phone} · {p.vehicle}</p><div className="flex gap-4"><span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{p.rating}</span><span>{p.orders} completed</span><span>₹{p.earnings.toLocaleString("en-IN")}</span></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setPartners((xs) => xs.map((x) => x.id === p.id ? { ...x, active: !x.active } : x))}><ToggleLeft className="mr-1 h-4 w-4" />{p.active ? "Deactivate" : "Activate"}</Button><Button size="sm" variant="outline"><MapPin className="mr-1 h-4 w-4" />Track</Button></div></CardContent></Card>)}</div></div>;
}
