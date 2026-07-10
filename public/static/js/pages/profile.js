// ============================================================
// Profile page
// ============================================================
const ProfilePage = (() => {
  async function render() {
    if (!Store.isLoggedIn()) {
      document.getElementById('app').innerHTML = `
        ${Components.header(false, 'Profile')}
        <main class="max-w-2xl mx-auto pb-24 px-4 pt-4 page-fade">${Components.requireLoginPrompt('Please login to view your profile')}</main>
        ${Components.bottomNav('profile')}
      `
      return
    }

    const user = Store.state.user

    document.getElementById('app').innerHTML = `
      ${Components.header(false, 'Profile')}
      <main class="max-w-2xl mx-auto pb-24 px-4 pt-4 page-fade">
        <div class="bg-white border border-gray-100 rounded-2xl p-5 mb-5 flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-2xl font-bold">
            ${(user.name || user.phone || 'U').charAt(0).toUpperCase()}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-gray-800 truncate">${UI.escapeHtml(user.name || 'Guest User')}</p>
            <p class="text-sm text-gray-500">+91 ${user.phone}</p>
          </div>
          <button id="edit-profile-btn" class="text-brand-600"><i class="fas fa-pen"></i></button>
        </div>

        <div class="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-100 mb-5">
          ${menuRow('fa-receipt', 'My Orders', '#/orders')}
          ${menuRow('fa-heart', 'My Wishlist', '#/wishlist')}
          ${menuRow('fa-cart-shopping', 'My Cart', '#/cart')}
          ${menuRow('fa-bell', 'Notifications', '#/notifications')}
          ${menuRow('fa-location-dot', 'Saved Addresses', '#/addresses')}
          ${menuRow('fa-tag', 'Coupons & Offers', '#/coupons')}
        </div>

        <button id="logout-btn" class="w-full border border-red-200 text-red-500 font-semibold py-3 rounded-xl text-sm">
          <i class="fas fa-right-from-bracket mr-1.5"></i>Logout
        </button>
      </main>
      ${Components.bottomNav('profile')}
    `

    document.getElementById('logout-btn').addEventListener('click', async () => {
      try { await Api.logout() } catch (e) {}
      Api.setToken(null)
      Store.setUser(null)
      Store.setCart([], 0)
      Store.setWishlistIds([])
      UI.toast('Logged out successfully', 'info')
      Router.navigate('/')
    })

    document.getElementById('edit-profile-btn').addEventListener('click', showEditModal)
  }

  function menuRow(icon, label, href) {
    return `
    <a href="${href}" class="flex items-center gap-3 p-4 hover:bg-gray-50">
      <div class="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-brand-600"><i class="fas ${icon}"></i></div>
      <span class="flex-1 text-sm font-medium text-gray-700">${label}</span>
      <i class="fas fa-chevron-right text-xs text-gray-300"></i>
    </a>`
  }

  function showEditModal() {
    const user = Store.state.user
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center'
    modal.innerHTML = `
      <div class="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg text-gray-800">Edit Profile</h3>
          <button id="close-edit-modal" class="text-gray-400"><i class="fas fa-xmark text-xl"></i></button>
        </div>
        <label class="text-xs font-medium text-gray-500 mb-1 block">Name</label>
        <input id="edit-name" value="${UI.escapeHtml(user.name || '')}" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3" />
        <label class="text-xs font-medium text-gray-500 mb-1 block">Email</label>
        <input id="edit-email" value="${UI.escapeHtml(user.email || '')}" type="email" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4" />
        <button id="save-profile-btn" class="w-full bg-brand-600 text-white font-semibold py-3 rounded-xl text-sm">Save Changes</button>
      </div>
    `
    document.body.appendChild(modal)
    modal.querySelector('#close-edit-modal').addEventListener('click', () => modal.remove())
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove() })
    modal.querySelector('#save-profile-btn').addEventListener('click', async () => {
      const name = document.getElementById('edit-name').value.trim()
      const email = document.getElementById('edit-email').value.trim()
      try {
        const { data } = await Api.updateProfile({ name, email })
        Store.setUser(data.user)
        modal.remove()
        UI.toast('Profile updated', 'success')
        render()
      } catch (e) {
        UI.toast(Api.errMsg(e), 'error')
      }
    })
  }

  return { render }
})()
