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

    const summaryRaw = sessionStorage.getItem('fc_checkout_summary')
    const summary = summaryRaw ? JSON.parse(summaryRaw) : null

    document.getElementById('app').innerHTML = `
      ${Components.header(true, 'Checkout')}
      <main class="max-w-2xl mx-auto pb-32 px-4 pt-4 page-fade">
        <section class="mb-5">
          <h3 class="font-semibold text-gray-800 mb-2 text-sm"><i class="fas fa-location-dot mr-1.5 text-brand-500"></i>Delivery Address</h3>
          <div id="address-list" class="space-y-2 mb-2">${UI.loadingSpinner('text-xl')}</div>
          <button id="add-address-btn" class="text-brand-600 text-sm font-semibold"><i class="fas fa-plus mr-1"></i>Add New Address</button>
        </section>

        <section class="mb-5">
          <h3 class="font-semibold text-gray-800 mb-2 text-sm"><i class="fas fa-credit-card mr-1.5 text-brand-500"></i>Payment Method</h3>
          <div class="space-y-2">
            <label class="flex items-center gap-3 border border-gray-200 rounded-xl p-3 cursor-pointer">
              <input type="radio" name="payment" value="cod" checked class="accent-brand-600" />
              <i class="fas fa-money-bill-wave text-gray-500"></i>
              <span class="text-sm font-medium text-gray-700">Cash on Delivery</span>
            </label>
            <label class="flex items-center gap-3 border border-gray-200 rounded-xl p-3 cursor-pointer">
              <input type="radio" name="payment" value="upi" class="accent-brand-600" />
              <i class="fas fa-mobile-screen-button text-gray-500"></i>
              <span class="text-sm font-medium text-gray-700">UPI Payment</span>
            </label>
            <label class="flex items-center gap-3 border border-gray-200 rounded-xl p-3 cursor-pointer">
              <input type="radio" name="payment" value="card" class="accent-brand-600" />
              <i class="fas fa-credit-card text-gray-500"></i>
              <span class="text-sm font-medium text-gray-700">Credit / Debit Card</span>
            </label>
          </div>
        </section>

        <section class="mb-5">
          <h3 class="font-semibold text-gray-800 mb-2 text-sm"><i class="fas fa-receipt mr-1.5 text-brand-500"></i>Order Summary</h3>
          <div class="bg-white border border-gray-100 rounded-2xl p-4 text-sm space-y-2">
            <div class="flex justify-between text-gray-600"><span>Subtotal</span><span>${UI.money(summary?.subtotal || 0)}</span></div>
            ${summary?.discount ? `<div class="flex justify-between text-brand-600"><span>Discount (${summary.coupon || ''})</span><span>-${UI.money(summary.discount)}</span></div>` : ''}
            <div class="flex justify-between text-gray-600"><span>Delivery Fee</span><span>${summary?.deliveryFee === 0 ? 'FREE' : UI.money(summary?.deliveryFee || 0)}</span></div>
            <div class="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900"><span>Total</span><span>${UI.money(summary?.total || 0)}</span></div>
          </div>
        </section>
      </main>

      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg px-4 py-3 z-30">
        <div class="max-w-2xl mx-auto">
          <button id="place-order-btn" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-full text-sm">
            Place Order &middot; ${UI.money(summary?.total || 0)}
          </button>
        </div>
      </div>
    `

    let selectedAddressId = null
    let selectedAddressText = null

    await loadAddresses()

    document.getElementById('add-address-btn').addEventListener('click', showAddAddressModal)
    document.getElementById('place-order-btn').addEventListener('click', placeOrder)

    async function loadAddresses() {
      try {
        const { data } = await Api.getAddresses()
        const listEl = document.getElementById('address-list')
        if (!data.addresses.length) {
          listEl.innerHTML = `<p class="text-sm text-gray-400">No saved addresses. Please add one to continue.</p>`
          return
        }
        listEl.innerHTML = data.addresses.map((a) => `
          <label class="flex items-start gap-3 border border-gray-200 rounded-xl p-3 cursor-pointer">
            <input type="radio" name="address" value="${a.id}" ${a.is_default ? 'checked' : ''} class="accent-brand-600 mt-1" />
            <div>
              <p class="text-sm font-semibold text-gray-800">${UI.escapeHtml(a.label)}</p>
              <p class="text-xs text-gray-500">${UI.escapeHtml(a.full_address)}</p>
            </div>
          </label>
        `).join('')

        const defaultAddr = data.addresses.find((a) => a.is_default) || data.addresses[0]
        selectedAddressId = defaultAddr.id
        selectedAddressText = defaultAddr.full_address

        listEl.querySelectorAll('input[name="address"]').forEach((radio) => {
          radio.addEventListener('change', () => {
            const addr = data.addresses.find((a) => a.id === parseInt(radio.value, 10))
            selectedAddressId = addr.id
            selectedAddressText = addr.full_address
          })
        })
      } catch (e) {
        UI.toast(Api.errMsg(e), 'error')
      }
    }

    function showAddAddressModal() {
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center'
      modal.innerHTML = `
        <div class="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-lg text-gray-800">Add New Address</h3>
            <button id="close-addr-modal" class="text-gray-400"><i class="fas fa-xmark text-xl"></i></button>
          </div>
          <button id="detect-loc-btn" class="w-full mb-3 flex items-center justify-center gap-2 border border-brand-200 text-brand-700 font-semibold py-2.5 rounded-xl text-sm bg-brand-50 hover:bg-brand-100 transition-colors">
            <i class="fas fa-location-crosshairs"></i> Use Current Location
          </button>
          <label class="text-xs font-medium text-gray-500 mb-1 block">Label</label>
          <input id="addr-label" placeholder="Home, Work, etc." class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3" />
          <label class="text-xs font-medium text-gray-500 mb-1 block">Full Address</label>
          <textarea id="addr-full" placeholder="House no, Street, Area, City, Pincode" rows="3" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4"></textarea>
          <button id="save-addr-btn" class="w-full bg-brand-600 text-white font-semibold py-3 rounded-xl text-sm">Save Address</button>
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
              detectBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Use Current Location'
            }
          },
          (error) => {
            UI.toast(`Location access failed: ${error.message}`, 'error')
            detectBtn.disabled = false
            detectBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Use Current Location'
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        )
      })

      modal.querySelector('#save-addr-btn').addEventListener('click', async () => {
        const label = document.getElementById('addr-label').value.trim() || 'Home'
        const fullAddress = document.getElementById('addr-full').value.trim()
        if (!fullAddress) { UI.toast('Please enter your full address', 'error'); return }
        try {
          await Api.addAddress({ label, full_address: fullAddress, is_default: true })
          modal.remove()
          UI.toast('Address saved', 'success')
          await loadAddresses()
        } catch (e) {
          UI.toast(Api.errMsg(e), 'error')
        }
      })
    }

    function showUPIModal(total, onPaymentComplete) {
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center px-4'
      modal.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800 text-lg">UPI Payment</h3>
            <button id="close-upi-modal" class="text-gray-400 hover:text-gray-600"><i class="fas fa-xmark text-xl"></i></button>
          </div>
          <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <p class="text-xs text-gray-500">Amount to Pay</p>
            <p class="text-2xl font-extrabold text-brand-600 mt-0.5">${UI.money(total)}</p>
          </div>
          <div class="w-48 h-48 mx-auto bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center relative mb-4">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('upi://pay?pa=vrindavanmart@okaxis&pn=VrindavanMart&am=' + total + '&cu=INR')}" 
                 alt="UPI QR Code" 
                 class="w-full h-full object-contain" />
          </div>
          <p class="text-xs text-gray-500 mb-4">Scan QR code using Google Pay, PhonePe, Paytm, or any UPI app to pay.</p>
          <div class="flex justify-between items-center text-xs text-gray-400 bg-gray-50 rounded-lg p-2.5 mb-5">
            <span>UPI ID: <strong class="text-gray-600">vrindavanmart@okaxis</strong></span>
            <button id="copy-upi-btn" class="text-brand-600 font-semibold">Copy</button>
          </div>
          <div class="flex gap-3">
            <button id="simulate-fail-btn" class="flex-1 border border-red-200 text-red-500 rounded-xl py-3 text-sm font-semibold hover:bg-red-50 transition-colors">Simulate Fail</button>
            <button id="simulate-success-btn" class="flex-1 bg-brand-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-700 transition-colors">Simulate Success</button>
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
        UI.toast('Payment simulation failed.', 'error')
      })
      modal.querySelector('#simulate-success-btn').addEventListener('click', () => {
        modal.remove()
        UI.toast('Payment verified! 🎉', 'success')
        onPaymentComplete()
      })
    }

    async function placeOrder() {
      if (!selectedAddressId && !selectedAddressText) {
        UI.toast('Please add a delivery address', 'error')
        return
      }
      const paymentMethod = document.querySelector('input[name="payment"]:checked').value
      if (paymentMethod === 'upi') {
        showUPIModal(summary?.total || 0, () => executeCheckout('UPI', 'PAID'))
      } else {
        executeCheckout(paymentMethod, 'PENDING')
      }
    }

    async function executeCheckout(paymentMethod, paymentStatus) {
      const btn = document.getElementById('place-order-btn')
      btn.disabled = true
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing order...'
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
        Router.navigate(`/order-success/${data.order.id}`)
      } catch (e) {
        UI.toast(Api.errMsg(e), 'error')
        btn.disabled = false
        btn.innerHTML = `Place Order &middot; ${UI.money(summary?.total || 0)}`
      }
    }
  }

  return { render }
})()
