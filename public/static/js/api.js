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

  client.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response && err.response.status === 401) {
        setToken(null)
        localStorage.removeItem('fc_user')
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
    errMsg,
    // auth
    requestOtp: (phone, purpose) => client.post('/auth/otp/request', { phone, purpose }),
    verifyOtp: (phone, code, name) => client.post('/auth/otp/verify', { phone, code, name }),
    me: () => client.get('/auth/me'),
    logout: () => client.post('/auth/logout'),
    updateProfile: (data) => client.put('/auth/profile', data),
    // catalog
    getCategories: () => client.get('/categories'),
    getCategory: (slug) => client.get(`/categories/${slug}`),
    getProducts: (params) => client.get('/products', { params }),
    getProduct: (slug) => client.get(`/products/${slug}`),
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
    getOrders: () => client.get('/orders'),
    getOrder: (id) => client.get(`/orders/${id}`),
    trackOrder: (id) => client.get(`/orders/${id}/track`),
    cancelOrder: (id) => client.post(`/orders/${id}/cancel`),
    reorder: (id) => client.post(`/orders/${id}/reorder`),
    // notifications
    getNotifications: () => client.get('/notifications'),
    markNotificationRead: (id) => client.post(`/notifications/${id}/read`),
    markAllNotificationsRead: () => client.post('/notifications/read-all'),
    // addresses
    getAddresses: () => client.get('/addresses'),
    addAddress: (data) => client.post('/addresses', data),
    deleteAddress: (id) => client.delete(`/addresses/${id}`)
  }
})()
