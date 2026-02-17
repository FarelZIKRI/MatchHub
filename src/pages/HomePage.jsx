import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import { getAvatarUrl } from '../lib/avatar'

export default function HomePage() {
  const [stats, setStats] = useState({ influencers: 0, smes: 0, campaigns: 0, satisfaction: 0 })
  const [topInfluencers, setTopInfluencers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const url = '/stat-cache'
        const session = await supabase.auth.getSession()
        const token = session.data.session?.access_token
        
        const response = await fetch(url, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        })
        
        if (!response.ok) throw new Error('Failed to fetch stats')
        
        const text = await response.text()
        let data
        try {
          data = JSON.parse(text)
        } catch (e) {
          console.error('Invalid JSON response:', text)
          throw new Error('Invalid JSON response from server')
        }

        setStats(data.stats)
        setTopInfluencers(data.topInfluencers)
      } catch (err) {
        console.warn('Backend offline or unreachable. Using offline data.')
        // Fallback stats if fetch fails
        setStats({ influencers: 500, smes: 1200, campaigns: 5000, satisfaction: 98 })
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const formatFollowers = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
    return n
  }

  const categories = [
    { icon: 'fa-spa', label: 'Beauty', color: '#06B6D4' },
    { icon: 'fa-utensils', label: 'Food & Culinary', color: '#FBBF24' },
    { icon: 'fa-microchip', label: 'Technology', color: '#3B82F6' },
    { icon: 'fa-plane', label: 'Travel', color: '#14B8A6' },
    { icon: 'fa-shirt', label: 'Fashion', color: '#8B5CF6' },
    { icon: 'fa-heart-pulse', label: 'Lifestyle', color: '#10B981' },
  ]

  const steps = [
    { num: '01', icon: 'fa-clipboard-list', title: 'Daftar & Buat Brief', desc: 'Buat akun dan jelaskan kebutuhan kampanye bisnis Anda.', color: 'var(--color-primary)' },
    { num: '02', icon: 'fa-wand-magic-sparkles', title: 'AI Smart Matching', desc: 'AI kami mencocokkan profil UMKM dengan nano influencer terbaik.', color: 'var(--color-accent)' },
    { num: '03', icon: 'fa-handshake', title: 'Pilih & Booking', desc: 'Pilih influencer yang sesuai dan lakukan booking langsung.', color: '#3B82F6' },
    { num: '04', icon: 'fa-rocket', title: 'Kampanye Berjalan', desc: 'Pantau progress kampanye dan lihat hasilnya secara real-time.', color: '#FBBF24' },
  ]

  return (
    <>
      {/* ==================== HERO ==================== */}
      <section style={{
        background: 'var(--gradient-hero)',
        paddingTop: 60, paddingBottom: 40,
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,60,225,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge badge-primary" style={{ marginBottom: 20, fontSize: '0.8rem', padding: '8px 20px' }}>
            <i className="fa-solid fa-bolt" style={{ marginRight: 6 }}></i>
            Platform #1 untuk UMKM & Influencer
          </span>

          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', lineHeight: 1.15, marginBottom: 20, maxWidth: 700, margin: '0 auto 20px', color: 'var(--color-secondary)' }}>
            Temukan <span className="gradient-text">Influencer</span><br />
            yang <span className="gradient-text">Tepat!</span>
          </h1>

          <p style={{
            color: 'var(--color-text-muted)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7
          }}>
            Platform matching berbasis AI yang menghubungkan UMKM
            dengan nano influencer lokal. Hemat biaya, dampak nyata.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <Link to="/influencers" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-search"></i> Cari Influencer
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Daftar UMKM
            </Link>
          </div>

          {/* Stats */}
          <div className="grid-stats">
            {[
              { val: `${stats.influencers > 0 ? stats.influencers : 500}+`, label: 'Nano Influencer' },
              { val: `${stats.smes > 0 ? stats.smes : 1200}+`, label: 'UMKM Terdaftar' },
              { val: `${stats.campaigns > 0 ? stats.campaigns : 5000}+`, label: 'Kampanye Sukses' },
              { val: `${stats.satisfaction}%`, label: 'Kepuasan Klien' },
            ].map((s, i) => (
              <div key={i} className="glass" style={{
                padding: '28px 16px', borderRadius: 16, textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-secondary)' }}>{s.val}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== KATEGORI ==================== */}
      <section className="section" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: 12 }}>
              Temukan Berdasarkan <span className="gradient-text">Kategori</span>
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 500, margin: '0 auto' }}>
              Pilih niche influencer yang sesuai dengan bisnis Anda
            </p>
          </div>

          <div className="grid-categories">
            {categories.map((c, i) => (
              <Link to={`/influencers?niche=${c.label.toLowerCase().split(' ')[0]}`} key={i}
                className="card" style={{
                  padding: '36px 20px', textAlign: 'center', cursor: 'pointer',
                  textDecoration: 'none', transition: 'all 0.3s',
                  border: '1px solid var(--color-border)'
                }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18,
                  background: `${c.color}15`, margin: '0 auto 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <i className={`fa-solid ${c.icon}`} style={{ fontSize: '1.5rem', color: c.color }}></i>
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CARA KERJA ==================== */}
      <section style={{ background: 'var(--color-dark-surface)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: 12 }}>
              Cara <span className="gradient-text">Kerja</span>
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 480, margin: '0 auto' }}>
              Mulai kampanye Anda dalam 4 langkah mudah
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24
          }}>
            {steps.map((s, i) => (
              <div key={i} className="card" style={{
                padding: '32px 24px', textAlign: 'center', position: 'relative',
                border: '1px solid var(--color-border)'
              }}>
                <span style={{
                  display: 'inline-block', padding: '4px 14px', borderRadius: 20,
                  fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                  background: s.color, marginBottom: 20, letterSpacing: 1
                }}>
                  Langkah {s.num}
                </span>
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: `${s.color}15`, margin: '0 auto 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <i className={`fa-solid ${s.icon}`} style={{ fontSize: '1.5rem', color: s.color }}></i>
                </div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 10, fontWeight: 700 }}>{s.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== INFLUENCER UNGGULAN ==================== */}
      <section className="section" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: 8 }}>
                Influencer <span className="gradient-text">Unggulan</span>
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Top influencer dengan performa terbaik
              </p>
            </div>
            <Link to="/influencers" className="btn btn-secondary btn-sm">
              Lihat Semua <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {[1,2,3,4].map(i => (
                <div key={i} className="card skeleton" style={{ height: 280 }}></div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {topInfluencers.map(inf => (
                <Link to={`/influencer/${inf.id}`} key={inf.id} className="card" style={{
                  padding: '28px', textAlign: 'center', textDecoration: 'none',
                  border: '1px solid var(--color-border)', transition: 'all 0.3s'
                }}>
                  <img
                    src={getAvatarUrl(inf.users?.avatar_url, inf.users?.name || inf.platform_username)}
                    alt={inf.users?.name}
                    className="avatar avatar-lg"
                    style={{ margin: '0 auto 16px', border: '3px solid var(--color-primary)' }}
                  />
                  <h4 style={{ marginBottom: 4, color: 'var(--color-text)' }}>{inf.users?.name}</h4>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 12 }}>
                    @{inf.platform_username}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">{inf.niche}</span>
                    <span className="badge badge-accent">{inf.platform}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <span><i className="fa-solid fa-users" style={{ color: 'var(--color-primary-light)', marginRight: 4 }}></i>{formatFollowers(inf.followers_count)}</span>
                    <span><i className="fa-solid fa-star" style={{ color: '#FBBF24', marginRight: 4 }}></i>{inf.avg_rating?.toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), #06B6D4)',
            borderRadius: 24, padding: 'clamp(40px, 6vw, 60px)',
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: -60, right: -60, width: 200, height: 200,
              borderRadius: '50%', background: 'rgba(255,255,255,0.1)'
            }} />
            <div style={{
              position: 'absolute', bottom: -40, left: -40, width: 150, height: 150,
              borderRadius: '50%', background: 'rgba(255,255,255,0.08)'
            }} />

            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: 16, color: '#fff', position: 'relative' }}>
              Siap Meledakkan Penjualan Anda?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 500, margin: '0 auto 28px', fontSize: '0.95rem', lineHeight: 1.7, position: 'relative' }}>
              Gabung bersama ratusan UMKM yang sudah merasakan dampak
              nyata dari kolaborasi dengan nano influencer pilihan AI kami.
            </p>
            <Link to="/register" className="btn btn-lg" style={{
              background: '#fff', color: 'var(--color-primary)',
              fontWeight: 700, position: 'relative'
            }}>
              Mulai Sekarang — Gratis!
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
