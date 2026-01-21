'use client'

interface TypeToggleProps {
  value: 'all' | 'workflow' | 'prompt'
  onChange: (value: 'all' | 'workflow' | 'prompt') => void
}

export default function TypeToggle({ value, onChange }: TypeToggleProps) {
  const options: { value: 'all' | 'workflow' | 'prompt'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'workflow', label: 'Workflows' },
    { value: 'prompt', label: 'Prompts' },
  ]

  return (
    <div className="inline-flex rounded-lg bg-spotify-darkgray p-1">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === option.value
              ? 'bg-spotify-green text-black'
              : 'text-spotify-lightgray hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
