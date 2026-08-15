// ============================================================
// Reusable UI components (return HTML strings)
// ============================================================
const Components = (() => {
  function header(showBack = false, title = '') {
    return `
    <header class="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        ${showBack ? `
          <button data-action="go-back" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700">
            <i class="fas fa-arrow-left"></i>
          </button>
        ` : `
          <a href="#/" class="flex items-center gap-2 shrink-0">
            <div class="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white text-lg">🛒</div>
            <span class="font-extrabold text-lg text-brand-700 hidden sm:inline">FreshCart</span>
          </a>
        `}
        ${title ? `<h1 class="font-semibold text-lg text-gray-800 truncate">${title}</h1>` : `
        <div class="flex-1 relative">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input id="global-search" type="text" placeholder="Search for groceries, fruits, snacks..."
            class="w-full bg-gray-100 rounded-full py-2.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-brand-400" autocomplete="off" />
        </div>
        `}
        <div class="flex items-center gap-1 shrink-0">
          <a href="#/notifications" class="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700">
            <i class="fas fa-bell"></i>
            <span id="notif-badge" class="hidden absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"></span>
          </a>
          <a href="#/cart" class="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700">
            <i class="fas fa-cart-shopping"></i>
            <span id="cart-badge" class="hidden absolute -top-0.5 -right-0.5 bg-brand-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"></span>
          </a>
        </div>
      </div>
    </header>`
  }

  function bottomNav(active) {
    const items = [
      { key: 'home', href: '#/', icon: 'fa-house', label: 'Home' },
      { key: 'categories', href: '#/categories', icon: 'fa-border-all', label: 'Categories' },
      { key: 'wishlist', href: '#/wishlist', icon: 'fa-heart', label: 'Wishlist' },
      { key: 'orders', href: '#/orders', icon: 'fa-receipt', label: 'Orders' },
      { key: 'profile', href: '#/profile', icon: 'fa-user', label: 'Profile' }
    ]
    return `
    <nav class="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <div class="max-w-5xl mx-auto grid grid-cols-5">
        ${items.map((it) => `
          <a href="${it.href}" class="flex flex-col items-center justify-center py-2.5 gap-0.5 ${active === it.key ? 'text-brand-600' : 'text-gray-400'}">
            <i class="fas ${it.icon} text-lg"></i>
            <span class="text-[11px] font-medium">${it.label}</span>
          </a>
        `).join('')}
      </div>
    </nav>`
  }

  function productCard(p) {
    if (!p) return ''
    const price = Number(p.price || 0)
    const mrp = Number(p.mrp || 0)
    const discount = UI.discountPercent(price, mrp)
    const inWishlist = Boolean(Store?.state?.wishlistIds?.has && Store.state.wishlistIds.has(p.id))
    const outOfStock = (p.stock !== undefined && p.stock !== null) ? Number(p.stock) <= 0 : false
    const imgUrl = UI.resolveProductImage(p)
    const name = UI.escapeHtml(p.name || '')
    const unit = UI.escapeHtml(p.unit || '')
    const rating = Number(p.rating || 0)
    const ratingCount = Number(p.rating_count || p.ratingCount || 0)
    const slug = p.slug || ''
    const id = p.id || 0

    return `
    <div class="product-card bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow relative group" data-product-id="${id}">
      <a href="#/product/${slug}" class="block">
        <div class="relative aspect-square rounded-t-2xl overflow-hidden bg-gray-50">
          <img src="${imgUrl}" alt="${name}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.onerror=null; this.src=UI.placeholderImage" />
          ${discount > 0 ? `<span class="absolute top-2 left-2 bg-accent-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">${discount}% OFF</span>` : ''}
          ${outOfStock ? `<div class="absolute inset-0 bg-white/70 flex items-center justify-center"><span class="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded">Out of Stock</span></div>` : ''}
        </div>
      </a>
      <button data-action="toggle-wishlist" data-id="${id}" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-sm ${inWishlist ? 'text-red-500' : 'text-gray-400'}">
        <i class="${inWishlist ? 'fas' : 'far'} fa-heart"></i>
      </button>
      <div class="p-3">
        <a href="#/product/${slug}" class="block">
          <p class="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-1">${name}</p>
          <p class="text-xs text-gray-400 mb-1">${unit}</p>
          <div class="flex items-center gap-1 mb-1.5">${UI.starRating(rating)}<span class="text-[11px] text-gray-400">(${ratingCount})</span></div>
        </a>
        <div class="flex items-center justify-between">
          <div>
            <span class="font-bold text-gray-900 text-sm">${UI.money(price)}</span>
            ${mrp > price ? `<span class="text-xs text-gray-400 line-through ml-1">${UI.money(mrp)}</span>` : ''}
          </div>
        </div>
        <div class="mt-2">
          ${outOfStock
            ? `<button disabled class="w-full bg-gray-200 text-gray-400 text-xs font-semibold py-2 rounded-lg cursor-not-allowed">Unavailable</button>`
            : `<button data-action="add-to-cart" data-id="${id}" class="w-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                <i class="fas fa-plus mr-1"></i>Add to Cart
              </button>`
          }
        </div>
      </div>
    </div>`
  }

  function productCardSkeleton() {
    return `
    <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div class="aspect-square skeleton"></div>
      <div class="p-3 space-y-2">
        <div class="h-3 skeleton rounded w-full"></div>
        <div class="h-3 skeleton rounded w-2/3"></div>
        <div class="h-8 skeleton rounded-lg w-full mt-2"></div>
      </div>
    </div>`
  }

  function categoryChip(cat, active = false) {
    return `
    <a href="#/category/${cat.slug}" class="flex flex-col items-center gap-1.5 shrink-0 ${active ? 'text-brand-600' : 'text-gray-600'}">
      <div class="w-16 h-16 rounded-2xl ${active ? 'bg-brand-100 border-2 border-brand-500' : 'bg-brand-50'} flex items-center justify-center text-2xl text-brand-600">
        <i class="fas ${cat.icon || 'fa-basket-shopping'}"></i>
      </div>
      <span class="text-xs font-medium text-center max-w-[70px] leading-tight">${cat.name}</span>
    </a>`
  }

  function requireLoginPrompt(message = 'Please login to continue') {
    return UI.emptyState('fa-lock', 'Login Required', message,
      `<a href="#/login" class="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Login / Sign Up</a>`)
  }

  return { header, bottomNav, productCard, productCardSkeleton, categoryChip, requireLoginPrompt }
})()
window.Components = Components
