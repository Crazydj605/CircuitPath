import Navbar from '@/components/Navbar'

export default function AcceptableUsePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-28">
        <div className="rounded border border-slate-200 bg-white p-8">
          <h1 className="text-3xl font-bold text-slate-900">Acceptable Use Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: May 5, 2026</p>
          <div className="mt-6 space-y-5 text-sm leading-6 text-slate-700">
            <p>Use CircuitPath in ways that are lawful, respectful, and safe for learners.</p>
            <p>Do not upload harmful code, abuse community tools, harass others, or attempt unauthorized access.</p>
            <p>Do not misuse educational content to impersonate credentials or provide unsafe hardware instructions.</p>
            <p>Violations may result in content removal, account restrictions, or account termination.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

