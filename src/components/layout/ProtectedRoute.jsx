import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { usePartnerAuth } from '../../context/PartnerAuthContext'

// Bootstrap flash, then unauthenticated → /login. There is no longer a second,
// must-change-password case here: that used to redirect to its own page, but the
// server never gated on it (see routers/portal.py) and the redirect was a second login
// wall for something meant to be a nudge. PortalShell's popup replaces it.
export default function ProtectedRoute() {
  const { me, bootstrapping } = usePartnerAuth()
  const location = useLocation()

  // Without this the first paint after a hard refresh redirects to /login while
  // GET /portal/auth/me is still in flight.
  if (bootstrapping) return null

  if (!me) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
