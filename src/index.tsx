import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { AppEnv } from './types'

import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import cartRoutes from './routes/cart'
import wishlistRoutes from './routes/wishlist'
import couponRoutes from './routes/coupons'
import orderRoutes from './routes/orders'
import notificationRoutes from './routes/notifications'
import addressRoutes from './routes/addresses'
import adminRoutes from './routes/admin'

const app = new Hono<AppEnv>()

app.use('/api/*', cors())

// Serve static assets (CSS/JS) from public/static
app.use('/static/*', serveStatic({ root: './public' }))

// --- API routes ---
app.route('/api/auth', authRoutes)
app.route('/api', productRoutes) // /api/categories, /api/products
app.route('/api/cart', cartRoutes)
app.route('/api/wishlist', wishlistRoutes)
app.route('/api/coupons', couponRoutes)
app.route('/api/orders', orderRoutes)
app.route('/api/notifications', notificationRoutes)
app.route('/api/addresses', addressRoutes)
app.route('/api/admin', adminRoutes)

app.get('/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }))
app.get('/api/store/info', (c) => c.json({
  name: 'FreshCart Mart',
  logo: '🛒',
  address: '123 Mart Street, Grocery City',
  timings: '6:00 AM - 11:00 PM',
  delivery_fee: 25,
  free_delivery_threshold: 499
}))

// --- SPA shell ---
const HTML_SHELL = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FreshCart - Grocery Mart</title>
  <meta name="description" content="FreshCart - Online grocery shopping with fast delivery" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛒</text></svg>" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link href="/static/style.css" rel="stylesheet" />
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Poppins', 'sans-serif'] },
          colors: {
            brand: {
              50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
              400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
              800: '#166534', 900: '#14532d'
            },
            accent: { 500: '#f97316', 600: '#ea580c' }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-gray-50 font-sans text-gray-800">
  <div id="app"></div>

  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>

  <!-- App scripts: order matters, each defines a global object used by later scripts -->
  <script src="/static/js/api.js"></script>
  <script src="/static/js/store.js"></script>
  <script src="/static/js/router.js"></script>
  <script src="/static/js/components.js"></script>
  <script src="/static/js/actions.js"></script>
  <script src="/static/js/pages/home.js"></script>
  <script src="/static/js/pages/auth.js"></script>
  <script src="/static/js/pages/categories.js"></script>
  <script src="/static/js/pages/search.js"></script>
  <script src="/static/js/pages/product.js"></script>
  <script src="/static/js/pages/cart.js"></script>
  <script src="/static/js/pages/checkout.js"></script>
  <script src="/static/js/pages/order-tracking.js"></script>
  <script src="/static/js/pages/orders-list.js"></script>
  <script src="/static/js/pages/wishlist.js"></script>
  <script src="/static/js/pages/notifications.js"></script>
  <script src="/static/js/pages/profile.js"></script>
  <script src="/static/js/pages/addresses.js"></script>
  <script src="/static/js/pages/coupons.js"></script>
  <script src="/static/app.js"></script>
</body>
</html>`

// Catch-all: serve the SPA shell for any non-API route (client-side routing)
app.get('*', (c) => {
  if (c.req.path.startsWith('/api/') || c.req.path.startsWith('/static/')) {
    return c.notFound()
  }
  return c.html(HTML_SHELL)
})

export default app
