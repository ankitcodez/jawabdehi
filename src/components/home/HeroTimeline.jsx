import { useT } from '../../i18n/I18nContext'

const stageConfig = {
  neutral: {
    dot: 'bg-teal-500 border-teal-500',
    label: 'text-ink-500',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    connector: 'bg-teal-300',
  },
  approaching: {
    dot: 'bg-amber-400 border-amber-400',
    label: 'text-amber-700',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    connector: 'bg-amber-300',
  },
  escalated: {
    dot: 'bg-red-500 border-red-500',
    label: 'text-red-700',
    badge: 'bg-red-50 text-red-700 border-red-200',
    connector: 'bg-red-300',
  },
}

function Stage({ label, title, body, variant, isLast }) {
  const config = stageConfig[variant] ?? stageConfig.neutral
  return (
    <li className="relative flex gap-3.5 pb-5 last:pb-0">
      {!isLast && (
        <span
          className={`absolute left-[9px] top-6 bottom-1 w-0.5 ${config.connector} rounded-full`}
          aria-hidden="true"
        />
      )}
      <span
        className={[
          'relative z-10 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center',
          'rounded-full border-2 mt-0.5',
          config.dot,
        ].join(' ')}
        aria-hidden="true"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={[
              'inline-flex items-center rounded-full border px-2 py-0.5',
              'font-sans text-[0.625rem] font-semibold tracking-wide',
              config.badge,
            ].join(' ')}
          >
            {label}
          </span>
        </div>
        <p className="font-sans text-small font-semibold text-ink-800 leading-1.4">{title}</p>
        <p className="font-sans text-caption text-ink-400 leading-1.5">{body}</p>
      </div>
    </li>
  )
}

export default function HeroTimeline() {
  const t = useT()

  return (
    <div className="rounded-lg border border-sand-200 bg-white shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-sand-200 bg-ivory-50 px-5 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-teal-50 text-teal-600 flex-shrink-0">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </span>
          <p className="font-sans text-small font-semibold text-ink-700 truncate">
            {t.home.heroTimelineTitle}
          </p>
        </div>
        <span className="font-sans text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-300 flex-shrink-0">
          JWD-2026-0014
        </span>
      </div>

      {/* Timeline body */}
      <div className="px-5 py-4">
        <ul className="flex flex-col">
          <Stage
            label={t.home.heroStage1Label}
            title={t.home.heroStage1Title}
            body={t.home.heroStage1Body}
            variant="neutral"
          />
          <Stage
            label={t.home.heroStage2Label}
            title={t.home.heroStage2Title}
            body={t.home.heroStage2Body}
            variant="approaching"
          />
          <Stage
            label={t.home.heroStage3Label}
            title={t.home.heroStage3Title}
            body={t.home.heroStage3Body}
            variant="escalated"
            isLast
          />
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t border-sand-200 bg-ivory-50 px-5 py-2">
        <p className="font-sans text-[0.625rem] text-ink-300">{t.home.heroTimelineSubtitle}</p>
      </div>
    </div>
  )
}
