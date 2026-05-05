import Navbar from '@/components/Navbar'

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-28">
        <div className="rounded border border-slate-200 bg-white p-8">
          <h1 className="text-3xl font-bold text-slate-900">Educational Disclaimer</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: May 5, 2026</p>
          <div className="mt-6 space-y-5 text-sm leading-6 text-slate-700">
            <p>CircuitPath is an educational platform and does not provide licensed engineering, legal, medical, or financial advice.</p>
            <p>Always verify circuit wiring before powering components. You are responsible for safe use of hardware and tools.</p>
            <p>Lessons are designed for learning progression and may not cover all edge cases in production hardware environments.</p>
            <p>Use caution around power sources, heat, and connected equipment at all times.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

