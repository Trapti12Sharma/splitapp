/**
 * serverWarmup — fires a health check the moment the JS bundle loads and
 * exposes a promise that resolves when the backend responds (or rejects
 * after a timeout). This lets the login page show a blocking "waking up"
 * screen only when the server is actually cold, and do nothing when it's warm.
 *
 * The module is a singleton — the fetch fires once on import, every consumer
 * that calls getWarmupPromise() gets the same promise.
 */

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')
const HEALTH_URL = BASE_URL ? `${BASE_URL}/api/health` : null

// How long we wait before deciding the server is cold and showing the overlay.
// Warm servers typically respond in < 300 ms; anything over 2 s is suspicious.
const COLD_THRESHOLD_MS = 2000

// Maximum time we'll wait for the server to wake before giving up on the overlay
// (user can still try to log in; the login request itself will wait).
const TIMEOUT_MS = 60000

let warmupPromise = null
let isServerWarm = false
let warmupStartTime = null

const startWarmup = () => {
  if (!HEALTH_URL) {
    // No API URL configured (local dev without .env) — assume warm.
    warmupPromise = Promise.resolve(true)
    isServerWarm = true
    return
  }

  warmupStartTime = Date.now()

  warmupPromise = new Promise((resolve) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
      resolve(false) // timed out — server didn't wake in time
    }, TIMEOUT_MS)

    fetch(HEALTH_URL, { method: 'GET', signal: controller.signal })
      .then((res) => {
        clearTimeout(timeout)
        isServerWarm = res.ok
        resolve(res.ok)
      })
      .catch(() => {
        clearTimeout(timeout)
        resolve(false)
      })
  })
}

// Start immediately on module import.
startWarmup()

/**
 * Returns { promise, isCold }
 *
 * promise  — resolves to true when the server is reachable, false on timeout.
 * isCold   — true if the server took longer than COLD_THRESHOLD_MS to respond
 *             at the time this function was called (i.e. it's currently warming up).
 */
export const getWarmupState = () => {
  const elapsed = warmupStartTime ? Date.now() - warmupStartTime : 0
  const alreadyResolved = isServerWarm
  const isCold = !alreadyResolved && elapsed < TIMEOUT_MS

  return {
    promise: warmupPromise,
    // True only if the health check hasn't come back yet AND we've been
    // waiting longer than the cold threshold — so warm responses (< 2s)
    // never flash the overlay at all.
    isCold: isCold && elapsed >= COLD_THRESHOLD_MS,
    isWarm: alreadyResolved,
  }
}

export { COLD_THRESHOLD_MS }
