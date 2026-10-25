export default function PageHeader({ eyebrow, title, subtitle, children, className = '' }) {
  return (
    <header className={['flex flex-col gap-3', className].join(' ')}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="font-editorial text-h1 text-ink-900">{title}</h1>
      {subtitle && (
        <p className="font-sans text-body-lg text-ink-500 max-w-2xl leading-1.6">
          {subtitle}
        </p>
      )}
      {children && <div className="mt-2">{children}</div>}
    </header>
  )
}
