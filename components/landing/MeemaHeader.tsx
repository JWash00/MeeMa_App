'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import ThemeSwitcher from '@/components/theme/ThemeSwitcher'
import Button from '../ui/Button'

export default function MeemaHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-meema-slate-950/80 backdrop-blur-lg border-b border-meema-slate-200 dark:border-meema-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-meema-indigo-500">
              Meema
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-meema-slate-600 dark:text-meema-slate-300 hover:text-meema-indigo-500 dark:hover:text-meema-indigo-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/library"
              className="text-meema-slate-600 dark:text-meema-slate-300 hover:text-meema-indigo-500 dark:hover:text-meema-indigo-400 transition-colors"
            >
              Library
            </Link>
            <Link
              href="/pricing"
              className="text-meema-slate-600 dark:text-meema-slate-300 hover:text-meema-indigo-500 dark:hover:text-meema-indigo-400 transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* Right Side: Theme Toggle + CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeSwitcher />
            <Link href="/library">
              <Button variant="primary">Start creating</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-meema-slate-100 dark:hover:bg-meema-slate-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-meema-slate-900 dark:text-meema-slate-50" />
            ) : (
              <Menu size={24} className="text-meema-slate-900 dark:text-meema-slate-50" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-meema-slate-200 dark:border-meema-slate-800">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-meema-slate-600 dark:text-meema-slate-300 hover:text-meema-indigo-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/library"
                className="text-meema-slate-600 dark:text-meema-slate-300 hover:text-meema-indigo-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Library
              </Link>
              <Link
                href="/pricing"
                className="text-meema-slate-600 dark:text-meema-slate-300 hover:text-meema-indigo-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="pt-4 border-t border-meema-slate-200 dark:border-meema-slate-800">
                <Link href="/library">
                  <Button variant="primary" className="w-full">
                    Start creating
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
