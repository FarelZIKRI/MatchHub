import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <>
      <section style={{
        background: 'var(--gradient-hero)',
        padding: '60px 0 60px',
        textAlign: 'center'
      }}>
        <div className="container">
          <span className="badge badge-accent" style={{ marginBottom: 16 }}>LEGAL</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 16 }}>
            Kebijakan <span style={{ color: 'var(--color-accent)' }}>Privasi</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: 650, margin: '0 auto' }}>
            Komitmen kami untuk melindungi data dan privasi Anda.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="card" style={{ padding: 40, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>1. Informasi yang Kami Kumpulkan</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: 16 }}>
                Kami mengumpulkan informasi yang Anda berikan secara langsung, seperti:
              </p>
              <ul style={{ paddingLeft: 20, color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                <li>Nama, email, dan informasi kontak</li>
                <li>Profil UMKM atau Influencer</li>
                <li>Data transaksi dan riwayat pembayaran (diproses pihak ketiga)</li>
                <li>Konten yang Anda unggah (brief, foto, ulasan)</li>
              </ul>
            </div>

            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>2. Penggunaan Informasi</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                Kami menggunakan data Anda untuk:
              </p>
              <ul style={{ paddingLeft: 20, color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                <li>Menyediakan layanan matching AI yang akurat</li>
                <li>Memproses pembayaran dan transaksi</li>
                <li>Mengirimkan notifikasi penting terkait kampanye</li>
                <li>Meningkatkan keamanan akun dan mencegah penipuan</li>
              </ul>
            </div>

            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>3. Berbagi Informasi</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                Kami tidak menjual data pribadi Anda. Kami hanya membagikan informasi dalam konteks:
              </p>
              <ul style={{ paddingLeft: 20, color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                <li>Antara UMKM dan Influencer yang berkolaborasi dalam satu order</li>
                <li>Dengan penyedia layanan pembayaran (Payment Gateway)</li>
                <li>Jika diwajibkan oleh hukum atau peraturan yang berlaku</li>
              </ul>
            </div>

            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>4. Keamanan Data</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                Kami menerapkan standar keamanan industri (enkripsi SSL, hashing password) untuk melindungi data Anda. 
                Namun, tidak ada sistem yang 100% aman, jadi kami menyarankan Anda menjaga kerahasiaan password Anda.
              </p>
            </div>

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
