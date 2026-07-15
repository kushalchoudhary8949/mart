// ============================================================
// Saved Addresses management page
// ============================================================
const AddressesPage = (() => {
  async function render() {
    document.getElementById('app').innerHTML = `
      ${Components.header(true, 'Saved Addresses')}
      <main class="max-w-2xl mx-auto pb-24 px-4 pt-4 page-fade">
        ${Store.isLoggedIn() ? `
          <div id="addr-list" class="space-y-3 mb-4">${UI.loadingSpinner()}</div>
          <button id="add-addr-btn" class="w-full border border-dashed border-brand-300 text-brand-600 font-semibold py-3 rounded-xl text-sm">
            <i class="fas fa-plus mr-1.5"></i>Add New Address
          </button>
        ` : Components.requireLoginPrompt('Please login to manage addresses')}
      </main>
    `
    if (!Store.isLoggedIn()) return

    document.getElementById('add-addr-btn').addEventListener('click', showAddModal)
    await load()
  }

  async function load() {
    try {
      const { data } = await Api.getAddresses()
      const container = document.getElementById('addr-list')
      if (!data.addresses.length) {
        container.innerHTML = UI.emptyState('fa-location-dot', 'No addresses saved', 'Add a delivery address to speed up checkout.')
        return
      }
      container.innerHTML = data.addresses.map((a) => `
        <div class="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
          <div class="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><i class="fas fa-location-dot"></i></div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-gray-800">${UI.escapeHtml(a.label)} ${a.is_default ? '<span class="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded ml-1">Default</span>' : ''}</p>
            <p class="text-xs text-gray-500 mt-0.5">${UI.escapeHtml(a.full_address)}</p>
          </div>
          <button data-del-id="${a.id}" class="text-gray-300 hover:text-red-500"><i class="fas fa-trash-can"></i></button>
        </div>
      `).join('')

      container.querySelectorAll('[data-del-id]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          try {
            await Api.deleteAddress(parseInt(btn.dataset.delId, 10))
            UI.toast('Address removed', 'info')
            await load()
          } catch (e) {
            UI.toast(Api.errMsg(e), 'error')
          }
        })
      })
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
    }
  }

  function showAddModal() {
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center'
    modal.innerHTML = `
      <div class="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg text-gray-800">Add New Address</h3>
          <button id="close-modal" class="text-gray-400"><i class="fas fa-xmark text-xl"></i></button>
        </div>
        <button id="detect-loc-btn" class="w-full mb-3 flex items-center justify-center gap-2 border border-brand-200 text-brand-700 font-semibold py-2.5 rounded-xl text-sm bg-brand-50 hover:bg-brand-100 transition-colors">
          <i class="fas fa-location-crosshairs"></i> Use Current Location
        </button>
        <label class="text-xs font-medium text-gray-500 mb-1 block">Label</label>
        <input id="addr-label" placeholder="Home, Work, etc." class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3" />
        <label class="text-xs font-medium text-gray-500 mb-1 block">Full Address</label>
        <textarea id="addr-full" placeholder="House no, Street, Area, City, Pincode" rows="3" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3"></textarea>
        <label class="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <input type="checkbox" id="addr-default" class="accent-brand-600" /> Set as default address
        </label>
        <button id="save-addr-btn" class="w-full bg-brand-600 text-white font-semibold py-3 rounded-xl text-sm">Save Address</button>
      </div>
    `
    document.body.appendChild(modal)
    modal.querySelector('#close-modal').addEventListener('click', () => modal.remove())
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
      const isDefault = document.getElementById('addr-default').checked
      if (!fullAddress) { UI.toast('Please enter your full address', 'error'); return }
      try {
        await Api.addAddress({ label, full_address: fullAddress, is_default: isDefault })
        modal.remove()
        UI.toast('Address saved', 'success')
        await load()
      } catch (e) {
        UI.toast(Api.errMsg(e), 'error')
      }
    })
  }

  return { render }
})()
