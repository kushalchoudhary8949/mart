// Realtime bridge for customer order tracking and product stock refreshes.
const Realtime = (() => {
  let socket = null
  function connect() {
    if (socket || !window.io || !Api.getToken()) return
    socket = window.io('http://localhost:5001', { auth: { token: Api.getToken() } })
    socket.on('stockUpdated', () => Router.resolve())
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
