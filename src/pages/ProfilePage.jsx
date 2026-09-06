import { useEffect, useMemo, useState } from 'react'
import * as api from '../services/api'
import { Button, EmptyState, LoadingState, PageHeader } from '../components/ui/Primitives'
import SectionShell from '../components/form/SectionShell'
import ReadOnlySection from '../components/form/ReadOnlySection'
import { visibleSpec } from '../utils/visibility'

// The partner's own read-only record. Modelled on the internal portal's
// PartnerReviewPage — same renderer (ReadOnlySection), same client-side re-filtering of
// gated fields — but over a session instead of a mailed token, and with no confirm /
// request-changes actions: this is a profile to read, not a form to answer.
//
// No document ids or file lists are threaded through here — see DocumentsPage for those.
// GET /api/portal/me/partner carries none, so there is nothing for ReadOnlySection's
// FileNames to render; every `file`-type field simply reads "—".
export default function ProfilePage() {
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [collapsed, setCollapsed] = useState({})

  useEffect(() => {
    let active = true
    api
      .getProfile()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err) => {
        if (active) setLoadError(err.message)
      })
    return () => {
      active = false
    }
  }, [])

  const sections = useMemo(() => visibleSpec(data?.sections, data?.values), [data])

  return (
    <>
      <PageHeader
        title={data?.legalName || 'My details'}
        subtitle={data?.kindLabel}
        actions={
          data && (
            <Button as="a" variant="secondary" href={api.pdfUrl()}>
              Download PDF
            </Button>
          )
        }
      />

      {loadError ? (
        <EmptyState title="Couldn't load your details" description={loadError} />
      ) : !data ? (
        <LoadingState label="Loading your details…" />
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <SectionShell
              key={section.id}
              number={section.number}
              title={section.title}
              collapsed={Boolean(collapsed[section.id])}
              onToggle={() => setCollapsed((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
            >
              <ReadOnlySection fields={section.fields} value={data.values?.[section.id]} />
            </SectionShell>
          ))}
        </div>
      )}
    </>
  )
}
