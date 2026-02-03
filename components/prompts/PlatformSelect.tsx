'use client'

import { Platform, PLATFORMS } from '@/lib/types/prompts'

interface PlatformSelectProps {
  value: Platform
  onChange: (platform: Platform) => void
}

export default function PlatformSelect({ value, onChange }: PlatformSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Platform)}
      className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
    >
      {PLATFORMS.map((platform) => (
        <option key={platform.id} value={platform.id}>
          {platform.label} ({platform.outputType})
        </option>
      ))}
    </select>
  )
}
