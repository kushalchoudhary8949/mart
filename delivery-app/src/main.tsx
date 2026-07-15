import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { io, Socket } from 'socket.io-client';
import './styles.css';

const api = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api/v1';
const socketUrl = api.replace(/\/api\/v1$/, '');
type Status = 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
type Order = { id: number; orderNo: string; total: number; paymentMethod: string; paymentStatus: string; addressText: string; status: Status; user: { name: string | null; phone: string }; items: Array<{ name: string; quantity: number; unit: string | null }> };
const request = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('delivery_token');
  const res = await fetch(`${api}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers } });
  const body = await res.json(); if (!res.ok) throw new Error(body.message ?? 'Request failed'); return body.data;
};
function App() {
  const [token, setToken] = useState(localStorage.getItem('delivery_token') ?? '');
  const [phone, setPhone] = useState(''); const [password, setPassword] = useState('');
  const [available, setAvailable] = useState<Order[]>([]); const [mine, setMine] = useState<Order[]>([]); const [completed, setCompleted] = useState<Order[]>([]); const [notice, setNotice] = useState('');
  const refresh = async () => { const [nextAvailable, nextMine, nextCompleted] = await Promise.all([request<Order[]>('/delivery/orders/available'), request<Order[]>('/delivery/orders/my'), request<Order[]>('/delivery/orders/my?completed=true')]); setAvailable(nextAvailable); setMine(nextMine); setCompleted(nextCompleted); };
  useEffect(() => { if (!token) return; refresh().catch((e) => setNotice(e.message)); const socket: Socket = io(socketUrl, { auth: { token }, reconnection: true }); socket.onAny(() => refresh().catch(() => undefined)); return () => { socket.close(); }; }, [token]);
  useEffect(() => {
    if (!token || !navigator.geolocation) return;
    const timer = window.setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          mine.filter((o) => o.status !== 'DELIVERED').forEach((o) => {
            request(`/delivery/orders/${o.id}/location`, {
              method: 'PATCH',
              body: JSON.stringify({ latitude: p.coords.latitude, longitude: p.coords.longitude })
            }).catch(() => undefined);
          });
        },
        (err) => {
          console.warn("CoreLocation reported error or permission denied, using Delhi NCR fallback:", err.message);
          mine.filter((o) => o.status !== 'DELIVERED').forEach((o) => {
            request(`/delivery/orders/${o.id}/location`, {
              method: 'PATCH',
              body: JSON.stringify({ latitude: 28.6139, longitude: 77.2090 })
            }).catch(() => undefined);
          });
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    }, 10000);
    return () => clearInterval(timer);
  }, [token, mine]);
  const earnings = useMemo(() => completed.filter((o) => o.status === 'DELIVERED').reduce((sum, o) => sum + o.total, 0), [completed]);
  const act = async (path: string) => { try { await request(path, { method: path.endsWith('/accept') ? 'POST' : 'PATCH' }); await refresh(); } catch (e) { setNotice(e instanceof Error ? e.message : 'Action failed'); } };
  if (!token) return <main className="login"><h1>Vrindavan Mart</h1><p>Delivery Partner</p><input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} /><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /><button onClick={async () => { try { const data = await request<{ accessToken: string }>('/delivery/login', { method: 'POST', body: JSON.stringify({ phone, password }) }); localStorage.setItem('delivery_token', data.accessToken); setToken(data.accessToken); } catch (e) { setNotice(e instanceof Error ? e.message : 'Login failed'); } }}>Sign in</button>{notice && <p className="error">{notice}</p>}</main>;
  const card = (o: Order, assigned: boolean) => <article className="order" key={o.id}><b>{o.orderNo}</b><span className="status">{o.status.replaceAll('_', ' ')}</span><p>{o.user.name ?? 'Customer'} · <a href={`tel:${o.user.phone}`}>{o.user.phone}</a></p><p>{o.addressText}</p><p>{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</p><strong>₹{o.total} · {o.paymentMethod}</strong><div className="actions">{!assigned ? <button onClick={() => act(`/delivery/orders/${o.id}/accept`)}>Accept order</button> : <>{o.status === 'READY_FOR_PICKUP' && <button onClick={() => act(`/delivery/orders/${o.id}/picked-up`)}>Picked up</button>}{o.status === 'READY_FOR_PICKUP' && <button onClick={() => act(`/delivery/orders/${o.id}/start`)}>Start delivery</button>}{o.status === 'OUT_FOR_DELIVERY' && <button onClick={() => act(`/delivery/orders/${o.id}/delivered`)}>Delivered</button>}<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.addressText)}`} target="_blank">Navigate</a></>}</div></article>;
  return <main><header><div><h1>Delivery dashboard</h1><p>Completed earnings: ₹{earnings}</p></div><button onClick={() => { localStorage.removeItem('delivery_token'); setToken(''); }}>Sign out</button></header>{notice && <p className="error">{notice}</p>}<section><h2>Available pickup orders</h2><div className="grid">{available.length ? available.map((o) => card(o, false)) : <p>No available orders.</p>}</div></section><section><h2>My assigned orders</h2><div className="grid">{mine.length ? mine.map((o) => card(o, true)) : <p>No assigned orders.</p>}</div></section><section><h2>Completed orders</h2><div className="grid">{completed.length ? completed.map((o) => card(o, true)) : <p>No completed orders yet.</p>}</div></section></main>;
}
createRoot(document.getElementById('root')!).render(<App />);
