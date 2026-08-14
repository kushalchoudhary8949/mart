// ============================================================
// Home page - categories, featured products, banner
// ============================================================
const HomePage = (() => {
  async function render() {
    document.getElementById('app').innerHTML = `
      ${Components.header()}
      <main class="max-w-5xl mx-auto pb-24 page-fade">
        <!-- Dynamic Banners -->
        <div id="home-banners" class="mx-4 mt-4">
          <div class="h-40 rounded-2xl skeleton"></div>
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

    // Fetch and populate banners
    Api.getBanners().then(({ data }) => {
      const bannerContainer = document.getElementById('home-banners')
      if (!bannerContainer) return
      const banners = data.banners || []
      if (banners.length > 0) {
        let activeIdx = 0
        const renderSlider = () => {
          const b = banners[activeIdx]
          const bannerImg = b.image || UI.placeholderImage
          bannerContainer.innerHTML = `
            <div class="rounded-2xl text-white p-5 relative overflow-hidden h-40 flex flex-col justify-center bg-cover bg-center transition-all duration-500 bg-brand-700" 
              style="background-image: linear-gradient(to right, rgba(20, 83, 45, 0.9), rgba(34, 197, 94, 0.7)), url('${bannerImg}')">
              <div class="relative z-10 max-w-[70%]">
                <p class="text-xs font-semibold uppercase tracking-wide text-brand-100 mb-1">${UI.escapeHtml(b.subtitle || '')}</p>
                <h2 class="text-lg font-extrabold leading-snug mb-2 line-clamp-2">${UI.escapeHtml(b.title)}</h2>
                <a href="${b.cta_link || '#/categories'}" class="inline-block bg-white text-brand-700 text-xs font-bold px-4 py-2 rounded-full mt-1">${UI.escapeHtml(b.cta_text || 'Shop Now')}</a>
              </div>
              <div class="absolute bottom-2 right-4 flex gap-1.5 z-20">
                ${banners.map((_, i) => `
                  <button class="w-1.5 h-1.5 rounded-full transition-all ${i === activeIdx ? 'bg-white w-3' : 'bg-white/40'}" data-slide-to="${i}"></button>
                `).join('')}
              </div>
            </div>
          `
          bannerContainer.querySelectorAll('[data-slide-to]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              e.preventDefault()
              activeIdx = parseInt(btn.dataset.slideTo, 10)
              renderSlider()
            })
          })
        }
        renderSlider()
        if (banners.length > 1) {
          const interval = setInterval(() => {
            const el = document.getElementById('home-banners')
            if (!el) {
              clearInterval(interval)
              return
            }
            activeIdx = (activeIdx + 1) % banners.length
            renderSlider()
          }, 5000)
        }
      } else {
        // Fallback default banner
        bannerContainer.innerHTML = `
          <div class="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white p-5 relative overflow-hidden">
            <div class="relative z-10 max-w-[70%]">
              <p class="text-xs font-semibold uppercase tracking-wide text-brand-100 mb-1">Limited Time Offer</p>
              <h2 class="text-xl font-extrabold leading-snug mb-2">Get 20% OFF on your first order!</h2>
              <p class="text-xs text-brand-50 mb-3">Use code <span class="font-bold bg-white/20 px-1.5 py-0.5 rounded">WELCOME50</span></p>
              <a href="#/categories" class="inline-block bg-white text-brand-700 text-xs font-bold px-4 py-2 rounded-full">Shop Now</a>
            </div>
            <div class="absolute -right-4 -bottom-4 text-8xl opacity-20">🛒</div>
          </div>
        `
      }
    }).catch(() => {
      // Fallback on error
      const bannerContainer = document.getElementById('home-banners')
      if (bannerContainer) {
        bannerContainer.innerHTML = `
          <div class="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white p-5 relative overflow-hidden">
            <div class="relative z-10 max-w-[70%]">
              <p class="text-xs font-semibold uppercase tracking-wide text-brand-100 mb-1">Limited Time Offer</p>
              <h2 class="text-xl font-extrabold leading-snug mb-2">Get 20% OFF on your first order!</h2>
              <p class="text-xs text-brand-50 mb-3">Use code <span class="font-bold bg-white/20 px-1.5 py-0.5 rounded">WELCOME50</span></p>
              <a href="#/categories" class="inline-block bg-white text-brand-700 text-xs font-bold px-4 py-2 rounded-full">Shop Now</a>
            </div>
            <div class="absolute -right-4 -bottom-4 text-8xl opacity-20">🛒</div>
          </div>
        `
      }
    })

    let categories
    try {
      categories = await Store.refreshCategories()
      if (!categories || categories.length === 0) {
        throw new Error('No categories found.')
      }
    } catch (e) {
      document.getElementById('app').innerHTML = `
        ${Components.header()}
        <main class="max-w-5xl mx-auto pb-24 px-4 pt-4">
          ${UI.errorState('Failed to load categories', Api.errMsg(e), 'HomePage.render')}
        </main>
        ${Components.bottomNav('home')}
      `
      return
    }

    const categoriesContainer = document.getElementById('home-categories')
    if (categoriesContainer) {
      categoriesContainer.innerHTML = categories
        .slice(0, 10)
        .map((c) => Components.categoryChip(c))
        .join('')
    }

    try {
      const { data } = await Api.getProducts({ featured: 1, limit: 6 })
      const container = document.getElementById('home-featured')
      container.innerHTML = data.products.length
        ? data.products.map((p) => Components.productCard(p)).join('')
        : `<p class="text-sm text-gray-400 col-span-full text-center py-6">No featured products right now.</p>`
      bindProductCardActions(container)
    } catch (e) {
      const container = document.getElementById('home-featured')
      if (container) {
        container.innerHTML = `<p class="text-sm text-gray-400 col-span-full text-center py-6">We couldn't load featured products right now.</p>`
      }
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
    Actions.bindProductCardActions(container)
  }

  return { render, bindProductCardActions, bindGlobalSearch }
})()
