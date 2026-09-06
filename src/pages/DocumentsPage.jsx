import { useEffect, useState } from 'react'
import * as api from '../services/api'
import { Card, EmptyState, LoadingState, PageHeader } from '../components/ui/Primitives'
import { formatDate } from '../utils/format'

function sizeLabel(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// A flat list rather than grouped by section/field the way the staff form shows them:
// there is no spec loaded on this page to label a field by, and "every document you've
// given Mavio" is a complete answer on its own. Add per-field grouping later if a flat
// list stops being enough — see the plan's note on why this stays simple in v1.
export default function DocumentsPage() {
  const [documents, setDocuments] = useState(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    api
      .getDocuments()
      .then((result) => {
        if (active) setDocuments(result)
      })
      .catch((err) => {
        if (active) setLoadError(err.message)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <PageHeader title="Documents" subtitle="Everything you've given Mavio." />
      {loadError ? (
        <EmptyState title="Couldn't load your documents" description={loadError} />
      ) : !documents ? (
        <LoadingState label="Loading your documents…" />
      ) : documents.length === 0 ? (
        <EmptyState title="No documents yet" description="Documents Mavio has on file for you will appear here." />
      ) : (
        <Card className="divide-y divide-ink-100">
          {documents.map((doc) => (
            <a
              key={doc.id}
              href={api.documentUrl(doc.id)}
              className="flex items-center justify-between gap-4 px-5 py-3 text-sm hover:bg-ink-50"
            >
              <span className="min-w-0 truncate font-medium text-ink-800">{doc.originalName || 'Document'}</span>
              <span className="shrink-0 text-ink-500">
                {sizeLabel(doc.sizeBytes)} · {formatDate(doc.createdAt)}
              </span>
            </a>
          ))}
        </Card>
      )}
    </>
  )
}
