const statusConfig = {
  filed: { dot: 'bg-ink-300', text: 'text-ink-600', bg: 'bg-ink-50 border-ink-100' },
  underReview: { dot: 'bg-teal-400', text: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  assigned: { dot: 'bg-teal-500', text: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  inProgress: { dot: 'bg-teal-600', text: 'text-teal-800', bg: 'bg-teal-100 border-teal-300' },
  resolved: { dot: 'bg-teal-700', text: 'text-teal-900', bg: 'bg-teal-100 border-teal-300' },
  overdue: { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  escalated: { dot: 'bg-red-600', text: 'text-red-800', bg: 'bg-red-100 border-red-300' },
  approaching: { dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
}

export default function StatusLabel({ status, label, className = '' }) {
  const config = statusConfig[status] ?? statusConfig.filed
  const displayLabel = label ?? status

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5',
        'font-sans text-caption font-semibold',
        config.bg,
        config.text,
        className,
      ].join(' ')}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {displayLabel}
    </span>
  )
}
