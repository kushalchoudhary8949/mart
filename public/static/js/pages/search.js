// ============================================================
// Search results page
// ============================================================
const SearchPage = (() => {
  let debounceTimer = null

  async function render(params, query) {
    const initialQuery = query.q || ''
    const featured = query.featured === '1'

    document.getElementById('app').innerHTML = `
      ${Components.header(true, '')}
      <main class="max-w-5xl mx-auto pb-24 page-fade">
        <div class="px-4 pt-2 pb-3 sticky top-[57px] bg-gray-50 z-10">
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input id="search-input" type="text" value="${UI.escapeHtml(initialQuery)}" placeholder="Search for products..."
              class="w-full bg-white border border-gray-200 rounded-full py-3 pl-9 pr-4 text-sm focus:ring-2 focus:ring-brand-400" autocomplete="off" />
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
      debounceTimer = setTimeout(() => performSearch(input.value.trim(), false), 350)
    })

    await performSearch(initialQuery, featured)
  }

  async function performSearch(q, featured) {
    const resultsEl = document.getElementById('search-results')
    const statusEl = document.getElementById('search-status')

    if (!q && !featured) {
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
      const { data } = await Api.getProducts(params)

      statusEl.textContent = `${data.pagination.total} result${data.pagination.total === 1 ? '' : 's'} found`
      resultsEl.innerHTML = data.products.length
        ? data.products.map((p) => Components.productCard(p)).join('')
        : UI.emptyState('fa-box-open', 'No products found', `We couldn't find anything matching "${UI.escapeHtml(q)}"`)
      HomePage.bindProductCardActions(resultsEl)
    } catch (e) {
      statusEl.textContent = ''
      UI.toast(Api.errMsg(e), 'error')
    }
  }

  return { render }
})()
