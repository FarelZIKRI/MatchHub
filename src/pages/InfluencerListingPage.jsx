import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getAvatarUrl } from '../lib/avatar'

export default function InfluencerListingPage() {
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    niche: '', platform: '', location: '', search: '', sort: 'avg_rating'
  })

  useEffect(() => {
    loadInfluencers()
  }, [filters.niche, filters.platform, filters.sort])

  async function loadInfluencers() {
    setLoading(true)
    let query = supabase
      .from('influencers')
      .select('*, users(name, avatar_url)')
      .eq('is_available', true)

    if (filters.niche) query = query.eq('niche', filters.niche)
    if (filters.platform) query = query.eq('platform', filters.platform)

    if (filters.sort === 'avg_rating') query = query.order('avg_rating', { ascending: false })
    else if (filters.sort === 'price_low') query = query.order('price_per_post', { ascending: true })
    else if (filters.sort === 'price_high') query = query.order('price_per_post', { ascending: false })
    else if (filters.sort === 'followers') query = query.order('followers_count', { ascending: false })

    const { data, error } = await query
    if (!error) {
      let result = data || []
      if (filters.search) {
        const s = filters.search.toLowerCase()
        result = result.filter(inf =>
          inf.users?.name?.toLowerCase().includes(s) ||
          inf.platform_username?.toLowerCase().includes(s) ||
          inf.niche?.toLowerCase().includes(s) ||
          inf.location?.toLowerCase().includes(s)
        )
      }
      if (filters.location) {
        const loc = filters.location.toLowerCase()
        result = result.filter(inf => inf.location?.toLowerCase().includes(loc))
      }
      setInfluencers(result)
    }
    setLoading(false)
  }

  function handleSearch(e) {
    e.preventDefault()
    loadInfluencers()
  }

  const formatPrice = (p) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)
  const formatFollowers = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
    return n
  }

  const niches = ['beauty', 'technology', 'food', 'travel']
  const platforms = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook']
  const platformIcons = { instagram: 'fa-brands fa-instagram', tiktok: 'fa-brands fa-tiktok', youtube: 'fa-brands fa-youtube', twitter: 'fa-brands fa-twitter', facebook: 'fa-brands fa-facebook' }

  return (
    <>
      <section style={{ 
        background: 'var(--gradient-hero)', 
        padding: '60px 0 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 3rem)', 
            marginBottom: 20, 
            textAlign: 'center',
            color: 'var(--color-secondary)'
          }}>
            Temukan <span className="gradient-text">Influencer</span> Terbaik
          </h1>
          <p style={{ 
            color: 'var(--color-text-muted)', 
            textAlign: 'center', 
            maxWidth: 500, 
            margin: '0 auto 40px', 
            fontSize: '1.1rem',
            lineHeight: 1.6
          }}>
            Hubungkan bisnismu dengan ribuan nano influencer lokal yang siap meningkatkan penjualan.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ 
              display: 'flex', 
              gap: 12, 
              background: 'white', 
              padding: 8, 
              borderRadius: 16,
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <i className="fa-solid fa-search" style={{
                  position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  fontSize: '1.1rem'
                }}></i>
                <input
                  type="text"
                  className="input"
                  placeholder="Cari nama, niche, atau lokasi..."
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  style={{ 
                    paddingLeft: 50, 
                    border: 'none', 
                    background: 'transparent',
                    fontSize: '1rem',
                    height: '100%'
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: 12 }}>
                Cari
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="section" style={{ 
        paddingTop: 40, 
        paddingBottom: 80, 
        background: 'var(--color-surface)',
        minHeight: '60vh'
      }}>
        <div className="container">
          {/* Filters */}
          <div className="glass" style={{
            padding: 24, 
            borderRadius: 20, 
            marginBottom: 40,
            border: '1px solid white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)', fontWeight: 600 }}>
              <i className="fa-solid fa-sliders" style={{ color: 'var(--color-primary)' }}></i> 
              Filter Pencarian
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 16 
            }}>
              <select className="input" 
                value={filters.niche} onChange={e => setFilters({ ...filters, niche: e.target.value })}>
                <option value="">Semua Niche</option>
                {niches.map(n => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
              </select>
              
              <select className="input" 
                value={filters.platform} onChange={e => setFilters({ ...filters, platform: e.target.value })}>
                <option value="">Semua Platform</option>
                {platforms.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
              
              <input type="text" className="input" placeholder="Lokasi (cth: Jakarta)" 
                value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })}
                onBlur={loadInfluencers}
              />
              
              <select className="input" 
                value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })}>
                <option value="avg_rating">Rating Tertinggi</option>
                <option value="price_low">Harga Terendah</option>
                <option value="price_high">Harga Tertinggi</option>
                <option value="followers">Followers Terbanyak</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Menampilkan <strong style={{ color: 'var(--color-text)' }}>{influencers.length}</strong> influencer potensial
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="card" style={{ padding: 24, height: 380 }}>
                  <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px' }}></div>
                  <div className="skeleton" style={{ height: 24, width: '70%', margin: '0 auto 10px' }}></div>
                  <div className="skeleton" style={{ height: 16, width: '40%', margin: '0 auto 24px' }}></div>
                  <div className="skeleton" style={{ height: 60, width: '100%', borderRadius: 12 }}></div>
                </div>
              ))}
            </div>
          ) : influencers.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 20px', 
              background: 'white', 
              borderRadius: 24,
              border: '1px dashed var(--color-border)'
            }}>
              <div style={{ 
                width: 80, height: 80, borderRadius: '50%', background: 'var(--color-surface)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
              }}>
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '2rem', color: 'var(--color-text-muted)' }}></i>
              </div>
              <h3 style={{ marginBottom: 8, fontSize: '1.2rem' }}>Tidak ada influencer ditemukan</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
              <button 
                onClick={() => setFilters({ niche: '', platform: '', location: '', search: '', sort: 'avg_rating' })}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 20 }}
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {influencers.map(inf => (
                <Link to={`/influencers/${inf.id}`} key={inf.id} className="card" style={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 24,
                  height: '100%'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={getAvatarUrl(inf.users?.avatar_url, inf.users?.name || inf.platform_username)}
                        alt={inf.users?.name}
                        className="avatar"
                        style={{ 
                          width: 88, 
                          height: 88, 
                          marginBottom: 16,
                          border: '4px solid white',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                      />
                      <div style={{
                        position: 'absolute', bottom: 16, right: 0,
                        background: 'white', borderRadius: '50%', padding: 6,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28
                      }}>
                        <i className={platformIcons[inf.platform] || 'fa-solid fa-globe'} 
                           style={{ color: inf.platform === 'instagram' ? '#E1306C' : inf.platform === 'tiktok' ? '#000' : '#1DA1F2' }}></i>
                      </div>
                    </div>
                    
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 4, fontWeight: 700 }}>{inf.users?.name}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>@{inf.platform_username}</p>
                  </div>

                  <div style={{ 
                    display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20,
                    paddingBottom: 20, borderBottom: '1px dashed var(--color-border)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatFollowers(inf.followers_count)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Followers</div>
                    </div>
                    <div style={{ width: 1, background: 'var(--color-border)' }}></div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {inf.avg_rating} <i className="fa-solid fa-star" style={{ fontSize: '0.7rem' }}></i>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Rating</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20, flex: 1 }}>
                    <p style={{ 
                      color: 'var(--color-text-muted)', 
                      fontSize: '0.9rem', 
                      lineHeight: 1.6, 
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden',
                      textAlign: 'center'
                    }}>
                      {inf.bio || 'Tidak ada bio.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
                    <span className="badge badge-primary">{inf.niche}</span>
                    <span className="badge badge-info">
                      <i className="fa-solid fa-location-dot" style={{ fontSize: '0.65rem', marginRight: 4 }}></i> {inf.location}
                    </span>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ 
                      background: 'var(--color-surface)', 
                      borderRadius: 12, 
                      padding: '12px 16px',
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Mulai dari</div>
                        <div style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                          {formatPrice(inf.price_per_post)}
                        </div>
                      </div>
                      <i className="fa-solid fa-arrow-right" style={{ 
                        color: 'var(--color-primary)', 
                        background: 'rgba(99,102,241,0.1)', 
                        width: 32, height: 32, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.8rem'
                      }}></i>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
