import { useState } from 'react'
import { Alert, Button, Input, Label } from './ui/Primitives'
import * as api from '../services/api'

// Shared by AccountPage (an ordinary settings action) and PortalShell's first-sign-in
// popup (see below) — one form, one place the fields and the request can drift apart.
export default function ChangePasswordForm({ submitLabel = 'Update password', onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Only shown once both fields have something to compare — not on the first
  // keystroke, which would flash a mismatch before there's anything to confirm yet.
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await api.changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-sm">
      <div className="mb-4">
        <Label htmlFor="cp-current">Current password</Label>
        <Input
          id="cp-current"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="cp-new">New password</Label>
        <Input
          id="cp-new"
          type="password"
          autoComplete="new-password"
          minLength={9}
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="cp-confirm">Confirm new password</Label>
        <Input
          id="cp-confirm"
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
      <Button type="submit" disabled={submitting || mismatch || !confirmPassword}>
        {submitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
