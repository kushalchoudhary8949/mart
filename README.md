# FreshCart — Grocery Mart Web App

## Project Overview
- **Name**: FreshCart
- **Goal**: A full-stack online grocery shopping application (customer-facing) with browsing, cart, coupons, checkout and live order tracking.
- **Stack**: Hono (TypeScript) on Cloudflare Workers/Pages + Cloudflare D1 (SQLite) + Vanilla JS SPA frontend (no framework, no build step for the UI) + Tailwind CSS (CDN) + Font Awesome.

## Features Implemented ✅
- **Sign Up / Login (OTP)** — Phone-number based OTP authentication. `POST /api/auth/otp/request` generates a 6-digit OTP (5 min expiry, 5 attempt limit) and `POST /api/auth/otp/verify` verifies it, auto-creates the user on first login, and issues a 30-day bearer session token.
  - ⚠️ No real SMS gateway is wired up — the OTP is returned in the response as `debug_otp` for demo/testing. To go live, plug in Twilio/MSG91/etc. inside `src/routes/auth.ts` and remove `debug_otp` from the response.
- **Search products** — Debounced live search (`GET /api/products?q=`) across name & description, with sort (price/rating/name) and pagination.
- **Categories** — 10 seeded categories (Fruits & Vegetables, Dairy & Eggs, Bakery, Beverages, Snacks, Staples & Grains, Meat & Seafood, Personal Care, Household, Frozen Foods), category listing and category-filtered product grid.
- **Product details** — Full detail page: images, price/MRP/discount, rating, stock, description, related products, sticky add-to-cart bar with quantity stepper.
- **Add to cart** — Persistent server-side cart (D1) with quantity update / remove / clear, live badge count in header.
- **Coupons** — 4 seeded coupons (`WELCOME50`, `SAVE10`, `FRESH20`, `FLAT100`). Coupon browsing modal, code validation against min order value / expiry / usage limit, applied at checkout.
- **Checkout** — Address selection (saved addresses, add-new-address modal), payment method choice (COD / UPI / Card — simulated, no real gateway), order summary with discount + delivery fee (free above ₹499) calculation, places the order and clears the cart.
- **Live order tracking** — `GET /api/orders/:id/track` computes order status (`placed → confirmed → preparing → out_for_delivery → delivered`) deterministically from elapsed time vs the order's ETA (20–45 min, randomized at checkout). The tracking page polls every 8s, animates a progress bar + timeline, and persists status transitions + fires notifications server-side the first time each status is reached. Orders can be cancelled while not yet "out for delivery".
- **Notifications** — In-app notification center (order updates + promo/welcome messages) with unread badge in the header, mark-as-read / mark-all-as-read.
- **Order history** — Full list of past orders with live-computed status chips, tap-through to tracking, "Reorder" (re-adds items to cart) and "Cancel" actions.
- **Wishlist** — Heart-toggle on every product card / detail page, dedicated wishlist page.

## API Endpoints Summary

| Method & Path | Auth | Description |
|---|---|---|
| `POST /api/auth/otp/request` | – | Body: `{phone, purpose}`. Sends OTP (returned as `debug_otp` in demo). |
| `POST /api/auth/otp/verify` | – | Body: `{phone, code, name?}`. Verifies OTP, returns `{token, user}`. |
| `GET /api/auth/me` | ✅ | Current user. |
| `PUT /api/auth/profile` | ✅ | Body: `{name?, email?}`. |
| `POST /api/auth/logout` | – | Invalidates the bearer token. |
| `GET /api/categories` | – | List categories. |
| `GET /api/categories/:slug` | – | Category detail. |
| `GET /api/products` | – | Query: `q, category, featured, sort(price_asc/price_desc/rating/name/newest), page, limit`. |
| `GET /api/products/:slug` | – | Product detail + related products. |
| `GET /api/cart` | ✅ | Current cart. |
| `POST /api/cart` | ✅ | Body: `{product_id, quantity}`. |
| `PUT /api/cart/:productId` | ✅ | Body: `{quantity}` (0 removes). |
| `DELETE /api/cart/:productId` / `DELETE /api/cart` | ✅ | Remove item / clear cart. |
| `GET /api/wishlist`, `POST /api/wishlist`, `DELETE /api/wishlist/:productId` | ✅ | Wishlist CRUD. |
| `GET /api/coupons` | – | Active coupons for display. |
| `POST /api/coupons/validate` | ✅ | Body: `{code, subtotal}`. |
| `POST /api/orders/checkout` | ✅ | Body: `{address_id? / address_text, coupon_code?, payment_method}`. |
| `GET /api/orders` | ✅ | Order history (with live-computed status). |
| `GET /api/orders/:id` | ✅ | Order detail + items. |
| `GET /api/orders/:id/track` | ✅ | Live tracking (status, progress %, ETA, timeline). |
| `POST /api/orders/:id/cancel` | ✅ | Cancel (only before "out for delivery"). |
| `POST /api/orders/:id/reorder` | ✅ | Re-add past order items to cart. |
| `GET /api/notifications`, `POST /api/notifications/:id/read`, `POST /api/notifications/read-all` | ✅ | Notification center. |
| `GET /api/addresses`, `POST /api/addresses`, `DELETE /api/addresses/:id` | ✅ | Saved delivery addresses. |

All `✅` routes require header `Authorization: Bearer <token>`.

## Data Architecture
- **Storage**: Cloudflare D1 (SQLite). Schema in `migrations/0001_initial_schema.sql`, seed data in `seed.sql`.
- **Tables**: `users`, `otp_codes`, `sessions`, `categories`, `products`, `cart_items`, `wishlist_items`, `coupons`, `addresses`, `orders`, `order_items`, `order_status_history`, `notifications`.
- **Auth model**: Custom OTP + bearer-token sessions stored in D1 (not JWT) — simple, revocable, no extra secret management needed.
- **Live tracking model**: No websockets/background jobs (not available on Cloudflare Pages). Status is derived from `now() - placed_at` vs `eta_minutes` on every `/track` call, and persisted + notified the first time a new status is crossed. The frontend polls every 8s while the tracking page is open.

## Project Structure
```
src/
  index.tsx            # Hono app entry, mounts routes, serves SPA shell + static files
  types.ts             # Shared Bindings/AppEnv types
  lib/
    auth.ts            # requireAuth middleware (bearer token -> userId)
    utils.ts           # OTP/token/order-no generators, phone validation
    orderStatus.ts      # Time-based order status computation
  routes/
    auth.ts, products.ts, cart.ts, wishlist.ts, coupons.ts, orders.ts, notifications.ts, addresses.ts
migrations/0001_initial_schema.sql
seed.sql
public/
  static/style.css
  static/app.js               # Boot: route registration, badge updates
  static/js/api.js            # Axios wrapper + auth header injection
  static/js/store.js          # Global pub/sub state + UI helpers (toast, money, star rating...)
  static/js/router.js         # Hash-based SPA router
  static/js/components.js     # Header, bottom nav, product card, category chip (HTML string components)
  static/js/actions.js        # Shared add-to-cart / toggle-wishlist logic
  static/js/pages/*.js        # One file per page (home, auth, categories, search, product, cart, checkout, order-tracking, orders-list, wishlist, notifications, profile, addresses, coupons)
```

## User Guide
1. Open the app → tap **Login / Sign Up**, enter a 10-digit phone number, tap **Send OTP**.
2. In demo mode the OTP is shown directly on screen (no SMS gateway configured) — enter it and optionally your name, then **Verify & Continue**.
3. Browse categories on Home, or use the search bar (header) / **Search** to find products.
4. Tap a product for details, or use **Add to Cart** directly on a product card. Use the heart icon to add to **Wishlist**.
5. Open **Cart** (top-right icon) to adjust quantities, apply a coupon (try `WELCOME50`, `SAVE10`, `FRESH20`, `FLAT100`), then **Proceed to Checkout**.
6. Add a delivery address, choose a payment method, and **Place Order**.
7. You'll land on **Track Order** — status auto-advances over the ETA window (20–45 min) and you'll get **Notifications** at each step (bell icon). Orders can be cancelled early or reordered from **My Orders**.

## Local Development
```bash
npm install
npm run build
npm run db:migrate:local     # apply D1 schema locally
npm run db:seed              # seed categories/products/coupons
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/health
```

## Deployment
- **Platform**: Cloudflare Pages (Workers + D1)
- **Status**: ✅ Running locally in sandbox (D1 local mode). Not yet deployed to a public Cloudflare Pages URL — ask to deploy when ready (requires a Cloudflare API token / hosted deploy path).
- **Tech Stack**: Hono 4 + TypeScript + Cloudflare D1 + Vanilla JS SPA + Tailwind CSS (CDN) + Font Awesome + Axios + Day.js
- **Last Updated**: 2026-07-10

## Not Yet Implemented / Next Steps
- Real SMS gateway integration for OTP (currently returns OTP in API response for demo purposes only — must be replaced before production use).
- Real payment gateway integration (Stripe/Razorpay) — checkout currently simulates COD/UPI/Card without processing actual payments.
- Admin/merchant panel for managing products, categories, orders, and coupons (this build covers the **customer panel** only, as requested).
- Product reviews/ratings submission (ratings are currently seeded/static, not user-submitted).
- Real-time push notifications (currently in-app notification center only, polled — no browser push/SMS/email).
- Map-based address picker / geolocation (addresses are currently free-text).
