import { getSnippets, getUniqueLanguages, getUniqueProviders, getAllTags } from '@/lib/supabase/snippets'
import LibraryPageWrapper from '@/components/library/LibraryPageWrapper'

export const dynamic = 'force-dynamic'

export default async function LibraryPage() {
  // Fetch data server-side from Supabase
  const [snippets, languages, providers, allTags] = await Promise.all([
    getSnippets(),
    getUniqueLanguages(),
    getUniqueProviders(),
    getAllTags(),
  ])

  return (
    <LibraryPageWrapper
      initialSnippets={snippets}
      languages={languages}
      providers={providers}
      allTags={allTags}
    />
  )
}
