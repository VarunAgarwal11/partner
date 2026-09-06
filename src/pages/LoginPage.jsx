import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { usePartnerAuth } from '../context/PartnerAuthContext'
import AuthCard from '../components/layout/AuthCard'
import { Alert, Button, Input, Label } from '../components/ui/Primitives'

export default function LoginPage() {
  const { me, bootstrapping, login } = usePartnerAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (bootstrapping) return null
  if (me) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title="Sign in" subtitle="Sign in with the details Mavio sent you.">
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-5">
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
        <div className="mb-6">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Alert className="mb-4">{error}</Alert>

        <Button type="submit" className="w-full py-3 text-base font-semibold" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <Link
        to="/forgot-password"
        className="mt-6 block text-center text-sm font-medium text-brand-700 underline"
      >
        Forgot your password?
      </Link>
    </AuthCard>
  )
}
