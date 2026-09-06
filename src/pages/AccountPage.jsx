import { usePartnerAuth } from '../context/PartnerAuthContext'
import { Card, Label, PageHeader } from '../components/ui/Primitives'
import { useToast } from '../context/ToastContext'
import ChangePasswordForm from '../components/ChangePasswordForm'

export default function AccountPage() {
  const { me, refresh } = usePartnerAuth()
  const toast = useToast()

  async function handleSuccess() {
    // Updates me.mustChangePassword too, so PortalShell's first-sign-in popup does not
    // reappear after a voluntary change made from here.
    await refresh()
    toast.success('Password updated. You have been signed out of every other device.')
  }

  return (
    <>
      <PageHeader title="Account" subtitle="Your own sign-in details." />

      <Card className="mb-6 p-5">
        <Label>Email</Label>
        <p className="text-sm text-ink-800">{me?.email}</p>
        <Label className="mt-4">Name</Label>
        <p className="text-sm text-ink-800">{me?.fullName}</p>
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 text-base font-semibold text-ink-900">Change password</h2>
        <p className="mb-4 text-sm text-ink-500">
          Changing your password signs out every other device you're signed in on.
        </p>
        <ChangePasswordForm onSuccess={handleSuccess} />
      </Card>
    </>
  )
}
