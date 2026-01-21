'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { label: 'Product', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: '#' },
  { label: 'GitHub', href: '#' },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 backdrop-blur-[12px] backdrop-saturate-[180%] bg-white/[0.05] border-b border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.37),inset_0_1px_0_rgba(255,255,255,0.1)]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-heading font-bold text-huly-white hover:text-huly-accent transition-colors">
            Prompt Toolkit
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-body text-huly-lightgray hover:text-huly-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/library"
              className="px-6 py-2 bg-huly-accent hover:bg-huly-accentHover text-white font-medium rounded-lg transition-colors text-sm"
            >
              Get started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-huly-lightgray hover:text-huly-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-huly-gray/30 mt-4">
            <nav className="flex flex-col gap-4">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-body text-huly-lightgray hover:text-huly-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/library"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 px-6 py-3 bg-huly-accent hover:bg-huly-accentHover text-white font-medium rounded-lg transition-colors text-center"
              >
                Get started
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
