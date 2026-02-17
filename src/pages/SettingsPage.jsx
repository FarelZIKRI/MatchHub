import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getAvatarUrl } from '../lib/avatar'

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  
  const [passwordForm, setPasswordForm] = useState({ 
    password: '', 
    confirmPassword: '' 
  })
  const [loading, setLoading] = useState(false)
  const [notifPreferences, setNotifPreferences] = useState({
    email: true,
    push: false,
    marketing: false
  })

  async function handleLogout() {
    await signOut()
    showToast('Anda telah keluar.', 'info')
    navigate('/')
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    if (passwordForm.password !== passwordForm.confirmPassword) {
      showToast('Password tidak cocok!', 'error')
      return
    }
    if (passwordForm.password.length < 6) {
      showToast('Password minimal 6 karakter.', 'error')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ 
      password: passwordForm.password 
    })

    if (error) {
      showToast('Gagal mengubah password: ' + error.message, 'error')
    } else {
      showToast('Password berhasil diubah!', 'success')
      setPasswordForm({ password: '', confirmPassword: '' })
    }
    setLoading(false)
  }

  const sidebarMenu = [
    { id: 'profile', icon: 'fa-user', label: 'Profil Saya', link: '/profile' },
    { id: 'orders', icon: 'fa-receipt', label: 'Pesanan Saya', link: '/my-orders' },
    { id: 'favorites', icon: 'fa-heart', label: 'Favorit', color: '#F472B6', link: '/favorites' },
    { id: 'settings', icon: 'fa-gear', label: 'Pengaturan', color: 'var(--color-primary-light)' },
  ]

  if (!profile) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner"></div>
    </div>
  )

  return (
    <section style={{ minHeight: 'calc(100vh - 72px)', padding: '40px 0 60px', background: 'var(--color-dark-bg)' }}>
      <div className="container layout-with-sidebar">

        {/* ========== SIDEBAR ========== */}
        <div className="card sidebar-sticky" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Avatar Area */}
          <div style={{
            padding: '32px 24px 24px', textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(108,60,225,0.15) 0%, transparent 100%)'
          }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <img
                src={getAvatarUrl(profile.avatar_url, profile.name || user.email)}
                alt="Avatar"
                style={{
                  width: 100, height: 100, borderRadius: '50%', objectFit: 'cover',
                  border: '3px solid var(--color-primary)'
                }}
              />
            </div>

            <h3 style={{ fontSize: '1.15rem', marginBottom: 4 }}>{profile.name || 'User'}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>
              {profile.email}
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 8, fontSize: '0.75rem',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
              background: 'rgba(59,130,246,0.15)', color: '#60A5FA',
              border: '1px solid rgba(59,130,246,0.3)'
            }}>
              <i className="fa-solid fa-building"></i>
              {profile.user_type === 'sme' ? 'BRAND' : profile.user_type === 'influencer' ? 'INFLUENCER' : profile.user_type?.toUpperCase()}
            </span>
          </div>

          {/* Menu */}
          <div style={{ padding: '8px 12px 16px' }}>
            {sidebarMenu.map(item => (
              item.link ? (
                <Link to={item.link} key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10, textDecoration: 'none',
                  color: item.id === 'settings' ? 'var(--color-text)' : 'var(--color-text-muted)',
                  fontSize: '0.9rem', fontWeight: item.id === 'settings' ? 600 : 400,
                  background: item.id === 'settings' ? 'rgba(108,60,225,0.12)' : 'transparent',
                  transition: 'all 0.2s', marginBottom: 2
                }}>
                  <i className={`fa-solid ${item.icon}`} style={{ width: 20, textAlign: 'center', color: item.color || 'var(--color-text-muted)' }}></i>
                  {item.label}
                </Link>
              ) : (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10,
                  color: 'var(--color-text)',
                  fontSize: '0.9rem', fontWeight: 600,
                  background: 'rgba(108,60,225,0.12)',
                  marginBottom: 2
                }}>
                  <i className={`fa-solid ${item.icon}`} style={{ width: 20, textAlign: 'center', color: item.color || 'var(--color-text-muted)' }}></i>
                  {item.label}
                </div>
              )
            ))}

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '8px 0' }} />

            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '12px 16px', borderRadius: 10, border: 'none',
              color: '#F87171', fontSize: '0.9rem',
              background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
              textAlign: 'left', transition: 'all 0.2s'
            }}>
              <i className="fa-solid fa-right-from-bracket" style={{ width: 20, textAlign: 'center' }}></i>
              Keluar
            </button>
          </div>
        </div>

        {/* ========== MAIN CONTENT ========== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Header */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>Pengaturan Akun</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>Kelola keamanan dan preferensi akun Anda</p>
          </div>

          {/* Change Password */}
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fa-solid fa-lock" style={{ color: 'var(--color-primary)' }}></i>
              Ganti Password
            </h3>
            
            <form onSubmit={handlePasswordChange}>
              <div style={{ display: 'grid', gap: 20, maxWidth: '400px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500 }}>Password Baru</label>
                  <input 
                    type="password" 
                    className="input" 
                    placeholder="Minimal 6 karakter"
                    value={passwordForm.password}
                    onChange={e => setPasswordForm({...passwordForm, password: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500 }}>Konfirmasi Password</label>
                  <input 
                    type="password" 
                    className="input" 
                    placeholder="Ulangi password baru"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Notifications */}
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fa-solid fa-bell" style={{ color: '#FBBF24' }}></i>
              Notifikasi
            </h3>
            
            <div style={{ display: 'grid', gap: 16 }}>
              {[
                { id: 'email', label: 'Notifikasi Email', desc: 'Terima update pesanan via email' },
                { id: 'push', label: 'Push Notification', desc: 'Notifikasi browser saat ada pesan baru' },
                { id: 'marketing', label: 'Info Promo', desc: 'Dapatkan info promo menarik dari MatchHub' }
              ].map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.label}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{item.desc}</div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                    <input 
                      type="checkbox" 
                      checked={notifPreferences[item.id]} 
                      onChange={() => setNotifPreferences({...notifPreferences, [item.id]: !notifPreferences[item.id]})}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{ 
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                      backgroundColor: notifPreferences[item.id] ? 'var(--color-primary)' : '#ccc', 
                      borderRadius: 34, transition: '.4s' 
                    }}></span>
                    <span style={{ 
                      position: 'absolute', content: '""', height: 16, width: 16, left: 4, bottom: 4, 
                      backgroundColor: 'white', borderRadius: '50%', transition: '.4s',
                      transform: notifPreferences[item.id] ? 'translateX(20px)' : 'translateX(0)'
                    }}></span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card" style={{ padding: 32, border: '1px solid #FCA5A5', background: '#FEF2F2' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              Danger Zone
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#B91C1C', marginBottom: 20 }}>
              Menghapus akun akan menghilangkan semua data profil, riwayat pesanan, dan portofolio Anda secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <button className="btn" style={{ background: '#DC2626', color: 'white' }} onClick={() => showToast('Fitur ini dinonaktifkan untuk keamanan demo.', 'info')}>
              Hapus Akun Saya
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}
