import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import StatusLabel from '../components/ui/StatusLabel'
import Alert from '../components/ui/Alert'
import { supabase } from '../lib/supabase'

const EVENT_LABELS = {
  complaint_submitted: 'Complaint submitted',
  authority_assigned: 'Authority assigned',
  official_response: 'Official response received',
  status_changed: 'Complaint status changed',
  investigation_update: 'Investigation update',
  escalation_triggered: 'Escalation triggered',
  correction_recorded: 'Correction recorded',
  appeal_submitted: 'Appeal submitted',
  complaint_closed: 'Complaint closed',
  review_action: 'Reviewer decision recorded',
}

function formatDate(value) {
  if (!value) return 'Not available'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDeadlineInfo(value) {
  if (!value) {
    return {
      label: 'Not configured',
      className: 'text-gray-500',
    }
  }

  const deadline = new Date(value).getTime()

  if (Number.isNaN(deadline)) {
    return {
      label: 'Invalid deadline',
      className: 'text-gray-500',
    }
  }

  const remaining = deadline - Date.now()

  if (remaining < 0) {
    return {
      label: 'Target date passed',
      className: 'text-red-600',
    }
  }

  const days = Math.ceil(
    remaining / (1000 * 60 * 60 * 24)
  )

  return {
    label:
      days === 0
        ? 'Due today'
        : `${days} day${days === 1 ? '' : 's'} remaining`,
    className: 'text-amber-700',
  }
}

function DeadlineCard({ title, value, description }) {
  const info = getDeadlineInfo(value)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm font-medium text-gray-600">
        {title}
      </p>

      <p className="mt-2 text-base font-semibold text-gray-900">
        {formatDate(value)}
      </p>

      <p className={`mt-2 text-sm font-medium ${info.className}`}>
        {info.label}
      </p>

      <p className="mt-2 text-sm leading-5 text-gray-500">
        {description}
      </p>
    </div>
  )
}

export default function ComplaintDetails() {
  const { id } = useParams()

  const [complaint, setComplaint] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadComplaint() {
      setLoading(true)
      setError('')

      try {
        const {
          data: complaintData,
          error: complaintError,
        } = await supabase
          .from('complaints')
          .select(`
            id,
            title,
            category,
            location,
            department,
            description,
            submission_language,
            status,
            created_at,
            acknowledgement_due_at,
            response_due_at,
            resolution_due_at
          `)
          .eq('id', id)
          .single()

        if (complaintError) {
          throw complaintError
        }

        const {
          data: eventData,
          error: eventError,
        } = await supabase
          .from('complaint_events')
          .select(`
            id,
            sequence_number,
            event_type,
            description,
            actor_role,
            created_at
          `)
          .eq('complaint_id', id)
          .order('sequence_number', {
            ascending: true,
          })

        if (eventError) {
          throw eventError
        }

        if (active) {
          setComplaint(complaintData)
          setEvents(eventData || [])
        }
      } catch (err) {
        console.error(
          'Could not load complaint details:',
          err
        )

        if (active) {
          setError(
            'Could not load this complaint. Make sure you are signed in and that this complaint belongs to your account.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    if (id) {
      loadComplaint()
    } else {
      setError('No complaint ID was provided.')
      setLoading(false)
    }

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-gray-600">
          Loading complaint details...
        </p>
      </main>
    )
  }

  if (error || !complaint) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Alert type="error">
          {error || 'Complaint not found.'}
        </Alert>

        <Link
          to="/my-complaints"
          className="mt-4 inline-block font-medium text-blue-700 underline"
        >
          Back to My Complaints
        </Link>
      </main>
    )
  }

  const statusText = (complaint.status || 'submitted')
    .replace(/_/g, ' ')

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <Link
          to="/my-complaints"
          className="inline-flex min-h-10 items-center text-sm font-medium text-blue-700 hover:underline"
        >
          ← Back to My Complaints
        </Link>
      </div>

      <PageHeader
        title={complaint.title}
        subtitle={`Complaint ID: ${complaint.id}`}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Complaint details
              </h2>

              <StatusLabel status={complaint.status} />
            </div>

            <dl className="mt-5 space-y-5">
              <div>
                <dt className="text-sm text-gray-500">
                  Category
                </dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {complaint.category}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">
                  Department
                </dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {complaint.department}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">
                  Location
                </dt>
                <dd className="mt-1 text-gray-900">
                  {complaint.location}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">
                  Description
                </dt>
                <dd className="mt-1 whitespace-pre-wrap leading-7 text-gray-800">
                  {complaint.description}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">
                  Submitted on
                </dt>
                <dd className="mt-1 text-gray-900">
                  {formatDate(complaint.created_at)}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">
                  Submission language
                </dt>
                <dd className="mt-1 text-gray-900">
                  {complaint.submission_language === 'hi'
                    ? 'Hindi'
                    : 'English'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Complaint timeline */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Complaint history
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Recorded events are displayed in chronological order.
                Reviewer decisions appear here when your account has
                permission to read those events.
              </p>
            </div>

            {events.length === 0 ? (
              <p className="mt-5 text-sm text-gray-500">
                No history events are available yet.
              </p>
            ) : (
              <div className="mt-6 space-y-6">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="relative border-l-2 border-gray-200 pl-5"
                  >
                    <span
                      className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                        event.event_type === 'review_action'
                          ? 'bg-amber-500'
                          : 'bg-teal-600'
                      }`}
                    />

                    <p className="font-semibold capitalize text-gray-900">
                      {EVENT_LABELS[event.event_type] ||
                        event.event_type.replace(/_/g, ' ')}
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                      {event.description}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      {formatDate(event.created_at)}
                      {' · '}
                      {event.actor_role}
                      {' · Event #'}
                      {event.sequence_number}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Demo deadline policy notice */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 text-amber-800"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.3 3.9 2.7 17.1A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0Z"
                  />
                </svg>
              </div>

              <div>
                <h3 className="font-semibold text-amber-900">
                  Deadline policy
                </h3>

                <p className="mt-2 text-sm leading-6 text-amber-900">
                  This platform uses configurable demo targets of
                  3 days for acknowledgement, 15 days for a response,
                  and 30 days for resolution. Applicable deadlines may
                  vary by department and complaint type. An overdue
                  target triggers an escalation review; it does not
                  by itself establish departmental non-compliance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Overview
            </h2>

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Current status
              </p>

              <p className="mt-1 font-medium capitalize text-gray-900">
                {statusText}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Recorded history events
              </p>

              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {events.length}
              </p>
            </div>

            <Link
              to="/my-complaints"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-800 transition hover:bg-gray-50"
            >
              View all complaints
            </Link>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Deadline tracker
            </h2>

            <p className="mb-4 text-sm leading-6 text-gray-500">
              Target dates calculated from complaint submission.
              These are demo targets, not verified statutory deadlines.
            </p>

            <div className="space-y-3">
              <DeadlineCard
                title="Acknowledgement"
                value={complaint.acknowledgement_due_at}
                description="Demo target: 3 days after submission."
              />

              <DeadlineCard
                title="Official response"
                value={complaint.response_due_at}
                description="Demo target: 15 days after submission."
              />

              <DeadlineCard
                title="Resolution"
                value={complaint.resolution_due_at}
                description="Demo target: 30 days after submission."
              />
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}