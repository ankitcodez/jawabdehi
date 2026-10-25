import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n/I18nContext'
import PageHeader from '../components/ui/PageHeader'
import StatusLabel from '../components/ui/StatusLabel'
import Alert from '../components/ui/Alert'
import { supabase } from '../lib/supabase'

const deadlineStyles = {
  neutral: 'text-ink-400',
}

function formatDate(date) {
  if (!date) return 'Date unavailable'

  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getStatus(status) {
  const statuses = {
    submitted: { status: 'filed', label: 'Filed' },
    filed: { status: 'filed', label: 'Filed' },
    in_progress: { status: 'inProgress', label: 'In Progress' },
    resolved: { status: 'resolved', label: 'Resolved' },
    rejected: { status: 'rejected', label: 'Rejected' },
  }

  return statuses[status] || { status: 'filed', label: 'Filed' }
}

export default function MyComplaints() {
  const t = useT()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [verifyingId, setVerifyingId] = useState(null)
  const [verificationResults, setVerificationResults] = useState({})
  const [verificationErrors, setVerificationErrors] = useState({})

  useEffect(() => {
    let active = true

    async function loadComplaints() {
      setLoading(true)
      setError('')

      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (!sessionData.session) {
          throw new Error(
            'Your session has expired. Please submit a test complaint again to establish a session.'
          )
        }

        const { data, error: queryError } = await supabase
          .from('complaints')
          .select('id, title, category, status, created_at, description')
          .order('created_at', { ascending: false })

        if (queryError) throw queryError

        if (active) {
          setComplaints(data || [])
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not load your complaints.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadComplaints()

    return () => {
      active = false
    }
  }, [])

  async function verifyHistory(complaintId) {
    setVerifyingId(complaintId)

    setVerificationResults((previous) => ({
      ...previous,
      [complaintId]: null,
    }))

    setVerificationErrors((previous) => ({
      ...previous,
      [complaintId]: '',
    }))

    try {
      const { data, error: verifyError } = await supabase.rpc(
        'verify_complaint_history',
        {
          target_complaint_id: complaintId,
        }
      )

      if (verifyError) throw verifyError

      if (!data || data.length === 0) {
        throw new Error(
          'No history events were found for this complaint.'
        )
      }

      const valid = data.every(
        (event) =>
          event.hash_matches === true &&
          event.chain_matches === true &&
          event.history_valid === true
      )

      setVerificationResults((previous) => ({
        ...previous,
        [complaintId]: {
          valid,
          eventCount: data.length,
          events: data,
        },
      }))
    } catch (err) {
      setVerificationErrors((previous) => ({
        ...previous,
        [complaintId]:
          err.message || 'Could not verify complaint history.',
      }))
    } finally {
      setVerifyingId(null)
    }
  }

  return (
    <div className="container-prose py-10 sm:py-16">
      <PageHeader
        eyebrow={t.myComplaints.eyebrow}
        title={t.myComplaints.title}
        subtitle={t.myComplaints.subtitle}
      />

      <div className="mt-8">
        {loading ? (
          <div
            className="rounded-md border border-sand-200 bg-white p-6 text-ink-600"
            role="status"
          >
            Loading your complaints...
          </div>
        ) : error ? (
          <Alert variant="neutral">{error}</Alert>
        ) : complaints.length === 0 ? (
          <div className="space-y-4">
            <Alert variant="neutral">
              {t.myComplaints.empty}
            </Alert>

            <Link
              to="/report"
              className="inline-flex min-h-12 items-center rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
            >
              Report a complaint
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-ink-500">
              {complaints.length} complaint
              {complaints.length === 1 ? '' : 's'} found
            </p>

            <ul className="flex flex-col divide-y divide-sand-200 overflow-hidden rounded-md border border-sand-200 bg-white">
              {complaints.map((complaint) => {
                const status = getStatus(complaint.status)
                const result = verificationResults[complaint.id]
                const verifyError = verificationErrors[complaint.id]

                return (
                  <li key={complaint.id} className="px-5 py-5">
                    <Link
                      to={`/complaints/${complaint.id}`}
                      className="group block rounded-md transition-colors hover:bg-ivory-50"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <span className="break-all font-sans text-xs font-semibold text-ink-400">
                            Complaint ID: {complaint.id}
                          </span>

                          <span className="font-sans text-sm font-medium text-ink-600">
                            {complaint.category}
                          </span>

                          <h2 className="font-sans text-base font-semibold text-ink-800 transition-colors group-hover:text-teal-700">
                            {complaint.title}
                          </h2>

                          <p className="font-sans text-sm text-ink-500">
                            Submitted: {formatDate(complaint.created_at)}
                          </p>
                        </div>

                        <div className="flex flex-shrink-0 flex-col items-start gap-2 sm:items-end">
                          <StatusLabel
                            status={status.status}
                            label={status.label}
                          />

                          <span
                            className={`font-sans text-xs ${deadlineStyles.neutral}`}
                          >
                            Deadline tracking not yet enabled
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="mt-4 border-t border-sand-200 pt-4">
                      <button
                        type="button"
                        onClick={() => verifyHistory(complaint.id)}
                        disabled={verifyingId !== null}
                        className="inline-flex min-h-12 items-center justify-center rounded-md border border-teal-700 px-4 py-2 font-sans text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {verifyingId === complaint.id
                          ? 'Verifying history...'
                          : 'Verify History'}
                      </button>

                      {verifyError && (
                        <div
                          className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                          role="alert"
                        >
                          Verification could not be completed: {verifyError}
                        </div>
                      )}

                      {result && (
                        <div
                          className={`mt-3 rounded-md border p-4 ${
                            result.valid
                              ? 'border-teal-200 bg-teal-50 text-teal-900'
                              : 'border-red-200 bg-red-50 text-red-900'
                          }`}
                          role="status"
                        >
                          <p className="font-semibold">
                            {result.valid
                              ? 'History verification passed'
                              : 'History verification failed'}
                          </p>

                          <p className="mt-1 text-sm">
                            Checked {result.eventCount} history event
                            {result.eventCount === 1 ? '' : 's'}.
                          </p>

                          <ul className="mt-3 space-y-1 text-sm">
                            {result.events.map((event) => (
                              <li key={event.sequence_number}>
                                Event {event.sequence_number}: hash{' '}
                                {event.hash_matches ? 'PASS' : 'FAIL'},
                                {' '}chain{' '}
                                {event.chain_matches ? 'PASS' : 'FAIL'},
                                {' '}sequence and integrity{' '}
                                {event.history_valid ? 'PASS' : 'FAIL'}
                              </li>
                            ))}
                          </ul>

                          <p className="mt-3 text-xs">
                            This check validates the stored event hashes
                            and links. It does not prove who originally
                            supplied the complaint or prevent a privileged
                            administrator from rewriting the entire history.
                          </p>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}