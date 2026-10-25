export default function Select({
  label,
  id,
  hint,
  error,
  required = false,
  placeholder,
  options,
  className = '',
  ...props
}) {
  const selectId = id || props.name
  const describedBy = hint || error ? `${selectId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="font-sans text-small font-semibold text-ink-700"
        >
          {label}
          {required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={selectId}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : undefined}
        required={required}
        className={[
          'font-sans text-body text-ink-900',
          'bg-white border rounded-md px-3 py-2.5 w-full',
          'transition-colors duration-fast cursor-pointer',
          'appearance-none bg-no-repeat',
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-sand-300 focus:border-teal-500',
          'focus:outline-none focus:ring-2 focus:ring-teal-500/30',
          className,
        ].join(' ')}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237e8ea6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '16px',
          paddingRight: '2.5rem',
        }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && (
        <p id={`${selectId}-hint`} className="font-sans text-caption text-ink-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${selectId}-hint`} className="font-sans text-caption text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
