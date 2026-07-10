// ============================================================
// Home page - categories, featured products, banner
// ============================================================
const HomePage = (() => {
  async function render() {
    document.getElementById('app').innerHTML = `
      ${Components.header()}
      <main class="max-w-5xl mx-auto pb-24 page-fade">
        <!-- Hero banner -->
        <div class="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white p-5 relative overflow-hidden">
          <div class="relative z-10 max-w-[70%]">
            <p class="text-xs font-semibold uppercase tracking-wide text-brand-100 mb-1">Limited Time Offer</p>
            <h2 class="text-xl font-extrabold leading-snug mb-2">Get 20% OFF on your first order!</h2>
            <p class="text-xs text-brand-50 mb-3">Use code <span class="font-bold bg-white/20 px-1.5 py-0.5 rounded">WELCOME50</span></p>
            <a href="#/categories" class="inline-block bg-white text-brand-700 text-xs font-bold px-4 py-2 rounded-full">Shop Now</a>
          </div>
          <div class="absolute -right-4 -bottom-4 text-8xl opacity-20">🛒</div>
        </div>

        <!-- Categories -->
        <section class="mt-6 px-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-800">Shop by Category</h3>
            <a href="#/categories" class="text-xs font-semibold text-brand-600">See all</a>
          </div>
          <div id="home-categories" class="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            ${Array.from({ length: 6 }).map(() => `<div class="w-16 h-16 rounded-2xl skeleton shrink-0"></div>`).join('')}
          </div>
        </section>

        <!-- Featured products -->
        <section class="mt-6 px-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-800">Featured Products</h3>
            <a href="#/search?featured=1" class="text-xs font-semibold text-brand-600">See all</a>
          </div>
          <div id="home-featured" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            ${Array.from({ length: 6 }).map(() => Components.productCardSkeleton()).join('')}
          </div>
        </section>

        <!-- All products by top categories -->
        <div id="home-category-sections"></div>
      </main>
      ${Components.bottomNav('home')}
    `

    bindGlobalSearch()

    const [categories] = await Promise.all([Store.refreshCategories()])
    document.getElementById('home-categories').innerHTML = categories
      .slice(0, 10)
      .map((c) => Components.categoryChip(c))
      .join('')

    try {
      const { data } = await Api.getProducts({ featured: 1, limit: 6 })
      const container = document.getElementById('home-featured')
      container.innerHTML = data.products.length
        ? data.products.map((p) => Components.productCard(p)).join('')
        : `<p class="text-sm text-gray-400 col-span-full text-center py-6">No featured products right now.</p>`
      bindProductCardActions(container)
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
    }

    // Show a couple of category sections with products for browsing
    const sectionCategories = categories.slice(0, 4)
    const sectionsContainer = document.getElementById('home-category-sections')
    for (const cat of sectionCategories) {
      const sectionEl = document.createElement('section')
      sectionEl.className = 'mt-6 px-4'
      sectionEl.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-gray-800">${cat.name}</h3>
          <a href="#/category/${cat.slug}" class="text-xs font-semibold text-brand-600">See all</a>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3" id="cat-section-${cat.id}">
          ${Array.from({ length: 3 }).map(() => Components.productCardSkeleton()).join('')}
        </div>
      `
      sectionsContainer.appendChild(sectionEl)

      Api.getProducts({ category: cat.slug, limit: 6 })
        .then(({ data }) => {
          const el = document.getElementById(`cat-section-${cat.id}`)
          if (!el) return
          el.innerHTML = data.products.map((p) => Components.productCard(p)).join('')
          bindProductCardActions(el)
        })
        .catch(() => {})
    }
  }

  function bindGlobalSearch() {
    const searchInput = document.getElementById('global-search')
    if (!searchInput) return
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        Router.navigate('/search?q=' + encodeURIComponent(searchInput.value.trim()))
      }
    })
  }

  function bindProductCardActions(container) {
    container.querySelectorAll('[data-action="add-to-cart"]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault()
        await Actions.addToCart(parseInt(btn.dataset.id, 10))
      })
    })
    container.querySelectorAll('[data-action="toggle-wishlist"]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault()
        await Actions.toggleWishlist(parseInt(btn.dataset.id, 10), btn)
      })
    })
  }

  return { render, bindProductCardActions, bindGlobalSearch }
})()
