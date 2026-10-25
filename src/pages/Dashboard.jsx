import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function StatCard({ label, value, detail, accent = 'teal' }) {
  const accents = {
    teal: 'border-t-teal-600',
    amber: 'border-t-amber-500',
    red: 'border-t-red-500',
    navy: 'border-t-ink-700',
  }

  return (
    <div
      className={`rounded-xl border border-sand-200 border-t-4 ${accents[accent]} bg-white p-5 shadow-sm`}
    >
      <p className="text-sm font-medium text-ink-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-ink-900">{value}</p>
      <p className="mt-2 text-sm text-ink-500">{detail}</p>
    </div>
  )
}

const demoStages = [
  {
    title: 'Stage 1 — Acknowledgement',
    target: '3-day demonstration target',
    description:
      'No acknowledgement is recorded by the configured target. The system flags the case for escalation review.',
    next: 'The configured acknowledgement target has passed.',
  },
  {
    title: 'Stage 2 — Response',
    target: '15-day demonstration target',
    description:
      'No official response is recorded by the configured target. A response escalation is demonstrated.',
    next: 'The configured response target has passed.',
  },
  {
    title: 'Stage 3 — Resolution',
    target: '30-day demonstration target',
    description:
      'No closure is recorded by the configured target. The case is flagged for resolution escalation review.',
    next: 'The configured resolution target has passed.',
  },
]

export default function Dashboard() {
  const [complaints, setComplaints] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [demoStage, setDemoStage] = useState(-1)

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const {
          data: complaintData,
          error: complaintError,
        } = await supabase
          .from('complaints')
          .select(
            'id, title, category, department, status, created_at, acknowledgement_due_at, response_due_at, resolution_due_at'
          )
          .order('created_at', { ascending: false })

        if (complaintError) throw complaintError

        const {
          data: eventData,
          error: eventError,
        } = await supabase
          .from('complaint_events')
          .select(
            'id, complaint_id, event_type, description, created_at'
          )
          .order('created_at', { ascending: false })

        if (eventError) throw eventError

        setComplaints(complaintData || [])
        setEvents(eventData || [])
      } catch (err) {
        console.error('Dashboard loading failed:', err)
        setError(
          'We could not load dashboard data. Please refresh or sign in again.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const now = Date.now()

  const escalations = events.filter(
    (event) => event.event_type === 'escalation_triggered'
  )

  const overdue = complaints.filter((complaint) => {
    if (complaint.status === 'closed') return false

    const complaintEvents = events.filter(
      (event) => event.complaint_id === complaint.id
    )

    const hasAcknowledgement = complaintEvents.some(
      (event) => event.event_type === 'authority_assigned'
    )

    const hasResponse = complaintEvents.some(
      (event) => event.event_type === 'official_response'
    )

    const hasClosure = complaintEvents.some(
      (event) => event.event_type === 'complaint_closed'
    )

    if (hasClosure) return false

    return (
      (!hasAcknowledgement &&
        complaint.acknowledgement_due_at &&
        new Date(complaint.acknowledgement_due_at).getTime() < now) ||
      (!hasResponse &&
        complaint.response_due_at &&
        new Date(complaint.response_due_at).getTime() < now) ||
      (complaint.resolution_due_at &&
        new Date(complaint.resolution_due_at).getTime() < now)
    )
  })

  if (loading) {
    return (
      <section className="container-prose py-12">
        <p className="text-ink-600">
          Loading your accountability dashboard…
        </p>
      </section>
    )
  }

  return (
    <section className="container-prose py-8 md:py-12">
      {/* Dashboard heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">
            Jawabdehi · Accountability Ledger
          </p>

          <h1 className="mt-2 text-3xl font-bold text-ink-900 md:text-4xl">
            Accountability Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-ink-600">
            Track complaints, monitor configured deadlines, and inspect
            recorded accountability events.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex w-fit items-center rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
        >
          + File a complaint
        </Link>
      </div>

      {/* Demo policy notice */}
      <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Demo policy:</strong> Deadlines are configurable
        demonstration targets, not confirmation of a legal violation.
        Complaint counts and history are limited to records your account
        is permitted to access.
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800"
        >
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Complaints visible"
          value={complaints.length}
          detail="Records available to your account"
          accent="navy"
        />

        <StatCard
          label="Submitted"
          value={
            complaints.filter((c) => c.status === 'submitted').length
          }
          detail="Awaiting recorded progress"
          accent="teal"
        />

        <StatCard
          label="Overdue targets"
          value={overdue.length}
          detail="Based on configured demo deadlines"
          accent="red"
        />

        <StatCard
          label="Escalation events"
          value={escalations.length}
          detail="Events in visible complaint history"
          accent="amber"
        />
      </div>

      {/* Interactive escalation simulation */}
      <div className="mt-8 rounded-xl border border-sand-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
              Interactive walkthrough
            </p>

            <h2 className="mt-2 text-2xl font-bold text-ink-900">
              Escalation Demo
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-ink-600">
              See how a case can progress when configured targets pass
              without the required recorded action.
            </p>
          </div>

          <span className="w-fit rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
            Simulation only
          </span>
        </div>

        {/* Three stages */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {demoStages.map((stage, index) => {
            const isReached = demoStage >= index
            const isCurrent = demoStage === index

            return (
              <div
                key={stage.title}
                className={`rounded-lg border p-4 ${
                  isCurrent
                    ? 'border-teal-600 bg-teal-50'
                    : isReached
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-sand-200 bg-ivory-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                      isReached
                        ? 'bg-teal-700 text-white'
                        : 'bg-sand-200 text-ink-700'
                    }`}
                  >
                    {isReached ? '✓' : index + 1}
                  </span>

                  <span className="text-sm font-bold text-ink-900">
                    {stage.title}
                  </span>
                </div>

                <p className="mt-3 text-xs font-semibold text-ink-600">
                  {stage.target}
                </p>

                <p className="mt-2 text-sm text-ink-600">
                  {isReached
                    ? 'Demonstration stage reached'
                    : 'Not reached in this walkthrough'}
                </p>
              </div>
            )
          })}
        </div>

        {/* Current stage details */}
        {demoStage >= 0 && demoStage < demoStages.length && (
          <div
            className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-4"
            aria-live="polite"
          >
            <p className="font-bold text-ink-900">
              {demoStages[demoStage].title}
            </p>

            <p className="mt-2 text-sm text-ink-700">
              {demoStages[demoStage].description}
            </p>

            <p className="mt-2 text-xs text-ink-600">
              {demoStages[demoStage].next}
            </p>
          </div>
        )}

        {/* FIXED: completion screen no longer accesses demoStages[3] */}
        {demoStage >= demoStages.length && (
          <div
            className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-4"
            aria-live="polite"
          >
            <p className="font-bold text-teal-800">
              Walkthrough complete
            </p>

            <p className="mt-1 text-sm text-ink-600">
              All three demonstration stages are complete. In the real
              workflow, the server-side escalation engine records events
              in the complaint history. Use Verify History to check a
              complaint’s recorded hash chain.
            </p>
          </div>
        )}

        {/* Simulation controls */}
        <div className="mt-5 flex flex-wrap gap-3">
          {demoStage < 0 ? (
            <button
              type="button"
              onClick={() => setDemoStage(0)}
              className="rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
            >
              Run escalation simulation
            </button>
          ) : demoStage < demoStages.length ? (
            <button
              type="button"
              onClick={() =>
                setDemoStage((stage) =>
                  Math.min(stage + 1, demoStages.length)
                )
              }
              className="rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
            >
              Next stage
            </button>
          ) : null}

          {demoStage >= 0 && (
            <button
              type="button"
              onClick={() => setDemoStage(-1)}
              className="rounded-lg border border-sand-300 bg-white px-4 py-3 font-semibold text-ink-700 hover:bg-ivory-50"
            >
              Reset demo
            </button>
          )}
        </div>

        <p className="mt-4 text-xs text-ink-500">
          This walkthrough is visual only. It does not create complaints,
          modify deadlines, or write simulated events to Supabase.
        </p>
      </div>

      {/* Recent complaints and latest events */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-sand-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-ink-900">
              Recent complaints
            </h2>

            <Link
              to="/my-complaints"
              className="text-sm font-semibold text-teal-700 hover:underline"
            >
              View all
            </Link>
          </div>

          {complaints.length === 0 ? (
            <p className="mt-5 text-sm text-ink-500">
              No complaints are visible to your account yet.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-sand-200">
              {complaints.slice(0, 5).map((complaint) => (
                <Link
                  key={complaint.id}
                  to={`/complaints/${complaint.id}`}
                  className="block py-4 hover:bg-ivory-50"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <div>
                      <p className="font-semibold text-ink-900">
                        {complaint.title}
                      </p>

                      <p className="mt-1 text-sm text-ink-500">
                        {complaint.category} · {complaint.department}
                      </p>
                    </div>

                    <span className="h-fit w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                      {complaint.status}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-ink-400">
                    Filed{' '}
                    {new Date(complaint.created_at).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-sand-200 bg-white p-5">
          <h2 className="text-xl font-bold text-ink-900">
            Latest events
          </h2>

          <p className="mt-1 text-sm text-ink-500">
            Recent recorded history entries
          </p>

          {events.length === 0 ? (
            <p className="mt-5 text-sm text-ink-500">
              No history events available.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {events.slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className="border-l-2 border-teal-600 pl-3"
                >
                  <p className="text-sm font-semibold text-ink-900">
                    {event.description}
                  </p>

                  <p className="mt-1 text-xs text-ink-500">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/public-record"
            className="mt-6 inline-block text-sm font-semibold text-teal-700 hover:underline"
          >
            Explore public records →
          </Link>
        </div>
      </div>
    </section>
  )
}