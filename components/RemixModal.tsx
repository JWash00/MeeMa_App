'use client'

import { useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { REMIX } from '@/lib/voice/voice'

interface RemixModalProps {
  isOpen: boolean
  onClose: () => void
  originalPrompt: string
  promptTitle: string
}

const quickChips = [
  { label: REMIX.chips.shorter, transform: (text: string) => text.split('. ').slice(0, Math.ceil(text.split('. ').length / 2)).join('. ') + '.' },
  { label: REMIX.chips.punchier, transform: (text: string) => text.replace(/\b(very|really|quite|somewhat|rather)\s+/gi, '') },
  { label: REMIX.chips.casual, transform: (text: string) => text.replace(/\b(utilize|endeavor|facilitate|implement)\b/gi, (m) => ({ utilize: 'use', endeavor: 'try', facilitate: 'help', implement: 'do' }[m.toLowerCase()] || m)) },
  { label: REMIX.chips.pro, transform: (text: string) => text.replace(/\b(get|use|do|make)\b/gi, (m) => ({ get: 'acquire', use: 'utilize', do: 'execute', make: 'create' }[m.toLowerCase()] || m)) },
]

export default function RemixModal({
  isOpen,
  onClose,
  originalPrompt,
  promptTitle,
}: RemixModalProps) {
  const [remixedText, setRemixedText] = useState(originalPrompt)
  const [activeChip, setActiveChip] = useState<string | null>(null)

  const handleChipClick = (chip: typeof quickChips[0]) => {
    setActiveChip(chip.label)
    setRemixedText(chip.transform(remixedText))
  }

  const handleGenerate = () => {
    // Mock generate - just shows a message
    alert('Remix generated! (This is a mock feature)')
  }

  const handleSave = () => {
    // Mock save - just shows a message
    alert('Remix saved to your library! (This is a mock feature)')
    onClose()
  }

  const handleReset = () => {
    setRemixedText(originalPrompt)
    setActiveChip(null)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={REMIX.modalTitle(promptTitle)}>
      <div className="p-6 space-y-6">
        {/* Helper text */}
        <p className="text-sm text-meema-slate-600 dark:text-meema-slate-300">
          {REMIX.subtitle}
        </p>

        {/* Original prompt (readonly) */}
        <div>
          <label className="block text-sm font-medium text-meema-slate-900 dark:text-meema-slate-50 mb-2">
            {REMIX.sections.original}
          </label>
          <div className="p-4 bg-meema-slate-50 dark:bg-meema-slate-800 rounded-xl text-sm text-meema-slate-600 dark:text-meema-slate-300 max-h-32 overflow-y-auto">
            {originalPrompt}
          </div>
        </div>

        {/* Quick chips */}
        <div>
          <label className="block text-sm font-medium text-meema-slate-900 dark:text-meema-slate-50 mb-2">
            {REMIX.sections.quickEdits}
          </label>
          <div className="flex flex-wrap gap-2">
            {quickChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleChipClick(chip)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeChip === chip.label
                    ? 'bg-meema-indigo-500 text-white'
                    : 'bg-meema-slate-100 dark:bg-meema-slate-800 text-meema-slate-600 dark:text-meema-slate-300 hover:bg-meema-slate-200 dark:hover:bg-meema-slate-700'
                }`}
              >
                {chip.label}
              </button>
            ))}
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-full text-sm font-medium text-meema-slate-600 dark:text-meema-slate-300 hover:text-meema-indigo-500 transition-colors"
            >
              {REMIX.chips.reset}
            </button>
          </div>
        </div>

        {/* Editable textarea */}
        <div>
          <label className="block text-sm font-medium text-meema-slate-900 dark:text-meema-slate-50 mb-2">
            {REMIX.sections.makeYours}
          </label>
          <textarea
            value={remixedText}
            onChange={(e) => setRemixedText(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-meema-slate-200 dark:border-meema-slate-800 bg-white dark:bg-meema-slate-900 text-meema-slate-900 dark:text-meema-slate-50 placeholder:text-meema-slate-600 dark:placeholder:text-meema-slate-300 focus:outline-none focus:ring-2 focus:ring-meema-indigo-500 transition-all resize-none"
            placeholder={REMIX.placeholder}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button variant="primary" onClick={handleGenerate} className="flex-1">
            {REMIX.actions.generate}
          </Button>
          <Button variant="secondary" onClick={handleSave} className="flex-1">
            {REMIX.actions.save}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {REMIX.actions.cancel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
