// ============================================================
// Minimal hash-based router
// ============================================================
const Router = (() => {
  const routes = []
  let currentCleanup = null

  function add(pattern, handler) {
    // pattern like '/product/:slug'
    const paramNames = []
    const regexStr = pattern.replace(/:[^/]+/g, (m) => {
      paramNames.push(m.substring(1))
      return '([^/]+)'
    })
    const regex = new RegExp(`^${regexStr}$`)
    routes.push({ regex, paramNames, handler })
  }

  async function resolve() {
    const hash = window.location.hash.slice(1) || '/'
    const [path, queryStr] = hash.split('?')
    const query = {}
    if (queryStr) {
      new URLSearchParams(queryStr).forEach((v, k) => (query[k] = v))
    }

    for (const route of routes) {
      const match = path.match(route.regex)
      if (match) {
        const params = {}
        route.paramNames.forEach((name, i) => (params[name] = decodeURIComponent(match[i + 1])))
        if (typeof currentCleanup === 'function') {
          try { currentCleanup() } catch (e) {}
        }
        currentCleanup = null
        window.scrollTo(0, 0)
        const cleanup = await route.handler(params, query)
        if (typeof cleanup === 'function') currentCleanup = cleanup
        return
      }
    }
    navigate('/')
  }

  function navigate(path) {
    if (window.location.hash.slice(1) === path) {
      resolve()
    } else {
      window.location.hash = path
    }
  }

  function start() {
    window.addEventListener('hashchange', resolve)
    resolve()
  }

  return { add, navigate, start, resolve }
})()
