interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
}

export default function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200'

  const variantStyles = {
    default:
      'bg-meema-slate-200 dark:bg-meema-slate-800 text-meema-slate-600 dark:text-meema-slate-300',
    success: 'bg-status-success/10 text-status-success border border-status-success/30',
    warning:
      'bg-status-warning/10 text-status-warning border border-status-warning/30',
    error: 'bg-status-error/10 text-status-error border border-status-error/30',
  }

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
