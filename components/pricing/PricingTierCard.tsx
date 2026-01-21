'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'

interface PricingTierCardProps {
  name: string
  price: string
  positioning: string
  features: string[]
  ctaText: string
  ctaLink: string
  highlighted?: boolean
}

export default function PricingTierCard({
  name,
  price,
  positioning,
  features,
  ctaText,
  ctaLink,
  highlighted = false
}: PricingTierCardProps) {
  return (
    <div
      className={`bg-spotify-darkgray rounded-xl p-6 card-lift hover:shadow-card-hover transition-all ${
        highlighted ? 'ring-2 ring-spotify-green' : ''
      }`}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
        <div className="text-3xl font-bold text-spotify-green mb-3">{price}</div>
        <p className="text-sm text-spotify-lightgray leading-relaxed">{positioning}</p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check size={20} className="text-spotify-green flex-shrink-0 mt-0.5" />
            <span className="text-sm text-white">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Link
        href={ctaLink}
        className="block w-full px-6 py-3 bg-spotify-green hover:bg-spotify-greenhover text-black font-semibold text-sm rounded-full text-center transition-colors"
      >
        {ctaText}
      </Link>
    </div>
  )
}
