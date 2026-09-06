// Single service-layer entry point for ALL data access in this app. Every screen calls a
// function exported here; nothing outside this file knows a URL. Same convention as the
// internal portal's services/api.js.
import * as http from './http'

// ---------------------------------------------------------------------------
// Auth. The session is an httpOnly partner_session cookie set by the server — a
// separate cookie and a separate Redis namespace from staff sessions, so one can never
// be presented where the other is expected. See backend/app/sessions.py.
// ---------------------------------------------------------------------------

export const login = ({ email, password }) => http.post('/portal/auth/login', { email, password })
export const logout = () => http.post('/portal/auth/logout')
export const getMe = () => http.get('/portal/auth/me')
export const changePassword = ({ currentPassword, newPassword }) =>
  http.post('/portal/auth/change-password', { currentPassword, newPassword })

// Self-service, for someone with no live session to change a password from. The
// response is identical whether or not the address has a login — see the backend's
// portal_forgot_password docstring — so this never tells the caller which case it was.
export const forgotPassword = (email) => http.post('/portal/auth/forgot-password', { email })

// The token is whatever arrived in the emailed link's query string, not one this app
// minted — an unknown, expired or already-used token all come back as one 400.
export const resetPassword = ({ token, password }) =>
  http.post('/portal/auth/reset-password', { token, password })

// ---------------------------------------------------------------------------
// The partner's own record.
// ---------------------------------------------------------------------------

export const getProfile = () => http.get('/portal/me/partner')
export const getDocuments = () => http.get('/portal/me/documents')

// <a href>, not fetched — a same-origin navigation carries the httpOnly cookie on its
// own, so the browser downloads the file with no token and no blob copy in JS memory.
// Same pattern as the internal portal's api.documentUrl / api.partnerPdfUrl.
export const documentUrl = (documentId) => `${http.BASE_URL}/portal/me/documents/${documentId}/file`
export const pdfUrl = () => `${http.BASE_URL}/portal/me/pdf`
