import Navbar from '@/components/Navbar'
import PricingSection from '@/components/PricingSection'

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <PricingSection />
      </div>
    </main>
  )
}
