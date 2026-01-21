'use client'

import PricingTierCard from './pricing/PricingTierCard'
import ComparisonCards from './pricing/ComparisonCards'
import FAQ from './pricing/FAQ'
import { PRICING } from '@/lib/voice/voice'

const pricingTiers = [
  {
    name: PRICING.tiers.toolkit.name,
    price: PRICING.tiers.toolkit.price,
    positioning: PRICING.tiers.toolkit.positioning,
    features: [
      "Access to full snippet library",
      "Production-ready integration patterns",
      "Retry logic and error handling",
      "Rate limiting patterns",
      "Streaming response handlers",
      "Multi-provider support"
    ],
    ctaText: PRICING.tiers.toolkit.cta,
    ctaLink: "#",
    highlighted: false
  },
  {
    name: PRICING.tiers.pro.name,
    price: PRICING.tiers.pro.price,
    positioning: PRICING.tiers.pro.positioning,
    features: [
      "Everything in Toolkit",
      "Private snippet collections",
      "Internal SDK generation",
      "Team collaboration",
      "Custom integration patterns",
      "Priority support"
    ],
    ctaText: PRICING.tiers.pro.cta,
    ctaLink: "#",
    highlighted: true
  },
  {
    name: PRICING.tiers.test.name,
    price: PRICING.tiers.test.price,
    positioning: PRICING.tiers.test.positioning,
    features: [
      "Everything in Pro",
      "Multi-provider testing",
      "Side-by-side comparisons",
      "Regression test suite",
      "Performance benchmarking",
      "CI/CD integration"
    ],
    ctaText: PRICING.tiers.test.cta,
    ctaLink: "#",
    highlighted: false
  }
]

const comparisonPhilosophy = [
  {
    title: "vs All-in-one AI suites",
    description: "Those tools help you use AI. Prompt Toolkit helps you build AI into your product."
  },
  {
    title: "vs Observability tools",
    description: "Observability tells you what broke. Prompt Toolkit helps prevent it from breaking."
  }
]

export default function PricingClient() {
  return (
    <div className="max-w-6xl mx-auto py-12 space-y-16">
      {/* Hero/Intro Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          {PRICING.pageTitle}
        </h1>
        <p className="text-lg text-spotify-lightgray max-w-2xl mx-auto">
          {PRICING.pageSubtitle}
        </p>
      </section>

      {/* Pricing Tiers */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingTiers.map((tier, index) => (
            <PricingTierCard key={index} {...tier} />
          ))}
        </div>
      </section>

      {/* Differentiation Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">
            Built for shipping, not just experimenting.
          </h2>
        </div>
        <ComparisonCards />
      </section>

      {/* Comparison Philosophy */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">
          How we compare
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparisonPhilosophy.map((item, index) => (
            <div key={index} className="bg-spotify-darkgray rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
              <p className="text-sm text-spotify-lightgray leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto">
          <FAQ />
        </div>
      </section>
    </div>
  )
}
