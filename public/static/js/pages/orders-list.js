// ============================================================
// Order History page
// ============================================================
const OrdersListPage = (() => {
  const STATUS_STYLE = {
    placed: 'bg-blue-50 text-blue-600',
    confirmed: 'bg-indigo-50 text-indigo-600',
    preparing: 'bg-amber-50 text-amber-600',
    out_for_delivery: 'bg-purple-50 text-purple-600',
    delivered: 'bg-brand-50 text-brand-600',
    cancelled: 'bg-red-50 text-red-600'
  }

  let currentPage = 1

  async function render() {
    currentPage = 1
    document.getElementById('app').innerHTML = `
      ${Components.header(false, 'My Orders')}
      <main class="max-w-3xl mx-auto pb-24 px-4 pt-4 page-fade">
        ${Store.isLoggedIn() ? `
          <div id="orders-list">
            <div id="orders-items-list" class="space-y-3"></div>
            <div id="orders-load-more" class="text-center mt-4 hidden">
              <button class="text-brand-600 font-semibold text-sm px-6 py-2 border border-brand-200 rounded-full bg-white hover:bg-brand-50 transition-colors">Load More</button>
            </div>
          </div>
        ` : Components.requireLoginPrompt('Please login to view your order history')}
      </main>
      ${Components.bottomNav('orders')}
    `

    if (!Store.isLoggedIn()) return

    await loadOrders(true)

    const loadMoreBtn = document.querySelector('#orders-load-more button')
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', async () => {
        currentPage++
        await loadOrders(false)
      })
    }
  }

  async function loadOrders(reset) {
    const listEl = document.getElementById('orders-items-list')
    const loadMoreDiv = document.getElementById('orders-load-more')
    if (reset && listEl) listEl.innerHTML = UI.loadingSpinner()

    try {
      const { data } = await Api.getOrders({ page: currentPage, limit: 10 })
      if (reset && listEl) {
        if (!data.orders.length) {
          listEl.innerHTML = UI.emptyState('fa-receipt', 'No orders yet', 'Your placed orders will appear here.',
            `<a href="#/" class="bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Start Shopping</a>`)
          if (loadMoreDiv) loadMoreDiv.classList.add('hidden')
          return
        }
        listEl.innerHTML = ''
      }

      const itemsHtml = data.orders.map((o) => orderCard(o)).join('')
      if (listEl) {
        listEl.innerHTML = reset ? itemsHtml : listEl.innerHTML + itemsHtml
      }

      if (loadMoreDiv) {
        loadMoreDiv.classList.toggle('hidden', currentPage >= data.pagination.total_pages)
      }
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
    }
  }

  function orderCard(o) {
    const style = STATUS_STYLE[o.current_status] || 'bg-gray-50 text-gray-600'
    return `
    <a href="#/order/${o.id}" class="block bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <p class="font-semibold text-gray-800 text-sm">#${o.order_no}</p>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${style}">${o.current_status_label}</span>
      </div>
      <p class="text-xs text-gray-400 mb-2">${UI.formatDateTime(o.placed_at)} &middot; ${o.item_count} item${o.item_count === 1 ? '' : 's'}</p>
      <div class="flex items-center justify-between">
        <p class="font-bold text-gray-900">${UI.money(o.total)}</p>
        <span class="text-xs text-brand-600 font-medium">Track Order <i class="fas fa-chevron-right ml-1"></i></span>
      </div>
    </a>`
  }

  return { render }
})()
