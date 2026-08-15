// ============================================================
// Order History & Payment History page
// ============================================================
const OrdersListPage = (() => {
  const STATUS_STYLE = {
    placed: 'bg-blue-50 text-blue-700 border-blue-100',
    confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    preparing: 'bg-amber-50 text-amber-700 border-amber-100',
    out_for_delivery: 'bg-purple-50 text-purple-700 border-purple-100',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    cancelled: 'bg-red-50 text-red-700 border-red-100'
  }

  let currentPage = 1
  let currentFilter = 'all' // 'all' | 'online' | 'offline'
  let cachedOrders = []

  async function render(params, query) {
    currentPage = 1
    if (query?.filter === 'online' || query?.filter === 'offline') {
      currentFilter = query.filter
    } else {
      currentFilter = 'all'
    }

    document.getElementById('app').innerHTML = `
      ${Components.header(false, 'My Orders & Payments')}
      <main class="max-w-3xl mx-auto pb-24 px-4 pt-4 page-fade">
        ${Store.isLoggedIn() ? `
          <!-- Payment & Order Summary Stats -->
          <div id="orders-summary-stats" class="grid grid-cols-3 gap-2.5 mb-4">
            <div class="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-xs">
              <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Total Orders</span>
              <span id="stat-total-orders" class="text-base font-extrabold text-gray-900 mt-0.5 block">-</span>
            </div>
            <div class="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-xs">
              <span class="text-[10px] text-purple-600 uppercase font-bold tracking-wider block">Online Paid</span>
              <span id="stat-online-paid" class="text-base font-extrabold text-purple-700 mt-0.5 block">-</span>
            </div>
            <div class="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-xs">
              <span class="text-[10px] text-amber-700 uppercase font-bold tracking-wider block">Offline / COD</span>
              <span id="stat-offline-val" class="text-base font-extrabold text-amber-800 mt-0.5 block">-</span>
            </div>
          </div>

          <!-- Filter Tabs -->
          <div class="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
            <button class="order-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${currentFilter === 'all' ? 'bg-brand-600 text-white shadow-xs' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}" data-filter="all">
              All Orders
            </button>
            <button class="order-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${currentFilter === 'online' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}" data-filter="online">
              <i class="fas fa-bolt mr-1"></i> Online (UPI / Card)
            </button>
            <button class="order-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${currentFilter === 'offline' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}" data-filter="offline">
              <i class="fas fa-money-bill-wave mr-1"></i> Cash on Delivery
            </button>
          </div>

          <div id="orders-list">
            <div id="orders-items-list" class="space-y-3"></div>
            <div id="orders-load-more" class="text-center mt-4 hidden">
              <button class="text-brand-600 font-bold text-xs px-6 py-2.5 border border-brand-200 rounded-full bg-white hover:bg-brand-50 transition-colors shadow-xs">
                Load More Orders
              </button>
            </div>
          </div>
        ` : Components.requireLoginPrompt('Please login to view your order and payment history')}
      </main>
      ${Components.bottomNav('orders')}
    `

    if (!Store.isLoggedIn()) return

    document.querySelectorAll('.order-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter
        document.querySelectorAll('.order-filter-btn').forEach((b) => {
          const active = b.dataset.filter === currentFilter
          if (b.dataset.filter === 'all') {
            b.className = `order-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${active ? 'bg-brand-600 text-white shadow-xs' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`
          } else if (b.dataset.filter === 'online') {
            b.className = `order-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${active ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`
          } else {
            b.className = `order-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${active ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`
          }
        })
        filterAndRenderOrders()
      })
    })

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
      const { data } = await Api.getOrders({ page: currentPage, limit: 15 })
      const rawOrders = data.orders || data.data?.orders || []

      if (reset) {
        cachedOrders = rawOrders
      } else {
        cachedOrders = cachedOrders.concat(rawOrders)
      }

      updateSummaryStats(cachedOrders, data.pagination?.total || cachedOrders.length)
      filterAndRenderOrders()

      if (loadMoreDiv) {
        const totalPages = data.pagination?.total_pages || 1
        loadMoreDiv.classList.toggle('hidden', currentPage >= totalPages)
      }
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
      if (listEl && reset) {
        listEl.innerHTML = UI.errorState('Failed to load orders', Api.errMsg(e), 'OrdersListPage.render()')
      }
    }
  }

  function updateSummaryStats(orders, totalCount) {
    const totalEl = document.getElementById('stat-total-orders')
    const onlineEl = document.getElementById('stat-online-paid')
    const offlineEl = document.getElementById('stat-offline-val')

    if (!totalEl || !onlineEl || !offlineEl) return

    totalEl.textContent = String(totalCount || orders.length)

    let onlineSum = 0
    let offlineSum = 0

    orders.forEach((o) => {
      const pm = String(o.payment_method || o.paymentMethod || 'cod').toLowerCase()
      if (pm === 'upi' || pm === 'card' || pm === 'online') {
        onlineSum += Number(o.total || 0)
      } else {
        offlineSum += Number(o.total || 0)
      }
    })

    onlineEl.textContent = UI.money(onlineSum)
    offlineEl.textContent = UI.money(offlineSum)
  }

  function filterAndRenderOrders() {
    const listEl = document.getElementById('orders-items-list')
    if (!listEl) return

    let filtered = cachedOrders
    if (currentFilter === 'online') {
      filtered = cachedOrders.filter((o) => {
        const m = String(o.payment_method || o.paymentMethod || '').toLowerCase()
        return m === 'upi' || m === 'card' || m === 'online'
      })
    } else if (currentFilter === 'offline') {
      filtered = cachedOrders.filter((o) => {
        const m = String(o.payment_method || o.paymentMethod || '').toLowerCase()
        return m === 'cod' || m === '' || m === 'offline'
      })
    }

    if (!filtered.length) {
      const subtitle = currentFilter === 'online' 
        ? 'No online payments (UPI/Card) found.' 
        : currentFilter === 'offline' 
        ? 'No Cash on Delivery orders found.' 
        : 'Your placed orders will appear here.'
      listEl.innerHTML = UI.emptyState('fa-receipt', 'No Orders Found', subtitle,
        `<a href="#/" class="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-colors">Start Shopping</a>`)
      return
    }

    listEl.innerHTML = filtered.map((o) => orderCard(o)).join('')
  }

  function orderCard(o) {
    const status = o.current_status || o.status || 'placed'
    const statusLabel = o.current_status_label || status.charAt(0).toUpperCase() + status.slice(1)
    const statusClass = STATUS_STYLE[status] || 'bg-gray-50 text-gray-700 border-gray-200'
    const payment = UI.formatPaymentMethod(o.payment_method || o.paymentMethod, o.payment_status || o.paymentStatus, status)

    return `
    <a href="#/order/${o.id}" class="block bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all shadow-xs group">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">#${o.order_no || o.orderNo}</span>
          <span class="text-[10px] text-gray-400 font-medium">&bull; ${UI.formatDateTime(o.placed_at || o.placedAt || new Date().toISOString())}</span>
        </div>
        <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusClass}">${statusLabel}</span>
      </div>

      <!-- Payment details pill & items -->
      <div class="flex items-center justify-between py-2 border-y border-gray-50 my-2">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${payment.bgColor} ${payment.color}">
            <i class="fas ${payment.icon} text-xs"></i>
            <span>${payment.modeLabel}</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${payment.statusColor}">
            ${payment.status}
          </span>
        </div>
        <span class="text-xs text-gray-500 font-medium">${o.item_count || o.items?.length || 1} item${(o.item_count || o.items?.length || 1) === 1 ? '' : 's'}</span>
      </div>

      <div class="flex items-center justify-between pt-1">
        <div>
          <span class="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Amount</span>
          <p class="font-black text-base text-gray-900 leading-tight">${UI.money(o.total)}</p>
        </div>
        <span class="text-xs text-brand-600 group-hover:translate-x-0.5 font-bold flex items-center gap-1 transition-transform">
          Track & View Details <i class="fas fa-chevron-right text-[10px]"></i>
        </span>
      </div>
    </a>`
  }

  return { render }
})()
window.OrdersListPage = OrdersListPage
