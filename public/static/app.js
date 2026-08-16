// ============================================================
// App bootstrap - route registration & global event bindings
// ============================================================
;(function () {
  document.body.insertAdjacentHTML('beforeend', '<div id="toast-container" class="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center"></div>')

  // Update header badges whenever store state changes
  function updateBadges() {
    const cartBadge = document.getElementById('cart-badge')
    if (cartBadge) {
      if (Store.state.cartCount > 0) {
        cartBadge.textContent = Store.state.cartCount > 99 ? '99+' : Store.state.cartCount
        cartBadge.classList.remove('hidden')
      } else {
        cartBadge.classList.add('hidden')
      }
    }
    const notifBadge = document.getElementById('notif-badge')
    if (notifBadge) {
      if (Store.state.unreadNotifications > 0) {
        notifBadge.textContent = Store.state.unreadNotifications > 99 ? '99+' : Store.state.unreadNotifications
        notifBadge.classList.remove('hidden')
      } else {
        notifBadge.classList.add('hidden')
      }
    }
  }
  Store.on('cart-change', updateBadges)
  Store.on('notif-change', updateBadges)

  // Re-render badges after every route change (header gets rebuilt each page)
  window.addEventListener('hashchange', () => setTimeout(updateBadges, 30))

  // Global delegated click handlers for buttons rendered across pages
  document.addEventListener('click', (e) => {
    const backBtn = e.target.closest('[data-action="go-back"]')
    if (backBtn) {
      if (window.history.length > 1) window.history.back()
      else Router.navigate('/')
    }
  })

  // ---- Register routes ----
  Router.add('/', HomePage.render)
  Router.add('/login', AuthPage.render)
  Router.add('/categories', CategoriesPage.render)
  Router.add('/categories/:slug', CategoryDetailPage.render)
  Router.add('/category/:slug', CategoryDetailPage.render)
  Router.add('/search', SearchPage.render)
  Router.add('/product/:slug', ProductPage.render)
  Router.add('/products/:slug', ProductPage.render)
  Router.add('/cart', CartPage.render)
  Router.add('/checkout', CheckoutPage.render)
  Router.add('/order-success/:id', OrderSuccessPage.render)
  Router.add('/orders', OrdersListPage.render)
  Router.add('/order/:id', OrderTrackingPage.render)
  Router.add('/wishlist', WishlistPage.render)
  Router.add('/notifications', NotificationsPage.render)
  Router.add('/profile', ProfilePage.render)
  Router.add('/addresses', AddressesPage.render)
  Router.add('/coupons', CouponsPage.render)

  // ---- Bootstrap ----
  async function boot() {
    if (Store.isLoggedIn()) {
      try {
        const { data } = await Api.me()
        Store.setUser(data.user)
        await Promise.all([Store.refreshCart(), Store.refreshWishlist(), Store.refreshNotifications()])
        Realtime.connect()
      } catch (e) {
        Api.setToken(null)
        Store.setUser(null)
        Realtime.disconnect()
      }
    }
    Router.start()
    setTimeout(updateBadges, 50)
  }

  boot()
})()
