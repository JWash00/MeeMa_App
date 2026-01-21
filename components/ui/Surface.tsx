'use client'

import { ReactNode } from 'react'

interface SurfaceProps {
  variant: 'card' | 'button'
  children: ReactNode
  className?: string
  asChild?: boolean
}

export default function Surface({ variant, children, className = '', asChild = false }: SurfaceProps) {
  const baseStyles = 'relative overflow-hidden transition-all duration-300 ease-out'

  const variantStyles = {
    card: `
      bg-panel-1
      border border-border-0
      rounded-2xl
      p-8
      hover:border-transparent
      hover:-translate-y-0.5
      hover:shadow-lg hover:shadow-accent-blue/10
      focus-visible:border-transparent
      focus-visible:-translate-y-0.5
      focus-visible:shadow-lg focus-visible:shadow-accent-blue/10
      focus-visible:ring-2 focus-visible:ring-accent-blue/40
      focus-visible:outline-none
      before:absolute before:inset-0
      before:rounded-2xl
      before:bg-gradient-to-br before:from-border-1 before:via-border-2 before:to-border-1
      before:opacity-0 before:transition-opacity before:duration-300
      hover:before:opacity-100
      focus-visible:before:opacity-100
      after:absolute after:inset-[-100%] after:top-[-50%]
      after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent
      after:rotate-[25deg] after:translate-x-[-200%] after:opacity-0
      after:transition-all after:duration-500 after:ease-out
      hover:after:translate-x-[200%] hover:after:opacity-100
      focus-visible:after:translate-x-[200%] focus-visible:after:opacity-100
    `,
    button: `
      inline-flex items-center gap-2
      px-8 py-4
      bg-accent-blue
      text-white font-medium
      rounded-lg
      hover:scale-[1.02]
      hover:shadow-lg hover:shadow-accent-blue/30
      focus-visible:scale-[1.02]
      focus-visible:shadow-lg focus-visible:shadow-accent-blue/30
      focus-visible:ring-2 focus-visible:ring-accent-violet/40
      focus-visible:outline-none
      before:absolute before:inset-0
      before:rounded-lg
      before:bg-gradient-to-br before:from-accent-blue before:via-accent-violet before:to-accent-blue
      before:opacity-0 before:transition-opacity before:duration-300
      hover:before:opacity-20
      focus-visible:before:opacity-20
      after:absolute after:inset-[-100%] after:top-[-50%]
      after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent
      after:rotate-[25deg] after:translate-x-[-200%] after:opacity-0
      after:transition-all after:duration-500 after:ease-out
      hover:after:translate-x-[200%] hover:after:opacity-100
      focus-visible:after:translate-x-[200%] focus-visible:after:opacity-100
    `
  }

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`.trim()

  if (variant === 'button') {
    return (
      <div className={combinedClassName}>
        <span className="relative z-10">{children}</span>
      </div>
    )
  }

  // Card variant
  return (
    <div className={combinedClassName}>
      {children}
    </div>
  )
}
