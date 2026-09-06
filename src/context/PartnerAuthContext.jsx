import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../services/api'
import { setAuthErrorHandler } from '../services/http'

const PartnerAuthContext = createContext(null)

// Same shape as the internal portal's AuthContext, for a different principal: the
// server is the only source of truth for who is signed in. Nothing is stored in
// localStorage — the session is an httpOnly cookie JS cannot read, which is what keeps
// XSS from stealing it.
export function PartnerAuthProvider({ children }) {
  const [me, setMe] = useState(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    api
      .getMe()
      .then(setMe)
      .catch(() => setMe(null))
      .finally(() => setBootstrapping(false))

    // A 401/403 on anything but /portal/auth/* means this tab's idea of who is signed in
    // is stale (a password change from another tab, a staff suspend) — re-read rather
    // than leave stale account data on screen. Same pattern as the internal portal.
    setAuthErrorHandler(() => {
      api
        .getMe()
        .then(setMe)
        .catch(() => setMe(null))
    })
  }, [])

  const login = useCallback(async (email, password) => {
    const result = await api.login({ email, password })
    setMe(result)
    return result
  }, [])

  const logout = useCallback(async () => {
    await api.logout().catch(() => {})
    setMe(null)
  }, [])

  const refresh = useCallback(async () => {
    const result = await api.getMe()
    setMe(result)
    return result
  }, [])

  const value = useMemo(
    () => ({ me, bootstrapping, login, logout, refresh }),
    [me, bootstrapping, login, logout, refresh]
  )

  return <PartnerAuthContext.Provider value={value}>{children}</PartnerAuthContext.Provider>
}

export function usePartnerAuth() {
  const ctx = useContext(PartnerAuthContext)
  if (!ctx) throw new Error('usePartnerAuth must be used within a PartnerAuthProvider')
  return ctx
}
