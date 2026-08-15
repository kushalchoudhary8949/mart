// ============================================================
// Notifications page
// ============================================================
const NotificationsPage = (() => {
  const TYPE_ICON = { order: 'fa-box', promo: 'fa-gift', system: 'fa-circle-info' }
  const TYPE_COLOR = { order: 'text-brand-600 bg-brand-50', promo: 'text-accent-500 bg-orange-50', system: 'text-blue-600 bg-blue-50' }

  async function render() {
    document.getElementById('app').innerHTML = `
      ${Components.header(true, 'Notifications')}
      <main class="max-w-2xl mx-auto pb-24 px-4 pt-4 page-fade">
        ${Store.isLoggedIn() ? `
        <div class="flex justify-end mb-3">
          <button id="mark-all-read-btn" class="text-xs font-semibold text-brand-600">Mark all as read</button>
        </div>
        <div id="notif-list">${UI.loadingSpinner()}</div>
        ` : Components.requireLoginPrompt('Please login to view notifications')}
      </main>
    `

    if (!Store.isLoggedIn()) return

    document.getElementById('mark-all-read-btn').addEventListener('click', async () => {
      try {
        await Api.markAllNotificationsRead()
        Store.setUnread(0)
        await load()
      } catch (e) {}
    })

    await load()
  }

  async function load() {
    try {
      const { data } = await Api.getNotifications()
      Store.setUnread(data.unread_count)
      const container = document.getElementById('notif-list')
      if (!data.notifications.length) {
        container.innerHTML = UI.emptyState('fa-bell-slash', 'No notifications', 'We\'ll notify you about orders and offers here.')
        return
      }
      container.innerHTML = `<div class="space-y-2">${data.notifications.map((n) => notifRow(n)).join('')}</div>`
      container.querySelectorAll('[data-notif-id]').forEach((row) => {
        row.addEventListener('click', async () => {
          const id = parseInt(row.dataset.notifId, 10)
          if (row.dataset.isRead === '0') {
            await Api.markNotificationRead(id)
            row.dataset.isRead = '1'
            row.classList.remove('bg-brand-50/50', 'border-brand-100')
            row.classList.add('bg-white', 'border-gray-100')
            const dot = row.querySelector('.unread-dot')
            if (dot) dot.remove()
            Store.setUnread(Math.max(0, Store.state.unreadNotifications - 1))
          }
          const orderId = row.dataset.orderId
          if (orderId && orderId !== 'null') Router.navigate(`/order/${orderId}`)
        })
      })
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
    }
  }

  function notifRow(n) {
    const iconClass = TYPE_ICON[n.type] || 'fa-bell'
    const colorClass = TYPE_COLOR[n.type] || 'text-gray-600 bg-gray-50'
    return `
    <div data-notif-id="${n.id}" data-order-id="${n.order_id}" data-is-read="${n.is_read}"
      class="flex gap-3 p-3.5 rounded-2xl border cursor-pointer ${n.is_read ? 'bg-white border-gray-100' : 'bg-brand-50/50 border-brand-100'}">
      <div class="w-10 h-10 rounded-full ${colorClass} flex items-center justify-center shrink-0">
        <i class="fas ${iconClass}"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5">
          ${!n.is_read ? `<span class="unread-dot w-2 h-2 rounded-full bg-accent-500 shrink-0"></span>` : ''}
          <p class="text-sm font-semibold text-gray-800 truncate">${UI.escapeHtml(n.title)}</p>
        </div>
        <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">${UI.escapeHtml(n.message)}</p>
        <p class="text-[11px] text-gray-400 mt-1">${UI.timeAgo(n.created_at)}</p>
      </div>
    </div>`
  }

  return { render }
})()
window.NotificationsPage = NotificationsPage
