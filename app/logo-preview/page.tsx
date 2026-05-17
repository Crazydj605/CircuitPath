export default function LogoPreview() {
  return (
    <main style={{ fontFamily: 'Inter, Segoe UI, sans-serif', background: '#f8fafc', minHeight: '100vh', padding: '48px 32px' }}>
      <h1 style={{ fontSize: 14, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 40 }}>
        CircuitPath — Logo Preview
      </h1>

      {/* Icon on light */}
      <section style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16, fontWeight: 500 }}>ICON — LIGHT BACKGROUND</p>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <img src="/logo.svg" width={200} height={200} alt="Logo 200px" style={{ display: 'block' }} />
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>200 × 200</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/logo.svg" width={100} height={100} alt="Logo 100px" style={{ display: 'block' }} />
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>100 × 100</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/logo.svg" width={56} height={56} alt="Logo 56px" style={{ display: 'block' }} />
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>56 × 56</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/logo.svg" width={32} height={32} alt="Logo 32px" style={{ display: 'block' }} />
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>32 × 32</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/logo.svg" width={20} height={20} alt="Logo 20px" style={{ display: 'block' }} />
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>20 × 20</p>
          </div>
        </div>
      </section>

      {/* Icon on dark */}
      <section style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16, fontWeight: 500 }}>ICON — DARK BACKGROUND</p>
        <div style={{ background: '#0f172a', borderRadius: 16, padding: 32, display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <img src="/logo.svg" width={200} height={200} alt="Logo dark 200px" style={{ display: 'block' }} />
            <p style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>200 × 200</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/logo.svg" width={100} height={100} alt="Logo dark 100px" style={{ display: 'block' }} />
            <p style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>100 × 100</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/logo.svg" width={56} height={56} alt="Logo dark 56px" style={{ display: 'block' }} />
            <p style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>56 × 56</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/logo.svg" width={32} height={32} alt="Logo dark 32px" style={{ display: 'block' }} />
            <p style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>32 × 32</p>
          </div>
        </div>
      </section>

      {/* Wordmark */}
      <section style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16, fontWeight: 500 }}>WORDMARK — LIGHT BACKGROUND</p>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 32 }}>
          <img src="/logo-wordmark.svg" width={440} height={80} alt="Wordmark" style={{ display: 'block' }} />
        </div>
      </section>

      {/* Wordmark dark */}
      <section style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16, fontWeight: 500 }}>WORDMARK — DARK BACKGROUND</p>
        <div style={{ background: '#0f172a', borderRadius: 12, padding: 32 }}>
          <img src="/logo-wordmark-dark.svg" width={440} height={80} alt="Wordmark dark" style={{ display: 'block' }} />
        </div>
      </section>

      {/* Navbar simulation */}
      <section style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16, fontWeight: 500 }}>IN NAVBAR CONTEXT</p>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.svg" width={32} height={32} alt="Navbar icon" style={{ display: 'block' }} />
          <span style={{ fontWeight: 700, fontSize: 17, color: '#0f172a', letterSpacing: '-0.02em' }}>CircuitPath</span>
          <div style={{ flex: 1 }}/>
          <span style={{ fontSize: 13, color: '#64748b', marginLeft: 24 }}>Learn</span>
          <span style={{ fontSize: 13, color: '#64748b', marginLeft: 24 }}>Paths</span>
          <span style={{ fontSize: 13, color: '#64748b', marginLeft: 24 }}>Components</span>
        </div>
      </section>

      <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 32 }}>
        Files: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>/public/logo.svg</code> &nbsp;
        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>/public/logo-wordmark.svg</code>
      </p>
    </main>
  )
}
