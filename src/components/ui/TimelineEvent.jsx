const dotStyles = {
  neutral: 'border-sand-300 bg-white',
  teal: 'border-teal-500 bg-teal-50',
  amber: 'border-amber-500 bg-amber-50',
  red: 'border-red-500 bg-red-50',
}

export default function TimelineEvent({
  date,
  title,
  description,
  actor,
  variant = 'neutral',
  isLast = false,
}) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* connector line */}
      {!isLast && (
        <span
          className="absolute left-[7px] top-4 bottom-0 w-px bg-sand-200"
          aria-hidden="true"
        />
      )}
      {/* dot */}
      <span
        className={[
          'mt-1.5 h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 z-10',
          dotStyles[variant],
        ].join(' ')}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <p className="font-sans text-body font-semibold text-ink-800">{title}</p>
          <time className="font-sans text-caption text-ink-400 whitespace-nowrap">{date}</time>
        </div>
        {actor && (
          <p className="font-sans text-small font-medium text-teal-700">{actor}</p>
        )}
        {description && (
          <p className="font-sans text-small text-ink-500 leading-1.5">{description}</p>
        )}
      </div>
    </li>
  )
}
