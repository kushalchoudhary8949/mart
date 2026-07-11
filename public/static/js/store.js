// ============================================================
// Global app state store (simple pub/sub) + UI helpers
// ============================================================
const Store = (() => {
  const state = {
    user: JSON.parse(localStorage.getItem('fc_user') || 'null'),
    cartCount: 0,
    cartSubtotal: 0,
    wishlistIds: new Set(),
    unreadNotifications: 0,
    categories: []
  }

  const listeners = {}
  function on(event, cb) {
    listeners[event] = listeners[event] || []
    listeners[event].push(cb)
  }
  function emit(event, payload) {
    (listeners[event] || []).forEach((cb) => cb(payload))
  }

  function setUser(user) {
    state.user = user
    if (user) localStorage.setItem('fc_user', JSON.stringify(user))
    else localStorage.removeItem('fc_user')
    emit('auth-change', user)
  }

  function isLoggedIn() {
    return !!state.user && !!Api.getToken()
  }

  function setCart(items, subtotal) {
    state.cartCount = (items || []).reduce((s, i) => s + i.quantity, 0)
    state.cartSubtotal = subtotal || 0
    emit('cart-change', { count: state.cartCount, subtotal: state.cartSubtotal })
  }

  function setWishlistIds(ids) {
    state.wishlistIds = new Set(ids)
    emit('wishlist-change', state.wishlistIds)
  }

  function toggleWishlistId(id, inWishlist) {
    if (inWishlist) state.wishlistIds.add(id)
    else state.wishlistIds.delete(id)
    emit('wishlist-change', state.wishlistIds)
  }

  function setUnread(count) {
    state.unreadNotifications = count
    emit('notif-change', count)
  }

  async function refreshCart() {
    if (!isLoggedIn()) return setCart([], 0)
    try {
      const { data } = await Api.getCart()
      setCart(data.items, data.subtotal)
    } catch (e) { /* silent */ }
  }

  async function refreshWishlist() {
    if (!isLoggedIn()) return setWishlistIds([])
    try {
      const { data } = await Api.getWishlist()
      setWishlistIds(data.items.map((i) => i.id))
    } catch (e) { /* silent */ }
  }

  async function refreshNotifications() {
    if (!isLoggedIn()) return setUnread(0)
    try {
      const { data } = await Api.getNotifications()
      setUnread(data.unread_count)
      return data.notifications
    } catch (e) { return [] }
  }

  async function refreshCategories() {
    if (state.categories.length) return state.categories
    try {
      const { data } = await Api.getCategories()
      state.categories = data.categories
      return state.categories
    } catch (e) { return [] }
  }

  return {
    state, on, emit,
    setUser, isLoggedIn,
    setCart, refreshCart,
    setWishlistIds, toggleWishlistId, refreshWishlist,
    setUnread, refreshNotifications,
    refreshCategories
  }
})()

// ============================================================
// UI helper functions
// ============================================================
const UI = (() => {
  function money(n) {
    const v = Number(n || 0)
    return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: v % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })
  }

  function toast(message, type = 'success') {
    const container = document.getElementById('toast-container')
    if (!container) return
    const colors = {
      success: 'bg-brand-600',
      error: 'bg-red-500',
      info: 'bg-gray-800'
    }
    const el = document.createElement('div')
    el.className = `toast-enter ${colors[type] || colors.info} text-white px-4 py-3 rounded-xl shadow-lg mb-2 flex items-center gap-2 max-w-sm text-sm font-medium`
    const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'
    el.innerHTML = `<i class="fas ${icon}"></i><span>${escapeHtml(message)}</span>`
    container.appendChild(el)
    setTimeout(() => {
      el.style.transition = 'opacity 0.3s'
      el.style.opacity = '0'
      setTimeout(() => el.remove(), 300)
    }, 2800)
  }

  function escapeHtml(str) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }

  function starRating(rating) {
    const full = Math.round(rating)
    let html = ''
    for (let i = 0; i < 5; i++) {
      html += `<i class="fas fa-star text-xs ${i < full ? 'text-amber-400' : 'text-gray-300'}"></i>`
    }
    return html
  }

  function discountPercent(price, mrp) {
    if (!mrp || mrp <= price) return 0
    return Math.round(((mrp - price) / mrp) * 100)
  }

  function timeAgo(dateStr) {
    const d = new Date(dateStr.replace(' ', 'T') + 'Z')
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diffSec < 60) return 'Just now'
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
    return `${Math.floor(diffSec / 86400)}d ago`
  }

  function formatDateTime(dateStr) {
    const d = new Date(dateStr.replace(' ', 'T') + 'Z')
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  function loadingSpinner(size = 'text-2xl') {
    return `<div class="flex justify-center items-center py-12"><i class="fas fa-spinner fa-spin ${size} text-brand-500"></i></div>`
  }

  function emptyState(icon, title, subtitle, actionHtml = '') {
    return `
      <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <i class="fas ${icon} text-3xl text-gray-400"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-1">${title}</h3>
        <p class="text-sm text-gray-500 mb-4">${subtitle}</p>
        ${actionHtml}
      </div>
    `
  }

  function errorState(title, subtitle, onRetryAction) {
    return `
      <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div class="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
          <i class="fas fa-triangle-exclamation text-3xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-1">${title}</h3>
        <p class="text-sm text-gray-500 mb-6">${subtitle}</p>
        <button onclick="${onRetryAction}" class="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-md">
          <i class="fas fa-arrows-rotate mr-1.5"></i>Retry
        </button>
      </div>
    `
  }

  return { money, toast, escapeHtml, starRating, discountPercent, timeAgo, formatDateTime, loadingSpinner, emptyState, errorState }
})()
