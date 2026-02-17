import { Link } from 'react-router-dom'

export default function CookiesPage() {
  return (
    <>
      <section style={{
        background: 'var(--gradient-hero)',
        padding: '40px 0 60px',
        textAlign: 'center'
      }}>
        <div className="container">
          <span className="badge badge-accent" style={{ marginBottom: 16 }}>KEBIJAKAN</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 16 }}>
            Kebijakan <span style={{ color: 'var(--color-accent)' }}>Cookies</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: 650, margin: '0 auto' }}>
            Transparansi tentang bagaimana kami menggunakan cookies untuk meningkatkan pengalaman Anda.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="card" style={{ padding: 40, border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>1. Apa itu Cookies?</h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: 32 }}>
              Cookies adalah file teks kecil yang disimpan di perangkat Anda ketika Anda mengunjungi website kami. 
              Kami menggunakan cookies untuk mengenali preferensi Anda, menjaga Anda tetap login, dan menganalisis 
              bagaimana layanan kami digunakan.
            </p>

            <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>2. Jenis Cookies yang Kami Gunakan</h2>
            <div style={{ display: 'grid', gap: 24, marginBottom: 32 }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 12 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 8, color: 'var(--color-primary-light)' }}>Cookies Esensial</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Diperlukan agar website berfungsi dengan benar (contoh: login session, keamanan).
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 12 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 8, color: 'var(--color-accent)' }}>Cookies Analitik</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Membantu kami memahami bagaimana pengguna berinteraksi dengan website untuk peningkatan layanan.
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 12 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 8, color: '#3B82F6' }}>Cookies Fungsional</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Mengingat pilihan Anda seperti bahasa atau preferensi pencarian.
                </p>
              </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>3. Mengelola Cookies</h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: 32 }}>
              Anda dapat mengatur browser Anda untuk menolak semua cookies atau memberi tahu saat cookies dikirim. 
              Namun, beberapa fitur NanoConnect mungkin tidak berfungsi dengan baik tanpa cookies.
            </p>

            <div style={{ marginTop: 40, paddingTop: 30, borderTop: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Terakhir diperbarui: 15 Februari 2026
              </p>
              <div style={{ marginTop: 20 }}>
                <Link to="/" className="btn btn-secondary btn-sm">
                  <i className="fa-solid fa-arrow-left" style={{ marginRight: 8 }}></i> Kembali ke Beranda
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
