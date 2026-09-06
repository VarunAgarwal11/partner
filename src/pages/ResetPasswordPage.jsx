import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import AuthCard from '../components/layout/AuthCard'
import { Alert, Button, Input, Label } from '../components/ui/Primitives'
import { usePartnerAuth } from '../context/PartnerAuthContext'
import * as api from '../services/api'

// Public — reached from the emailed link, which is the whole credential (the token in
// the query string), the same way /review/:token has no session behind it on the
// internal portal. A successful reset signs the caller in on the spot (the server
// returns a fresh session cookie), so this redirects into the app rather than back to
// /login.
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { refresh } = usePartnerAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword

  if (!token) {
    return (
      <AuthCard title="This link is missing its token" subtitle="Ask for a new one from the sign-in page.">
        <p className="text-sm text-ink-600">
          The link in your email should have opened this page with a token already filled in.
        </p>
      </AuthCard>
    )
  }

  if (done) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await api.resetPassword({ token, password })
      // The server already set the new session cookie — this just reads it into
      // context, the same way login() does after a normal sign-in.
      await refresh()
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title="Set a new password" subtitle="This signs you out of every other device.">
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={9}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={9}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {mismatch && <p className="mt-1.5 text-sm text-red-600">The passwords do not match.</p>}
        </div>

        <Alert className="mb-4">{error}</Alert>

        <Button
          type="submit"
          className="w-full py-3 text-base font-semibold"
          disabled={submitting || mismatch || !confirmPassword}
        >
          {submitting ? 'Saving…' : 'Set password'}
        </Button>
      </form>
    </AuthCard>
  )
}
