// ============================================================
// Coupons & Offers listing page
// ============================================================
const CouponsPage = (() => {
  async function render() {
    document.getElementById('app').innerHTML = `
      ${Components.header(true, 'Coupons & Offers')}
      <main class="max-w-2xl mx-auto pb-24 px-4 pt-4 page-fade">
        <div id="coupons-list" class="space-y-3">${UI.loadingSpinner()}</div>
      </main>
    `
    try {
      const { data } = await Api.getCoupons()
      const container = document.getElementById('coupons-list')
      if (!data.coupons.length) {
        container.innerHTML = UI.emptyState('fa-tag', 'No coupons available', 'Check back later for exciting offers!')
        return
      }
      container.innerHTML = data.coupons.map((cp) => `
        <div class="bg-white border border-dashed border-brand-300 rounded-2xl p-4 relative overflow-hidden">
          <div class="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
            ${cp.discount_type === 'percent' ? cp.discount_value + '% OFF' : '₹' + cp.discount_value + ' OFF'}
          </div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center"><i class="fas fa-tag"></i></div>
            <p class="font-bold text-brand-700 text-lg">${cp.code}</p>
          </div>
          <p class="text-sm text-gray-600 mb-2">${UI.escapeHtml(cp.description)}</p>
          <p class="text-xs text-gray-400">Min. order value: ${UI.money(cp.min_order_value)}${cp.max_discount ? ` &middot; Max discount: ${UI.money(cp.max_discount)}` : ''}</p>
          <button data-copy="${cp.code}" class="mt-3 text-xs font-semibold text-brand-600 border border-brand-200 rounded-full px-3 py-1.5">
            <i class="fas fa-copy mr-1"></i>Copy Code
          </button>
        </div>
      `).join('')

      container.querySelectorAll('[data-copy]').forEach((btn) => {
        btn.addEventListener('click', () => {
          navigator.clipboard?.writeText(btn.dataset.copy).catch(() => {})
          UI.toast(`Coupon code ${btn.dataset.copy} copied!`, 'success')
        })
      })
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
    }
  }
  return { render }
})()
