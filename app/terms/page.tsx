import Navbar from '@/components/Navbar'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-28">
        <div className="rounded border border-slate-200 bg-white p-8">
          <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: May 5, 2026</p>
          <div className="mt-6 space-y-5 text-sm leading-6 text-slate-700">
            <p>By using CircuitPath, you agree to use the platform lawfully, respectfully, and for educational purposes.</p>
            <p>You are responsible for your account security and any activity under your account.</p>
            <p>Educational content is provided as guidance, not engineering certification or licensed professional advice.</p>
            <p>You must follow hardware safety practices when building physical circuits.</p>
            <p>We may update platform features and these terms over time. Continued use means you accept updates.</p>
            <p>For legal notices, contact the individual owner using the business contact email listed in-app.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

