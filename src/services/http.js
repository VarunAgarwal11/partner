// Thin fetch wrapper. Every request is same-origin and carries the httpOnly
// partner_session cookie; no token is ever read or stored by JS.
// Copied from the internal portal's services/http.js, not imported — see CLAUDE.md:
// this is a separate deploy from portal/, and nothing here may import from there.
export const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
  // `errors` is the per-field map from a 422; nothing on this portal submits a form yet
  // (v1 is read + account only), but the shape is kept identical to the internal
  // portal's so a future form page needs no second error-handling convention.
  constructor(message, status, code, errors) {
    super(message)
    this.status = status
    this.code = code
    this.errors = errors
  }
}

function apiError(response, payload) {
  const detail = payload?.detail
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    return new ApiError(detail.message || 'Something went wrong.', response.status, detail.code, detail.errors)
  }
  const message =
    typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail[0]?.msg || 'Please check the form and try again.'
        : 'Something went wrong.'
  return new ApiError(message, response.status)
}

let onAuthError = null

export function setAuthErrorHandler(handler) {
  onAuthError = handler
}

async function request(method, path, body) {
  const isForm = body instanceof FormData
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'same-origin',
    headers: body === undefined || isForm ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined || isForm ? body : JSON.stringify(body),
  })

  if (response.status === 204) return null

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    // /portal/auth/* excluded so a failing identity check cannot re-trigger itself —
    // same reasoning as the internal portal, on this app's own auth prefix.
    if ((response.status === 401 || response.status === 403) && !path.startsWith('/portal/auth/')) onAuthError?.()
    throw apiError(response, payload)
  }

  return payload
}

export const get = (path) => request('GET', path)
export const post = (path, body) => request('POST', path, body)
export const del = (path) => request('DELETE', path)
