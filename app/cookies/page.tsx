import Navbar from '@/components/Navbar'

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-28">
        <div className="rounded border border-slate-200 bg-white p-8">
          <h1 className="text-3xl font-bold text-slate-900">Cookie Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: May 5, 2026</p>
          <div className="mt-6 space-y-5 text-sm leading-6 text-slate-700">
            <p>We use essential cookies to keep you signed in and maintain secure sessions.</p>
            <p>We may use analytics cookies to understand product usage and improve lesson quality.</p>
            <p>You can control cookies through browser settings, though disabling essential cookies may break sign-in features.</p>
            <p>By using CircuitPath, you consent to this cookie usage as described here.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

