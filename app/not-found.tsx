import ErrorNotice from '@/components/ui/ErrorNotice'
import { ERRORS } from '@/lib/voice/voice'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md">
        <ErrorNotice
          title={ERRORS.notFound.title}
          subtitle={ERRORS.notFound.subtitle}
        />
        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-accent hover:text-accent-hover transition-colors"
          >
            {ERRORS.notFound.action}
          </Link>
        </div>
      </div>
    </div>
  )
}
