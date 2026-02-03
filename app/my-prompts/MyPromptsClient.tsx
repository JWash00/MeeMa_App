'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { SavedGeneration } from '../prompts/types'
import { deleteGeneration, listGenerations } from '../prompts/storage'

export default function MyPromptsClient() {
  const [items, setItems] = useState<SavedGeneration[]>([])
  const [openId, setOpenId] = useState<string | null>(null)

  async function load() {
    const rows = await listGenerations()
    setItems(rows.sort((a,b) => b.createdAt.localeCompare(a.createdAt)))
  }

  useEffect(() => { void load() }, [])

  async function onCopy(text: string) {
    await navigator.clipboard.writeText(text)
  }

  async function onDelete(id: string) {
    await deleteGeneration(id)
    await load()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">MeeMa</Link>
          <Link href="/prompts" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Create
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Saved</h1>
          <p className="text-gray-600 mt-1">Your saved outputs for quick reuse.</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-500 mb-4">No saved prompts yet.</p>
            <Link
              href="/prompts"
              className="inline-flex px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create a prompt
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((g) => (
              <div key={g.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{g.intentText}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {g.pattern} · {g.platform} · {new Date(g.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onCopy(g.outputPrompt)}
                      className="px-3 py-2 text-sm rounded-lg bg-gray-900 text-white"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => setOpenId(openId === g.id ? null : g.id)}
                      className="px-3 py-2 text-sm rounded-lg border border-gray-200"
                    >
                      {openId === g.id ? 'Hide' : 'Open'}
                    </button>
                    <button
                      onClick={() => onDelete(g.id)}
                      className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {openId === g.id && (
                  <div className="mt-3">
                    <textarea
                      readOnly
                      value={g.outputPrompt}
                      className="w-full min-h-[120px] p-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
