import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getAvatarUrl } from '../lib/avatar'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { showToast } = useToast()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileDropdown, setProfileDropdown] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    showToast('Anda telah keluar.', 'info')
    setProfileDropdown(false)
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
  }

  return (
    <nav className="glass" style={{
      position: 'sticky', top: 0, zIndex: 100,
      borderBottom: '1px solid var(--color-border)'
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '72px', position: 'relative'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none', color: 'var(--color-secondary)', fontWeight: 800, fontSize: '1.4rem'
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem',
            color: '#fff' 
          }}>
            <i className="fa-solid fa-link"></i>
          </div>
          <span>Match<span style={{ color: 'var(--color-primary)' }}>Hub</span></span>
        </Link>


        {/* Desktop Nav Links - Centered */}
        <div className="hidden md:flex" style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          alignItems: 'center', gap: '32px'
        }}>
          <Link to="/" className="nav-link">Beranda</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/influencers" className="nav-link">Influencer</Link>
          <Link to="/ai-recommendations" className="nav-link">
            <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 4 }}></i>AI Match
          </Link>
        </div>

        {/* Desktop Right - Profile/Auth */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)'
                }}
              >
                <img
                  src={getAvatarUrl(profile?.avatar_url, profile?.name || user.email)}
                  alt="Avatar"
                  className="avatar"
                  style={{ width: 36, height: 36 }}
                />
                <span style={{ fontWeight: 500 }}>{profile?.name || 'User'}</span>
                <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem' }}></i>
              </button>
              {profileDropdown && (
                <div className="card animate-fade-in" style={{
                  position: 'absolute', top: '120%', right: 0, minWidth: 200,
                  padding: 8, zIndex: 200, background: 'white', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid var(--color-border)'
                }}>
                  <Link to="/profile" onClick={() => setProfileDropdown(false)}
                    style={dropdownItemStyle}>
                    <i className="fa-solid fa-user"></i> Profil Saya
                  </Link>
                  <Link to="/my-orders" onClick={() => setProfileDropdown(false)}
                    style={dropdownItemStyle}>
                    <i className="fa-solid fa-receipt"></i> Pesanan Saya
                  </Link>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />
                  <button onClick={handleSignOut} style={{
                    ...dropdownItemStyle, width: '100%', background: 'none',
                    border: 'none', color: '#F87171', cursor: 'pointer', fontFamily: 'inherit'
                  }}>
                    <i className="fa-solid fa-right-from-bracket"></i> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Masuk</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Daftar</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1.4rem', cursor: 'pointer'
          }}
        >
          <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden animate-fade-in" style={{
          padding: '16px 24px 24px', borderTop: '1px solid var(--color-border)',
          display: 'flex', flexDirection: 'column', gap: 12
        }}>
          <Link to="/" onClick={() => setMobileOpen(false)} style={mobileLinkStyle}>
            <i className="fa-solid fa-house"></i> Beranda
          </Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} style={mobileLinkStyle}>
            <i className="fa-solid fa-circle-info"></i> Tentang
          </Link>
          <Link to="/influencers" onClick={() => setMobileOpen(false)} style={mobileLinkStyle}>
            <i className="fa-solid fa-users"></i> Influencer
          </Link>
          <Link to="/ai-recommendations" onClick={() => setMobileOpen(false)} style={mobileLinkStyle}>
            <i className="fa-solid fa-wand-magic-sparkles"></i> AI Match
          </Link>
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMobileOpen(false)} style={mobileLinkStyle}>
                <i className="fa-solid fa-user"></i> Profil Saya
              </Link>
              <Link to="/my-orders" onClick={() => setMobileOpen(false)} style={mobileLinkStyle}>
                <i className="fa-solid fa-receipt"></i> Pesanan Saya
              </Link>
              <button onClick={() => { handleSignOut(); setMobileOpen(false) }}
                style={{ ...mobileLinkStyle, background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', fontFamily: 'inherit' }}>
                <i className="fa-solid fa-right-from-bracket"></i> Keluar
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Masuk</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Daftar</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

const dropdownItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
  borderRadius: 8, color: 'var(--color-text)', fontSize: '0.9rem',
  textDecoration: 'none', transition: 'background 0.2s'
}

const mobileLinkStyle = {
  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
  color: 'var(--color-text)', fontSize: '1rem', fontWeight: 500, textDecoration: 'none'
}
