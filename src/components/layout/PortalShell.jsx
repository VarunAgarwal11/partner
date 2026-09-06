import { NavLink, Outlet } from 'react-router-dom'
import { usePartnerAuth } from '../../context/PartnerAuthContext'
import { useTheme } from '../../hooks/useTheme'
import { PORTALS, DEFAULT_BRAND } from '../../config/portals'
import Modal from '../ui/Modal'
import ChangePasswordForm from '../ChangePasswordForm'

const NAV = [
  { to: '/profile', label: 'My details' },
  { to: '/documents', label: 'Documents' },
  { to: '/account', label: 'Account' },
]

// The signed-in chrome. Brand comes from PORTALS[me.kind] at runtime, not from a
// build-time flag — see config/portals.js. One static build renders correctly no
// matter which of the three hostnames served it.
export default function PortalShell() {
  const { me, logout, refresh } = usePartnerAuth()
  const [theme, toggleTheme] = useTheme()
  const brand = PORTALS[me?.kind]?.brand || DEFAULT_BRAND

  return (
    <div className="app-ambient-bg min-h-dvh" data-app-scroll>
      <header className="border-b border-ink-200 bg-surface">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <span className="font-semibold tracking-tight text-brand-700">{brand}</span>
          <nav className="flex flex-wrap items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-100 text-brand-800' : 'text-ink-600 hover:bg-ink-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={toggleTheme}
              className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-100"
            >
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-100"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 pb-16 sm:px-6">
        <Outlet />
      </main>

      {/* A popup over whatever page just loaded, not a separate gated route: the server
          no longer blocks on must_change_password (see routers/portal.py), so this is a
          nudge the UI owns, not an access wall the API enforces. `dismissible={false}`
          — no backdrop click, no Escape, no X — because "to continue, reset the
          password" was the ask; closing it any other way would just paper over a
          staff-issued password nobody has actually replaced yet. Same form Account uses,
          reused rather than duplicated. */}
      {me?.mustChangePassword && (
        <Modal title="Set your password" onClose={() => {}} dismissible={false}>
          <p className="mb-4 text-sm text-ink-600">
            You're signed in with a temporary password. Set your own to continue.
          </p>
          <ChangePasswordForm submitLabel="Set password" onSuccess={refresh} />
        </Modal>
      )}
    </div>
  )
}
