// ============================================================
// Search results page
// ============================================================
const SearchPage = (() => {
  let debounceTimer = null

  async function render(params, query) {
    const initialQuery = query.q || ''
    const featured = query.featured === '1'
    let activeCategorySlug = query.category || ''

    document.getElementById('app').innerHTML = `
      ${Components.header(true, '')}
      <main class="max-w-5xl mx-auto pb-24 page-fade">
        <div class="px-4 pt-2 pb-2 sticky top-[57px] bg-gray-50 z-10 space-y-2">
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input id="search-input" type="text" value="${UI.escapeHtml(initialQuery)}" placeholder="Search for products..."
              class="w-full bg-white border border-gray-200 rounded-full py-3 pl-9 pr-4 text-sm focus:ring-2 focus:ring-brand-400" autocomplete="off" />
          </div>
          <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1 chip-scroll" id="search-category-filters">
            <div class="h-6 w-12 skeleton rounded-full shrink-0"></div>
            <div class="h-6 w-24 skeleton rounded-full shrink-0"></div>
            <div class="h-6 w-20 skeleton rounded-full shrink-0"></div>
          </div>
        </div>
        <div id="search-status" class="px-4 text-xs text-gray-400 mb-2"></div>
        <div id="search-results" class="px-4 grid grid-cols-2 sm:grid-cols-3 gap-3"></div>
      </main>
      ${Components.bottomNav('home')}
    `

    const input = document.getElementById('search-input')
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => performSearch(input.value.trim(), false, activeCategorySlug), 350)
    })

    // Load category filters
    const categories = await Store.refreshCategories()
    const filterContainer = document.getElementById('search-category-filters')
    
    const renderChips = () => {
      if (!filterContainer) return
      filterContainer.innerHTML = `
        <button data-cat-filter="" class="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${!activeCategorySlug ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-500 border-gray-200'}">All</button>
        ${categories.map((c) => `
          <button data-cat-filter="${c.slug}" class="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${activeCategorySlug === c.slug ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-500 border-gray-200'}">${c.name}</button>
        `).join('')}
      `
      filterContainer.querySelectorAll('[data-cat-filter]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault()
          activeCategorySlug = btn.dataset.catFilter
          renderChips()
          performSearch(input.value.trim(), false, activeCategorySlug)
        })
      })
    }
    renderChips()

    await performSearch(initialQuery, featured, activeCategorySlug)
  }

  async function performSearch(q, featured, categorySlug) {
    const resultsEl = document.getElementById('search-results')
    const statusEl = document.getElementById('search-status')

    if (!q && !featured && !categorySlug) {
      resultsEl.innerHTML = UI.emptyState('fa-magnifying-glass', 'Search for groceries', 'Try "milk", "bread", "fruits" or browse categories.')
      statusEl.textContent = ''
      return
    }

    resultsEl.innerHTML = Array.from({ length: 6 }).map(() => Components.productCardSkeleton()).join('')
    statusEl.textContent = 'Searching...'

    try {
      const params = { limit: 24 }
      if (q) params.q = q
      if (featured) params.featured = 1
      if (categorySlug) params.category = categorySlug
      const { data } = await Api.getProducts(params)

      statusEl.textContent = `${data.pagination.total} result${data.pagination.total === 1 ? '' : 's'} found`
      resultsEl.innerHTML = data.products.length
        ? data.products.map((p) => Components.productCard(p)).join('')
        : UI.emptyState('fa-box-open', 'No products found', `We couldn't find anything matching your search.`)
      Actions.bindProductCardActions(resultsEl)
    } catch (e) {
      statusEl.textContent = ''
      UI.toast(Api.errMsg(e), 'error')
    }
  }

  return { render }
})()
