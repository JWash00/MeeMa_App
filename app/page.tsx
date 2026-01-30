import MeemaHeader from '@/components/landing/MeemaHeader'
import MeemaHero from '@/components/landing/MeemaHero'
import LogoBar from '@/components/landing/LogoBar'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import MeemaCTA from '@/components/landing/MeemaCTA'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-body">
      <MeemaHeader />
      <main>
        <MeemaHero />
        <LogoBar />
        <Features />
        <HowItWorks />
        <MeemaCTA />
      </main>
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center text-sm text-meema-slate-600">
          © {new Date().getFullYear()} MeeMa · Made for creators
        </div>
      </footer>
    </div>
  )
}
