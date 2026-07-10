// ============================================================
// Cart page - view/update items, apply coupon, proceed to checkout
// ============================================================
const CartPage = (() => {
  let cartData = { items: [], subtotal: 0 }
  let appliedCoupon = null // { code, discount }

  async function render() {
    document.getElementById('app').innerHTML = `
      ${Components.header(true, 'My Cart')}
      <main class="max-w-3xl mx-auto pb-32 page-fade">
        ${Store.isLoggedIn() ? `<div id="cart-body">${UI.loadingSpinner()}</div>` : `<div class="px-4">${Components.requireLoginPrompt('Please login to view your cart')}</div>`}
      </main>
      ${Store.isLoggedIn() ? `
      <div id="checkout-bar" class="hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg px-4 py-3 z-30">
        <div class="max-w-3xl mx-auto flex items-center gap-4">
          <div>
            <p class="text-xs text-gray-400">Total</p>
            <p class="font-bold text-lg text-gray-900" id="checkout-total">₹0</p>
          </div>
          <a href="#/checkout" class="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-full text-center text-sm">
            Proceed to Checkout <i class="fas fa-arrow-right ml-1"></i>
          </a>
        </div>
      </div>` : ''}
    `

    if (!Store.isLoggedIn()) return
    await loadCart()
  }

  async function loadCart() {
    try {
      const { data } = await Api.getCart()
      cartData = data
      Store.setCart(data.items, data.subtotal)
      renderCartBody()
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
    }
  }

  function renderCartBody() {
    const container = document.getElementById('cart-body')
    const checkoutBar = document.getElementById('checkout-bar')

    if (!cartData.items.length) {
      container.innerHTML = UI.emptyState('fa-cart-shopping', 'Your cart is empty', 'Add items to get started with your grocery shopping.',
        `<a href="#/" class="bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Start Shopping</a>`)
      if (checkoutBar) checkoutBar.classList.add('hidden')
      return
    }

    const discount = appliedCoupon ? appliedCoupon.discount : 0
    const deliveryFee = (cartData.subtotal - discount) >= 499 ? 0 : 25
    const total = Math.max(0, cartData.subtotal - discount) + deliveryFee

    container.innerHTML = `
      <div class="px-4 pt-3 space-y-3" id="cart-items-list">
        ${cartData.items.map((it) => cartItemRow(it)).join('')}
      </div>

      <div class="px-4 mt-5">
        <div class="bg-white border border-gray-100 rounded-2xl p-4">
          <h3 class="font-semibold text-gray-800 mb-2 text-sm"><i class="fas fa-tag mr-1.5 text-brand-500"></i>Apply Coupon</h3>
          ${appliedCoupon ? `
            <div class="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl px-3 py-2.5">
              <div>
                <p class="text-sm font-bold text-brand-700">${appliedCoupon.code}</p>
                <p class="text-xs text-brand-600">You saved ${UI.money(appliedCoupon.discount)}</p>
              </div>
              <button id="remove-coupon-btn" class="text-xs text-red-500 font-medium">Remove</button>
            </div>
          ` : `
            <div class="flex gap-2">
              <input id="coupon-input" type="text" placeholder="Enter coupon code" class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm uppercase focus:ring-2 focus:ring-brand-400" />
              <button id="apply-coupon-btn" class="bg-gray-800 text-white text-sm font-semibold px-4 rounded-xl">Apply</button>
            </div>
            <button id="view-coupons-btn" class="text-xs text-brand-600 font-medium mt-2">View available coupons</button>
          `}
        </div>
      </div>

      <div class="px-4 mt-5">
        <div class="bg-white border border-gray-100 rounded-2xl p-4">
          <h3 class="font-semibold text-gray-800 mb-3 text-sm">Price Details</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between text-gray-600"><span>Subtotal (${cartData.total_items} items)</span><span>${UI.money(cartData.subtotal)}</span></div>
            ${discount > 0 ? `<div class="flex justify-between text-brand-600"><span>Coupon Discount</span><span>-${UI.money(discount)}</span></div>` : ''}
            <div class="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>${deliveryFee === 0 ? '<span class="text-brand-600 font-medium">FREE</span>' : UI.money(deliveryFee)}</span>
            </div>
            ${deliveryFee > 0 ? `<p class="text-[11px] text-gray-400">Add ${UI.money(499 - (cartData.subtotal - discount))} more for free delivery</p>` : ''}
            <div class="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900"><span>Total</span><span>${UI.money(total)}</span></div>
          </div>
        </div>
      </div>
    `

    bindCartItemActions()

    const applyCouponBtn = document.getElementById('apply-coupon-btn')
    if (applyCouponBtn) applyCouponBtn.addEventListener('click', applyCoupon)
    const couponInput = document.getElementById('coupon-input')
    if (couponInput) couponInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyCoupon() })
    const removeCouponBtn = document.getElementById('remove-coupon-btn')
    if (removeCouponBtn) removeCouponBtn.addEventListener('click', () => { appliedCoupon = null; renderCartBody() })
    const viewCouponsBtn = document.getElementById('view-coupons-btn')
    if (viewCouponsBtn) viewCouponsBtn.addEventListener('click', showCouponsModal)

    checkoutBar.classList.remove('hidden')
    document.getElementById('checkout-total').textContent = UI.money(total)

    sessionStorage.setItem('fc_checkout_summary', JSON.stringify({
      subtotal: cartData.subtotal, discount, deliveryFee, total, coupon: appliedCoupon ? appliedCoupon.code : null
    }))
  }

  function cartItemRow(it) {
    return `
      <div class="bg-white border border-gray-100 rounded-2xl p-3 flex gap-3 items-center" data-cart-product-id="${it.product_id}">
        <a href="#/product/${it.slug}"><img src="${it.image}" class="w-16 h-16 rounded-xl object-cover shrink-0" /></a>
        <div class="flex-1 min-w-0">
          <a href="#/product/${it.slug}"><p class="text-sm font-medium text-gray-800 line-clamp-1">${UI.escapeHtml(it.name)}</p></a>
          <p class="text-xs text-gray-400">${it.unit}</p>
          <p class="font-bold text-gray-900 text-sm mt-1">${UI.money(it.price * it.quantity)}</p>
        </div>
        <div class="flex items-center border border-gray-200 rounded-full overflow-hidden shrink-0">
          <button data-action="dec" class="w-8 h-8 text-gray-600">-</button>
          <span class="w-7 text-center text-sm font-semibold">${it.quantity}</span>
          <button data-action="inc" class="w-8 h-8 text-gray-600">+</button>
        </div>
        <button data-action="remove" class="text-gray-300 hover:text-red-500 shrink-0"><i class="fas fa-trash-can"></i></button>
      </div>
    `
  }

  function bindCartItemActions() {
    document.querySelectorAll('[data-cart-product-id]').forEach((row) => {
      const productId = parseInt(row.dataset.cartProductId, 10)
      row.querySelector('[data-action="inc"]').addEventListener('click', () => updateQty(productId, 1))
      row.querySelector('[data-action="dec"]').addEventListener('click', () => updateQty(productId, -1))
      row.querySelector('[data-action="remove"]').addEventListener('click', () => removeItem(productId))
    })
  }

  async function updateQty(productId, delta) {
    const item = cartData.items.find((i) => i.product_id === productId)
    if (!item) return
    const newQty = item.quantity + delta
    try {
      const { data } = await Api.updateCartItem(productId, newQty)
      cartData = data
      Store.setCart(data.items, data.subtotal)
      appliedCoupon = null // re-validate coupon on subtotal change
      renderCartBody()
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
    }
  }

  async function removeItem(productId) {
    try {
      const { data } = await Api.removeCartItem(productId)
      cartData = data
      Store.setCart(data.items, data.subtotal)
      appliedCoupon = null
      renderCartBody()
      UI.toast('Item removed from cart', 'info')
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
    }
  }

  async function applyCoupon() {
    const input = document.getElementById('coupon-input')
    const code = input.value.trim().toUpperCase()
    if (!code) return
    try {
      const { data } = await Api.validateCoupon(code, cartData.subtotal)
      if (data.valid) {
        appliedCoupon = { code: data.code, discount: data.discount }
        UI.toast(`Coupon applied! You saved ${UI.money(data.discount)}`, 'success')
      } else {
        UI.toast(data.error || 'Invalid coupon', 'error')
      }
      renderCartBody()
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
    }
  }

  async function showCouponsModal() {
    try {
      const { data } = await Api.getCoupons()
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center'
      modal.innerHTML = `
        <div class="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-y-auto p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-lg text-gray-800">Available Coupons</h3>
            <button id="close-coupons-modal" class="text-gray-400"><i class="fas fa-xmark text-xl"></i></button>
          </div>
          <div class="space-y-3">
            ${data.coupons.map((cp) => `
              <div class="border border-dashed border-brand-300 bg-brand-50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p class="font-bold text-brand-700">${cp.code}</p>
                  <p class="text-xs text-gray-600">${UI.escapeHtml(cp.description)}</p>
                </div>
                <button data-coupon-code="${cp.code}" class="text-xs font-semibold bg-brand-600 text-white px-3 py-1.5 rounded-full">Apply</button>
              </div>
            `).join('')}
          </div>
        </div>
      `
      document.body.appendChild(modal)
      modal.querySelector('#close-coupons-modal').addEventListener('click', () => modal.remove())
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove() })
      modal.querySelectorAll('[data-coupon-code]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          document.getElementById('coupon-input').value = btn.dataset.couponCode
          modal.remove()
          await applyCoupon()
        })
      })
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
    }
  }

  return { render }
})()
