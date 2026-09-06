import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthCard from '../components/layout/AuthCard'
import { Alert, Button, Input, Label } from '../components/ui/Primitives'
import * as api from '../services/api'

// Public — no session exists yet, that's the whole point. Always ends in the same
// success state whether or not the address has a portal login (see api.forgotPassword);
// a form that answered differently for the two cases would let anyone holding a
// partner's email confirm they have an account here at all.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await api.forgotPassword(email)
      setSent(true)
    } catch (err) {
      // Rate-limited or a genuine server error — not "email not found", which never
      // reaches here as its own case.
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <AuthCard title="Check your email" subtitle="If that address has a portal login, a reset link is on its way.">
        <p className="text-sm text-ink-600">
          The link works once and expires in an hour. Ask your Mavio representative if it doesn't arrive.
        </p>
        <Link to="/login" className="mt-6 block text-center text-sm font-medium text-brand-700 underline">
          Back to sign in
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Forgot your password?" subtitle="We'll email you a link to set a new one.">
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-6">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Alert className="mb-4">{error}</Alert>

        <Button type="submit" className="w-full py-3 text-base font-semibold" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <Link to="/login" className="mt-6 block text-center text-sm font-medium text-brand-700 underline">
        Back to sign in
      </Link>
    </AuthCard>
  )
}
