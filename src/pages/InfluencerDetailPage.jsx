import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../lib/avatar'

export default function InfluencerDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [influencer, setInfluencer] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    loadInfluencer()
    loadReviews()
    if (user) checkFavorite()
  }, [id, user])

  async function loadInfluencer() {
    const { data, error } = await supabase
      .from('influencers')
      .select('*, users(name, email, avatar_url, bio)')
      .eq('id', id)
      .single()
    if (!error) setInfluencer(data)
    setLoading(false)
  }

  async function loadReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*, reviewer:reviewer_id(name, avatar_url), orders!inner(influencer_id)')
      .eq('orders.influencer_id', id)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
    setReviews(data || [])
  }

  async function checkFavorite() {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('influencer_id', id)
      .maybeSingle()
    setIsFavorite(!!data)
  }

  async function toggleFavorite() {
    if (!user) return navigate('/login')
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('influencer_id', id)
      setIsFavorite(false)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, influencer_id: id })
      setIsFavorite(true)
    }
  }

  const formatPrice = (p) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)
  const formatFollowers = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
    return n
  }

  const platformIcons = { instagram: 'fa-brands fa-instagram', tiktok: 'fa-brands fa-tiktok', youtube: 'fa-brands fa-youtube', twitter: 'fa-brands fa-twitter', facebook: 'fa-brands fa-facebook' }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner"></div>
    </div>
  )

  if (!influencer) return (
    <div style={{ textAlign: 'center', padding: 120 }}>
      <i className="fa-solid fa-face-sad-tear" style={{ fontSize: '4rem', color: 'var(--color-text-muted)', marginBottom: 16 }}></i>
      <h2>Influencer tidak ditemukan</h2>
      <Link to="/influencers" className="btn btn-primary" style={{ marginTop: 16 }}>Kembali</Link>
    </div>
  )

  return (
    <div style={{ background: 'var(--color-surface)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header / Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '20px 16px' }}>
          <Link to="/influencers" style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 8, 
            color: 'var(--color-text-muted)', fontSize: '0.9rem', 
            textDecoration: 'none', fontWeight: 500 
          }}>
            <i className="fa-solid fa-arrow-left"></i> Kembali ke Daftar
          </Link>
        </div>
      </div>

      <div className="container" style={{ marginTop: 32 }}>
        <div className="grid-influencer-layout">
          
          {/* Left Column: Profile Card (Sticky) */}
          <div className="sticky-profile">
            <div className="card card-responsive-padding" style={{ textAlign: 'center', borderTop: '4px solid var(--color-primary)' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
                <img
                  src={getAvatarUrl(influencer.users?.avatar_url, influencer.users?.name || influencer.platform_username)}
                  alt={influencer.users?.name}
                  className="avatar"
                  style={{ width: 120, height: 120, border: '4px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: 'white', borderRadius: '50%', padding: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36
                }}>
                  <i className={platformIcons[influencer.platform] || 'fa-solid fa-globe'} 
                     style={{ color: influencer.platform === 'instagram' ? '#E1306C' : influencer.platform === 'tiktok' ? '#000' : '#1DA1F2', fontSize: '1.2rem' }}></i>
                </div>
              </div>

              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4, letterSpacing: '-0.5px' }}>
                {influencer.users?.name}
              </h1>
              <a href={`https://${influencer.platform}.com/${influencer.platform_username}`} target="_blank" rel="noopener noreferrer" 
                 style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: 20, display: 'inline-block', textDecoration: 'none' }}>
                @{influencer.platform_username}
              </a>

              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
                {influencer.bio || 'Tidak ada deskripsi bio.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
                <span className="badge badge-primary">{influencer.niche}</span>
                <span className="badge badge-info">
                  <i className="fa-solid fa-location-dot" style={{ marginRight: 4 }}></i> {influencer.location}
                </span>
              </div>

              {/* Quick Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32, padding: '20px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)' }}>{formatFollowers(influencer.followers_count)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Followers</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)' }}>{influencer.avg_rating}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Rating</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)' }}>{influencer.engagement_rate}%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Engagement</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Link to={`/order/${influencer.id}`} className="btn btn-primary" style={{ flex: 1, padding: '12px', fontSize: '1rem' }}>
                  Pesan Jasa
                </Link>
                <button onClick={toggleFavorite} className="btn btn-secondary" style={{ width: 50, padding: 0, justifyContent: 'center' }}>
                  <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart`} style={{ color: isFavorite ? '#EF4444' : 'var(--color-text-muted)', fontSize: '1.2rem' }}></i>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Service Pricing */}
            <div className="card card-responsive-padding">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Daftar Harga</h3>
                <span className="badge badge-accent">Update Terbaru</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { type: 'Instagram Feed Post', price: influencer.price_per_post, icon: 'fa-image', desc: '1x Feed Photo, Keep 30 Days' },
                  { type: 'Instagram Story', price: influencer.price_per_story, icon: 'fa-circle-notch', desc: '1x Story 24 Hours' },
                  { type: 'Reels / Video', price: influencer.price_per_video, icon: 'fa-video', desc: '1x Video Content (max 60s)' },
                ].filter(p => p.price > 0).map((p, i) => (
                  <div key={i} className="pricing-item"
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ 
                        width: 48, height: 48, borderRadius: 12, 
                        background: 'var(--color-surface)', color: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                      }}>
                        <i className={`fa-solid ${p.icon}`}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>{p.type}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{p.desc}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.1rem' }}>{formatPrice(p.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="card card-responsive-padding">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 24px' }}>Performa Statistik</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                <div style={{ padding: 20, background: 'var(--color-surface)', borderRadius: 16 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <i className="fa-solid fa-briefcase"></i> Total Order
                   </div>
                   <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    {influencer.total_orders} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>orders</span>
                   </div>
                </div>
                <div style={{ padding: 20, background: 'var(--color-surface)', borderRadius: 16 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <i className="fa-solid fa-star"></i> Penilaian Rata-rata
                   </div>
                   <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    {influencer.avg_rating} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>/ 5.0</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="card card-responsive-padding">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Ulasan Klien</h3>
                {reviews.length > 0 && <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{reviews.length} ulasan</span>}
              </div>

              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--color-border)', borderRadius: 16 }}>
                  <div style={{ 
                    width: 64, height: 64, background: 'var(--color-surface)', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                    color: 'var(--color-text-muted)', fontSize: '1.5rem'
                  }}>
                    <i className="fa-regular fa-comment-dots"></i>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', maxWidth: 300, margin: '0 auto' }}>Belum ada ulasan untuk influencer ini. Jadilah yang pertama memberikan ulasan!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {reviews.map(review => (
                    <div key={review.id} style={{ paddingBottom: 24, borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={getAvatarUrl(review.reviewer?.avatar_url, review.reviewer?.name)}
                            alt={review.reviewer?.name}
                            className="avatar"
                            style={{ width: 40, height: 40 }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{review.reviewer?.name || 'Pengguna'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Verified Client</div>
                          </div>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, color: '#FBBF24', fontSize: '0.8rem' }}>
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fa-${i < review.rating ? 'solid' : 'regular'} fa-star`}></i>
                          ))}
                        </div>
                      </div>
                      <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                        "{review.comment}"
                      </p>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'center', marginTop: 8 }}>
                    Lihat Lebih Banyak
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
