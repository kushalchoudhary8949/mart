// ============================================================
// Categories list page + Category detail (products) page
// ============================================================
const CategoriesPage = (() => {
  async function render() {
    document.getElementById('app').innerHTML = `
      ${Components.header(false, 'All Categories')}
      <main class="max-w-5xl mx-auto pb-24 px-4 pt-4 page-fade">
        <div id="cat-grid" class="grid grid-cols-3 sm:grid-cols-4 gap-4">
          ${Array.from({ length: 10 }).map(() => `<div class="flex flex-col items-center gap-2"><div class="w-16 h-16 rounded-2xl skeleton"></div><div class="h-3 w-12 skeleton rounded"></div></div>`).join('')}
        </div>
      </main>
      ${Components.bottomNav('categories')}
    `
    const categories = await Store.refreshCategories()
    document.getElementById('cat-grid').innerHTML = categories.map((c) => Components.categoryChip(c)).join('')
  }
  return { render }
})()

const CategoryDetailPage = (() => {
  let currentSort = 'name'
  let currentSlug = null
  let currentPage = 1

  async function render(params) {
    currentSlug = params.slug
    currentSort = 'name'
    currentPage = 1

    document.getElementById('app').innerHTML = `
      ${Components.header(true, '')}
      <main class="max-w-5xl mx-auto pb-24 page-fade">
        <div class="px-4 pt-2">
          <h1 id="cat-title" class="font-bold text-xl text-gray-800 mb-3">Loading...</h1>
          <div class="flex items-center gap-2 mb-4 overflow-x-auto hide-scrollbar chip-scroll">
            ${sortChip('name', 'Popular')}${sortChip('price_asc', 'Price: Low to High')}${sortChip('price_desc', 'Price: High to Low')}${sortChip('rating', 'Top Rated')}
          </div>
        </div>
        <div id="cat-products" class="px-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          ${Array.from({ length: 6 }).map(() => Components.productCardSkeleton()).join('')}
        </div>
        <div id="cat-load-more" class="px-4 mt-4 text-center hidden">
          <button class="text-brand-600 font-semibold text-sm px-6 py-2 border border-brand-200 rounded-full">Load More</button>
        </div>
      </main>
      ${Components.bottomNav('categories')}
    `

    document.querySelectorAll('[data-sort]').forEach((chip) => {
      chip.addEventListener('click', () => {
        currentSort = chip.dataset.sort
        currentPage = 1
        document.querySelectorAll('[data-sort]').forEach((c) => c.classList.remove('bg-brand-600', 'text-white'))
        chip.classList.add('bg-brand-600', 'text-white')
        loadProducts(true)
      })
    })
    document.querySelector(`[data-sort="name"]`).classList.add('bg-brand-600', 'text-white')

    try {
      const { data } = await Api.getCategory(params.slug)
      document.getElementById('cat-title').textContent = data.category.name
    } catch (e) {
      document.getElementById('cat-title').textContent = 'Category'
    }

    await loadProducts(true)

    document.querySelector('#cat-load-more button').addEventListener('click', async () => {
      currentPage++
      await loadProducts(false)
    })
  }

  function sortChip(value, label) {
    return `<button data-sort="${value}" class="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-600">${label}</button>`
  }

  async function loadProducts(reset) {
    try {
      const { data } = await Api.getProducts({ category: currentSlug, sort: currentSort, page: currentPage, limit: 12 })
      const container = document.getElementById('cat-products')
      const html = data.products.length
        ? data.products.map((p) => Components.productCard(p)).join('')
        : UI.emptyState('fa-box-open', 'No products found', 'Try a different category or search term.')
      container.innerHTML = reset ? html : container.innerHTML + html
      HomePage.bindProductCardActions(container)

      const loadMoreDiv = document.getElementById('cat-load-more')
      loadMoreDiv.classList.toggle('hidden', currentPage >= data.pagination.total_pages)
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
    }
  }

  return { render }
})()
window.CategoriesPage = CategoriesPage
window.CategoryDetailPage = CategoryDetailPage
