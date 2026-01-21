'use client'

interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

export default function Chip({
  label,
  selected = false,
  onClick,
  className = '',
}: ChipProps) {
  const baseStyles =
    'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer select-none min-h-[44px] min-w-[44px] justify-center'

  const variantStyles = selected
    ? 'bg-accent/10 border border-accent text-accent hover:bg-accent/15'
    : 'bg-surface-2 border border-border text-muted hover:border-accent/30 hover:text-text'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${className}`}
      aria-pressed={selected}
    >
      {label}
    </button>
  )
}
