const variantStyles = {
  info: 'bg-teal-50 border-teal-200 text-teal-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  danger: 'bg-red-50 border-red-200 text-red-800',
  neutral: 'bg-ivory-100 border-sand-200 text-ink-700',
}

const iconPaths = {
  info: 'M12 16v-4m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  warning: 'M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 0 0-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z',
  danger: 'M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 0 0-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z',
  neutral: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
}

export default function Alert({
  variant = 'info',
  title,
  children,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={[
        'flex gap-3 rounded-md border px-4 py-3',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      <svg
        className="mt-0.5 h-5 w-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[variant]} />
      </svg>
      <div className="flex flex-col gap-0.5">
        {title && <p className="font-sans text-small font-semibold">{title}</p>}
        {children && <div className="font-sans text-small leading-1.5">{children}</div>}
      </div>
    </div>
  )
}
