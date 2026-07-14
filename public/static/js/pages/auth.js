// ============================================================
// Login / Signup with OTP page
// ============================================================
const AuthPage = (() => {
  async function render() {
    let storeName = 'FreshCart'
    let storeTagline = 'Fresh groceries delivered in minutes'

    try {
      const { data } = await Api.getStoreInfo()
      if (data?.name) storeName = data.name
      if (data?.address) storeTagline = `${data.address}`
    } catch (e) {
      // keep defaults on failure
    }

    document.getElementById('app').innerHTML = `
    <div class="min-h-screen flex flex-col bg-gradient-to-b from-brand-50 to-white">
      <div class="max-w-md mx-auto w-full flex-1 flex flex-col px-6 pt-10">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-brand-200">🛒</div>
          <h1 class="text-2xl font-extrabold text-gray-800">${UI.escapeHtml(storeName)}</h1>
          <p class="text-gray-500 text-sm mt-1">${UI.escapeHtml(storeTagline)}</p>
        </div>

        <div id="auth-step-phone" class="page-fade">
          <h2 class="font-semibold text-lg text-gray-800 mb-1">Login or Sign Up</h2>
          <p class="text-sm text-gray-500 mb-5">We'll send you a One-Time Password (OTP) to verify your number.</p>
          <label class="text-xs font-medium text-gray-500 mb-1 block">Mobile Number</label>
          <div class="flex items-center bg-white border border-gray-200 rounded-xl px-3 mb-4 focus-within:ring-2 focus-within:ring-brand-400">
            <span class="text-gray-500 font-medium pr-2 border-r border-gray-200 mr-2">+91</span>
            <input id="phone-input" type="tel" maxlength="10" placeholder="98765 43210"
              class="flex-1 py-3.5 text-base focus:outline-none" />
          </div>
          <button id="send-otp-btn" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-xl transition-colors">
            Send OTP
          </button>
          <p class="text-xs text-gray-400 text-center mt-4">By continuing, you agree to our Terms of Service & Privacy Policy</p>
        </div>

        <div id="auth-step-otp" class="hidden page-fade">
          <button data-action="back-to-phone" class="text-sm text-gray-500 mb-4"><i class="fas fa-arrow-left mr-1"></i> Change number</button>
          <h2 class="font-semibold text-lg text-gray-800 mb-1">Enter OTP</h2>
          <p class="text-sm text-gray-500 mb-5">Sent to <span id="otp-phone-display" class="font-medium text-gray-700"></span></p>

          <div id="demo-otp-banner" class="hidden bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-2 mb-4">
            <i class="fas fa-flask mr-1"></i> Demo mode: Your OTP is <span id="demo-otp-code" class="font-bold"></span> (no SMS gateway configured)
          </div>

          <div class="flex justify-center gap-2 mb-5" id="otp-boxes">
            ${Array.from({ length: 6 }).map((_, i) => `<input maxlength="1" data-idx="${i}" class="otp-input border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400" inputmode="numeric" />`).join('')}
          </div>

          <div id="new-user-name-field" class="hidden mb-4">
            <label class="text-xs font-medium text-gray-500 mb-1 block">Your Name (optional)</label>
            <input id="name-input" type="text" placeholder="Enter your name" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-400" />
          </div>

          <button id="verify-otp-btn" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-xl transition-colors mb-3">
            Verify & Continue
          </button>
          <button id="resend-otp-btn" class="w-full text-brand-600 font-medium py-2 text-sm" disabled>
            Resend OTP in <span id="resend-timer">30</span>s
          </button>
        </div>
      </div>
    </div>`

    let currentPhone = ''
    let resendInterval = null

    const phoneInput = document.getElementById('phone-input')
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10)
    })
    phoneInput.focus()

    document.getElementById('send-otp-btn').addEventListener('click', () => sendOtp('login'))

    async function sendOtp(purpose) {
      const phone = phoneInput.value.trim()
      if (phone.length !== 10) {
        UI.toast('Please enter a valid 10-digit mobile number', 'error')
        return
      }
      currentPhone = phone
      const btn = document.getElementById('send-otp-btn')
      btn.disabled = true
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
      try {
        const { data } = await Api.requestOtp(phone, purpose)
        document.getElementById('auth-step-phone').classList.add('hidden')
        document.getElementById('auth-step-otp').classList.remove('hidden')
        document.getElementById('otp-phone-display').textContent = '+91 ' + phone
        const otpCode = data.debug_otp || data.data?.mockOtp || data.data?.debug_otp
        if (otpCode) {
          document.getElementById('demo-otp-banner').classList.remove('hidden')
          document.getElementById('demo-otp-code').textContent = otpCode
        }
        startResendTimer()
        document.querySelector('#otp-boxes input').focus()
      } catch (e) {
        UI.toast(Api.errMsg(e), 'error')
      } finally {
        btn.disabled = false
        btn.innerHTML = 'Send OTP'
      }
    }

    function startResendTimer() {
      let seconds = 30
      const resendBtn = document.getElementById('resend-otp-btn')
      const timerSpan = document.getElementById('resend-timer')
      resendBtn.disabled = true
      clearInterval(resendInterval)
      resendInterval = setInterval(() => {
        seconds--
        if (seconds <= 0) {
          clearInterval(resendInterval)
          resendBtn.disabled = false
          resendBtn.innerHTML = 'Resend OTP'
        } else {
          timerSpan.textContent = seconds
          resendBtn.innerHTML = `Resend OTP in <span id="resend-timer">${seconds}</span>s`
        }
      }, 1000)
    }

    document.getElementById('resend-otp-btn').addEventListener('click', () => sendOtp('login'))

    document.querySelector('button[data-action="back-to-phone"]').addEventListener('click', () => {
      document.getElementById('auth-step-otp').classList.add('hidden')
      document.getElementById('auth-step-phone').classList.remove('hidden')
      clearInterval(resendInterval)
    })

    // OTP box navigation
    const otpInputs = Array.from(document.querySelectorAll('#otp-boxes input'))
    otpInputs.forEach((input, idx) => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '')
        if (input.value && idx < otpInputs.length - 1) otpInputs[idx + 1].focus()
        maybeShowNameField()
      })
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) otpInputs[idx - 1].focus()
      })
      input.addEventListener('paste', (e) => {
        e.preventDefault()
        const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6)
        text.split('').forEach((ch, i) => { if (otpInputs[i]) otpInputs[i].value = ch })
        if (text.length === 6) otpInputs[5].focus()
      })
    })

    function maybeShowNameField() {
      // Show name field always available; not strictly necessary to detect new user client-side
      document.getElementById('new-user-name-field').classList.remove('hidden')
    }

    document.getElementById('verify-otp-btn').addEventListener('click', verifyOtp)

    async function verifyOtp() {
      const code = otpInputs.map((i) => i.value).join('')
      if (code.length !== 6) {
        UI.toast('Please enter the complete 6-digit OTP', 'error')
        return
      }
      const name = document.getElementById('name-input').value.trim()
      const btn = document.getElementById('verify-otp-btn')
      btn.disabled = true
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
      try {
        const { data } = await Api.verifyOtp(currentPhone, code, name)
        Api.setToken(data.token)
        Store.setUser(data.user)
        UI.toast(`Welcome${data.user.name ? ', ' + data.user.name : ''}!`, 'success')
        await Promise.all([Store.refreshCart(), Store.refreshWishlist(), Store.refreshNotifications()])
        const redirect = sessionStorage.getItem('fc_redirect_after_login')
        sessionStorage.removeItem('fc_redirect_after_login')
        Router.navigate(redirect || '/')
      } catch (e) {
        UI.toast(Api.errMsg(e), 'error')
      } finally {
        btn.disabled = false
        btn.innerHTML = 'Verify & Continue'
      }
    }

    return () => clearInterval(resendInterval)
  }

  return { render }
})()
