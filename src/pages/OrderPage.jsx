import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../lib/avatar'

export default function OrderPage() {
  const { influencerId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [influencer, setInfluencer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [orderData, setOrderData] = useState({
    order_type: 'post',
    description: '',
    deadline: '',
    notes: '',
  })

  // Fee platform 5%
  const PLATFORM_FEE_PERCENTAGE = 0.05

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    loadInfluencer()
  }, [influencerId, user, authLoading])

  async function loadInfluencer() {
    const { data, error } = await supabase
      .from('influencers')
      .select('*, users(name, avatar_url)')
      .eq('id', influencerId)
      .single()
    if (!error) setInfluencer(data)
    setLoading(false)
  }

  function getBasePrice() {
    if (!influencer) return 0
    switch (orderData.order_type) {
      case 'post': return Number(influencer.price_per_post)
      case 'story': return Number(influencer.price_per_story)
      case 'video': return Number(influencer.price_per_video)
      case 'bundle': return Number(influencer.price_per_post) + Number(influencer.price_per_story) + Number(influencer.price_per_video)
      default: return 0
    }
  }

  function getPlatformFee() {
    return getBasePrice() * PLATFORM_FEE_PERCENTAGE
  }

  function getTotalPrice() {
    return getBasePrice() + getPlatformFee()
  }

  const formatPrice = (p) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const payload = {
      influencer_id: influencerId,
      sme_id: user.id,
      order_type: orderData.order_type,
      description: orderData.description,
      total_price: getTotalPrice(), // Save total price including fee? Usually yes, or keep separate. Let's save total for now.
      deadline: orderData.deadline || null,
      notes: orderData.notes || null,
      order_status: 'pending',
      payment_status: 'unpaid',
    }

    try {
      const { data, error: supaError } = await supabase
        .from('orders')
        .insert([payload])
        .select()

      if (supaError) {
        setError(supaError.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Terjadi kesalahan: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner"></div>
    </div>
  )

  if (success) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card animate-fade-in-up" style={{ textAlign: 'center', maxWidth: 480, padding: 48 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: 'rgba(6,214,160,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
        }}>
          <i className="fa-solid fa-check" style={{ fontSize: '2rem', color: 'var(--color-accent)' }}></i>
        </div>
        <h2 style={{ marginBottom: 12 }}>Pesanan Berhasil! 🎉</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
          Pesanan Anda telah berhasil dibuat. Influencer akan segera memproses pesanan Anda.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/my-orders" className="btn btn-primary">Lihat Pesanan</Link>
          <Link to="/influencers" className="btn btn-secondary">Cari Lagi</Link>
        </div>
      </div>
    </div>
  )

  // Service Options for the grid
  const serviceOptions = [
    { id: 'post', label: 'Feed Post', icon: 'fa-image', price: influencer.price_per_post },
    { id: 'story', label: 'Story Post', icon: 'fa-regular fa-clock', price: influencer.price_per_story },
    { id: 'video', label: 'Reels / Video', icon: 'fa-video', price: influencer.price_per_video },
    { id: 'bundle', label: 'Bundling Package', icon: 'fa-gift', price: Number(influencer.price_per_post) + Number(influencer.price_per_story) + Number(influencer.price_per_video) },
  ]

  return (
    <section>
      {/* Header simplified or just spacing */}
      <div style={{ padding: '40px 0 20px' }}>
        <div className="container">
          <Link to={`/influencers/${influencerId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)', marginBottom: 24, fontSize: '0.9rem', textDecoration: 'none' }}>
            <i className="fa-solid fa-arrow-left"></i> Kembali ke Profil
          </Link>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-text)', fontWeight: 700 }}>
            Buat Pesanan Baru
          </h2>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="order-layout">
          
          {/* LEFT COLUMN: ORDER FORM */}
          <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
            <h3 style={{ marginBottom: 24, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fa-solid fa-file-contract" style={{ color: '#3B82F6' }}></i> Detail Pesanan
            </h3>

            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: 10, marginBottom: 20,
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                color: '#F87171', fontSize: '0.9rem'
              }}>
                <i className="fa-solid fa-exclamation-circle" style={{ marginRight: 8 }}></i>{error}
              </div>
            )}

            {/* Service Type Selection Grid */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 12, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Jenis Layanan *</label>
              <div className="service-selection-grid">
                {serviceOptions.map((opt) => {
                  const isSelected = orderData.order_type === opt.id
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setOrderData({ ...orderData, order_type: opt.id })}
                      className="glass-card"
                      style={{
                        padding: '24px 16px',
                        borderRadius: 12,
                        cursor: 'pointer',
                        border: `2px solid ${isSelected ? '#3B82F6' : 'var(--color-border)'}`,
                        background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.03)',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <i className={`fa-solid ${opt.icon}`} style={{ fontSize: '1.5rem', marginBottom: 12, color: isSelected ? '#3B82F6' : 'var(--color-text-muted)' }}></i>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 6 }}>{opt.label}</div>
                      <div style={{ color: isSelected ? '#3B82F6' : 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 700 }}>
                        {formatPrice(opt.price)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Description Brief */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Deskripsi Brief *</label>
              <textarea
                required
                rows="5"
                placeholder="Jelaskan produk/jasa Anda, target audience, dan ekspektasi konten yang diinginkan..."
                value={orderData.description}
                onChange={e => setOrderData({ ...orderData, description: e.target.value })}
                className="input"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            {/* Deadline */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Deadline *</label>
              <input
                type="date"
                required
                value={orderData.deadline}
                onChange={e => setOrderData({ ...orderData, deadline: e.target.value })}
                className="input"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Catatan Tambahan</label>
              <textarea
                rows="3"
                placeholder="Catatan tambahan (opsional)..."
                value={orderData.notes}
                onChange={e => setOrderData({ ...orderData, notes: e.target.value })}
                className="input"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #3B82F6, #8B5CF6)', // Custom gradient based on reference
                border: 'none',
                padding: '14px',
                fontSize: '1rem'
              }}
            >
              {submitting ? 'Memproses...' : <><i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i> Kirim Pesanan</>}
            </button>
          </form>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="order-summary-sticky">
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 24, color: 'var(--color-text)' }}>Ringkasan Pesanan</h3>

              {/* Influencer Mini Profile */}
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, 
                padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--color-border)'
              }}>
                <img
                  src={getAvatarUrl(influencer.users?.avatar_url, influencer.users?.name || influencer.platform_username)}
                  alt="Avatar"
                  style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {influencer.users?.name}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className={`fa-brands fa-${influencer.platform}`}></i>
                    {influencer.platform_username}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <span>{serviceOptions.find(o => o.id === orderData.order_type)?.label}</span>
                  <span>{formatPrice(getBasePrice())}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <span>Platform Fee (5%)</span>
                  <span>{formatPrice(getPlatformFee())}</span>
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 20 }}></div>

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Total</span>
                <span style={{ 
                  color: '#8B5CF6', 
                  fontWeight: 800, 
                  fontSize: '1.4rem' 
                }}>
                  {formatPrice(getTotalPrice())}
                </span>
              </div>

              {/* Secure Badge */}
              <div style={{ 
                padding: '12px', borderRadius: 8, 
                background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.2)',
                display: 'flex', alignItems: 'center', gap: 10,
                color: 'var(--color-accent)', fontSize: '0.8rem', fontWeight: 500
              }}>
                <i className="fa-solid fa-shield-halved"></i>
                Pembayaran aman dengan sistem escrow
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
