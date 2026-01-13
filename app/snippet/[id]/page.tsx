import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSnippetById } from '@/lib/supabase/snippets'
import { trackSnippetEvent } from '@/lib/supabase/analytics'
import SnippetDetail from '@/components/SnippetDetail'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function SnippetPage({ params }: PageProps) {
  const { id } = await params
  const snippet = await getSnippetById(id)

  if (!snippet) {
    notFound()
  }

  // Track view event (fire and forget)
  trackSnippetEvent(id, 'view').catch(() => {
    // Silently fail - analytics shouldn't break the page
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to snippets
        </Link>

        <SnippetDetail snippet={snippet} />
      </div>
    </main>
  )
}
