'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useScroll } from '@/components/ui/use-scroll'
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon'
import { useAuth } from '@/components/auth/AuthProvider'
import { cn } from '@/lib/utils'

// Inline MeeMa logo icon
function MeemaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="url(#meema-gradient)" />
      <path
        d="M8 22V10L12 18L16 10L20 18L24 10V22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="meema-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#solutions', label: 'Solutions' },
  { href: '/pricing', label: 'Pricing' },
  { href: '#blog', label: 'Blog' },
]

export default function MeemaHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrolled = useScroll(10)
  const { user, loading } = useAuth()

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      scrolled
        ? 'top-4 mx-4 sm:mx-6 lg:mx-auto max-w-7xl'
        : 'mx-0 max-w-full'
    )}>
      <nav className={cn(
        'backdrop-blur-2xl backdrop-saturate-150 px-4 sm:px-6 lg:px-8 transition-all duration-300',
        scrolled
          ? 'bg-white/70 py-3 rounded-2xl border border-white/30 shadow-lg shadow-black/5'
          : 'bg-white/60 py-4 rounded-none border-b border-white/20 shadow-md shadow-black/5'
      )}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <MeemaIcon className="w-8 h-8" />
            <span className="text-xl font-bold text-meema-charcoal-900">
              MeeMa
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-meema-slate-600 hover:text-meema-blue-500 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side: Login + CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              user ? (
                <Link
                  href="/dashboard"
                  className="font-inter font-semibold text-[14px] text-white px-5 py-2 rounded-xl transition-colors hover:opacity-90"
                  style={{ backgroundColor: 'rgb(26, 32, 44)' }}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-meema-slate-600 hover:text-meema-blue-500 transition-colors font-medium"
                  >
                    Log In
                  </Link>
                  <Link href="/signup">
                    <button
                      className="font-inter font-semibold text-[14px] text-white px-5 py-2 rounded-xl transition-colors hover:opacity-90"
                      style={{ backgroundColor: 'rgb(26, 32, 44)' }}
                    >
                      Get Started
                    </button>
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <MenuToggleIcon
              open={mobileMenuOpen}
              className="w-6 h-6 text-meema-charcoal-900"
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-meema-slate-600 hover:text-meema-blue-500 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!loading && (
                user ? (
                  <div className="pt-4 border-t border-gray-100">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <button
                        className="w-full font-inter font-semibold text-[14px] text-white px-5 py-2 rounded-xl transition-colors hover:opacity-90"
                        style={{ backgroundColor: 'rgb(26, 32, 44)' }}
                      >
                        Dashboard
                      </button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-meema-slate-600 hover:text-meema-blue-500 transition-colors font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <div className="pt-4 border-t border-gray-100">
                      <Link href="/signup">
                        <button
                          className="w-full font-inter font-semibold text-[14px] text-white px-5 py-2 rounded-xl transition-colors hover:opacity-90"
                          style={{ backgroundColor: 'rgb(26, 32, 44)' }}
                        >
                          Get Started
                        </button>
                      </Link>
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
