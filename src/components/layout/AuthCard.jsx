import { motion } from 'framer-motion'
import { authEnter } from '../../utils/motion'
import { Card } from '../ui/Primitives'
import { DEFAULT_BRAND } from '../../config/portals'

// A centred card on a plain background — same layout as the internal portal's AuthCard.
// Brand is generic here on purpose: the two screens that render this (LoginPage,
// SetPasswordPage) run before /auth/me has resolved a kind. PortalShell is what shows
// the partner's own brand, once there is a session to read it from.
export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="app-ambient-bg flex min-h-dvh items-center justify-center px-4 py-12">
      <motion.div {...authEnter} className="w-full max-w-md">
        <p className="mb-6 text-center text-xl font-semibold tracking-tight text-brand-700">{DEFAULT_BRAND}</p>
        <Card variant="strong" className="rounded-3xl p-7 sm:p-9">
          {title && <h1 className="text-xl font-semibold text-ink-900">{title}</h1>}
          {subtitle && <p className="mt-1 mb-6 text-sm text-ink-500">{subtitle}</p>}
          {children}
        </Card>
      </motion.div>
    </div>
  )
}
