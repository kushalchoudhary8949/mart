// ============================================================
// Customer Auth Page (Mandatory Name + Mobile Number + OTP)
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
      <!-- Back to Store Link -->
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

        <!-- Auth Card -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-100 border border-gray-100">
          
          <!-- STEP 1: Name + Mobile Number -->
          <div id="auth-step-details" class="page-fade">
            <div class="mb-5 text-center">
              <h2 class="font-bold text-xl text-gray-900">Login or Sign Up</h2>
              <p class="text-xs text-gray-500 mt-1">Enter your name and mobile number to receive a verification OTP</p>
            </div>

            <form id="details-form" class="space-y-4" onsubmit="return false;">
              <!-- Name Input (MANDATORY) -->
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

              <!-- Phone Input (MANDATORY) -->
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
                id="send-otp-btn" 
                type="submit"
                class="w-full mt-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md shadow-brand-200 hover:shadow-lg hover:shadow-brand-300 active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
              >
                <span>Send Verification OTP</span>
                <i class="fas fa-arrow-right text-xs"></i>
              </button>
            </form>

            <p class="text-[11px] text-gray-400 text-center mt-5 leading-relaxed">
              By continuing, you agree to Vrindavan Mart's <a href="#/" class="text-brand-600 underline">Terms of Service</a> & <a href="#/" class="text-brand-600 underline">Privacy Policy</a>
            </p>
          </div>

          <!-- STEP 2: OTP Verification -->
          <div id="auth-step-otp" class="hidden page-fade">
            <button id="back-to-details-btn" class="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-brand-600 mb-4 transition-colors">
              <i class="fas fa-arrow-left mr-1.5"></i> Change details
            </button>

            <div class="mb-5 text-center">
              <h2 class="font-bold text-xl text-gray-900">Verify OTP</h2>
              <p class="text-xs text-gray-500 mt-1">
                Enter the 6-digit code sent to <br/>
                <span id="otp-phone-display" class="font-bold text-gray-800"></span>
              </p>
            </div>

            <!-- Demo OTP Banner -->
            <div id="demo-otp-banner" class="hidden bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3 mb-4 flex items-center gap-2">
              <i class="fas fa-key text-emerald-600 text-sm"></i>
              <div>
                <span class="font-bold">Your Verification OTP:</span> 
                <span id="demo-otp-code" class="font-mono font-extrabold text-sm ml-1 text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded"></span>
              </div>
            </div>

            <!-- OTP Input Boxes -->
            <div class="flex justify-center gap-2.5 mb-5" id="otp-boxes">
              ${Array.from({ length: 6 }).map((_, i) => `
                <input 
                  type="text" 
                  inputmode="numeric" 
                  maxlength="1" 
                  data-idx="${i}" 
                  class="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-400 focus:outline-none transition-all" 
                />
              `).join('')}
            </div>

            <!-- Verify Button -->
            <button 
              id="verify-otp-btn" 
              class="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md shadow-brand-200 hover:shadow-lg hover:shadow-brand-300 active:scale-[0.99] flex items-center justify-center gap-2 text-sm mb-3"
            >
              <i class="fas fa-check text-xs"></i>
              <span>Verify & Continue</span>
            </button>

            <!-- Resend OTP -->
            <div class="text-center">
              <button id="resend-otp-btn" class="text-xs text-brand-600 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline" disabled>
                Resend OTP in <span id="resend-timer">30</span>s
              </button>
            </div>
          </div>

        </div>

        <!-- Trust Badges -->
        <div class="grid grid-cols-3 gap-3 mt-6 text-center">
          <div class="bg-white/80 backdrop-blur rounded-2xl p-3 border border-gray-100 shadow-sm">
            <i class="fas fa-bolt text-amber-500 text-lg mb-1"></i>
            <p class="text-[11px] font-bold text-gray-800">10 Min Delivery</p>
            <p class="text-[9px] text-gray-400">Superfast</p>
          </div>
          <div class="bg-white/80 backdrop-blur rounded-2xl p-3 border border-gray-100 shadow-sm">
            <i class="fas fa-shield-halved text-brand-600 text-lg mb-1"></i>
            <p class="text-[11px] font-bold text-gray-800">Secure OTP</p>
            <p class="text-[9px] text-gray-400">Verified Account</p>
          </div>
          <div class="bg-white/80 backdrop-blur rounded-2xl p-3 border border-gray-100 shadow-sm">
            <i class="fas fa-leaf text-emerald-600 text-lg mb-1"></i>
            <p class="text-[11px] font-bold text-gray-800">100% Fresh</p>
            <p class="text-[9px] text-gray-400">Guaranteed</p>
          </div>
        </div>
      </div>
    </div>`

    let currentName = ''
    let currentPhone = ''
    let resendInterval = null

    const nameInput = document.getElementById('name-input')
    const phoneInput = document.getElementById('phone-input')
    const nameError = document.getElementById('name-error')
    const phoneError = document.getElementById('phone-error')
    const sendOtpBtn = document.getElementById('send-otp-btn')
    const detailsForm = document.getElementById('details-form')

    const stepDetails = document.getElementById('auth-step-details')
    const stepOtp = document.getElementById('auth-step-otp')
    const otpPhoneDisplay = document.getElementById('otp-phone-display')
    const demoOtpBanner = document.getElementById('demo-otp-banner')
    const demoOtpCode = document.getElementById('demo-otp-code')
    const verifyOtpBtn = document.getElementById('verify-otp-btn')
    const resendOtpBtn = document.getElementById('resend-otp-btn')
    const backToDetailsBtn = document.getElementById('back-to-details-btn')

    // Phone input restriction (digits only, max 10)
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10)
      phoneError.classList.add('hidden')
      phoneInput.parentElement.classList.remove('border-red-400')
    })

    nameInput.addEventListener('input', () => {
      nameError.classList.add('hidden')
      nameInput.classList.remove('border-red-400')
    })

    nameInput.focus()

    detailsForm.addEventListener('submit', handleSendOtp)
    sendOtpBtn.addEventListener('click', handleSendOtp)

    async function handleSendOtp(e) {
      if (e) e.preventDefault()

      const name = nameInput.value.trim()
      const phone = phoneInput.value.trim()

      let hasError = false

      // 1. Mandatory Name Validation
      if (!name || name.length < 2) {
        nameError.textContent = 'Please enter your full name (minimum 2 characters).'
        nameError.classList.remove('hidden')
        nameInput.classList.add('border-red-400')
        nameInput.focus()
        hasError = true
      } else {
        nameError.classList.add('hidden')
        nameInput.classList.remove('border-red-400')
      }

      // 2. Mandatory Phone Validation (Indian 10-digit mobile)
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

      currentName = name
      currentPhone = phone

      sendOtpBtn.disabled = true
      sendOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-base mr-2"></i> Sending OTP...'

      try {
        const { data } = await Api.requestOtp(phone, 'login')

        stepDetails.classList.add('hidden')
        stepOtp.classList.remove('hidden')
        otpPhoneDisplay.textContent = `+91 ${phone}`

        const mockOtp = data.debug_otp || data.data?.mockOtp || data.data?.debug_otp
        if (mockOtp) {
          demoOtpBanner.classList.remove('hidden')
          demoOtpCode.textContent = mockOtp
        } else {
          demoOtpBanner.classList.add('hidden')
        }

        startResendTimer()

        // Focus first OTP box
        const firstOtpInput = document.querySelector('#otp-boxes input')
        if (firstOtpInput) {
          firstOtpInput.value = ''
          firstOtpInput.focus()
        }
      } catch (err) {
        UI.toast(Api.errMsg(err), 'error')
      } finally {
        sendOtpBtn.disabled = false
        sendOtpBtn.innerHTML = '<span>Send Verification OTP</span> <i class="fas fa-arrow-right text-xs"></i>'
      }
    }

    function startResendTimer() {
      let seconds = 30
      resendOtpBtn.disabled = true
      clearInterval(resendInterval)

      resendInterval = setInterval(() => {
        seconds--
        if (seconds <= 0) {
          clearInterval(resendInterval)
          resendOtpBtn.disabled = false
          resendOtpBtn.innerHTML = 'Resend OTP'
        } else {
          resendOtpBtn.innerHTML = `Resend OTP in <span id="resend-timer">${seconds}</span>s`
        }
      }, 1000)
    }

    resendOtpBtn.addEventListener('click', async () => {
      if (!currentPhone) return
      resendOtpBtn.disabled = true
      resendOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Resending...'

      try {
        const { data } = await Api.requestOtp(currentPhone, 'login')
        UI.toast('OTP resent successfully!', 'success')
        const mockOtp = data.debug_otp || data.data?.mockOtp || data.data?.debug_otp
        if (mockOtp) {
          demoOtpBanner.classList.remove('hidden')
          demoOtpCode.textContent = mockOtp
        }
        startResendTimer()
      } catch (err) {
        UI.toast(Api.errMsg(err), 'error')
        resendOtpBtn.disabled = false
        resendOtpBtn.innerHTML = 'Resend OTP'
      }
    })

    backToDetailsBtn.addEventListener('click', () => {
      stepOtp.classList.add('hidden')
      stepDetails.classList.remove('hidden')
      clearInterval(resendInterval)
      nameInput.focus()
    })

    // OTP Input Navigation & Paste Handling
    const otpInputs = Array.from(document.querySelectorAll('#otp-boxes input'))
    otpInputs.forEach((input, idx) => {
      input.addEventListener('input', (e) => {
        input.value = input.value.replace(/\D/g, '')
        if (input.value && idx < otpInputs.length - 1) {
          otpInputs[idx + 1].focus()
        }
        // If all 6 digits entered, auto-trigger verify
        const fullCode = otpInputs.map((i) => i.value).join('')
        if (fullCode.length === 6) {
          handleVerifyOtp()
        }
      })

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
          otpInputs[idx - 1].focus()
        }
      })

      input.addEventListener('paste', (e) => {
        e.preventDefault()
        const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6)
        text.split('').forEach((ch, i) => {
          if (otpInputs[i]) otpInputs[i].value = ch
        })
        if (text.length === 6) {
          otpInputs[5].focus()
          handleVerifyOtp()
        }
      })
    })

    verifyOtpBtn.addEventListener('click', handleVerifyOtp)

    async function handleVerifyOtp() {
      const code = otpInputs.map((i) => i.value).join('')
      if (code.length !== 6) {
        UI.toast('Please enter the complete 6-digit OTP', 'error')
        return
      }

      verifyOtpBtn.disabled = true
      verifyOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-base mr-2"></i> Verifying...'

      try {
        const { data } = await Api.verifyOtp(currentPhone, code, currentName)

        const token = data.token || data.accessToken || data.data?.token || data.data?.accessToken
        const refreshToken = data.refreshToken || data.data?.refreshToken
        const user = data.user || data.data?.user || { name: currentName, phone: currentPhone }

        if (token) Api.setToken(token)
        if (refreshToken) Api.setRefreshToken(refreshToken)

        Store.setUser(user)
        UI.toast(`Welcome, ${user.name || currentName}! 🎉`, 'success')

        try {
          await Promise.all([
            Store.refreshCart(),
            Store.refreshWishlist(),
            Store.refreshNotifications()
          ])
        } catch (_) {}

        const redirect = sessionStorage.getItem('fc_redirect_after_login')
        sessionStorage.removeItem('fc_redirect_after_login')
        Router.navigate(redirect || '/')
      } catch (err) {
        UI.toast(Api.errMsg(err), 'error')
      } finally {
        verifyOtpBtn.disabled = false
        verifyOtpBtn.innerHTML = '<i class="fas fa-check text-xs"></i> <span>Verify & Continue</span>'
      }
    }

    return () => {
      clearInterval(resendInterval)
    }
  }

  return { render }
})()
