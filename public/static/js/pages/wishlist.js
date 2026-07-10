// ============================================================
// Wishlist page
// ============================================================
const WishlistPage = (() => {
  async function render() {
    document.getElementById('app').innerHTML = `
      ${Components.header(false, 'My Wishlist')}
      <main class="max-w-5xl mx-auto pb-24 px-4 pt-4 page-fade">
        ${Store.isLoggedIn() ? `<div id="wishlist-grid" class="grid grid-cols-2 sm:grid-cols-3 gap-3">${Array.from({ length: 4 }).map(() => Components.productCardSkeleton()).join('')}</div>` : Components.requireLoginPrompt('Please login to view your wishlist')}
      </main>
      ${Components.bottomNav('wishlist')}
    `

    if (!Store.isLoggedIn()) return

    try {
      const { data } = await Api.getWishlist()
      const container = document.getElementById('wishlist-grid')
      Store.setWishlistIds(data.items.map((i) => i.id))
      if (!data.items.length) {
        container.className = ''
        container.innerHTML = UI.emptyState('fa-heart', 'Your wishlist is empty', 'Save items you love for later.',
          `<a href="#/" class="bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Explore Products</a>`)
        return
      }
      container.innerHTML = data.items.map((p) => Components.productCard({ ...p, rating_count: p.rating_count || 0 })).join('')
      HomePage.bindProductCardActions(container)
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
    }
  }
  return { render }
})()
