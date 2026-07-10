// ============================================================
// Shared actions used across multiple pages (add to cart, wishlist toggle)
// ============================================================
const Actions = (() => {
  async function addToCart(productId, quantity = 1) {
    if (!Store.isLoggedIn()) {
      UI.toast('Please login to add items to cart', 'error')
      sessionStorage.setItem('fc_redirect_after_login', window.location.hash.slice(1) || '/')
      Router.navigate('/login')
      return false
    }
    try {
      const { data } = await Api.addToCart(productId, quantity)
      Store.setCart(data.items, data.subtotal)
      const badge = document.getElementById('cart-badge')
      if (badge) {
        badge.classList.add('pulse-badge')
        setTimeout(() => badge.classList.remove('pulse-badge'), 400)
      }
      UI.toast('Added to cart', 'success')
      return true
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
      return false
    }
  }

  async function toggleWishlist(productId, btnEl) {
    if (!Store.isLoggedIn()) {
      UI.toast('Please login to use wishlist', 'error')
      sessionStorage.setItem('fc_redirect_after_login', window.location.hash.slice(1) || '/')
      Router.navigate('/login')
      return
    }
    const isInWishlist = Store.state.wishlistIds.has(productId)
    try {
      if (isInWishlist) {
        await Api.removeWishlist(productId)
        Store.toggleWishlistId(productId, false)
        UI.toast('Removed from wishlist', 'info')
      } else {
        await Api.addWishlist(productId)
        Store.toggleWishlistId(productId, true)
        UI.toast('Added to wishlist', 'success')
      }
      if (btnEl) {
        const icon = btnEl.querySelector('i')
        const nowIn = Store.state.wishlistIds.has(productId)
        btnEl.classList.toggle('text-red-500', nowIn)
        btnEl.classList.toggle('text-gray-400', !nowIn)
        if (icon) icon.className = `${nowIn ? 'fas' : 'far'} fa-heart`
      }
    } catch (e) {
      UI.toast(Api.errMsg(e), 'error')
    }
  }

  return { addToCart, toggleWishlist }
})()
