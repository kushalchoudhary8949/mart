// ============================================================
// Checkout page - address selection, payment method, place order
// ============================================================
const CheckoutPage = (() => {
  async function render() {
    if (!Store.isLoggedIn()) {
      sessionStorage.setItem('fc_redirect_after_login', '/checkout')
      Router.navigate('/login')
      return
    }

    let summary = null
    try {
      const summaryRaw = sessionStorage.getItem('fc_checkout_summary')
      if (summaryRaw) summary = JSON.parse(summaryRaw)
    } catch (_) {}

    if (!summary) {
      const subtotal = Store.state.cartSubtotal || 0
      const deliveryFee = subtotal > 0 && subtotal < 499 ? 25 : 0
      summary = {
        subtotal,
        discount: 0,
        deliveryFee,
        total: subtotal + deliveryFee,
        coupon: null
      }
    }

    document.getElementById('app').innerHTML = `
      ${Components.header(true, 'Checkout')}
      <main class="max-w-2xl mx-auto pb-32 px-4 pt-4 page-fade">
        <section class="mb-5">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
              <i class="fas fa-location-dot text-brand-600"></i> Delivery Address
            </h3>
            <button id="add-address-btn" class="text-brand-600 hover:text-brand-700 text-xs font-bold inline-flex items-center gap-1">
              <i class="fas fa-plus"></i> Add Address
            </button>
          </div>
          <div id="address-list" class="space-y-2 mb-2">${UI.loadingSpinner('text-xl')}</div>
        </section>

        <section class="mb-5">
          <h3 class="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-1.5">
            <i class="fas fa-credit-card text-brand-600"></i> Payment Method
          </h3>
          <div class="space-y-2">
            <label class="flex items-center gap-3 border border-gray-200 hover:border-brand-300 rounded-xl p-3.5 cursor-pointer bg-white transition-colors">
              <input type="radio" name="payment" value="cod" checked class="accent-brand-600" />
              <div class="w-8 h-8 rounded-lg bg-green-50 text-brand-700 flex items-center justify-center text-sm">
                <i class="fas fa-money-bill-wave"></i>
              </div>
              <div class="flex-1">
                <span class="text-sm font-semibold text-gray-800 block">Cash on Delivery</span>
                <span class="text-[11px] text-gray-400 block">Pay with cash or UPI at delivery</span>
              </div>
            </label>
            <label class="flex items-center gap-3 border border-gray-200 hover:border-brand-300 rounded-xl p-3.5 cursor-pointer bg-white transition-colors">
              <input type="radio" name="payment" value="upi" class="accent-brand-600" />
              <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                <i class="fas fa-qrcode"></i>
              </div>
              <div class="flex-1">
                <span class="text-sm font-semibold text-gray-800 block">UPI Instant Payment (QR Code)</span>
                <span class="text-[11px] text-gray-400 block">Google Pay, PhonePe, Paytm, BHIM</span>
              </div>
            </label>
            <label class="flex items-center gap-3 border border-gray-200 hover:border-brand-300 rounded-xl p-3.5 cursor-pointer bg-white transition-colors">
              <input type="radio" name="payment" value="card" class="accent-brand-600" />
              <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                <i class="fas fa-credit-card"></i>
              </div>
              <div class="flex-1">
                <span class="text-sm font-semibold text-gray-800 block">Credit / Debit Card</span>
                <span class="text-[11px] text-gray-400 block">Visa, Mastercard, RuPay</span>
              </div>
            </label>
          </div>
        </section>

        <section class="mb-5">
          <h3 class="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-1.5">
            <i class="fas fa-receipt text-brand-600"></i> Order Summary
          </h3>
          <div class="bg-white border border-gray-100 rounded-2xl p-4 text-sm space-y-2.5 shadow-sm">
            <div class="flex justify-between text-gray-600"><span>Item Total</span><span>${UI.money(summary?.subtotal || 0)}</span></div>
            ${summary?.discount ? `<div class="flex justify-between text-brand-600 font-medium"><span>Discount (${summary.coupon || ''})</span><span>-${UI.money(summary.discount)}</span></div>` : ''}
            <div class="flex justify-between text-gray-600"><span>Delivery Fee</span><span>${summary?.deliveryFee === 0 ? '<span class="text-brand-600 font-bold">FREE</span>' : UI.money(summary?.deliveryFee || 0)}</span></div>
            <div class="border-t border-gray-100 pt-2.5 flex justify-between font-extrabold text-gray-900 text-base"><span>To Pay</span><span>${UI.money(summary?.total || 0)}</span></div>
          </div>
        </section>
      </main>

      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg px-4 py-3.5 z-30">
        <div class="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span class="text-[11px] text-gray-400 block uppercase font-bold tracking-wider">Total</span>
            <span class="text-lg font-black text-gray-900 leading-tight">${UI.money(summary?.total || 0)}</span>
          </div>
          <button id="place-order-btn" class="flex-1 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-md shadow-brand-200 flex items-center justify-center gap-2">
            <span>Place Order</span>
            <i class="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>
    `

    let selectedAddressId = null
    let selectedAddressText = null

    await loadAddresses()

    const addBtn = document.getElementById('add-address-btn')
    if (addBtn) addBtn.addEventListener('click', showAddAddressModal)

    const placeBtn = document.getElementById('place-order-btn')
    if (placeBtn) placeBtn.addEventListener('click', placeOrder)

    async function loadAddresses() {
      const listEl = document.getElementById('address-list')
      if (!listEl) return

      try {
        const res = await Api.getAddresses()
        const raw = res?.data
        const addresses = raw?.addresses || raw?.data?.addresses || (Array.isArray(raw) ? raw : []) || []

        if (!addresses || !addresses.length) {
          listEl.innerHTML = `
            <div class="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-5 text-center">
              <div class="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-2 text-sm">
                <i class="fas fa-location-dot"></i>
              </div>
              <p class="text-xs font-bold text-gray-800 mb-0.5">No Saved Addresses</p>
              <p class="text-[11px] text-gray-500 mb-3">Please add your delivery address to place the order</p>
              <button id="add-first-addr-btn" class="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5">
                <i class="fas fa-plus"></i> Add Delivery Address
              </button>
            </div>`
          selectedAddressId = null
          selectedAddressText = null

          const addFirstBtn = document.getElementById('add-first-addr-btn')
          if (addFirstBtn) addFirstBtn.addEventListener('click', showAddAddressModal)
          return
        }

        listEl.innerHTML = addresses.map((a, idx) => `
          <label class="flex items-start gap-3 border ${idx === 0 || a.is_default ? 'border-brand-500 bg-brand-50/20' : 'border-gray-200 bg-white'} rounded-xl p-3.5 cursor-pointer transition-colors hover:border-brand-400">
            <input type="radio" name="address" value="${a.id}" ${idx === 0 || a.is_default ? 'checked' : ''} class="accent-brand-600 mt-1" />
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-xs font-bold text-gray-900">${UI.escapeHtml(a.label || 'Home')}</span>
                ${a.is_default ? `<span class="bg-brand-100 text-brand-700 text-[10px] font-bold px-1.5 py-0.2 rounded">DEFAULT</span>` : ''}
              </div>
              <p class="text-xs text-gray-600 leading-relaxed">${UI.escapeHtml(a.full_address || a.fullAddress || '')}</p>
            </div>
          </label>
        `).join('')

        const defaultAddr = addresses.find((a) => a.is_default) || addresses[0]
        if (defaultAddr) {
          selectedAddressId = defaultAddr.id
          selectedAddressText = defaultAddr.full_address || defaultAddr.fullAddress
        }

        listEl.querySelectorAll('input[name="address"]').forEach((radio) => {
          radio.addEventListener('change', () => {
            const addr = addresses.find((a) => a.id === parseInt(radio.value, 10))
            if (addr) {
              selectedAddressId = addr.id
              selectedAddressText = addr.full_address || addr.fullAddress
            }
          })
        })
      } catch (e) {
        if (listEl) {
          listEl.innerHTML = `
            <div class="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-center justify-between">
              <span>Could not load addresses: ${UI.escapeHtml(Api.errMsg(e))}</span>
              <button id="retry-addr-btn" class="font-bold underline ml-2">Retry</button>
            </div>`
          const retryBtn = document.getElementById('retry-addr-btn')
          if (retryBtn) retryBtn.addEventListener('click', loadAddresses)
        }
      }
    }

    function showAddAddressModal() {
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center'
      modal.innerHTML = `
        <div class="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-lg text-gray-900">Add Delivery Address</h3>
            <button id="close-addr-modal" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700 flex items-center justify-center"><i class="fas fa-xmark"></i></button>
          </div>
          <button id="detect-loc-btn" class="w-full mb-3 flex items-center justify-center gap-2 border border-brand-200 text-brand-700 font-semibold py-3 rounded-xl text-xs bg-brand-50 hover:bg-brand-100 transition-colors">
            <i class="fas fa-location-crosshairs text-sm"></i> Use Current GPS Location
          </button>
          <label class="text-xs font-bold text-gray-700 mb-1 block">Address Label</label>
          <input id="addr-label" placeholder="e.g. Home, Office, Flat 402" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-xs mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white" />
          <label class="text-xs font-bold text-gray-700 mb-1 block">Complete Address</label>
          <textarea id="addr-full" placeholder="House/Flat No., Building, Street, Area, Landmark, City, Pincode" rows="3" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-xs mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"></textarea>
          <button id="save-addr-btn" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-md">Save Address</button>
        </div>
      `
      document.body.appendChild(modal)
      modal.querySelector('#close-addr-modal').addEventListener('click', () => modal.remove())
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove() })

      const detectBtn = modal.querySelector('#detect-loc-btn')
      detectBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
          UI.toast('Geolocation is not supported by your browser', 'error')
          return
        }
        detectBtn.disabled = true
        detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting location...'
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude
            const lon = position.coords.longitude
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
                headers: { 'Accept-Language': 'en' }
              })
              const data = await res.json()
              if (data && data.display_name) {
                document.getElementById('addr-full').value = data.display_name
                UI.toast('Location detected!', 'success')
              } else {
                UI.toast('Could not resolve location address', 'error')
              }
            } catch (err) {
              UI.toast('Error fetching address from coordinates', 'error')
            } finally {
              detectBtn.disabled = false
              detectBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Use Current GPS Location'
            }
          },
          (error) => {
            UI.toast(`Location access failed: ${error.message}`, 'error')
            detectBtn.disabled = false
            detectBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Use Current GPS Location'
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        )
      })

      modal.querySelector('#save-addr-btn').addEventListener('click', async () => {
        const label = document.getElementById('addr-label').value.trim() || 'Home'
        const fullAddress = document.getElementById('addr-full').value.trim()
        if (!fullAddress) { UI.toast('Please enter your complete address', 'error'); return }
        const saveBtn = modal.querySelector('#save-addr-btn')
        saveBtn.disabled = true
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'
        try {
          await Api.addAddress({ label, full_address: fullAddress, is_default: true })
          modal.remove()
          UI.toast('Address saved successfully!', 'success')
          await loadAddresses()
        } catch (e) {
          UI.toast(Api.errMsg(e), 'error')
          saveBtn.disabled = false
          saveBtn.innerHTML = 'Save Address'
        }
      })
    }

    function showUPIModal(total, onPaymentComplete) {
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center px-4'
      modal.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-900 text-base">Scan & Pay via UPI</h3>
            <button id="close-upi-modal" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700 flex items-center justify-center"><i class="fas fa-xmark"></i></button>
          </div>
          <div class="bg-gray-50 border border-gray-100 rounded-2xl p-3 mb-4">
            <p class="text-[11px] text-gray-500 uppercase font-bold tracking-wider">Amount to Pay</p>
            <p class="text-2xl font-black text-brand-600 mt-0.5">${UI.money(total)}</p>
          </div>
          <div class="w-44 h-44 mx-auto bg-white border-2 border-brand-100 rounded-2xl p-2.5 flex flex-col items-center justify-center relative mb-3 shadow-inner">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent('upi://pay?pa=vrindavanmart@okaxis&pn=VrindavanMart&am=' + total + '&cu=INR')}" 
                 alt="UPI QR Code" 
                 class="w-full h-full object-contain" />
          </div>
          <p class="text-[11px] text-gray-500 mb-3">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
          <div class="flex justify-between items-center text-xs text-gray-500 bg-gray-50 rounded-xl p-2.5 mb-4">
            <span>UPI ID: <strong class="text-gray-800 font-mono">vrindavanmart@okaxis</strong></span>
            <button id="copy-upi-btn" class="text-brand-600 font-bold hover:underline">Copy</button>
          </div>
          <div class="flex gap-2.5">
            <button id="simulate-fail-btn" class="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-bold hover:bg-gray-50 transition-colors">Cancel</button>
            <button id="simulate-success-btn" class="flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-brand-700 transition-colors shadow-md">I Have Paid</button>
          </div>
        </div>
      `
      document.body.appendChild(modal)
      modal.querySelector('#close-upi-modal').addEventListener('click', () => modal.remove())
      modal.querySelector('#copy-upi-btn').addEventListener('click', () => {
        navigator.clipboard.writeText('vrindavanmart@okaxis')
        UI.toast('UPI ID copied!', 'info')
      })
      modal.querySelector('#simulate-fail-btn').addEventListener('click', () => {
        modal.remove()
      })
      modal.querySelector('#simulate-success-btn').addEventListener('click', () => {
        modal.remove()
        UI.toast('Payment verified! 🎉', 'success')
        onPaymentComplete()
      })
    }

    async function placeOrder() {
      if (!selectedAddressId && !selectedAddressText) {
        UI.toast('Please select or add a delivery address', 'error')
        return
      }
      const paymentRadio = document.querySelector('input[name="payment"]:checked')
      const paymentMethod = paymentRadio ? paymentRadio.value : 'cod'

      if (paymentMethod === 'upi') {
        showUPIModal(summary?.total || 0, () => executeCheckout('UPI', 'PAID'))
      } else {
        executeCheckout(paymentMethod.toUpperCase(), 'PENDING')
      }
    }

    async function executeCheckout(paymentMethod, paymentStatus) {
      const btn = document.getElementById('place-order-btn')
      if (btn) {
        btn.disabled = true
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing order...'
      }
      try {
        const { data } = await Api.checkout({
          address_id: selectedAddressId,
          address_text: selectedAddressText,
          coupon_code: summary?.coupon || null,
          payment_method: paymentMethod,
          payment_status: paymentStatus
        })
        sessionStorage.removeItem('fc_checkout_summary')
        Store.setCart([], 0)
        UI.toast('Order placed successfully! 🎉', 'success')
        Router.navigate(`/order-success/${data.order?.id || data.data?.order?.id || ''}`)
      } catch (e) {
        UI.toast(Api.errMsg(e), 'error')
        if (btn) {
          btn.disabled = false
          btn.innerHTML = `<span>Place Order</span> <i class="fas fa-arrow-right text-xs"></i>`
        }
      }
    }
  }

  return { render }
})()
window.CheckoutPage = CheckoutPage
