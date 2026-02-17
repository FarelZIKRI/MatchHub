import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getAvatarUrl } from '../lib/avatar'

export default function FavoritesPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    fetchFavorites()
  }, [user, authLoading])

  async function fetchFavorites() {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          influencer_id,
          influencers (
            id,
            niche,
            location,
            avg_rating,
            followers_count,
            platform,
            platform_username,
            price_per_post,
            users (
              name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFavorites(data || [])
    } catch (err) {
      console.error(err)
      showToast('Gagal memuat favorit', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function removeFavorite(favId) {
    try {
      const { error } = await supabase.from('favorites').delete().eq('id', favId)
      if (error) throw error
      setFavorites(favorites.filter(f => f.id !== favId))
      showToast('Dihapus dari favorit', 'success')
    } catch (err) {
      showToast('Gagal menghapus favorit', 'error')
    }
  }

  async function handleLogout() {
    await signOut()
    showToast('Anda telah keluar.', 'info')
    window.location.href = '/'
  }

  const formatFollowers = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
    return n
  }

  const formatPrice = (p) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)

  if (!profile) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner"></div>
    </div>
  )

  const sidebarMenu = [
    { id: 'profile', icon: 'fa-user', label: 'Profil Saya', link: '/profile' },
    { id: 'orders', icon: 'fa-receipt', label: 'Pesanan Saya', link: '/my-orders' },
    { id: 'favorites', icon: 'fa-heart', label: 'Favorit', color: '#F472B6', link: '/favorites' },
    { id: 'settings', icon: 'fa-gear', label: 'Pengaturan', link: '/settings' },
  ]

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
              <Link to={item.link} key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 10, textDecoration: 'none',
                color: item.id === 'favorites' ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontSize: '0.9rem', fontWeight: item.id === 'favorites' ? 600 : 400,
                background: item.id === 'favorites' ? 'rgba(244,114,182,0.12)' : 'transparent',
                transition: 'all 0.2s', marginBottom: 2
              }}>
                <i className={`fa-solid ${item.icon}`} style={{ width: 20, textAlign: 'center', color: item.id === 'favorites' ? '#F472B6' : item.color || 'var(--color-text-muted)' }}></i>
                {item.label}
              </Link>
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
            <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>Influencer Favorit</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>Daftar influencer yang Anda simpan</p>
          </div>

          {/* Favorites List */}
          {loading ? (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
               {[1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: 200 }}></div>)}
             </div>
          ) : favorites.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ 
                width: 80, height: 80, borderRadius: '50%', background: 'rgba(244,114,182,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
              }}>
                <i className="fa-regular fa-heart" style={{ fontSize: '2.5rem', color: '#F472B6' }}></i>
              </div>
              <h3>Belum ada favorit</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
                Anda belum menyimpan influencer ke daftar favorit.
              </p>
              <Link to="/influencers" className="btn btn-primary">
                Cari Influencer
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
              {favorites.map((fav) => {
                const inf = fav.influencers
                return (
                  <div key={fav.id} className="card" style={{ padding: 24, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    
                    <button 
                      onClick={() => removeFavorite(fav.id)}
                      title="Hapus dari favorit"
                      style={{
                        position: 'absolute', top: 12, right: 12,
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'rgba(244,114,182,0.1)', border: 'none',
                        color: '#F472B6', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', transition: 'all 0.2s', zIndex: 2
                      }}
                    >
                      <i className="fa-solid fa-heart"></i>
                    </button>

                    <Link to={`/influencers/${inf.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: 16, textAlign: 'center' }}>
                      <img
                        src={getAvatarUrl(inf.users?.avatar_url, inf.users?.name)}
                        alt={inf.users?.name}
                        className="avatar"
                        style={{ width: 80, height: 80, margin: '0 auto 12px', border: '3px solid var(--color-surface)' }}
                      />
                      <h4 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{inf.users?.name}</h4>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>@{inf.platform_username}</p>
                    </Link>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{inf.niche}</span>
                      <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>{inf.platform}</span>
                    </div>

                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                         {formatPrice(inf.price_per_post)}
                       </div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                         <i className="fa-solid fa-users" style={{ marginRight: 4 }}></i>
                         {formatFollowers(inf.followers_count)}
                       </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
