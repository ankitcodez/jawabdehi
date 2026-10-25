const variants = {
  primary:
    'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 border border-teal-600 hover:border-teal-700',
  secondary:
    'bg-ivory-50 text-ink-700 hover:bg-ivory-100 border border-sand-300 hover:border-sand-400',
  ghost:
    'bg-transparent text-ink-600 hover:text-ink-900 hover:bg-ivory-100 border border-transparent',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-red-600 hover:border-red-700',
  outline:
    'bg-transparent text-teal-700 hover:bg-teal-50 border border-teal-500 hover:border-teal-600',
}

const sizes = {
  sm: 'px-3 py-1.5 text-small',
  md: 'px-4 py-2.5 text-body',
  lg: 'px-6 py-3 text-body-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  as = 'button',
  className = '',
  ...props
}) {
  const Tag = as
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-md font-sans font-semibold',
    'transition-colors duration-fast ease-default cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className,
  ].join(' ')

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  )
}
