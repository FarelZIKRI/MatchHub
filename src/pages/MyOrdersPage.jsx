import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../lib/avatar'

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (authLoading) return // Wait for auth to finish loading
    if (!user) { navigate('/login'); return }
    loadOrders()
  }, [user, authLoading])

  async function loadOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, influencer:influencer_id(*, users(name, avatar_url))')
      .eq('sme_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setOrders(data || [])
    setLoading(false)
  }

  const formatPrice = (p) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)
  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  const statusColors = {
    pending: { bg: 'rgba(251,191,36,0.15)', color: '#FBBF24', border: 'rgba(251,191,36,0.3)' },
    accepted: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: 'rgba(59,130,246,0.3)' },
    in_progress: { bg: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: 'rgba(139,92,246,0.3)' },
    completed: { bg: 'rgba(6,214,160,0.15)', color: '#06D6A0', border: 'rgba(6,214,160,0.3)' },
    cancelled: { bg: 'rgba(248,113,113,0.15)', color: '#F87171', border: 'rgba(248,113,113,0.3)' },
    rejected: { bg: 'rgba(248,113,113,0.15)', color: '#F87171', border: 'rgba(248,113,113,0.3)' },
  }

  const statusLabels = {
    pending: 'Menunggu', accepted: 'Diterima', in_progress: 'Dalam Proses',
    completed: 'Selesai', cancelled: 'Dibatalkan', rejected: 'Ditolak'
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.order_status === filter)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner"></div>
    </div>
  )

  return (
    <>
      <section style={{ background: 'var(--gradient-hero)', padding: '40px 0 60px' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: 8 }}>
            <i className="fa-solid fa-receipt" style={{ color: 'var(--color-primary-light)', marginRight: 12 }}></i>
            Pesanan Saya
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Kelola dan pantau semua pesanan Anda</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
            {[
              { key: 'all', label: 'Semua' },
              { key: 'pending', label: 'Menunggu' },
              { key: 'accepted', label: 'Diterima' },
              { key: 'in_progress', label: 'Proses' },
              { key: 'completed', label: 'Selesai' },
              { key: 'cancelled', label: 'Dibatalkan' },
            ].map(tab => (
              <button key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-secondary'}`}
              >
                {tab.label}
                {tab.key === 'all' && <span style={{ marginLeft: 4, opacity: 0.7 }}>({orders.length})</span>}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <i className="fa-solid fa-inbox" style={{ fontSize: '3rem', color: 'var(--color-text-muted)', marginBottom: 16 }}></i>
              <h3 style={{ marginBottom: 8 }}>Belum ada pesanan</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
                Temukan influencer terbaik untuk bisnis Anda
              </p>
              <Link to="/influencers" className="btn btn-primary">
                <i className="fa-solid fa-search"></i> Cari Influencer
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredOrders.map(order => {
                const sc = statusColors[order.order_status] || statusColors.pending
                return (
                  <div key={order.id} className="card" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <img
                          src={getAvatarUrl(order.influencer?.users?.avatar_url, order.influencer?.users?.name)}
                          alt="" className="avatar" style={{ width: 48, height: 48 }}
                        />
                        <div>
                          <h4 style={{ fontSize: '1rem', marginBottom: 4 }}>{order.influencer?.users?.name || 'Influencer'}</h4>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '2px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                              background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`
                            }}>
                              {statusLabels[order.order_status]}
                            </span>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'capitalize' }}>
                              {order.order_type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '1.1rem' }}>
                          {formatPrice(order.total_price)}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </div>

                    {order.description && (
                      <p style={{
                        color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: 12,
                        lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {order.description}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
