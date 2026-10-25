import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const decisions = [
  {
    value: 'needs_information',
    label: 'Request more information',
  },
  {
    value: 'ready_for_investigation',
    label: 'Ready for investigation',
  },
  {
    value: 'possible_duplicate',
    label: 'Flag possible duplicate',
  },
  {
    value: 'insufficient_information',
    label: 'Insufficient information',
  },
  {
    value: 'no_issue_found',
    label: 'No issue found after review',
  },
]

export default function Reviewer() {
  const [complaints, setComplaints] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewerActive, setReviewerActive] = useState(false)
  const [forms, setForms] = useState({})
  const [submitting, setSubmitting] = useState({})
  const [messages, setMessages] = useState({})

  async function loadComplaints() {
    setLoading(true)
    setError('')

    try {
      const { data: role, error: roleError } = await supabase
        .from('reviewer_roles')
        .select('role, active')
        .maybeSingle()

      if (roleError) throw roleError

      const active = role?.active === true
      setReviewerActive(active)

      const { data, error: queryError } = await supabase
        .from('complaints')
        .select(
          'id, title, category, location, department, description, status, created_at'
        )
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

      setComplaints(data ?? [])
    } catch (err) {
      setError(err.message || 'Could not load complaints.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  function updateForm(complaintId, field, value) {
    setForms((previous) => ({
      ...previous,
      [complaintId]: {
        decision: 'needs_information',
        reason: '',
        ...previous[complaintId],
        [field]: value,
      },
    }))
  }

  async function submitReview(complaintId) {
    const form = forms[complaintId] ?? {
      decision: 'needs_information',
      reason: '',
    }

    if (form.reason.trim().length < 10) {
      setMessages((previous) => ({
        ...previous,
        [complaintId]: {
          type: 'error',
          text: 'Please enter a reason of at least 10 characters.',
        },
      }))
      return
    }

    setSubmitting((previous) => ({
      ...previous,
      [complaintId]: true,
    }))

    setMessages((previous) => ({
      ...previous,
      [complaintId]: null,
    }))

    try {
      const { data, error: reviewError } = await supabase.rpc(
        'submit_review_action',
        {
          target_complaint_id: complaintId,
          review_decision: form.decision,
          review_reason: form.reason.trim(),
        }
      )

      if (reviewError) throw reviewError

      setMessages((previous) => ({
        ...previous,
        [complaintId]: {
          type: 'success',
          text: `Review saved successfully. Review action ID: ${data}`,
        },
      }))

      setForms((previous) => ({
        ...previous,
        [complaintId]: {
          decision: 'needs_information',
          reason: '',
        },
      }))
    } catch (err) {
      setMessages((previous) => ({
        ...previous,
        [complaintId]: {
          type: 'error',
          text:
            err.message ||
            'Review could not be saved. Please check your permissions.',
        },
      }))
    } finally {
      setSubmitting((previous) => ({
        ...previous,
        [complaintId]: false,
      }))
    }
  }

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
          String(value ?? '').toLowerCase().includes(term)
        )

      const matchesFilter =
        filter === 'all' ||
        (filter === 'submitted' && complaint.status === 'submitted') ||
        (filter === 'closed' && complaint.status === 'closed')

      return matchesSearch && matchesFilter
    })
  }, [complaints, search, filter])

  const submittedCount = complaints.filter(
    (complaint) => complaint.status === 'submitted'
  ).length

  const closedCount = complaints.filter(
    (complaint) => complaint.status === 'closed'
  ).length

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-teal-700">
            Jawabdehi · Review centre
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Reviewer Workspace
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Review complaints, record a reasoned decision, and add an
            auditable event to the complaint history.
          </p>
        </div>

        <button
          type="button"
          onClick={loadComplaints}
          disabled={loading}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? 'Refreshing...' : 'Refresh records'}
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">
        <p className="font-semibold text-amber-950">
          Human review required
        </p>
        <p className="mt-1 text-sm leading-6 text-amber-900">
          A flag is not proof of wrongdoing or a false complaint. Record
          objective reasons and treat each decision fairly.
        </p>
      </div>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Accessible records" value={complaints.length} />
        <StatCard label="Submitted" value={submittedCount} />
        <StatCard label="Closed" value={closedCount} />
      </section>

      {!loading && !error && !reviewerActive && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Your current account does not have an active reviewer role. You
          may only see complaints allowed by your normal account permissions,
          and the server will reject review submissions.
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Complaint review queue
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Inspect a complaint before recording a decision.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_190px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, department, location or ID..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          >
            <option value="all">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {loading ? (
          <p className="rounded-xl bg-slate-50 p-8 text-center text-slate-600">
            Loading complaints...
          </p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-800">
              Could not load the review workspace
            </p>
            <p className="mt-2 break-words text-sm text-red-700">{error}</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <p className="font-semibold text-slate-900">
              No matching complaints
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Try another search or filter.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredComplaints.map((complaint) => {
              const form = forms[complaint.id] ?? {
                decision: 'needs_information',
                reason: '',
              }
              const message = messages[complaint.id]

              return (
                <article
                  key={complaint.id}
                  className="rounded-xl border border-slate-200 p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                        {complaint.category || 'Uncategorised'}
                      </p>
                      <h3 className="mt-1 break-words text-lg font-bold text-slate-900">
                        {complaint.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Department: {complaint.department}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Location: {complaint.location}
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                      {complaint.status}
                    </span>
                  </div>

                  <details className="mt-4 rounded-lg bg-slate-50 p-3">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                      Read complaint description
                    </summary>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {complaint.description}
                    </p>
                  </details>

                  <div className="mt-4">
                    <p className="text-xs text-slate-500">Complaint ID</p>
                    <p className="mt-1 break-all font-mono text-xs text-slate-700">
                      {complaint.id}
                    </p>
                    <p className="mt-3 text-xs text-slate-500">Submitted</p>
                    <p className="mt-1 text-sm text-slate-700">
                      {new Date(complaint.created_at).toLocaleString()}
                    </p>

                    <Link
                      to={`/complaint/${complaint.id}`}
                      className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                      Inspect complaint timeline
                    </Link>
                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <h4 className="text-base font-bold text-slate-900">
                      Record a review decision
                    </h4>
                    <p className="mt-1 text-sm text-slate-600">
                      Choose the closest decision and explain why. This
                      records a review action; it does not automatically
                      close or reject the complaint.
                    </p>

                    <label
                      htmlFor={`decision-${complaint.id}`}
                      className="mt-4 block text-sm font-semibold text-slate-800"
                    >
                      Decision
                    </label>
                    <select
                      id={`decision-${complaint.id}`}
                      value={form.decision}
                      onChange={(event) =>
                        updateForm(
                          complaint.id,
                          'decision',
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    >
                      {decisions.map((decision) => (
                        <option key={decision.value} value={decision.value}>
                          {decision.label}
                        </option>
                      ))}
                    </select>

                    <label
                      htmlFor={`reason-${complaint.id}`}
                      className="mt-4 block text-sm font-semibold text-slate-800"
                    >
                      Reason (at least 10 characters)
                    </label>
                    <textarea
                      id={`reason-${complaint.id}`}
                      value={form.reason}
                      onChange={(event) =>
                        updateForm(
                          complaint.id,
                          'reason',
                          event.target.value
                        )
                      }
                      minLength={10}
                      maxLength={2000}
                      rows={3}
                      placeholder="Explain the specific information supporting this review decision..."
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-slate-500">
                        {form.reason.length}/2000 characters
                      </p>
                      <button
                        type="button"
                        onClick={() => submitReview(complaint.id)}
                        disabled={
                          !reviewerActive ||
                          submitting[complaint.id] ||
                          form.reason.trim().length < 10
                        }
                        className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting[complaint.id]
                          ? 'Saving review...'
                          : 'Submit review decision'}
                      </button>
                    </div>

                    {message && (
                      <div
                        role="status"
                        className={`mt-4 break-words rounded-xl border p-3 text-sm ${
                          message.type === 'success'
                            ? 'border-teal-200 bg-teal-50 text-teal-900'
                            : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                      >
                        {message.text}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {!loading && !error && (
          <p className="mt-5 text-xs text-slate-500">
            Showing {filteredComplaints.length} of {complaints.length}{' '}
            accessible records.
          </p>
        )}
      </section>
    </main>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  )
}