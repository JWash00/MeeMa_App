'use client'

import { User } from '@supabase/supabase-js'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardClientProps {
  user: User
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            MeeMa
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/profile"
              className="text-gray-600 hover:text-blue-500 transition-colors"
            >
              Profile
            </Link>
            <span className="text-gray-600">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-blue-500 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">Welcome to your dashboard!</p>
      </main>
    </div>
  )
}
