import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { io, Socket } from 'socket.io-client';
import './styles.css';

const api = import.meta.env.VITE_API_URL ?? 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001/api/v1'
    : 'https://vrindawan-mart-redis.onrender.com/api/v1');
const socketUrl = api.replace(/\/api\/v1$/, '');

type Status = 'PENDING' | 'ACCEPTED' | 'PACKING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
type Order = { 
  id: number; 
  orderNo: string; 
  total: number; 
  subtotal?: number;
  deliveryFee?: number;
  paymentMethod: string; 
  paymentStatus: string; 
  addressText: string; 
  status: Status; 
  placedAt?: string;
  user: { name: string | null; phone: string }; 
  items: Array<{ name: string; quantity: number; unit: string | null; price?: number }>;
};

type PartnerProfile = {
  id: number;
  name: string;
  phone: string;
  vehicleType?: string;
  vehicleNumber?: string;
  isOnline: boolean;
  isAvailable: boolean;
  rating?: number;
};

// Web Audio API Synthesizer for notifications
const playChime = (type: 'ping' | 'success' | 'accept') => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'ping') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'accept') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.2); // C6
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    }
  } catch {
    // AudioContext blocked or not supported
  }
};

const request = async <T,>(path: string, init?: RequestInit, isRetry = false): Promise<T> => {
  const token = localStorage.getItem('delivery_token');
  const res = await fetch(`${api}${path}`, { 
    ...init, 
    headers: { 
      'Content-Type': 'application/json', 
      ...(token ? { Authorization: `Bearer ${token}` } : {}), 
      ...init?.headers 
    } 
  });
  
  if (res.status === 401 && !isRetry && !path.startsWith('/delivery/login')) {
    const refreshToken = localStorage.getItem('delivery_refresh_token');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${api}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        const refreshBody = await refreshRes.json();
        if (refreshRes.ok && refreshBody.data?.accessToken) {
          localStorage.setItem('delivery_token', refreshBody.data.accessToken);
          if (refreshBody.data.refreshToken) localStorage.setItem('delivery_refresh_token', refreshBody.data.refreshToken);
          return request<T>(path, init, true);
        }
      } catch { /* Refresh failed */ }
    }
    localStorage.removeItem('delivery_token');
    localStorage.removeItem('delivery_refresh_token');
    window.location.reload();
    throw new Error('Session expired. Please sign in again.');
  }

  const body = await res.json(); 
  if (!res.ok) {
    throw new Error(body.message ?? body.error ?? 'Request failed'); 
  }
  return body.data !== undefined ? body.data : body;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('delivery_token') ?? '');
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed' | 'profile'>('available');

  const [phone, setPhone] = useState(''); 
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [available, setAvailable] = useState<Order[]>([]); 
  const [mine, setMine] = useState<Order[]>([]); 
  const [completed, setCompleted] = useState<Order[]>([]); 
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Delivery PIN Verification State
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);

  // Keep track of order count for audio alert
  const prevAvailableCount = useRef(0);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast((prev) => prev?.message === message ? null : prev), 4500);
  };

  const fetchProfile = async () => {
    try {
      const p = await request<PartnerProfile>('/delivery/profile');
      setProfile(p);
    } catch {
      // ignore
    }
  };

  const refreshOrders = async () => { 
    try {
      const [nextAvailable, nextMine, nextCompleted] = await Promise.all([
        request<Order[]>('/delivery/orders/available'), 
        request<Order[]>('/delivery/orders/my'), 
        request<Order[]>('/delivery/orders/my?completed=true')
      ]); 

      // Alert when new orders arrive
      if (nextAvailable.length > prevAvailableCount.current) {
        playChime('ping');
        showToast(`🔔 New pickup order available!`, 'info');
      }
      prevAvailableCount.current = nextAvailable.length;

      setAvailable(nextAvailable); 
      setMine(nextMine); 
      setCompleted(nextCompleted); 
    } catch (e) {
      // silent refresh catch
    }
  };

  useEffect(() => { 
    if (!token) return; 
    fetchProfile();
    refreshOrders();

    const socket: Socket = io(socketUrl, { auth: { token }, reconnection: true }); 
    socket.onAny(() => {
      refreshOrders();
    }); 
    return () => { socket.close(); }; 
  }, [token]);

  // Smooth Geolocation Updates
  useEffect(() => {
    if (!token || !navigator.geolocation) return;
    const updateLoc = () => {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          mine.filter((o) => o.status !== 'DELIVERED').forEach((o) => {
            request(`/delivery/orders/${o.id}/location`, {
              method: 'PATCH',
              body: JSON.stringify({ latitude: p.coords.latitude, longitude: p.coords.longitude })
            }).catch(() => undefined);
          });
        },
        () => {
          // Default fallback coordinates (silent fail)
          mine.filter((o) => o.status !== 'DELIVERED').forEach((o) => {
            request(`/delivery/orders/${o.id}/location`, {
              method: 'PATCH',
              body: JSON.stringify({ latitude: 28.6139, longitude: 77.2090 })
            }).catch(() => undefined);
          });
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    };

    updateLoc();
    const timer = window.setInterval(updateLoc, 15000);
    return () => clearInterval(timer);
  }, [token, mine]);

  const toggleOnline = async () => {
    if (!profile) return;
    const newStatus = !profile.isOnline;
    try {
      await request('/delivery/profile', {
        method: 'PUT',
        body: JSON.stringify({ isOnline: newStatus, isAvailable: newStatus })
      });
      setProfile((prev) => prev ? { ...prev, isOnline: newStatus, isAvailable: newStatus } : null);
      showToast(newStatus ? '🟢 You are now Online & ready for orders' : '⚫ You are now Offline', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update status', 'error');
    }
  };

  const handleAction = async (path: string, successMsg?: string, chimeType?: 'accept' | 'success') => { 
    try { 
      await request(path, { 
        method: path.endsWith('/accept') ? 'POST' : 'PATCH'
      }); 
      if (chimeType) playChime(chimeType);
      if (successMsg) showToast(successMsg, 'success');
      await refreshOrders();
      if (path.endsWith('/accept')) {
        setActiveTab('active');
      }
    } catch (e) { 
      showToast(e instanceof Error ? e.message : 'Action failed', 'error'); 
    } 
  };

  const handlePinChange = (index: number, val: string) => {
    const next = [...pinDigits];
    next[index] = val.slice(-1);
    setPinDigits(next);
    if (val && index < 3) {
      const nextInput = document.getElementById(`deliv-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      const prevInput = document.getElementById(`deliv-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const submitDeliveryPin = async () => {
    if (!verifyingOrder) return;
    const pin = pinDigits.join('');
    if (pin.length !== 4) {
      showToast('Please enter the full 4-digit customer PIN', 'error');
      return;
    }
    setIsVerifying(true);
    try {
      await request(`/delivery/orders/${verifyingOrder.id}/delivered`, {
        method: 'PATCH',
        body: JSON.stringify({ pin })
      });
      playChime('success');
      setVerifyingOrder(null);
      setPinDigits(['', '', '', '']);
      showToast(`🎉 Order #${verifyingOrder.orderNo} delivered successfully!`, 'success');
      await refreshOrders();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Delivery verification failed', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const totalEarnings = useMemo(() => completed.reduce((sum, o) => sum + o.total, 0), [completed]);

  // Login Screen
  if (!token) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">
            <i className="fas fa-motorcycle"></i>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Vrindavan Mart</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Delivery Partner Portal</p>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            setIsLoggingIn(true);
            try {
              const data = await request<{ accessToken: string; refreshToken?: string; deliveryPartner?: PartnerProfile }>('/delivery/login', {
                method: 'POST',
                body: JSON.stringify({ phone, password })
              });
              localStorage.setItem('delivery_token', data.accessToken);
              if (data.refreshToken) localStorage.setItem('delivery_refresh_token', data.refreshToken);
              setToken(data.accessToken);
              if (data.deliveryPartner) setProfile(data.deliveryPartner);
              playChime('accept');
            } catch (err) {
              showToast(err instanceof Error ? err.message : 'Sign in failed', 'error');
            } finally {
              setIsLoggingIn(false);
            }
          }}>
            <input 
              className="login-input" 
              placeholder="Registered Phone Number" 
              type="tel"
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required
            />
            <input 
              className="login-input" 
              placeholder="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
            <button className="login-btn" type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing in...' : 'Sign in to Shift'}
            </button>
          </form>
          
          {toast && (
            <div className={`toast-banner ${toast.type}`} style={{ position: 'static', transform: 'none', marginTop: '16px', width: '100%' }}>
              <span>{toast.message}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Order Card Component
  const renderOrderCard = (o: Order, mode: 'available' | 'active' | 'completed') => {
    const isCOD = o.paymentMethod?.toUpperCase() === 'COD';
    return (
      <article className={`order-card ${mode === 'active' ? 'assigned' : ''}`} key={o.id}>
        <div className="order-card-header">
          <div>
            <span className="order-no">#{o.orderNo}</span>
            <span className="payment-mode-pill" style={{ background: isCOD ? '#fee2e2' : '#dcfce7', color: isCOD ? '#991b1b' : '#166534' }}>
              {isCOD ? '💵 Cash on Delivery' : '💳 Prepaid Online'}
            </span>
          </div>
          <span className={`order-status-tag status-tag-${o.status.toLowerCase().replace(/_/g, '')}`}>
            {o.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="customer-row">
          <div className="customer-details">
            <i className="fas fa-user-circle" style={{ color: '#059669', fontSize: '16px' }}></i>
            <span>{o.user?.name || 'Customer'}</span>
          </div>
          {o.user?.phone && (
            <a href={`tel:${o.user.phone}`} className="btn-call">
              <i className="fas fa-phone"></i> Call
            </a>
          )}
        </div>

        <div className="address-box">
          <i className="fas fa-location-dot"></i>
          <div>
            <p>{o.addressText || 'Customer Delivery Address'}</p>
          </div>
        </div>

        <div className="items-chip-list">
          {o.items?.map((it, idx) => (
            <span className="item-chip" key={idx}>
              {it.name} × {it.quantity}
            </span>
          ))}
        </div>

        <div className="order-footer">
          <div className="payout-summary">
            <span className="payout-label">{isCOD ? 'Collect Amount' : 'Order Value'}</span>
            <span className="payout-amount">₹{o.total}</span>
          </div>

          <div className="order-actions-grid">
            {mode === 'available' && (
              <button 
                className="btn-action-primary" 
                onClick={() => handleAction(`/delivery/orders/${o.id}/accept`, '✅ Order Accepted! Added to Active Deliveries', 'accept')}
              >
                <i className="fas fa-check"></i> Accept Order
              </button>
            )}

            {mode === 'active' && (
              <>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(o.addressText)}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-action-secondary"
                >
                  <i className="fas fa-diamond-turn-right"></i> Maps
                </a>

                {o.status === 'READY_FOR_PICKUP' && (
                  <button 
                    className="btn-action-primary" 
                    onClick={() => handleAction(`/delivery/orders/${o.id}/picked-up`, '📦 Order Picked Up!')}
                  >
                    <i className="fas fa-box"></i> Picked Up
                  </button>
                )}

                {(o.status === 'ACCEPTED' || o.status === 'PACKING' || o.status === 'READY_FOR_PICKUP') && (
                  <button 
                    className="btn-action-primary" 
                    onClick={() => handleAction(`/delivery/orders/${o.id}/start`, '🛵 Out for Delivery!')}
                  >
                    <i className="fas fa-paper-plane"></i> Start Delivery
                  </button>
                )}

                {o.status === 'OUT_FOR_DELIVERY' && (
                  <button 
                    className="btn-action-primary" 
                    style={{ background: '#059669' }}
                    onClick={() => { 
                      setVerifyingOrder(o); 
                      setPinDigits(['', '', '', '']); 
                    }}
                  >
                    <i className="fas fa-shield-halved"></i> Verify PIN & Complete
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-banner ${toast.type}`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <i className="fas fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="app-header">
        <div className="header-top">
          <div className="partner-info">
            <div className="partner-avatar">
              {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'VP'}
            </div>
            <div className="partner-meta">
              <h2>{profile?.name || 'Delivery Partner'}</h2>
              <p>
                <i className="fas fa-motorcycle"></i> {profile?.vehicleNumber || 'Bike Partner'}
              </p>
            </div>
          </div>

          <div 
            className={`status-pill-toggle ${profile?.isOnline ? 'online' : ''}`}
            onClick={toggleOnline}
          >
            <div className={`pulse-dot ${profile?.isOnline ? 'online' : ''}`}></div>
            <span className="status-text">{profile?.isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Quick Shift Metrics Strip */}
        <div className="metrics-strip">
          <div className="metric-card">
            <p className="metric-label">Pickups</p>
            <p className="metric-value">{available.length}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Active</p>
            <p className="metric-value" style={{ color: '#059669' }}>{mine.length}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Earnings</p>
            <p className="metric-value" style={{ color: '#0f172a' }}>₹{totalEarnings}</p>
          </div>
        </div>
      </header>

      {/* Dynamic Tab Content */}
      <main className="app-content">
        {activeTab === 'available' && (
          <section>
            <div className="section-header">
              <h2 className="section-title">
                <span>Available Pickups</span>
                <span className="badge-count">{available.length}</span>
              </h2>
              <button 
                onClick={refreshOrders} 
                style={{ background: 'transparent', color: '#059669', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                <i className="fas fa-rotate"></i> Refresh
              </button>
            </div>
            
            <div className="orders-list">
              {available.length > 0 ? (
                available.map((o) => renderOrderCard(o, 'available'))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon"><i className="fas fa-inbox"></i></div>
                  <h3>No Orders Available Right Now</h3>
                  <p>Stay online! New pickup orders from Vrindavan Mart will appear here automatically.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'active' && (
          <section>
            <div className="section-header">
              <h2 className="section-title">
                <span>My Active Deliveries</span>
                <span className="badge-count">{mine.length}</span>
              </h2>
            </div>
            
            <div className="orders-list">
              {mine.length > 0 ? (
                mine.map((o) => renderOrderCard(o, 'active'))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon"><i className="fas fa-motorcycle"></i></div>
                  <h3>No Active Deliveries</h3>
                  <p>Switch to the "Available" tab to accept and start new deliveries.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'completed' && (
          <section>
            <div className="section-header">
              <h2 className="section-title">
                <span>Delivered History</span>
                <span className="badge-count">{completed.length}</span>
              </h2>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#059669' }}>Total: ₹{totalEarnings}</span>
            </div>
            
            <div className="orders-list">
              {completed.length > 0 ? (
                completed.map((o) => renderOrderCard(o, 'completed'))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon"><i className="fas fa-receipt"></i></div>
                  <h3>No Completed Deliveries Yet</h3>
                  <p>Completed orders and payouts for this shift will be listed here.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'profile' && (
          <section>
            <div className="section-header">
              <h2 className="section-title">Partner Profile & Shift</h2>
            </div>

            <div className="order-card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div className="partner-avatar" style={{ width: '56px', height: '56px', fontSize: '20px' }}>
                  {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'VP'}
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800 }}>{profile?.name || 'Partner'}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Phone: {profile?.phone || 'N/A'}</p>
                  <p style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                    <i className="fas fa-shield-check"></i> Verified Delivery Agent
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>VEHICLE TYPE</span>
                  <p style={{ fontWeight: 800, fontSize: '14px', marginTop: '2px' }}>{profile?.vehicleType || 'Two Wheeler'}</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>VEHICLE NO.</span>
                  <p style={{ fontWeight: 800, fontSize: '14px', marginTop: '2px' }}>{profile?.vehicleNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="order-card" style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>Quick Support & Shift Actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={toggleOnline} 
                  className="btn-action-secondary" 
                  style={{ justifyContent: 'center' }}
                >
                  <i className={`fas fa-circle ${profile?.isOnline ? 'text-green-500' : 'text-gray-400'}`}></i> 
                  {profile?.isOnline ? 'Go Offline' : 'Go Online'}
                </button>
                <a 
                  href="tel:+919876543210" 
                  className="btn-action-secondary" 
                  style={{ justifyContent: 'center' }}
                >
                  <i className="fas fa-headset"></i> Call Dispatch Support
                </a>
              </div>
            </div>

            <button 
              onClick={() => {
                localStorage.removeItem('delivery_token');
                localStorage.removeItem('delivery_refresh_token');
                setToken('');
              }}
              style={{ width: '100%', padding: '14px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
            >
              <i className="fas fa-arrow-right-from-bracket mr-2"></i> End Shift & Sign Out
            </button>
          </section>
        )}
      </main>

      {/* Bottom App Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-tab ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          {available.length > 0 && <span className="tab-badge">{available.length}</span>}
          <i className="fas fa-inbox"></i>
          <span>Pickups</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          {mine.length > 0 && <span className="tab-badge" style={{ background: '#059669' }}>{mine.length}</span>}
          <i className="fas fa-motorcycle"></i>
          <span>Active</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <i className="fas fa-wallet"></i>
          <span>Earnings</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </button>
      </nav>

      {/* Customer Delivery PIN Verification Modal */}
      {verifyingOrder && (
        <div className="modal-overlay" onClick={() => setVerifyingOrder(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 800, fontSize: '15px' }}>
                <i className="fas fa-shield-halved"></i>
                <span>Customer Verification</span>
              </div>
              <button 
                onClick={() => setVerifyingOrder(null)} 
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer' }}
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4', marginBottom: '16px' }}>
              Ask the customer for the 4-digit PIN code displayed on their tracking screen to complete order <b>#{verifyingOrder.orderNo}</b>.
            </p>

            <div className="pin-inputs-row">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`deliv-pin-${idx}`}
                  type="tel"
                  maxLength={1}
                  className="pin-box"
                  value={pinDigits[idx]}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(idx, e)}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn-action-secondary" 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={() => setVerifyingOrder(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-action-primary" 
                style={{ flex: 2, justifyContent: 'center' }} 
                onClick={submitDeliveryPin}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Verifying...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> Complete Delivery
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
