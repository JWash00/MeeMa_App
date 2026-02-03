'use client'

import { useState } from 'react'
import Shell from '@/components/layout/Shell'
import PricingClient from '@/components/PricingClient'

export default function PricingPageClient() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <Shell
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <PricingClient />
    </Shell>
  )
}
