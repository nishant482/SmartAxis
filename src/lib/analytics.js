export const measurementId = 'G-5B8S4H1W11'
let initialized = false

export function setAnalyticsPage(path) {
  if (typeof window === 'undefined') return false
  const enabled = import.meta.env.PROD && window.location.hostname === 'smart-axis.vercel.app'
    && path !== '/admin' && !path.startsWith('/admin/')
  window[`ga-disable-${measurementId}`] = !enabled
  return enabled
}

export function initializeAnalytics(path) {
  if (!setAnalyticsPage(path) || initialized) return
  initialized = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  // Enhanced Measurement tracks History API navigation. Sending additional
  // page_view events here would count the same visit twice.
  window.gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)
}
