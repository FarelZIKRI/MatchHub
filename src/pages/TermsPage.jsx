import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <>
      <section style={{
        background: 'var(--gradient-hero)',
        padding: '40px 0 60px',
        textAlign: 'center'
      }}>
        <div className="container">
          <span className="badge badge-accent" style={{ marginBottom: 16 }}>LEGAL</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 16 }}>
            Syarat & <span style={{ color: 'var(--color-accent)' }}>Ketentuan</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: 650, margin: '0 auto' }}>
            Aturan main untuk memastikan pengalaman terbaik bagi semua pengguna NanoConnect.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="card" style={{ padding: 40, border: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              {
                title: '1. Penerimaan Syarat',
                content: 'Dengan mengakses dan menggunakan layanan NanoConnect, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun, mohon untuk tidak menggunakan layanan kami.'
              },
              {
                title: '2. Layanan Kami',
                content: 'NanoConnect adalah platform perantara yang menghubungkan UMKM dengan Nano Influencer. Kami menyediakan alat pencarian, rekomendasi AI, dan sistem manajemen kampanye. Kami bukan agensi periklanan, melainkan penyedia teknologi.'
              },
              {
                title: '3. Akun Pengguna',
                content: 'Anda bertanggung jawab penuh atas keamanan akun Anda. NanoConnect tidak bertanggung jawab atas kerugian yang timbul akibat akses tidak sah ke akun Anda. Pastikan informasi yang Anda berikan akurat dan terkini.'
              },
              {
                title: '4. Transaksi & Pembayaran',
                content: 'Pembayaran kampanye dilakukan melalui payment gateway resmi kami. Dana akan diteruskan ke influencer setelah pekerjaan selesai dan disetujui (atau otomatis disetujui setelah periode tertentu). Biaya layanan (service fee) bersifat non-refundable.'
              },
              {
                title: '5. Konten & Hak Cipta',
                content: 'Influencer memberikan hak penggunaan konten kepada UMKM untuk keperluan pemasaran sesuai kesepakatan. Namun, hak moral tetap pada kreator. Konten tidak boleh mengandung unsur SARA, pornografi, atau ilegal.'
              },
              {
                title: '6. Batasan Tanggung Jawab',
                content: 'NanoConnect tidak menjamin hasil spesifik (seperti kenaikan penjualan) dari kampanye influencer. Kami berupaya menjaga kualitas platform, namun tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan layanan.'
              },
              {
                title: '7. Penghentian Layanan',
                content: 'Kami berhak menangguhkan atau menghapus akun yang melanggar syarat dan ketentuan, melakukan penipuan, atau aktivitas mencurigakan lainnya tanpa pemberitahuan sebelumnya.'
              },
              {
                title: '8. Hukum yang Berlaku',
                content: 'Syarat dan Ketentuan ini diatur oleh hukum Republik Indonesia. Segala sengketa akan diselesaikan melalui musyawarah atau yurisdiksi pengadilan yang berwenang di Indonesia.'
              },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: i < 7 ? 40 : 0 }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: 16 }}>{item.title}</h2>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: '1rem' }}>
                  {item.content}
                </p>
              </div>
            ))}

            <div style={{ marginTop: 50, paddingTop: 30, borderTop: '1px solid var(--color-border)' }}>
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
