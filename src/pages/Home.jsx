import { Link } from 'react-router-dom'
import { useT } from '../i18n/I18nContext'
import Button from '../components/ui/Button'
import StatusLabel from '../components/ui/StatusLabel'
import Alert from '../components/ui/Alert'
import HeroTimeline from '../components/home/HeroTimeline'

const processSteps = [
  {
    key: 'process1',
    icon: 'M12 4v16m8-8H4',
    iconBg: 'bg-teal-50 text-teal-700',
  },
  {
    key: 'process2',
    icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    iconBg: 'bg-amber-50 text-amber-700',
  },
  {
    key: 'process3',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.062-.18-2.087-.514-3.056z',
    iconBg: 'bg-ink-50 text-ink-600',
  },
]

const trustItems = [
  { key: 'trust1', icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
  { key: 'trust2', icon: 'M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z' },
  { key: 'trust3', icon: 'M13 7h8v8M21 7l-9 9-4-4-5 5' },
]

const sampleComplaints = [
  {
    id: 'JWD-2026-0014',
    category: 'Water supply',
    location: 'Ward 14, Pune',
    status: 'inProgress',
    statusLabel: 'In Progress',
    deadline: '3 days left',
    deadlineState: 'approaching',
    summary: 'Irregular piped water supply for over six weeks affecting 200+ households.',
  },
  {
    id: 'JWD-2026-0021',
    category: 'Road safety',
    location: 'Sector 7, Faridabad',
    status: 'filed',
    statusLabel: 'Filed',
    deadline: 'Awaiting assignment',
    deadlineState: 'neutral',
    summary: 'Broken streetlight at main pedestrian crossing, recurring after dusk.',
  },
  {
    id: 'JWD-2026-0008',
    category: 'Sanitation',
    location: 'Zone 3, Lucknow',
    status: 'resolved',
    statusLabel: 'Resolved',
    deadline: 'Resolved on time',
    deadlineState: 'neutral',
    summary: 'Overflowing drain repaired and site cleaned within response window.',
  },
  {
    id: 'JWD-2026-0019',
    category: 'Public health',
    location: 'Block 9, Patna',
    status: 'overdue',
    statusLabel: 'Overdue',
    deadline: '5 days overdue',
    deadlineState: 'overdue',
    summary: 'Primary health centre out of essential medicines for three weeks.',
  },
]

const deadlineStyles = {
  approaching: 'text-amber-700 font-semibold',
  overdue: 'text-red-700 font-semibold',
  neutral: 'text-ink-400',
}

export default function Home() {
  const t = useT()

  return (
    <div>
      {/* ── Hero ── */}
      <section className="border-b border-sand-200 bg-ivory-100">
        <div className="container-prose py-12 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* Left: copy */}
            <div className="lg:col-span-7">
              <p className="eyebrow">{t.home.eyebrow}</p>
              <h1 className="mt-3 font-editorial text-h1 sm:text-display text-ink-900 max-w-xl leading-[1.1]">
                {t.home.title}
              </h1>
              <p className="mt-5 font-sans text-body-lg text-ink-500 max-w-lg leading-1.6">
                {t.home.subtitle}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button as={Link} to="/report" size="lg">
                  {t.home.reportCta}
                </Button>
                <Button as={Link} to="/public-record" variant="secondary" size="lg">
                  {t.home.learnCta}
                </Button>
              </div>
            </div>

            {/* Right: hero timeline */}
            <div className="lg:col-span-5">
              <div className="lg:pl-4">
                <HeroTimeline />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="container-prose py-16">
        <div className="max-w-xl">
          <p className="eyebrow">{t.home.processTitle}</p>
          <h2 className="mt-2 font-editorial text-h2 text-ink-900">{t.home.processTitle}</h2>
          <p className="mt-3 font-sans text-body text-ink-500 leading-1.6">{t.home.processSubtitle}</p>
        </div>
        <ol className="mt-10 grid gap-px bg-sand-200 border border-sand-200 rounded-lg overflow-hidden sm:grid-cols-3">
          {processSteps.map((step, i) => (
            <li key={step.key} className="bg-ivory-50 p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-md ${step.iconBg}`}>
                  <svg
                    className="h-4.5 w-4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                  </svg>
                </span>
                <span className="font-editorial text-h2 text-sand-300 leading-none">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-sans text-h4 text-ink-800 leading-1.3">
                {t.home[`${step.key}Title`]}
              </h3>
              <p className="font-sans text-small text-ink-500 leading-1.6">
                {t.home[`${step.key}Body`]}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Trust & Privacy ── */}
      <section className="border-y border-sand-200 bg-ivory-100">
        <div className="container-prose py-16">
          <div className="max-w-xl">
            <p className="eyebrow">{t.home.trustTitle}</p>
            <h2 className="mt-2 font-editorial text-h2 text-ink-900">{t.home.trustTitle}</h2>
            <p className="mt-3 font-sans text-body text-ink-500 leading-1.6">{t.home.trustSubtitle}</p>
          </div>
          <ul className="mt-10 flex flex-col gap-px border border-sand-200 rounded-lg overflow-hidden bg-sand-200">
            {trustItems.map((item) => (
              <li key={item.key} className="bg-white flex gap-4 p-5 sm:p-6">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-ivory-100 text-ink-500">
                  <svg
                    className="h-4.5 w-4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h3 className="font-sans text-h4 text-ink-800 leading-1.3">
                    {t.home[`${item.key}Title`]}
                  </h3>
                  <p className="mt-1.5 font-sans text-small text-ink-500 leading-1.6">
                    {t.home[`${item.key}Body`]}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Sample complaints ── */}
      <section className="container-prose py-16">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h2 className="font-editorial text-h2 text-ink-900">{t.home.sampleComplaintsTitle}</h2>
          <p className="font-sans text-caption text-ink-400">{t.home.sampleDisclaimer}</p>
        </div>
        <ul className="mt-6 flex flex-col divide-y divide-sand-200 border border-sand-200 rounded-lg bg-white overflow-hidden">
          {sampleComplaints.map((c) => (
            <li key={c.id}>
              <Link
                to={`/complaints/${c.id}`}
                className="block px-5 py-4 hover:bg-ivory-50 transition-colors duration-fast group"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans text-small font-semibold text-ink-400">
                        {c.id}
                      </span>
                      <span className="font-sans text-small text-ink-300">·</span>
                      <span className="font-sans text-small font-medium text-ink-600">
                        {c.category}
                      </span>
                    </div>
                    <p className="font-sans text-body text-ink-800 group-hover:text-teal-700 transition-colors duration-fast">
                      {c.summary}
                    </p>
                    <p className="font-sans text-caption text-ink-400">{c.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusLabel status={c.status} label={c.statusLabel} />
                    <span className={`font-sans text-caption ${deadlineStyles[c.deadlineState]}`}>
                      {c.deadline}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Emergency reminder ── */}
      <section className="container-prose pb-16">
        <Alert variant="danger" title={t.common.emergencyNotice}>
          <a href="tel:112" className="font-semibold underline underline-offset-2">
            {t.common.callNow}
          </a>
        </Alert>
      </section>
    </div>
  )
}
