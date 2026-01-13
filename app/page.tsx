import { getSnippets, getUniqueLanguages, getUniqueProviders, getAllTags } from '@/lib/supabase/snippets'
import HomeClient from '@/components/HomeClient'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch data server-side
  const [snippets, languages, providers, allTags] = await Promise.all([
    getSnippets(),
    getUniqueLanguages(),
    getUniqueProviders(),
    getAllTags(),
  ])

  return (
    <HomeClient
      initialSnippets={snippets}
      languages={languages}
      providers={providers}
      allTags={allTags}
    />
  )
}
