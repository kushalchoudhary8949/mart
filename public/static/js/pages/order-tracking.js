// ============================================================
// Order Success page + Live Order Tracking page
// ============================================================
const OrderSuccessPage = (() => {
  async function render(params) {
    document.getElementById('app').innerHTML = `
      <main class="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center px-6 text-center page-fade">
        <div class="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center text-5xl text-brand-600 mb-5">
          <i class="fas fa-circle-check"></i>
        </div>
        <h1 class="text-2xl font-extrabold text-gray-800 mb-2">Order Placed!</h1>
        <p class="text-gray-500 text-sm mb-6">Your order has been placed successfully and will be delivered soon.</p>
        <div class="flex gap-3 w-full">
          <a href="#/order/${params.id}" class="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl text-sm">Track Order</a>
          <a href="#/" class="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm">Continue Shopping</a>
        </div>
      </main>
    `
  }
  return { render }
})()

const OrderTrackingPage = (() => {
  let pollInterval = null

  async function render(params) {
    document.getElementById('app').innerHTML = `
      ${Components.header(true, 'Order Tracking')}
      <main class="max-w-2xl mx-auto pb-24 px-4 pt-4 page-fade" id="track-container">
        ${UI.loadingSpinner('text-3xl')}
      </main>
      ${Components.bottomNav('orders')}
    `

    async function load() {
      try {
        const [orderRes, trackRes] = await Promise.all([Api.getOrder(params.id), Api.trackOrder(params.id)])
        renderTracking(orderRes.data, trackRes.data, params.id)
      } catch (e) {
        document.getElementById('track-container').innerHTML = UI.emptyState('fa-triangle-exclamation', 'Order not found', Api.errMsg(e))
        clearInterval(pollInterval)
      }
    }

    await load()
    pollInterval = setInterval(load, 8000) // poll every 8s to simulate live updates

    return () => clearInterval(pollInterval)
  }

  function renderTracking(orderData, trackData, orderId) {
    const { order, items } = orderData
    const isCancelled = trackData.status === 'cancelled'
    const canCancel = !isCancelled && ['placed', 'confirmed', 'preparing'].includes(trackData.status)

    document.getElementById('track-container').innerHTML = `
      <div class="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <div class="flex items-center justify-between mb-1">
          <p class="font-bold text-gray-800">Order #${order.order_no}</p>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${isCancelled ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}">
            ${isCancelled ? 'Cancelled' : trackData.steps.find((s) => s.status === trackData.status)?.label}
          </span>
        </div>
        <p class="text-xs text-gray-400">Placed on ${UI.formatDateTime(order.placed_at)}</p>
      </div>

      ${!isCancelled ? `
      <div class="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-sm text-gray-500">${trackData.status === 'delivered' ? 'Delivered' : 'Estimated Delivery'}</p>
            <p class="font-bold text-gray-800">
              ${trackData.status === 'delivered' ? 'Order delivered!' : `${Math.ceil(trackData.minutes_remaining)} mins remaining`}
            </p>
          </div>
          <div class="text-3xl ${trackData.status === 'out_for_delivery' ? 'bike-anim' : ''}">
            ${trackData.status === 'delivered' ? '🎉' : trackData.status === 'out_for_delivery' ? '🛵' : trackData.status === 'preparing' ? '📦' : '🧾'}
          </div>
        </div>
        <div class="track-progress-bg h-2 rounded-full overflow-hidden">
          <div class="track-progress-fill h-full rounded-full" style="width:${trackData.progress_percent}%"></div>
        </div>
      </div>

      <div class="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <h3 class="font-semibold text-gray-800 mb-4 text-sm">Order Status</h3>
        <div class="relative">
          ${trackData.steps.map((step, idx) => `
            <div class="flex gap-3 ${idx < trackData.steps.length - 1 ? 'pb-6' : ''} relative">
              ${idx < trackData.steps.length - 1 ? `<div class="absolute left-[11px] top-6 bottom-0 w-0.5 ${step.completed ? 'bg-brand-500' : 'bg-gray-200'}"></div>` : ''}
              <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${step.completed ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-400'}">
                <i class="fas ${step.completed ? 'fa-check' : 'fa-circle'} text-[10px]"></i>
              </div>
              <div>
                <p class="text-sm font-medium ${step.completed ? 'text-gray-800' : 'text-gray-400'}">${step.label}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : `
      <div class="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4 text-center">
        <i class="fas fa-circle-xmark text-red-400 text-2xl mb-2"></i>
        <p class="text-sm text-red-600 font-medium">This order was cancelled.</p>
      </div>
      `}

      <div class="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <h3 class="font-semibold text-gray-800 mb-3 text-sm"><i class="fas fa-location-dot mr-1.5 text-brand-500"></i>Delivery Address</h3>
        <p class="text-sm text-gray-600">${UI.escapeHtml(order.address_text || 'N/A')}</p>
      </div>

      <div class="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <h3 class="font-semibold text-gray-800 mb-3 text-sm">Items (${items.length})</h3>
        <div class="space-y-3">
          ${items.map((it) => `
            <div class="flex gap-3 items-center">
              <img src="${it.image}" class="w-12 h-12 rounded-lg object-cover" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 line-clamp-1">${UI.escapeHtml(it.name)}</p>
                <p class="text-xs text-gray-400">${it.quantity} x ${UI.money(it.price)}</p>
              </div>
              <p class="text-sm font-semibold text-gray-800">${UI.money(it.price * it.quantity)}</p>
            </div>
          `).join('')}
        </div>
        <div class="border-t border-gray-100 mt-3 pt-3 space-y-1.5 text-sm">
          <div class="flex justify-between text-gray-500"><span>Subtotal</span><span>${UI.money(order.subtotal)}</span></div>
          ${order.discount > 0 ? `<div class="flex justify-between text-brand-600"><span>Discount</span><span>-${UI.money(order.discount)}</span></div>` : ''}
          <div class="flex justify-between text-gray-500"><span>Delivery Fee</span><span>${order.delivery_fee === 0 ? 'FREE' : UI.money(order.delivery_fee)}</span></div>
          <div class="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-1.5"><span>Total</span><span>${UI.money(order.total)}</span></div>
        </div>
      </div>

      <div class="flex gap-3">
        ${canCancel ? `<button id="cancel-order-btn" class="flex-1 border border-red-200 text-red-500 font-semibold py-3 rounded-xl text-sm">Cancel Order</button>` : ''}
        <button id="reorder-btn" class="flex-1 bg-brand-600 text-white font-semibold py-3 rounded-xl text-sm">Reorder</button>
      </div>
    `

    const cancelBtn = document.getElementById('cancel-order-btn')
    if (cancelBtn) cancelBtn.addEventListener('click', () => confirmCancel(orderId))

    document.getElementById('reorder-btn').addEventListener('click', async () => {
      try {
        await Api.reorder(orderId)
        await Store.refreshCart()
        UI.toast('Items added to cart', 'success')
        Router.navigate('/cart')
      } catch (e) {
        UI.toast(Api.errMsg(e), 'error')
      }
    })
  }

  function confirmCancel(orderId) {
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center px-4'
    modal.innerHTML = `
      <div class="bg-white rounded-2xl w-full max-w-sm p-5 text-center">
        <i class="fas fa-triangle-exclamation text-amber-500 text-3xl mb-3"></i>
        <h3 class="font-bold text-gray-800 mb-1">Cancel this order?</h3>
        <p class="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
        <div class="flex gap-3">
          <button id="cancel-no" class="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium">No</button>
          <button id="cancel-yes" class="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium">Yes, Cancel</button>
        </div>
      </div>
    `
    document.body.appendChild(modal)
    modal.querySelector('#cancel-no').addEventListener('click', () => modal.remove())
    modal.querySelector('#cancel-yes').addEventListener('click', async () => {
      try {
        await Api.cancelOrder(orderId)
        modal.remove()
        UI.toast('Order cancelled', 'info')
        Router.resolve()
      } catch (e) {
        UI.toast(Api.errMsg(e), 'error')
      }
    })
  }

  return { render }
})()
