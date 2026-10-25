export default function Input({
  label,
  id,
  hint,
  error,
  required = false,
  className = '',
  ...props
}) {
  const inputId = id || props.name
  const describedBy = hint || error ? `${inputId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="font-sans text-small font-semibold text-ink-700"
        >
          {label}
          {required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={inputId}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : undefined}
        required={required}
        className={[
          'font-sans text-body text-ink-900 placeholder:text-ink-300',
          'bg-white border rounded-md px-3 py-2.5 w-full',
          'transition-colors duration-fast',
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-sand-300 focus:border-teal-500',
          'focus:outline-none focus:ring-2 focus:ring-teal-500/30',
          className,
        ].join(' ')}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="font-sans text-caption text-ink-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-hint`} className="font-sans text-caption text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
