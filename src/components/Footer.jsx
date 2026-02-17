import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-secondary)',
      paddingTop: 60, paddingBottom: 30,
      marginTop: 60
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 40, marginBottom: 40
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '1rem'
              }}>
                <i className="fa-solid fa-link"></i>
              </div>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem' }}>
                Match<span style={{ color: 'var(--color-secondary)' }}>Hub</span>
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Platform AI untuk mencocokkan UMKM dengan Nano Influencer.
              Temukan partner promosi yang tepat untuk bisnis Anda.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: 16, fontSize: '1rem' }}>Navigasi</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/" style={footerLinkStyle}>Beranda</Link>
              <Link to="/about" style={footerLinkStyle}>Tentang</Link>
              <Link to="/influencers" style={footerLinkStyle}>Influencer</Link>
              <Link to="/ai-recommendations" style={footerLinkStyle}>AI Match</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: 16, fontSize: '1rem' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/terms" style={footerLinkStyle}>Syarat & Ketentuan</Link>
              <Link to="/privacy" style={footerLinkStyle}>Kebijakan Privasi</Link>
              <Link to="/cookies" style={footerLinkStyle}>Kebijakan Cookies</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: 16, fontSize: '1rem' }}>Hubungi Kami</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={footerLinkStyle}>
                <i className="fa-solid fa-envelope" style={{ marginRight: 8 }}></i>
                hello@matchhub.id
              </span>
              <span style={footerLinkStyle}>
                <i className="fa-solid fa-phone" style={{ marginRight: 8 }}></i>
                +62 812-3456-7890
              </span>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <a href="#" style={socialIconStyle}><i className="fa-brands fa-instagram"></i></a>
                <a href="#" style={socialIconStyle}><i className="fa-brands fa-tiktok"></i></a>
                <a href="#" style={socialIconStyle}><i className="fa-brands fa-youtube"></i></a>
                <a href="#" style={socialIconStyle}><i className="fa-brands fa-twitter"></i></a>
              </div>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '20px 0' }} />

        <p style={{
          textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem'
        }}>
          © 2026 MatchHub. Dibuat dengan <i className="fa-solid fa-heart" style={{ color: 'var(--color-secondary)' }}></i> untuk UMKM Indonesia.
        </p>
      </div>
    </footer>
  )
}

const footerLinkStyle = {
  color: 'var(--color-text-muted)', fontSize: '0.9rem', textDecoration: 'none',
  transition: 'color 0.2s'
}

const socialIconStyle = {
  width: 36, height: 36, borderRadius: '50%',
  background: 'var(--color-dark-surface)', border: '1px solid var(--color-border)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--color-text-muted)', fontSize: '0.9rem',
  textDecoration: 'none', transition: 'all 0.2s'
}
