import MeemaHeader from '@/components/landing/MeemaHeader'
import MeemaHero from '@/components/landing/MeemaHero'
import SocialProof from '@/components/landing/SocialProof'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import MeemaCTA from '@/components/landing/MeemaCTA'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-meema-slate-50 dark:bg-meema-slate-950 font-body">
      <MeemaHeader />
      <main>
        <MeemaHero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <MeemaCTA />
      </main>
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-meema-slate-200 dark:border-meema-slate-800">
        <div className="max-w-7xl mx-auto text-center text-sm text-meema-slate-600 dark:text-meema-slate-300">
          © {new Date().getFullYear()} Meema · Made for creators
        </div>
      </footer>
    </div>
  )
}
