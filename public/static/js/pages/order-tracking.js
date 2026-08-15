// ============================================================
// Order Success page + Live Order Tracking page with Delivery PIN
// ============================================================
const OrderSuccessPage = (() => {
  async function render(params) {
    document.getElementById('app').innerHTML = `
      <main class="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center px-6 text-center page-fade">
        <div class="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center text-5xl text-brand-600 mb-5 shadow-inner">
          <i class="fas fa-circle-check"></i>
        </div>
        <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p class="text-gray-500 text-sm mb-6">Your order is being prepared and will be delivered shortly.</p>
        <div class="flex gap-3 w-full">
          <a href="#/order/${params.id}" class="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md">
            Track Order & Get PIN
          </a>
          <a href="#/" class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl text-sm transition-colors">
            Continue Shopping
          </a>
        </div>
      </main>
    `
  }
  return { render }
})()

const OrderTrackingPage = (() => {
  let pollInterval = null

  function getDeliveryPinFallback(orderId, orderNo) {
    let hash = 0
    const str = `${orderId}-${orderNo || ''}`
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff
    }
    return String((Math.abs(hash) % 9000) + 1000)
  }

  async function render(params) {
    let isTerminal = false
    let activeRequest = 0

    document.getElementById('app').innerHTML = `
      ${Components.header(true, 'Order Tracking')}
      <main class="max-w-2xl mx-auto pb-24 px-4 pt-4 page-fade" id="track-container">
        ${UI.loadingSpinner('text-3xl')}
      </main>
      ${Components.bottomNav('orders')}
    `

    async function load() {
      const requestId = ++activeRequest
      try {
        const [orderRes, trackRes] = await Promise.all([Api.getOrder(params.id), Api.trackOrder(params.id)])
        if (requestId !== activeRequest) return
        const container = document.getElementById('track-container')
        if (!container) return
        renderTracking(orderRes.data, trackRes.data, params.id)
        if (['delivered', 'cancelled'].includes(trackRes.data.status)) {
          isTerminal = true
          if (pollInterval) {
            clearInterval(pollInterval)
            pollInterval = null
          }
        }
      } catch (e) {
        if (requestId !== activeRequest) return
        isTerminal = true
        const container = document.getElementById('track-container')
        if (container) {
          container.innerHTML = UI.errorState(
            'Order not found', Api.errMsg(e), `Router.resolve()`
          )
        }
        if (pollInterval) {
          clearInterval(pollInterval)
          pollInterval = null
        }
      }
    }

    await load()
    if (!isTerminal) {
      pollInterval = setInterval(load, 8000)
    }

    return () => {
      activeRequest += 1
      if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
      }
    }

    function renderTracking(orderData, trackData, orderId) {
      const order = orderData.order || orderData
      const items = orderData.items || order.items || []
      const isCancelled = trackData.status === 'cancelled'
      const isDelivered = trackData.status === 'delivered'
      const canCancel = !isCancelled && !isDelivered && ['placed', 'confirmed', 'preparing'].includes(trackData.status)
      const payment = UI.formatPaymentMethod(order.payment_method || order.paymentMethod, order.payment_status || order.paymentStatus, trackData.status)

      const deliveryPin = String(order.delivery_pin || trackData.delivery_pin || getDeliveryPinFallback(order.id, order.order_no || order.orderNo))

      const container = document.getElementById('track-container')
      if (!container) return

      container.innerHTML = `
        <div class="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-xs">
          <div class="flex items-center justify-between mb-1">
            <p class="font-bold text-gray-900 text-sm">Order #${order.order_no || order.orderNo}</p>
            <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${isCancelled ? 'bg-red-50 text-red-700 border border-red-100' : isDelivered ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-brand-50 text-brand-700 border border-brand-100'}">
              ${isCancelled ? 'Cancelled' : trackData.steps?.find((s) => s.status === trackData.status)?.label || trackData.status}
            </span>
          </div>
          <p class="text-xs text-gray-400">Placed on ${UI.formatDateTime(order.placed_at || order.placedAt || new Date().toISOString())}</p>
        </div>

        ${!isCancelled && !isDelivered ? `
        <!-- Delivery Partner Verification Code Card -->
        <div class="bg-gradient-to-br from-emerald-600 via-brand-600 to-brand-700 text-white rounded-3xl p-5 mb-4 shadow-lg shadow-brand-500/10 relative overflow-hidden">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">
                <i class="fas fa-shield-halved text-sm"></i>
              </div>
              <div>
                <h3 class="font-black text-sm tracking-tight leading-tight">Delivery Verification PIN</h3>
                <p class="text-[11px] text-white/80">Share with delivery partner to complete delivery</p>
              </div>
            </div>
            <button id="copy-pin-btn" class="bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors flex items-center gap-1">
              <i class="fas fa-copy"></i> Copy PIN
            </button>
          </div>

          <!-- 4-Digit Display Box -->
          <div class="flex items-center justify-center gap-2.5 my-3.5">
            ${deliveryPin.split('').map(digit => `
              <div class="w-12 h-14 bg-white/20 backdrop-blur-md border border-white/40 rounded-2xl flex items-center justify-center text-2xl font-black tracking-widest text-white shadow-inner">
                ${digit}
              </div>
            `).join('')}
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
            <span class="text-[11px] text-white/80 flex items-center gap-1.5">
              <i class="fas fa-lock text-[10px]"></i> Secure Delivery Verification
            </span>
            <button id="open-partner-verify-btn" class="bg-white hover:bg-white/90 text-brand-700 font-extrabold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5">
              <i class="fas fa-motorcycle"></i> Partner Input Code
            </button>
          </div>
        </div>
        ` : isDelivered ? `
        <!-- Delivered & Verified Status -->
        <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg shrink-0">
              <i class="fas fa-circle-check"></i>
            </div>
            <div>
              <p class="text-xs font-bold text-emerald-900">Delivery Verified & Completed</p>
              <p class="text-[11px] text-emerald-700">Verified via PIN (<span class="font-mono font-bold">${deliveryPin}</span>) at doorstep</p>
            </div>
          </div>
          <span class="bg-emerald-200/60 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">VERIFIED</span>
        </div>
        ` : ''}

        ${!isCancelled ? `
        <div class="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">${trackData.status === 'delivered' ? 'Delivered' : 'Estimated Delivery'}</p>
              <p class="font-black text-gray-900 text-base mt-0.5">
                ${trackData.status === 'delivered' ? 'Order Delivered Successfully!' : `${Math.ceil(trackData.minutes_remaining || 15)} mins remaining`}
              </p>
            </div>
            <div class="text-3xl ${trackData.status === 'out_for_delivery' ? 'bike-anim' : ''}">
              ${trackData.status === 'delivered' ? '🎉' : trackData.status === 'out_for_delivery' ? '🛵' : trackData.status === 'preparing' ? '📦' : '🧾'}
            </div>
          </div>
          <div class="track-progress-bg h-2 rounded-full overflow-hidden bg-gray-100">
            <div class="track-progress-fill h-full rounded-full bg-brand-500 transition-all duration-500" style="width:${trackData.progress_percent || 25}%"></div>
          </div>
        </div>

        <div class="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-xs">
          <h3 class="font-bold text-gray-900 mb-4 text-xs uppercase tracking-wider">Live Status</h3>
          <div class="relative">
            ${(trackData.steps || []).map((step, idx) => `
              <div class="flex gap-3 ${idx < trackData.steps.length - 1 ? 'pb-5' : ''} relative">
                ${idx < trackData.steps.length - 1 ? `<div class="absolute left-[11px] top-6 bottom-0 w-0.5 ${step.completed ? 'bg-brand-500' : 'bg-gray-200'}"></div>` : ''}
                <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${step.completed ? 'bg-brand-500 text-white shadow-xs' : 'bg-gray-100 text-gray-400'}">
                  <i class="fas ${step.completed ? 'fa-check' : 'fa-circle'} text-[10px]"></i>
                </div>
                <div>
                  <p class="text-xs font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400'}">${step.label}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : `
        <div class="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4 text-center">
          <i class="fas fa-circle-xmark text-red-400 text-2xl mb-2"></i>
          <p class="text-sm text-red-600 font-bold">This order was cancelled.</p>
        </div>
        `}

        <div class="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-xs">
          <h3 class="font-bold text-gray-900 mb-2 text-xs flex items-center gap-1.5">
            <i class="fas fa-location-dot text-brand-600"></i> Delivery Address
          </h3>
          <p class="text-xs text-gray-600 leading-relaxed">${UI.escapeHtml(order.address_text || order.addressText || 'N/A')}</p>
        </div>

        <!-- Payment & Billing Details Card -->
        <div class="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              <i class="fas fa-credit-card text-brand-600"></i> Payment & Billing Details
            </h3>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${payment.statusColor}">
              ${payment.status}
            </span>
          </div>
          
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span class="text-gray-500">Payment Mode</span>
              <span class="font-bold text-gray-800 flex items-center gap-1.5">
                <i class="fas ${payment.icon} ${payment.color}"></i>
                ${payment.modeLabel}
              </span>
            </div>
            <div class="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span class="text-gray-500">Payment Status</span>
              <span class="font-bold ${payment.isPaid ? 'text-emerald-700' : 'text-amber-700'}">
                ${payment.isPaid ? '<i class="fas fa-circle-check mr-1"></i> Payment Verified' : '<i class="fas fa-clock mr-1"></i> Collect Cash on Delivery'}
              </span>
            </div>
            <div class="flex items-center justify-between py-1.5">
              <span class="text-gray-500">Transaction Ref</span>
              <span class="font-mono text-gray-600 font-semibold">TXN-${order.order_no || order.orderNo}</span>
            </div>
          </div>
        </div>

        <div class="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-xs">
          <h3 class="font-bold text-gray-900 mb-3 text-xs">Items (${items.length})</h3>
          <div class="space-y-3">
            ${items.map((it) => `
              <div class="flex gap-3 items-center">
                <img src="${UI.resolveProductImage(it)}" loading="lazy" decoding="async" class="w-11 h-11 rounded-xl object-cover bg-gray-50" onerror="this.onerror=null; this.src=UI.placeholderImage" />
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-gray-800 line-clamp-1">${UI.escapeHtml(it.name)}</p>
                  <p class="text-[11px] text-gray-400">${it.quantity} x ${UI.money(it.price)}</p>
                </div>
                <p class="text-xs font-extrabold text-gray-900">${UI.money(it.price * it.quantity)}</p>
              </div>
            `).join('')}
          </div>
          <div class="border-t border-gray-100 mt-3 pt-3 space-y-1.5 text-xs">
            <div class="flex justify-between text-gray-500"><span>Subtotal</span><span>${UI.money(order.subtotal)}</span></div>
            ${order.discount > 0 ? `<div class="flex justify-between text-brand-600 font-bold"><span>Discount</span><span>-${UI.money(order.discount)}</span></div>` : ''}
            <div class="flex justify-between text-gray-500"><span>Delivery Fee</span><span>${order.delivery_fee === 0 || order.deliveryFee === 0 ? 'FREE' : UI.money(order.delivery_fee || order.deliveryFee || 0)}</span></div>
            <div class="flex justify-between font-black text-gray-900 border-t border-gray-100 pt-2 text-sm">
              <span>Total ${payment.isPaid ? 'Paid' : 'Payable'}</span>
              <span>${UI.money(order.total)}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          ${canCancel ? `<button id="cancel-order-btn" class="flex-1 border border-red-200 hover:bg-red-50 text-red-500 font-bold py-3 rounded-xl text-xs transition-colors">Cancel Order</button>` : ''}
          <button id="reorder-btn" class="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-colors">Reorder Items</button>
        </div>
      `

      const copyPinBtn = document.getElementById('copy-pin-btn')
      if (copyPinBtn) {
        copyPinBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(deliveryPin)
          UI.toast(`Delivery PIN ${deliveryPin} copied!`, 'info')
        })
      }

      const partnerBtn = document.getElementById('open-partner-verify-btn')
      if (partnerBtn) {
        partnerBtn.addEventListener('click', () => showPartnerVerificationModal(orderId, deliveryPin, order.order_no || order.orderNo, load))
      }

      const cancelBtn = document.getElementById('cancel-order-btn')
      if (cancelBtn) cancelBtn.addEventListener('click', () => confirmCancel(orderId))

      const reorderBtn = document.getElementById('reorder-btn')
      if (reorderBtn) {
        reorderBtn.addEventListener('click', async () => {
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
    }

    function showPartnerVerificationModal(orderId, expectedPin, orderNo, onComplete) {
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center p-4'
      modal.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2 text-brand-700 font-black text-sm">
              <i class="fas fa-motorcycle text-base"></i> Delivery Partner Verification
            </div>
            <button id="close-partner-modal" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700 flex items-center justify-center"><i class="fas fa-xmark"></i></button>
          </div>
          <p class="text-xs text-gray-500 mb-4">Ask customer for the 4-digit PIN code displayed on their screen to complete order #${orderNo}.</p>
          
          <div class="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
            <label class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Enter 4-Digit Customer PIN</label>
            <div class="flex justify-center gap-2 mb-2" id="pin-input-group">
              <input type="tel" maxlength="1" class="pin-digit w-12 h-14 text-center font-black text-2xl bg-white border-2 border-gray-200 focus:border-brand-500 rounded-xl focus:outline-none shadow-xs" />
              <input type="tel" maxlength="1" class="pin-digit w-12 h-14 text-center font-black text-2xl bg-white border-2 border-gray-200 focus:border-brand-500 rounded-xl focus:outline-none shadow-xs" />
              <input type="tel" maxlength="1" class="pin-digit w-12 h-14 text-center font-black text-2xl bg-white border-2 border-gray-200 focus:border-brand-500 rounded-xl focus:outline-none shadow-xs" />
              <input type="tel" maxlength="1" class="pin-digit w-12 h-14 text-center font-black text-2xl bg-white border-2 border-gray-200 focus:border-brand-500 rounded-xl focus:outline-none shadow-xs" />
            </div>
            <button id="fill-demo-pin-btn" class="text-[11px] text-brand-600 font-bold underline mt-1">Auto-fill Customer PIN (${expectedPin})</button>
          </div>

          <button id="submit-verify-btn" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2">
            <span>Verify PIN & Complete Delivery</span>
            <i class="fas fa-check"></i>
          </button>
        </div>
      `
      document.body.appendChild(modal)

      const closeBtn = modal.querySelector('#close-partner-modal')
      closeBtn.addEventListener('click', () => modal.remove())
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove() })

      const digits = modal.querySelectorAll('.pin-digit')
      digits.forEach((input, index) => {
        input.addEventListener('input', (e) => {
          if (e.target.value && index < digits.length - 1) {
            digits[index + 1].focus()
          }
        })
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !e.target.value && index > 0) {
            digits[index - 1].focus()
          }
        })
      })
      setTimeout(() => digits[0]?.focus(), 150)

      modal.querySelector('#fill-demo-pin-btn').addEventListener('click', () => {
        expectedPin.split('').forEach((d, i) => {
          if (digits[i]) digits[i].value = d
        })
        digits[3]?.focus()
      })

      const submitBtn = modal.querySelector('#submit-verify-btn')
      submitBtn.addEventListener('click', async () => {
        const pin = Array.from(digits).map((d) => d.value).join('')
        if (pin.length !== 4) {
          UI.toast('Please enter the complete 4-digit PIN', 'error')
          return
        }

        submitBtn.disabled = true
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...'

        try {
          await Api.verifyDelivery(orderId, pin)
          modal.remove()
          UI.toast('🎉 Delivery Verified & Completed Successfully!', 'success')
          if (typeof onComplete === 'function') onComplete()
        } catch (err) {
          UI.toast(Api.errMsg(err), 'error')
          submitBtn.disabled = false
          submitBtn.innerHTML = '<span>Verify PIN & Complete Delivery</span> <i class="fas fa-check"></i>'
        }
      })
    }

    function confirmCancel(orderId) {
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center px-4'
      modal.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl">
          <i class="fas fa-triangle-exclamation text-amber-500 text-3xl mb-3"></i>
          <h3 class="font-bold text-gray-900 text-base mb-1">Cancel this order?</h3>
          <p class="text-xs text-gray-500 mb-5">This will cancel the active delivery request.</p>
          <div class="flex gap-3">
            <button id="cancel-no" class="flex-1 border border-gray-200 rounded-xl py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50">No, Keep</button>
            <button id="cancel-yes" class="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-xs font-bold transition-colors">Yes, Cancel</button>
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
  }

  return { render }
})()
