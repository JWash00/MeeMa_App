'use client'

interface InlineHintProps {
  text: string
  className?: string
}

export default function InlineHint({ text, className = '' }: InlineHintProps) {
  return (
    <p className={`text-sm text-muted ${className}`}>
      {text}
    </p>
  )
}
