import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <>
      {/* Header & Vision/Commitment */}
      {/* Header & Vision/Commitment */}
      <section style={{
        background: 'var(--gradient-hero)',
        padding: '40px 0 60px',
        textAlign: 'center'
      }}>
        <div className="container">
          <span className="badge badge-primary" style={{ marginBottom: 16 }}>TENTANG KAMI</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: 16 }}>
            Membangun <span style={{ color: 'var(--color-primary-light)' }}>Jembatan</span> antara<br />
            UMKM & Nano Influencer
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: 650, margin: '0 auto 60px' }}>
            NanoConnect adalah platform AI-powered yang menghubungkan UMKM Indonesia 
            dengan nano influencer terpercaya untuk kampanye pemasaran yang efektif.
          </p>

          {/* Vision & Commitment Cards */}
          <div className="grid-vision">
            {/* Visi */}
            <div className="card" style={{ 
              textAlign: 'center', padding: 48, 
              background: 'white',
              border: '1px solid var(--color-border)',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: 20, 
                background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
                boxShadow: '0 8px 16px rgba(14, 165, 233, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 24px' 
              }}>
                <i className="fa-solid fa-rocket" style={{ fontSize: '1.8rem', color: '#fff' }}></i>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Visi</h3>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                Menjadi platform influencer marketing #1 di Indonesia yang membantu jutaan UMKM berkembang.
              </p>
            </div>

            {/* Komitmen */}
            <div className="card" style={{ 
              textAlign: 'center', padding: 48,
              background: 'white',
              border: '1px solid var(--color-border)',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: 20, 
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 24px' 
              }}>
                <i className="fa-solid fa-user-group" style={{ fontSize: '1.8rem', color: '#fff' }}></i>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Komitmen</h3>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                Memberdayakan ribuan nano influencer untuk memonetisasi pengaruh mereka secara berkelanjutan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nilai Inti Section */}
      <section className="section" style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: 48 }}>
              Nilai <span style={{ color: 'var(--color-primary)' }}>Inti</span>
            </h2>
            <div className="grid-values">
              {[
                { icon: 'fa-handshake', title: 'Transparansi', desc: 'Keterbukaan dalam setiap transaksi dan komunikasi.', color: '#3B82F6' },
                { icon: 'fa-lightbulb', title: 'Inovasi', desc: 'Terus berkembang dengan teknologi AI terbaik.', color: '#0EA5E9' },
                { icon: 'fa-users', title: 'Komunitas', desc: 'Membangun ekosistem yang saling mendukung.', color: '#8B5CF6' },
                { icon: 'fa-shield-halved', title: 'Kepercayaan', desc: 'Menjamin keamanan dan kualitas layanan.', color: '#10B981' }
              ].map((val, idx) => (
                <div key={idx} className="card" style={{ 
                  textAlign: 'center', padding: '32px 24px',
                  background: 'white',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ 
                    width: 50, height: 50, borderRadius: '50%', background: `${val.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                  }}>
                    <i className={`fa-solid ${val.icon}`} style={{ fontSize: '1.4rem', color: val.color }}></i>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: 12 }}>{val.title}</h4>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ background: 'var(--color-surface)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="badge badge-accent" style={{ marginBottom: 16 }}>CARA KERJA</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
              Semudah Berhitung <span style={{ color: 'var(--color-accent)' }}>1-2-3</span>
            </h2>
          </div>

          <div className="grid-steps">
            {[
              { step: '01', icon: 'fa-user-plus', title: 'Daftar & Buat Profil', desc: 'Buat akun UMKM Anda dan lengkapi profil bisnis termasuk niche, budget, dan target audiens.' },
              { step: '02', icon: 'fa-wand-magic-sparkles', title: 'Dapatkan Rekomendasi AI', desc: 'AI kami akan menganalisis profil Anda dan merekomendasikan influencer yang paling cocok.' },
              { step: '03', icon: 'fa-handshake', title: 'Mulai Kolaborasi', desc: 'Pilih influencer, buat order, dan mulai kampanye pemasaran yang efektif untuk bisnis Anda.' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 24,
                  background: 'white',
                  border: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
                }}>
                  <i className={`fa-solid ${item.icon}`} style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}></i>
                </div>

                <h3 style={{ fontSize: '1.15rem', marginBottom: 10, position: 'relative', zIndex: 1 }}>{item.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section" style={{ padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="badge badge-primary" style={{ marginBottom: 16 }}>TECH STACK</span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: 60 }}>
            Dibangun dengan <span style={{ color: 'var(--color-primary-light)' }}>Teknologi Modern</span>
          </h2>

          <div className="grid-tech">
            {[
              { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png', name: 'React.js', desc: 'Frontend Framework', color: '#61DAFB' },
              { logo: 'https://raw.githubusercontent.com/supabase/supabase/master/packages/common/assets/images/supabase-logo-icon.png', name: 'Supabase', desc: 'PostgreSQL Backend', color: '#3ECF8E' },
              { logo: 'https://img.icons8.com/color/480/tencent-cloud.png', name: 'Tencent Cloud', desc: 'Edge Computing', color: '#0052FF' }, // Tencent Cloud EdgeOne
              { logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', name: 'OpenAI', desc: 'AI Integration', color: '#10A37F' },
              { logo: 'https://img.icons8.com/fluency/96/google-logo.png', name: 'Google Auth', desc: 'Authentication', color: '#4285F4' },
              { logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg', name: 'Tailwind CSS', desc: 'Utility-first CSS', color: '#38B2AC' },
            ].map((tech, i) => (
              <TechCard key={i} tech={tech} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function TechCard({ tech }) {
  const [hover, setHover] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <div 
      className="glass"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '32px 24px', borderRadius: 16,
        textAlign: 'center', transition: 'all 0.3s ease',
        transform: hover ? 'translateY(-5px)' : 'translateY(0)',
        border: hover ? `1px solid ${tech.color}40` : '1px solid transparent',
        background: hover ? `linear-gradient(145deg, ${tech.color}10, white)` : 'transparent',
        boxShadow: hover ? 'var(--shadow-lg)' : 'none'
      }}
    >
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        {!imgError ? (
          <img 
            src={tech.logo} 
            alt={tech.name}
            onError={() => setImgError(true)}
            style={{ 
              height: '100%', 
              maxHeight: 56,
              maxWidth: '100%',
              objectFit: 'contain',
              transition: 'all 0.3s ease',
              filter: hover ? 'none' : 'grayscale(100%) opacity(0.5)'
            }}
          />
        ) : (
          <i 
            className="fa-solid fa-cloud" 
            style={{ 
              fontSize: '2.5rem', 
              color: hover ? tech.color : 'var(--color-text-muted)',
              transition: 'all 0.3s ease',
              filter: hover ? 'none' : 'grayscale(100%) opacity(0.5)'
            }}
          ></i>
        )}
      </div>
      <h4 style={{ 
        fontSize: '1.1rem', marginBottom: 6, fontWeight: 700,
        color: hover ? 'var(--color-secondary)' : 'var(--color-text-muted)',
        transition: 'color 0.3s'
      }}>
        {tech.name}
      </h4>
      <p style={{ 
        color: 'var(--color-text-muted)', fontSize: '0.85rem',
        opacity: hover ? 1 : 0.7, transition: 'opacity 0.3s'
      }}>
        {tech.desc}
      </p>
    </div>
  )
}
