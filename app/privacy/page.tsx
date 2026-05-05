import Navbar from '@/components/Navbar'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-28">
        <div className="rounded border border-slate-200 bg-white p-8">
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: May 5, 2026</p>
          <div className="mt-6 space-y-5 text-sm leading-6 text-slate-700">
            <p>We collect account data (email, profile details), lesson progress, and basic usage analytics to run the platform.</p>
            <p>We use your data to personalize lessons, track streaks, and improve learning outcomes.</p>
            <p>We do not sell your personal data. Service providers may process data only to operate core platform functions.</p>
            <p>You can request access, correction, or deletion of your data through support contact.</p>
            <p>We use reasonable security practices, but no internet service can guarantee absolute security.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

