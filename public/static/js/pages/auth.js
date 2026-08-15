// ============================================================
// Customer Direct Login / Signup Page (Name + Mobile Number)
// ============================================================
const AuthPage = (() => {
  async function render() {
    let storeName = 'Vrindavan Mart'
    let storeTagline = 'Fresh groceries delivered in 10 minutes'

    try {
      const { data } = await Api.getStoreInfo()
      if (data?.name) storeName = data.name
      if (data?.address) storeTagline = `${data.address}`
    } catch (e) {
      // keep defaults on failure
    }

    document.getElementById('app').innerHTML = `
    <div class="min-h-screen flex flex-col bg-gradient-to-b from-brand-50 via-white to-gray-50">
      <!-- Back button header -->
      <div class="max-w-md mx-auto w-full px-6 pt-6">
        <a href="#/" class="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-brand-700 transition-colors">
          <i class="fas fa-arrow-left mr-2"></i> Back to Store
        </a>
      </div>

      <div class="max-w-md mx-auto w-full flex-1 flex flex-col px-6 pt-4 pb-12 justify-center">
        <!-- Store Branding -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-tr from-brand-700 to-brand-500 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-brand-200 ring-4 ring-white">
            🛒
          </div>
          <h1 class="text-2xl font-black tracking-tight text-gray-900">${UI.escapeHtml(storeName)}</h1>
          <p class="text-gray-500 text-xs font-medium mt-0.5">${UI.escapeHtml(storeTagline)}</p>
        </div>

        <!-- Login / Register Card -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-100 border border-gray-100 page-fade">
          <div class="mb-5 text-center">
            <h2 class="font-bold text-xl text-gray-900">Customer Login / Sign Up</h2>
            <p class="text-xs text-gray-500 mt-1">Enter your name and mobile number to start shopping instantly</p>
          </div>

          <form id="customer-auth-form" class="space-y-4" onsubmit="return false;">
            <!-- Name Input (Mandatory) -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="name-input" class="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <i class="fas fa-user text-brand-600 text-xs"></i> Full Name
                </label>
                <span class="text-[10px] font-bold text-red-500 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-full">Required</span>
              </div>
              <div class="relative">
                <input 
                  id="name-input" 
                  type="text" 
                  autocomplete="name"
                  placeholder="e.g. Kushal Choudhary" 
                  class="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  required
                />
              </div>
              <p id="name-error" class="hidden text-[11px] text-red-500 mt-1 font-medium pl-1"></p>
            </div>

            <!-- Phone Input (Mandatory) -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="phone-input" class="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <i class="fas fa-mobile-screen text-brand-600 text-xs"></i> Mobile Number
                </label>
                <span class="text-[10px] font-bold text-red-500 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-full">Required</span>
              </div>
              <div class="flex items-center bg-gray-50/70 border border-gray-200 rounded-xl px-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
                <span class="text-gray-700 font-bold text-sm pr-2.5 border-r border-gray-200 mr-2.5 flex items-center gap-1">
                  <span>🇮🇳</span> +91
                </span>
                <input 
                  id="phone-input" 
                  type="tel" 
                  inputmode="numeric"
                  maxlength="10" 
                  autocomplete="tel"
                  placeholder="98765 43210"
                  class="flex-1 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
                  required
                />
              </div>
              <p id="phone-error" class="hidden text-[11px] text-red-500 mt-1 font-medium pl-1"></p>
            </div>

            <!-- Submit Button -->
            <button 
              id="login-btn" 
              type="submit"
              class="w-full mt-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md shadow-brand-200 hover:shadow-lg hover:shadow-brand-300 active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
            >
              <span>Continue Shopping</span>
              <i class="fas fa-arrow-right text-xs"></i>
            </button>
          </form>

          <!-- Privacy Notice -->
          <p class="text-[11px] text-gray-400 text-center mt-5 leading-relaxed">
            By logging in, you agree to Vrindavan Mart's <a href="#/" class="text-brand-600 underline">Terms of Service</a> & <a href="#/" class="text-brand-600 underline">Privacy Policy</a>
          </p>
        </div>

        <!-- Highlights / Trust Badges -->
        <div class="grid grid-cols-3 gap-3 mt-6 text-center">
          <div class="bg-white/80 backdrop-blur rounded-2xl p-3 border border-gray-100 shadow-sm">
            <i class="fas fa-bolt text-amber-500 text-lg mb-1"></i>
            <p class="text-[11px] font-bold text-gray-800">10 Min Delivery</p>
            <p class="text-[9px] text-gray-400">Superfast</p>
          </div>
          <div class="bg-white/80 backdrop-blur rounded-2xl p-3 border border-gray-100 shadow-sm">
            <i class="fas fa-leaf text-brand-600 text-lg mb-1"></i>
            <p class="text-[11px] font-bold text-gray-800">Fresh Quality</p>
            <p class="text-[9px] text-gray-400">100% Guaranteed</p>
          </div>
          <div class="bg-white/80 backdrop-blur rounded-2xl p-3 border border-gray-100 shadow-sm">
            <i class="fas fa-shield-halved text-blue-600 text-lg mb-1"></i>
            <p class="text-[11px] font-bold text-gray-800">Instant Access</p>
            <p class="text-[9px] text-gray-400">No OTP Wait</p>
          </div>
        </div>
      </div>
    </div>`

    const nameInput = document.getElementById('name-input')
    const phoneInput = document.getElementById('phone-input')
    const nameError = document.getElementById('name-error')
    const phoneError = document.getElementById('phone-error')
    const loginBtn = document.getElementById('login-btn')
    const form = document.getElementById('customer-auth-form')

    // Format phone input (digits only, max 10)
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10)
      phoneError.classList.add('hidden')
      phoneInput.parentElement.classList.remove('border-red-400')
    })

    nameInput.addEventListener('input', () => {
      nameError.classList.add('hidden')
      nameInput.classList.remove('border-red-400')
    })

    // Auto-focus name field
    nameInput.focus()

    form.addEventListener('submit', handleLogin)
    loginBtn.addEventListener('click', handleLogin)

    async function handleLogin(e) {
      if (e) e.preventDefault()

      const name = nameInput.value.trim()
      const phone = phoneInput.value.trim()

      let hasError = false

      // Validate Name (Mandatory)
      if (!name || name.length < 2) {
        nameError.textContent = 'Please enter your full name (at least 2 characters).'
        nameError.classList.remove('hidden')
        nameInput.classList.add('border-red-400')
        nameInput.focus()
        hasError = true
      } else {
        nameError.classList.add('hidden')
        nameInput.classList.remove('border-red-400')
      }

      // Validate Phone (Mandatory Indian 10-digit mobile)
      if (!phone || phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
        phoneError.textContent = 'Please enter a valid 10-digit Indian mobile number.'
        phoneError.classList.remove('hidden')
        phoneInput.parentElement.classList.add('border-red-400')
        if (!hasError) phoneInput.focus()
        hasError = true
      } else {
        phoneError.classList.add('hidden')
        phoneInput.parentElement.classList.remove('border-red-400')
      }

      if (hasError) return

      // Submit direct login
      loginBtn.disabled = true
      loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-base mr-2"></i> Signing In...'

      try {
        const { data } = await Api.customerLogin(name, phone)

        const token = data.token || data.accessToken || data.data?.token || data.data?.accessToken
        const refreshToken = data.refreshToken || data.data?.refreshToken
        const user = data.user || data.data?.user || { name, phone }

        if (token) Api.setToken(token)
        if (refreshToken) Api.setRefreshToken(refreshToken)

        Store.setUser(user)
        UI.toast(`Welcome, ${user.name || name}! 🎉`, 'success')

        // Refresh user's state
        try {
          await Promise.all([
            Store.refreshCart(),
            Store.refreshWishlist(),
            Store.refreshNotifications()
          ])
        } catch (_) {}

        // Navigate to redirect destination or home
        const redirect = sessionStorage.getItem('fc_redirect_after_login')
        sessionStorage.removeItem('fc_redirect_after_login')
        Router.navigate(redirect || '/')
      } catch (err) {
        const message = Api.errMsg(err)
        UI.toast(message, 'error')
      } finally {
        loginBtn.disabled = false
        loginBtn.innerHTML = '<span>Continue Shopping</span> <i class="fas fa-arrow-right text-xs"></i>'
      }
    }

    return () => {}
  }

  return { render }
})()
