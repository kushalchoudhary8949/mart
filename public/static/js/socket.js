// Realtime bridge for customer order tracking and product stock refreshes.
const Realtime = (() => {
  let socket = null
  function connect() {
    if (socket || !window.io || !Api.getToken()) return
    const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5001'
      : 'https://vrindawan-mart-redis.onrender.com'
    socket = window.io(socketUrl, { auth: { token: Api.getToken() } })
    socket.on('stockUpdated', () => {
      const h = window.location.hash || ''
      if (!h || h === '#/' || h.startsWith('#/category') || h.startsWith('#/search') || h.startsWith('#/product/')) {
        Router.resolve()
      }
    })
    socket.on('notification', (payload) => {
      UI.toast(payload.title || "New notification!", 'info')
      Store.refreshNotifications()
      if (location.hash === '#/notifications') Router.resolve()
    })
    socket.onAny((event, payload) => {
      if (payload?.id && location.hash === `#/order/${payload.id}`) Router.resolve()
    })
  }
  function disconnect() { if (socket) socket.disconnect(); socket = null }
  return { connect, disconnect }
})()
