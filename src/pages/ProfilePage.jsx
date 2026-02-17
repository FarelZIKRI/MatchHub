import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getAvatarUrl } from '../lib/avatar'

export default function ProfilePage() {
  const { user, profile, loading: authLoading, updateProfile, signOut } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [stats, setStats] = useState({ orders: 0, completed: 0, favorites: 0, rating: '-' })

  const [form, setForm] = useState({ name: '', phone: '', bio: '', avatar_url: '' })

  useEffect(() => {
    if (authLoading) return // Wait for auth to finish loading
    if (!user) { navigate('/login'); return }
    if (profile) {
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      })
      fetchStats()
    }
  }, [user, profile, authLoading])

  async function fetchStats() {
    try {
      const [{ count: orderCount }, { count: completedCount }, { count: favCount }] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('sme_id', user.id),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('sme_id', user.id).eq('order_status', 'completed'),
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ])
      setStats({
        orders: orderCount || 0,
        completed: completedCount || 0,
        favorites: favCount || 0,
        rating: '-'
      })
    } catch (err) {
      console.error(err)
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setMessage({ text: '', type: '' })

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      setMessage({ text: 'Gagal upload gambar: ' + uploadError.message, type: 'error' })
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setForm({ ...form, avatar_url: publicUrl })

      // Auto-save avatar
      await updateProfile({ avatar_url: publicUrl })
      setMessage({ text: 'Foto profil berhasil diperbarui!', type: 'success' })
    }
    setUploading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })

    const { error } = await updateProfile({
      name: form.name,
      phone: form.phone,
      bio: form.bio,
      avatar_url: form.avatar_url
    })

    if (error) {
      setMessage({ text: 'Gagal menyimpan: ' + error.message, type: 'error' })
    } else {
      setMessage({ text: 'Profil berhasil diperbarui!', type: 'success' })
      setEditing(false)
    }
    setSaving(false)
  }

  async function handleLogout() {
    await signOut()
    showToast('Anda telah keluar.', 'info')
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
  }

  if (!profile) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner"></div>
    </div>
  )

  const sidebarMenu = [
    { id: 'profile', icon: 'fa-user', label: 'Profil Saya', color: 'var(--color-primary-light)' },
    { id: 'orders', icon: 'fa-receipt', label: 'Pesanan Saya', link: '/my-orders' },
    { id: 'favorites', icon: 'fa-heart', label: 'Favorit', color: '#F472B6', link: '/favorites' },
    { id: 'settings', icon: 'fa-gear', label: 'Pengaturan', link: '/settings' },
  ]

  return (
    <>
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
                  src={getAvatarUrl(form.avatar_url, profile.name || user.email)}
                  alt="Avatar"
                  style={{
                    width: 100, height: 100, borderRadius: '50%', objectFit: 'cover',
                    border: '3px solid var(--color-primary)'
                  }}
                />
                {/* Camera button for upload */}
                <label style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--color-primary)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid var(--color-dark-card)',
                  transition: 'transform 0.2s'
                }}>
                  {uploading ? (
                    <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></div>
                  ) : (
                    <i className="fa-solid fa-camera" style={{ color: '#fff', fontSize: '0.7rem' }}></i>
                  )}
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={handleAvatarUpload} disabled={uploading} />
                </label>
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
                    color: item.color || 'var(--color-text)',
                    fontSize: '0.9rem', fontWeight: activeTab === item.id ? 600 : 400,
                    background: activeTab === item.id ? 'rgba(108,60,225,0.12)' : 'transparent',
                    transition: 'all 0.2s', marginBottom: 2
                  }}>
                    <i className={`fa-solid ${item.icon}`} style={{ width: 20, textAlign: 'center', color: item.color || 'var(--color-text-muted)' }}></i>
                    {item.label}
                  </Link>
                ) : (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '12px 16px', borderRadius: 10, border: 'none',
                    color: item.color || 'var(--color-text)',
                    fontSize: '0.9rem', fontWeight: activeTab === item.id ? 600 : 400,
                    background: activeTab === item.id ? 'rgba(108,60,225,0.12)' : 'transparent',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'all 0.2s', marginBottom: 2
                  }}>
                    <i className={`fa-solid ${item.icon}`} style={{ width: 20, textAlign: 'center', color: item.color || 'var(--color-text-muted)' }}></i>
                    {item.label}
                  </button>
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
          <div>
            {/* Message */}
            {message.text && (
              <div className="animate-fade-in" style={{
                padding: '12px 16px', borderRadius: 12, marginBottom: 20,
                background: message.type === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(6,214,160,0.1)',
                border: `1px solid ${message.type === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(6,214,160,0.3)'}`,
                color: message.type === 'error' ? '#F87171' : 'var(--color-accent)',
                fontSize: '0.88rem'
              }}>
                <i className={`fa-solid ${message.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`} style={{ marginRight: 8 }}></i>
                {message.text}
              </div>
            )}

            {/* Profile Info Card */}
            <div className="card" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>Informasi Profil</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>Kelola informasi profil Anda</p>
                </div>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="btn btn-primary btn-sm">
                    <i className="fa-solid fa-pen-to-square"></i> Edit Profil
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setEditing(false); setForm({ name: profile.name || '', phone: profile.phone || '', bio: profile.bio || '', avatar_url: form.avatar_url }) }}
                      className="btn btn-secondary btn-sm">
                      Batal
                    </button>
                    <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
                      {saving ? 'Menyimpan...' : <><i className="fa-solid fa-check"></i> Simpan</>}
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSave}>
                <div className="form-grid-2-col">
                  {/* Nama Lengkap */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      <i className="fa-solid fa-user" style={{ color: 'var(--color-primary-light)' }}></i> Nama Lengkap
                    </div>
                    {editing ? (
                      <input type="text" className="input" value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })} />
                    ) : (
                      <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{profile.name || 'Belum diisi'}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      <i className="fa-solid fa-envelope" style={{ color: '#3B82F6' }}></i> Email
                    </div>
                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{profile.email}</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 2, fontStyle: 'italic' }}>Email tidak dapat diubah</p>
                  </div>

                  {/* Nomor Telepon */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      <i className="fa-solid fa-phone" style={{ color: '#14B8A6' }}></i> Nomor Telepon
                    </div>
                    {editing ? (
                      <input type="tel" className="input" placeholder="081234567890"
                        value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    ) : (
                      <p style={{ fontWeight: 500, fontSize: '0.95rem', color: profile.phone ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                        {profile.phone || 'Belum diisi'}
                      </p>
                    )}
                  </div>

                  {/* Bergabung Sejak */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      <i className="fa-solid fa-calendar" style={{ color: '#FBBF24' }}></i> Bergabung Sejak
                    </div>
                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>
                      {new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    <i className="fa-solid fa-align-left" style={{ color: '#A78BFA' }}></i> Bio
                  </div>
                  {editing ? (
                    <textarea className="input" rows="3" placeholder="Ceritakan tentang Anda atau bisnis Anda..."
                      value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                      style={{ resize: 'vertical' }}
                    />
                  ) : (
                    <p style={{ fontWeight: 400, fontSize: '0.95rem', fontStyle: profile.bio ? 'normal' : 'italic', color: profile.bio ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                      {profile.bio || 'Belum ada bio'}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid-4-col">
              {[
                { icon: 'fa-bag-shopping', val: stats.orders, label: 'Total Pesanan', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
                { icon: 'fa-circle-check', val: stats.completed, label: 'Selesai', color: 'var(--color-accent)', bg: 'rgba(6,214,160,0.12)' },
                { icon: 'fa-heart', val: stats.favorites, label: 'Favorit', color: '#F472B6', bg: 'rgba(244,114,182,0.12)' },
                { icon: 'fa-star', val: stats.rating, label: 'Rating', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
              ].map((s, i) => (
                <div key={i} className="card" style={{
                  padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: s.bg, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: '1.1rem' }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 4 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
