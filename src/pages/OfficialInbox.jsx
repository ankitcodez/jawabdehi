import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const RESPONSE_STATUSES = [
  { value: 'under_review', label: 'Under review' },
  { value: 'investigation', label: 'Investigation in progress' },
  { value: 'awaiting_information', label: 'Awaiting information' },
  { value: 'resolved', label: 'Resolved' },
]

function formatDate(value) {
  if (!value) return 'Not available'

  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }) {
  const styles = {
    submitted: 'bg-amber-50 text-amber-800 border-amber-200',
    closed: 'bg-slate-100 text-slate-700 border-slate-200',
    under_review: 'bg-blue-50 text-blue-800 border-blue-200',
    investigation: 'bg-amber-50 text-amber-800 border-amber-200',
    awaiting_information: 'bg-orange-50 text-orange-800 border-orange-200',
    resolved: 'bg-teal-50 text-teal-800 border-teal-200',
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'
      }`}
    >
      {status
        ? status.replaceAll('_', ' ')
        : 'Unknown'}
    </span>
  )
}

export default function OfficialInbox() {
  const [complaints, setComplaints] = useState([])
  const [officialRole, setOfficialRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [responses, setResponses] = useState({})
  const [submittingId, setSubmittingId] = useState(null)
  const [responseErrors, setResponseErrors] = useState({})
  const [responseSuccess, setResponseSuccess] = useState({})

  const loadInbox = useCallback(async () => {
    setLoading(true)
    setError('')
    setNotice('')

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError

      if (!user) {
        throw new Error('Please sign in before opening the official inbox.')
      }

      const { data: role, error: roleError } = await supabase
        .from('official_roles')
        .select('user_id, department, active')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle()

      if (roleError) throw roleError

      if (!role) {
        setOfficialRole(null)
        setComplaints([])
        setError(
          'This account does not have an active official role. Register the account in official_roles first.'
        )
        return
      }

      setOfficialRole(role)

      const { data, error: complaintsError } = await supabase
        .from('complaints')
        .select(
          'id, title, category, department, location, status, created_at, acknowledgement_due_at, response_due_at, resolution_due_at'
        )
        .ilike('department', role.department.trim())
        .order('created_at', { ascending: false })

      if (complaintsError) throw complaintsError

      setComplaints(data || [])
    } catch (err) {
      console.error('Official inbox failed:', err)
      setError(
        err.message ||
          'Could not load the inbox. Check your connection and permissions.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInbox()
  }, [loadInbox])

  const filteredComplaints = useMemo(() => {
    const term = search.trim().toLowerCase()

    return complaints.filter((complaint) => {
      const matchesSearch =
        !term ||
        [
          complaint.title,
          complaint.category,
          complaint.department,
          complaint.location,
          complaint.id,
        ].some((value) =>
          String(value || '').toLowerCase().includes(term)
        )

      const matchesStatus =
        statusFilter === 'all' || complaint.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [complaints, search, statusFilter])

  const submittedCount = complaints.filter(
    (complaint) => complaint.status === 'submitted'
  ).length

  const closedCount = complaints.filter(
    (complaint) => complaint.status === 'closed'
  ).length

  function updateResponse(complaintId, field, value) {
    setResponses((current) => ({
      ...current,
      [complaintId]: {
        responseText: '',
        status: 'under_review',
        nextAction: '',
        ...current[complaintId],
        [field]: value,
      },
    }))

    setResponseErrors((current) => ({
      ...current,
      [complaintId]: '',
    }))

    setResponseSuccess((current) => ({
      ...current,
      [complaintId]: '',
    }))
  }

  async function submitResponse(complaint) {
    const form = responses[complaint.id] || {
      responseText: '',
      status: 'under_review',
      nextAction: '',
    }

    const responseText = form.responseText.trim()
    const nextAction = form.nextAction.trim()

    if (responseText.length < 10 || responseText.length > 5000) {
      setResponseErrors((current) => ({
        ...current,
        [complaint.id]: 'Your response must be between 10 and 5000 characters.',
      }))
      return
    }

    if (nextAction.length > 1000) {
      setResponseErrors((current) => ({
        ...current,
        [complaint.id]: 'The next-action field cannot exceed 1000 characters.',
      }))
      return
    }

    setSubmittingId(complaint.id)
    setResponseErrors((current) => ({ ...current, [complaint.id]: '' }))
    setResponseSuccess((current) => ({ ...current, [complaint.id]: '' }))

    try {
      const { data, error: submitError } = await supabase.rpc(
        'submit_official_response',
        {
          target_complaint_id: complaint.id,
          response_content: responseText,
          response_status: form.status,
          next_action_text: nextAction || null,
        }
      )

      if (submitError) throw submitError

      setResponseSuccess((current) => ({
        ...current,
        [complaint.id]:
          'Response recorded successfully and added to the complaint history.',
      }))

      setResponses((current) => ({
        ...current,
        [complaint.id]: {
          responseText: '',
          status: 'under_review',
          nextAction: '',
        },
      }))

      setNotice(`Response submitted for "${complaint.title}".`)

      // Refresh the inbox without losing the selected complaint.
      await loadInbox()

      // Keep the successful message visible after the inbox refresh.
      setResponseSuccess((current) => ({
        ...current,
        [complaint.id]:
          `Response saved successfully. Reference: ${String(data)}`,
      }))
    } catch (err) {
      console.error('Official response submission failed:', err)

      setResponseErrors((current) => ({
        ...current,
        [complaint.id]:
          err.message ||
          'The response could not be submitted. Please try again.',
      }))
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <section className="container-prose py-8 md:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">
            Jawabdehi · Official workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold text-ink-900 md:text-4xl">
            Official Inbox
          </h1>

          <p className="mt-3 max-w-2xl text-ink-600">
            Review complaints assigned to your registered department and
            record responses with a traceable history.
          </p>

          {officialRole && (
            <p className="mt-3 text-sm text-ink-700">
              <span className="font-semibold">Department:</span>{' '}
              {officialRole.department}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={loadInbox}
          disabled={loading}
          className="w-fit rounded-lg border border-sand-300 bg-white px-4 py-3 font-semibold text-ink-700 hover:bg-ivory-50 disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh inbox'}
        </button>
      </div>

      <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-bold">Demo workspace</p>
        <p className="mt-1">
          Responses are submitted through a protected database function.
          The selected status is recorded with the response; it does not
          independently change the complaint's main status or prove that
          the complaint has been resolved.
        </p>
      </div>

      {notice && (
        <div
          role="status"
          className="mt-5 rounded-lg border border-teal-300 bg-teal-50 p-4 text-teal-900"
        >
          {notice}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={loadInbox}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-sand-200 border-t-4 border-t-ink-700 bg-white p-5">
          <p className="text-sm text-ink-500">Department records</p>
          <p className="mt-2 text-3xl font-bold text-ink-900">
            {loading ? '—' : complaints.length}
          </p>
          <p className="mt-1 text-sm text-ink-500">Accessible complaints</p>
        </div>

        <div className="rounded-xl border border-sand-200 border-t-4 border-t-amber-500 bg-white p-5">
          <p className="text-sm text-ink-500">Submitted</p>
          <p className="mt-2 text-3xl font-bold text-ink-900">
            {loading ? '—' : submittedCount}
          </p>
          <p className="mt-1 text-sm text-ink-500">Awaiting progress</p>
        </div>

        <div className="rounded-xl border border-sand-200 border-t-4 border-t-teal-600 bg-white p-5">
          <p className="text-sm text-ink-500">Closed</p>
          <p className="mt-2 text-3xl font-bold text-ink-900">
            {loading ? '—' : closedCount}
          </p>
          <p className="mt-1 text-sm text-ink-500">Marked closed in records</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-sand-200 bg-white p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <label
              htmlFor="inbox-search"
              className="mb-2 block text-sm font-semibold text-ink-800"
            >
              Search complaints
            </label>

            <input
              id="inbox-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, department, category or ID"
              className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-ink-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="md:w-64">
            <label
              htmlFor="inbox-status"
              className="mb-2 block text-sm font-semibold text-ink-800"
            >
              Filter by complaint status
            </label>

            <select
              id="inbox-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-ink-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-ink-900">Complaint records</h2>
          <span className="text-sm text-ink-500">
            {loading ? 'Loading…' : `${filteredComplaints.length} shown`}
          </span>
        </div>

        {loading ? (
          <p className="mt-6 text-ink-600">Loading department records…</p>
        ) : filteredComplaints.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-sand-300 p-8 text-center">
            <p className="font-semibold text-ink-800">No matching complaints</p>
            <p className="mt-2 text-sm text-ink-500">
              Check that a complaint exists for this department and that
              your account has permission to read it.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {filteredComplaints.map((complaint) => {
              const form = responses[complaint.id] || {
                responseText: '',
                status: 'under_review',
                nextAction: '',
              }

              const expanded = expandedId === complaint.id

              return (
                <article
                  key={complaint.id}
                  className="rounded-lg border border-sand-200 p-4 transition-colors hover:border-teal-300"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-bold text-ink-900">
                        {complaint.title}
                      </h3>
                      <p className="mt-1 text-sm text-ink-600">
                        {complaint.category} · {complaint.department}
                      </p>
                      <p className="mt-1 text-sm text-ink-500">
                        {complaint.location || 'Location not provided'}
                      </p>
                    </div>

                    <StatusBadge status={complaint.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-ink-500">Complaint ID</p>
                      <p className="mt-1 break-all font-mono text-xs text-ink-700">
                        {complaint.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-500">Filed on</p>
                      <p className="mt-1 font-medium text-ink-800">
                        {formatDate(complaint.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-500">Acknowledgement target</p>
                      <p className="mt-1 font-medium text-ink-800">
                        {formatDate(complaint.acknowledgement_due_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-500">Response target</p>
                      <p className="mt-1 font-medium text-ink-800">
                        {formatDate(complaint.response_due_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sand-200 pt-4">
                    <Link
                      to={`/complaints/${complaint.id}`}
                      className="font-semibold text-teal-700 hover:underline"
                    >
                      Inspect timeline
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setExpandedId(expanded ? null : complaint.id)
                        setResponseErrors((current) => ({
                          ...current,
                          [complaint.id]: '',
                        }))
                      }}
                      className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800"
                    >
                      {expanded ? 'Hide response form' : 'Record official response'}
                    </button>
                  </div>

                  {expanded && (
                    <div className="mt-5 rounded-xl border border-sand-200 bg-ivory-50 p-4 md:p-5">
                      <h4 className="text-lg font-bold text-ink-900">
                        Official response
                      </h4>
                      <p className="mt-1 text-sm text-ink-600">
                        Write a factual update and, if possible, explain
                        what will happen next. Avoid including private
                        personal information.
                      </p>

                      <div className="mt-4">
                        <label
                          htmlFor={`response-${complaint.id}`}
                          className="mb-2 block text-sm font-semibold text-ink-800"
                        >
                          Response to citizen *
                        </label>
                        <textarea
                          id={`response-${complaint.id}`}
                          rows={5}
                          maxLength={5000}
                          value={form.responseText}
                          onChange={(event) =>
                            updateResponse(
                              complaint.id,
                              'responseText',
                              event.target.value
                            )
                          }
                          placeholder="Explain what has been reviewed, what action has been taken, or what information is still needed."
                          className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-ink-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                        />
                        <p className="mt-1 text-right text-xs text-ink-500">
                          {form.responseText.length}/5000 characters
                        </p>
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor={`response-status-${complaint.id}`}
                          className="mb-2 block text-sm font-semibold text-ink-800"
                        >
                          Response status *
                        </label>
                        <select
                          id={`response-status-${complaint.id}`}
                          value={form.status}
                          onChange={(event) =>
                            updateResponse(
                              complaint.id,
                              'status',
                              event.target.value
                            )
                          }
                          className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-ink-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                        >
                          {RESPONSE_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor={`next-action-${complaint.id}`}
                          className="mb-2 block text-sm font-semibold text-ink-800"
                        >
                          Next action (optional)
                        </label>
                        <textarea
                          id={`next-action-${complaint.id}`}
                          rows={2}
                          maxLength={1000}
                          value={form.nextAction}
                          onChange={(event) =>
                            updateResponse(
                              complaint.id,
                              'nextAction',
                              event.target.value
                            )
                          }
                          placeholder="For example: An inspection is planned for the next working week."
                          className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-ink-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                        />
                      </div>

                      {responseErrors[complaint.id] && (
                        <p
                          role="alert"
                          className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
                        >
                          {responseErrors[complaint.id]}
                        </p>
                      )}

                      {responseSuccess[complaint.id] && (
                        <p
                          role="status"
                          className="mt-4 break-words rounded-lg border border-teal-300 bg-teal-50 p-3 text-sm text-teal-900"
                        >
                          {responseSuccess[complaint.id]}
                        </p>
                      )}

                      <button
                        type="button"
                        disabled={submittingId === complaint.id}
                        onClick={() => submitResponse(complaint)}
                        className="mt-4 w-full rounded-lg bg-ink-900 px-5 py-3 font-semibold text-white hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        {submittingId === complaint.id
                          ? 'Submitting response…'
                          : 'Submit and record response'}
                      </button>

                      <p className="mt-3 text-xs text-ink-500">
                        Submitting creates a response record and an
                        append-only history event. It does not independently
                        change the complaint's main status.
                      </p>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link
          to="/dashboard"
          className="font-semibold text-teal-700 hover:underline"
        >
          ← Back to dashboard
        </Link>
        <Link
          to="/reviewer"
          className="font-semibold text-teal-700 hover:underline"
        >
          Reviewer workspace →
        </Link>
      </div>
    </section>
  )
}