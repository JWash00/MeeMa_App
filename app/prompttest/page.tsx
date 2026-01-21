import { getSnippets } from '@/lib/supabase/snippets';
import PromptTestClient from '@/components/prompttest/PromptTestClient';

export const dynamic = 'force-dynamic';

export default async function PromptTestPage() {
  // Fetch all snippets server-side
  const snippets = await getSnippets();

  return <PromptTestClient initialSnippets={snippets} />;
}
