import { Navigate, Route, Routes } from 'react-router-dom'
import { PartnerAuthProvider } from './context/PartnerAuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import PortalShell from './components/layout/PortalShell'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'
import DocumentsPage from './pages/DocumentsPage'
import AccountPage from './pages/AccountPage'
import NotFoundPage from './pages/NotFoundPage'

// One SPA, one build, three hostnames (buyer/supplier/logistics) — see config/portals.js
// for why there is no per-kind route list here yet. When a route genuinely needs to
// exist for only one kind, it is a `routes: []` entry on that table, gated the same way
// PORTALS[me.kind] already gates the brand — not a second copy of App.jsx.
export default function App() {
  return (
    <PartnerAuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Public — no session exists at either point in this flow. See each page's
            own header comment for why. */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<PortalShell />}>
            <Route path="/" element={<Navigate to="/profile" replace />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </PartnerAuthProvider>
  )
}
