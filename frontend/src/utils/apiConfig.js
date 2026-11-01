export const getApiBaseUrl = () => {
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  }
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://127.0.0.1:8000'
  }
  return 'https://samirbuilds-api.onrender.com'
}

export const API_BASE_URL = getApiBaseUrl()

