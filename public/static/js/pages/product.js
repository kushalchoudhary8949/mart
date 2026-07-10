// ============================================================
// Product detail page
// ============================================================
const ProductPage = (() => {
  let currentProduct = null

  async function render(params) {
    document.getElementById('app').innerHTML = `
      ${Components.header(true, '')}
      <main class="max-w-5xl mx-auto pb-28 page-fade" id="product-container">
        ${UI.loadingSpinner('text-3xl')}
      </main>
      <div id="product-sticky-bar" class="hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg px-4 py-3 z-30">
        <div class="max-w-5xl mx-auto flex items-center gap-3">
          <div class="flex items-center border border-gray-200 rounded-full overflow-hidden" id="qty-control">
            <button class="w-9 h-9 text-gray-600" data-action="qty-minus">-</button>
            <span class="w-8 text-center font-semibold text-sm" id="qty-value">1</span>
            <button class="w-9 h-9 text-gray-600" data-action="qty-plus">+</button>
          </div>
          <button id="add-to-cart-sticky" class="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-full text-sm">
            Add to Cart
          </button>
        </div>
      </div>
    `

    try {
      const { data } = await Api.getProduct(params.slug)
      currentProduct = data.product
      renderProduct(data.product, data.related)
    } catch (e) {
      document.getElementById('product-container').innerHTML = UI.emptyState('fa-triangle-exclamation', 'Product not found', Api.errMsg(e),
        `<a href="#/" class="bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Go Home</a>`)
    }
  }

  function renderProduct(p, related) {
    const discount = UI.discountPercent(p.price, p.mrp)
    const inWishlist = Store.state.wishlistIds.has(p.id)
    const outOfStock = p.stock <= 0

    document.getElementById('product-container').innerHTML = `
      <div class="bg-white">
        <div class="relative aspect-square max-w-md mx-auto bg-gray-50">
          <img src="${p.image}" alt="${UI.escapeHtml(p.name)}" class="w-full h-full object-cover" />
          ${discount > 0 ? `<span class="absolute top-3 left-3 bg-accent-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">${discount}% OFF</span>` : ''}
          <button data-action="toggle-wishlist-detail" class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center ${inWishlist ? 'text-red-500' : 'text-gray-400'}">
            <i class="${inWishlist ? 'fas' : 'far'} fa-heart"></i>
          </button>
        </div>
      </div>
      <div class="px-4 py-4">
        <p class="text-xs font-semibold text-brand-600 uppercase mb-1"><a href="#/category/${p.category_slug}">${p.category_name}</a></p>
        <h1 class="text-xl font-bold text-gray-800 mb-1">${UI.escapeHtml(p.name)}</h1>
        <p class="text-sm text-gray-400 mb-2">${p.unit}</p>
        <div class="flex items-center gap-1 mb-3">
          ${UI.starRating(p.rating)}
          <span class="text-sm text-gray-500 ml-1">${p.rating} (${p.rating_count} reviews)</span>
        </div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-2xl font-extrabold text-gray-900">${UI.money(p.price)}</span>
          ${p.mrp > p.price ? `<span class="text-sm text-gray-400 line-through">${UI.money(p.mrp)}</span>` : ''}
        </div>
        <p class="text-xs ${outOfStock ? 'text-red-500' : 'text-brand-600'} font-medium mb-4">
          <i class="fas ${outOfStock ? 'fa-circle-xmark' : 'fa-circle-check'} mr-1"></i>
          ${outOfStock ? 'Out of stock' : `In stock (${p.stock} available)`}
        </p>

        <div class="border-t border-gray-100 pt-4 mb-4">
          <h3 class="font-semibold text-gray-800 mb-1.5">Product Description</h3>
          <p class="text-sm text-gray-600 leading-relaxed">${UI.escapeHtml(p.description || 'No description available.')}</p>
        </div>

        <div class="border-t border-gray-100 pt-4 mb-2">
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="bg-gray-50 rounded-xl py-3">
              <i class="fas fa-truck-fast text-brand-500 mb-1"></i>
              <p class="text-[11px] text-gray-500">Fast Delivery</p>
            </div>
            <div class="bg-gray-50 rounded-xl py-3">
              <i class="fas fa-leaf text-brand-500 mb-1"></i>
              <p class="text-[11px] text-gray-500">100% Fresh</p>
            </div>
            <div class="bg-gray-50 rounded-xl py-3">
              <i class="fas fa-rotate-left text-brand-500 mb-1"></i>
              <p class="text-[11px] text-gray-500">Easy Returns</p>
            </div>
          </div>
        </div>
      </div>

      ${related && related.length ? `
      <div class="px-4 pt-4 border-t border-gray-100">
        <h3 class="font-bold text-gray-800 mb-3">You may also like</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3" id="related-products">
          ${related.map((rp) => Components.productCard({ ...rp, stock: rp.stock ?? 50, rating_count: rp.rating_count ?? 0 })).join('')}
        </div>
      </div>` : ''}
    `

    if (related && related.length) {
      HomePage.bindProductCardActions(document.getElementById('related-products'))
    }

    document.querySelector('[data-action="toggle-wishlist-detail"]').addEventListener('click', async (e) => {
      await Actions.toggleWishlist(p.id, e.currentTarget)
    })

    // Sticky add-to-cart bar with quantity control
    const stickyBar = document.getElementById('product-sticky-bar')
    if (!outOfStock) {
      stickyBar.classList.remove('hidden')
      let qty = 1
      const qtyValueEl = document.getElementById('qty-value')
      document.querySelector('[data-action="qty-minus"]').addEventListener('click', () => {
        qty = Math.max(1, qty - 1)
        qtyValueEl.textContent = qty
      })
      document.querySelector('[data-action="qty-plus"]').addEventListener('click', () => {
        qty = Math.min(p.stock, qty + 1)
        qtyValueEl.textContent = qty
      })
      document.getElementById('add-to-cart-sticky').addEventListener('click', async () => {
        await Actions.addToCart(p.id, qty)
      })
    }
  }

  return { render }
})()
