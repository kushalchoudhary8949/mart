// ============================================================
// API layer - wraps axios, manages auth token, handles errors
// ============================================================
const Api = (() => {
  const client = axios.create({ baseURL: '/api', timeout: 15000 })

  function getToken() {
    return localStorage.getItem('fc_token') || null
  }
  function setToken(token) {
    if (token) localStorage.setItem('fc_token', token)
    else localStorage.removeItem('fc_token')
  }
  function getRefreshToken() {
    return localStorage.getItem('fc_refresh_token') || null
  }
  function setRefreshToken(token) {
    if (token) localStorage.setItem('fc_refresh_token', token)
    else localStorage.removeItem('fc_refresh_token')
  }

  client.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  // ── Silent token refresh state ──
  let isRefreshing = false
  let refreshQueue = [] // pending requests waiting for new token

  function processQueue(error, token = null) {
    refreshQueue.forEach(({ resolve, reject }) => {
      if (error) reject(error)
      else resolve(token)
    })
    refreshQueue = []
  }

  client.interceptors.response.use(
    (res) => {
      // If the response from Express backend wraps its payload in a nested 'data' object
      if (res && res.data && res.data.success === true && res.data.data !== undefined) {
        const payload = res.data.data;
        if (payload && typeof payload === 'object') {
          // Flatten the response payload so that top-level properties are directly accessible
          res.data = {
            success: true,
            ...res.data, // preserve other top-level keys if any
            ...payload   // merge properties from res.data.data
          };

          // Compat key mapping for auth: promote accessToken to token
          if (payload.accessToken && !res.data.token) {
            res.data.token = payload.accessToken;
          }

          // Compat key mapping for user objects: if payload is a user object (has phone and role but not nested user)
          if (payload.phone && payload.role && !res.data.user) {
            res.data.user = payload;
          }

          // Compat key mapping for OTP request: promote mockOtp to debug_otp
          if (payload.mockOtp && !res.data.debug_otp) {
            res.data.debug_otp = payload.mockOtp;
          }
        }
      }
      return res;
    },
    async (err) => {
      const originalRequest = err.config

      // Only attempt refresh for 401 errors that haven't already been retried
      if (err.response && err.response.status === 401 && !originalRequest._retry) {
        const refreshToken = getRefreshToken()

        // No refresh token available — go straight to login
        if (!refreshToken) {
          setToken(null)
          localStorage.removeItem('fc_user')
          if (window.location.hash !== '#/login') {
            sessionStorage.setItem('fc_redirect_after_login', window.location.hash.slice(1) || '/')
            window.location.hash = '/login'
          }
          return Promise.reject(err)
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject })
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return client(originalRequest)
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken })
          const newAccessToken = data?.data?.accessToken || data?.accessToken
          const newRefreshToken = data?.data?.refreshToken || data?.refreshToken

          if (newAccessToken) {
            setToken(newAccessToken)
            if (newRefreshToken) setRefreshToken(newRefreshToken)
            processQueue(null, newAccessToken)

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return client(originalRequest)
          }
          throw new Error('No access token in refresh response')
        } catch (refreshErr) {
          processQueue(refreshErr, null)
          setToken(null)
          setRefreshToken(null)
          localStorage.removeItem('fc_user')
          if (window.location.hash !== '#/login') {
            sessionStorage.setItem('fc_redirect_after_login', window.location.hash.slice(1) || '/')
            window.location.hash = '/login'
          }
          return Promise.reject(refreshErr)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(err)
    }
  )

  function errMsg(err) {
    return err?.response?.data?.error || err?.message || 'Something went wrong. Please try again.'
  }

  return {
    getToken,
    setToken,
    getRefreshToken,
    setRefreshToken,
    errMsg,
    // auth
    customerLogin: (name, phone) => client.post('/auth/customer-login', { name, phone }),
    requestOtp: (phone, purpose) => client.post('/auth/otp/request', { phone, purpose }),
    verifyOtp: (phone, code, name) => client.post('/auth/otp/verify', { phone, code, name }),
    me: () => client.get('/auth/me'),
    logout: () => client.post('/auth/logout'),
    updateProfile: (data) => client.put('/auth/profile', data),
    // catalog
    getStoreInfo: () => client.get('/store/info'),
    getBanners: () => client.get('/banners'),
    getCategories: () => client.get('/categories'),
    getCategory: (slug) => client.get(`/categories/${slug}`),
    getProducts: (params) => client.get('/products', { params }),
    getProduct: (slug) => client.get(`/products/${slug}`),
    getProductImages: (productId) => client.get(`/products/${productId}/images`),
    // cart
    getCart: () => client.get('/cart'),
    addToCart: (productId, quantity = 1) => client.post('/cart', { product_id: productId, quantity }),
    updateCartItem: (productId, quantity) => client.put(`/cart/${productId}`, { quantity }),
    removeCartItem: (productId) => client.delete(`/cart/${productId}`),
    clearCart: () => client.delete('/cart'),
    // wishlist
    getWishlist: () => client.get('/wishlist'),
    addWishlist: (productId) => client.post('/wishlist', { product_id: productId }),
    removeWishlist: (productId) => client.delete(`/wishlist/${productId}`),
    // coupons
    getCoupons: () => client.get('/coupons'),
    validateCoupon: (code, subtotal) => client.post('/coupons/validate', { code, subtotal }),
    // orders
    checkout: (payload) => client.post('/orders/checkout', payload),
    getOrders: (params) => client.get('/orders', { params }),
    getOrder: (id) => client.get(`/orders/${id}`),
    trackOrder: (id) => client.get(`/orders/${id}/track`),
    verifyDelivery: (id, pin) => client.post(`/orders/${id}/verify-delivery`, { pin }),
    cancelOrder: (id) => client.post(`/orders/${id}/cancel`),
    reorder: (id) => client.post(`/orders/${id}/reorder`),
    rateOrder: (id, rating, comment) => client.post(`/orders/${id}/rate`, { rating, comment }),
    // notifications
    getNotifications: () => client.get('/notifications'),
    markNotificationRead: (id) => client.post(`/notifications/${id}/read`),
    markAllNotificationsRead: () => client.post('/notifications/read-all'),
    // addresses
    getAddresses: () => client.get('/addresses'),
    addAddress: (data) => client.post('/addresses', data),
    updateAddress: (id, data) => client.put(`/addresses/${id}`, data),
    deleteAddress: (id) => client.delete(`/addresses/${id}`)
  }
})()
