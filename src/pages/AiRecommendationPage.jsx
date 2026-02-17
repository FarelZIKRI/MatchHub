import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../lib/avatar'

const STEPS = [
  { title: 'Jenis Bisnis Anda?', sub: 'Pilih kategori yang paling sesuai dengan bisnis Anda' },
  { title: 'Budget Kampanye?', sub: 'Pilih range budget yang Anda siapkan untuk kampanye' },
  { title: 'Lokasi Target?', sub: 'Pilih lokasi target audiens Anda' },
  { title: 'Tujuan Kampanye?', sub: 'Apa yang ingin Anda capai dari kampanye ini?' },
]

const CATEGORIES = [
  { value: 'food', label: 'F&B / Kuliner', icon: 'fa-utensils' },
  { value: 'beauty', label: 'Beauty / Skincare', icon: 'fa-spa' },
  { value: 'fashion', label: 'Fashion', icon: 'fa-shirt' },
  { value: 'technology', label: 'Tech / Gadget', icon: 'fa-laptop' },
  { value: 'travel', label: 'Travel', icon: 'fa-plane' },
  { value: 'health', label: 'Jasa / Services', icon: 'fa-briefcase' },
]

const BUDGETS = [
  { value: 500000, label: '< Rp 500K', sub: 'Budget hemat', icon: 'fa-coins' },
  { value: 1000000, label: 'Rp 500K - 1 Juta', sub: 'Budget standar', icon: 'fa-wallet' },
  { value: 3000000, label: 'Rp 1 - 3 Juta', sub: 'Budget menengah', icon: 'fa-money-bill-wave' },
  { value: 5000000, label: 'Rp 3 - 5 Juta', sub: 'Budget premium', icon: 'fa-gem' },
  { value: 10000000, label: 'Rp 5 - 10 Juta', sub: 'Budget enterprise', icon: 'fa-crown' },
  { value: 99999999, label: '> Rp 10 Juta', sub: 'Unlimited', icon: 'fa-rocket' },
]

const LOCATIONS = [
  { value: 'Jakarta', icon: 'fa-city' },
  { value: 'Bandung', icon: 'fa-mountain-sun' },
  { value: 'Surabaya', icon: 'fa-building' },
  { value: 'Yogyakarta', icon: 'fa-landmark' },
  { value: 'Bali', icon: 'fa-umbrella-beach' },
  { value: 'Semua Lokasi', icon: 'fa-globe' },
]

const GOALS = [
  { value: 'awareness', label: 'Brand Awareness', sub: 'Meningkatkan pengenalan brand', icon: 'fa-bullhorn' },
  { value: 'sales', label: 'Boost Penjualan', sub: 'Meningkatkan penjualan produk', icon: 'fa-chart-line' },
  { value: 'engagement', label: 'Engagement', sub: 'Meningkatkan interaksi & komunitas', icon: 'fa-heart' },
  { value: 'launch', label: 'Product Launch', sub: 'Peluncuran produk baru', icon: 'fa-rocket' },
]

export default function AiRecommendationPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')

  const [answers, setAnswers] = useState({
    niche: '',
    budget: '',
    location: '',
    goal: '',
  })

  const progress = showResults ? 100 : ((step + 1) / STEPS.length) * 100

  function selectAnswer(key, value) {
    setAnswers({ ...answers, [key]: value })
  }

  function canProceed() {
    const keys = ['niche', 'budget', 'location', 'goal']
    return answers[keys[step]] !== ''
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1)
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    setShowResults(true)

    try {
      // Use local database matching
      await localMatching()
    } catch (err) {
      setError('Terjadi kesalahan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function localMatching() {
    // Progressive filter relaxation: always keep niche, relax other filters
    const attempts = [
      // Attempt 1: All filters (niche + location + budget)
      () => {
        let q = supabase.from('influencers').select('*, users(name, avatar_url)')
          .eq('is_available', true)
        if (answers.niche) q = q.eq('niche', answers.niche)
        if (answers.location && answers.location !== 'Semua Lokasi') q = q.ilike('location', `%${answers.location}%`)
        if (answers.budget) q = q.lte('price_per_post', Number(answers.budget))
        return q.order('avg_rating', { ascending: false }).limit(6)
      },
      // Attempt 2: Niche + budget only (drop location)
      () => {
        let q = supabase.from('influencers').select('*, users(name, avatar_url)')
          .eq('is_available', true)
        if (answers.niche) q = q.eq('niche', answers.niche)
        if (answers.budget) q = q.lte('price_per_post', Number(answers.budget))
        return q.order('avg_rating', { ascending: false }).limit(6)
      },
      // Attempt 3: Niche only (drop budget & location)
      () => {
        let q = supabase.from('influencers').select('*, users(name, avatar_url)')
          .eq('is_available', true)
        if (answers.niche) q = q.eq('niche', answers.niche)
        return q.order('avg_rating', { ascending: false }).limit(6)
      },
    ]

    for (const attempt of attempts) {
      const { data, error: dbError } = await attempt()

      if (dbError) {
        setError('Gagal mendapatkan rekomendasi: ' + dbError.message)
        return
      }

      if (data && data.length > 0) {
        const scored = data.map(inf => {
          let score = 40
          if (inf.niche === answers.niche) score += 30
          if (answers.location && answers.location !== 'Semua Lokasi' &&
              inf.location?.toLowerCase().includes(answers.location.toLowerCase())) score += 15
          if (answers.budget && Number(inf.price_per_post) <= Number(answers.budget)) score += 10
          if (inf.avg_rating >= 4.5) score += 5
          return { ...inf, match_score: Math.min(score, 98) }
        })
        scored.sort((a, b) => b.match_score - a.match_score)
        setRecommendations(scored)
        return
      }
    }

    setError('Belum ada influencer yang tersedia untuk kategori ini. Silakan coba kategori lain.')
  }

  function resetWizard() {
    setStep(0)
    setAnswers({ niche: '', budget: '', location: '', goal: '' })
    setRecommendations([])
    setShowResults(false)
    setError('')
  }

  const formatPrice = (p) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)
  const formatFollowers = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
    return n
  }

  // Shared card style for option buttons
  const optionCard = (selected) => ({
    padding: '28px 20px', borderRadius: 16, border: '2px solid',
    borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
    background: selected ? 'rgba(108,60,225,0.1)' : 'var(--color-dark-surface)',
    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
    color: 'var(--color-text)', fontFamily: 'inherit',
  })

  const optionIcon = (selected) => ({
    fontSize: '1.6rem', display: 'block', marginBottom: 12,
    color: selected ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
  })

  return (
    <>
      {/* Hero */}
      <section style={{
        background: 'var(--gradient-hero)', padding: '40px 0 32px', textAlign: 'center'
      }}>
        <div className="container">
          <span className="badge badge-accent" style={{ marginBottom: 16, padding: '8px 20px', fontSize: '0.8rem' }}>
            <i className="fa-solid fa-wand-magic-sparkles"></i> AI-Powered Matching
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', marginBottom: 16 }}>
            <span className="gradient-text">Smart</span> Recommendations
          </h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: 520, margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
            Jawab beberapa pertanyaan dan AI kami akan merekomendasikan influencer
            yang paling cocok untuk bisnis Anda
          </p>
        </div>
      </section>

      <section style={{ padding: '32px 0 80px' }}>
        <div className="container">

          {/* Loading State */}
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: 80 }}>
              <div className="spinner" style={{ margin: '0 auto 24px' }}></div>
              <h3 style={{ marginBottom: 8 }}>AI sedang menganalisis...</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Mencari influencer terbaik untuk bisnis Anda</p>
            </div>
          )}

          {/* Results */}
          {!loading && showResults && (
            <div className="animate-fade-in-up">
              {/* Progress bar - complete */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Selesai!</span>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.85rem' }}>100%</span>
                </div>
                <div style={{ height: 4, borderRadius: 4, background: 'var(--color-dark-surface)' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: 'var(--color-accent)', width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>
                    <i className="fa-solid fa-sparkles" style={{ color: 'var(--color-accent)', marginRight: 8 }}></i>
                    {recommendations.length > 0 ? 'Rekomendasi untuk Anda' : 'Tidak Ada Hasil'}
                  </h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {recommendations.length > 0
                      ? `Ditemukan ${recommendations.length} influencer yang cocok`
                      : 'Coba ubah kriteria pencarian Anda'
                    }
                  </p>
                </div>
                <button onClick={resetWizard} className="btn btn-secondary btn-sm">
                  <i className="fa-solid fa-rotate-left"></i> Ulangi
                </button>
              </div>

              {error && (
                <div style={{
                  padding: '16px 20px', borderRadius: 12, marginBottom: 20,
                  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                  color: '#F87171', fontSize: '0.9rem'
                }}>
                  <i className="fa-solid fa-exclamation-circle" style={{ marginRight: 8 }}></i>{error}
                </div>
              )}

              {recommendations.length === 0 && !error && (
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                  <i className="fa-solid fa-face-sad-tear" style={{ fontSize: '3rem', color: 'var(--color-text-muted)', marginBottom: 16 }}></i>
                  <h3 style={{ marginBottom: 8 }}>Tidak ditemukan influencer</h3>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
                    Tidak ada influencer yang sesuai dengan kriteria Anda saat ini
                  </p>
                  <button onClick={resetWizard} className="btn btn-primary">
                    <i className="fa-solid fa-rotate-left"></i> Coba Lagi
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {recommendations.map((inf, i) => (
                  <Link to={`/influencers/${inf.id}`} key={inf.id} className="card recommendation-item">
                    {/* Rank */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: i === 0 ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' :
                                  i === 1 ? 'linear-gradient(135deg, #94A3B8, #64748B)' :
                                  i === 2 ? 'linear-gradient(135deg, #CD7F32, #A0522D)' :
                                  'var(--color-dark-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, color: '#fff', fontSize: '1.1rem'
                    }}>
                      #{i + 1}
                    </div>

                    {/* Avatar */}
                    <img
                      src={getAvatarUrl(inf.users?.avatar_url, inf.users?.name || inf.platform_username)}
                      alt="" className="avatar" style={{ width: 56, height: 56, flexShrink: 0 }}
                    />

                    {/* Info */}
                    <div className="recommendation-info">
                      <h4 style={{ marginBottom: 6, fontSize: '1.05rem' }}>{inf.users?.name}</h4>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <span className="badge badge-primary">{inf.niche}</span>
                        <span className="badge badge-accent">{inf.platform}</span>
                        <span className="badge badge-info">
                          <i className="fa-solid fa-location-dot"></i> {inf.location}
                        </span>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div style={{ textAlign: 'center', minWidth: 70 }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: `conic-gradient(var(--color-accent) ${(inf.match_score || 0) * 3.6}deg, var(--color-dark-surface) 0deg)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto'
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%',
                          background: 'var(--color-dark-card)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-accent)'
                        }}>
                          {inf.match_score || 0}%
                        </div>
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', marginTop: 4 }}>Match</div>
                    </div>

                    {/* Price & Action */}
                    <div className="recommendation-price">
                      <div style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '1rem' }}>
                        {formatPrice(inf.price_per_post)}
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 8 }}>
                        {formatFollowers(inf.followers_count)} followers
                      </div>
                      <span className="btn btn-primary btn-sm">
                        Lihat Detail <i className="fa-solid fa-arrow-right"></i>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Wizard Steps */}
          {!loading && !showResults && (
            <>
              {/* Progress Bar */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    Step {step + 1} dari {STEPS.length}
                  </span>
                  <span style={{ color: 'var(--color-primary-light)', fontWeight: 700, fontSize: '0.9rem' }}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 4, background: 'var(--color-dark-surface)' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    background: 'var(--gradient-primary)',
                    width: `${progress}%`, transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              {/* Step Card */}
              <div className="card wizard-card-padding">
                <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>{STEPS[step].title}</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: 32 }}>
                  {STEPS[step].sub}
                </p>

                {/* Step 0: Niche */}
                {step === 0 && (
                  <div className="grid-wizard-options">
                    {CATEGORIES.map(c => (
                      <button key={c.value} onClick={() => selectAnswer('niche', c.value)}
                        style={optionCard(answers.niche === c.value)}>
                        <i className={`fa-solid ${c.icon}`} style={optionIcon(answers.niche === c.value)}></i>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 1: Budget */}
                {step === 1 && (
                  <div className="grid-wizard-options">
                    {BUDGETS.map(b => (
                      <button key={b.value} onClick={() => selectAnswer('budget', b.value)}
                        style={optionCard(answers.budget === b.value)}>
                        <i className={`fa-solid ${b.icon}`} style={optionIcon(answers.budget === b.value)}></i>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block' }}>{b.label}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>{b.sub}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                  <div className="grid-wizard-options">
                    {LOCATIONS.map(l => (
                      <button key={l.value} onClick={() => selectAnswer('location', l.value)}
                        style={optionCard(answers.location === l.value)}>
                        <i className={`fa-solid ${l.icon}`} style={optionIcon(answers.location === l.value)}></i>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{l.value}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 3: Goal */}
                {step === 3 && (
                  <div className="grid-wizard-goals">
                    {GOALS.map(g => (
                      <button key={g.value} onClick={() => selectAnswer('goal', g.value)}
                        style={{
                          ...optionCard(answers.goal === g.value),
                          textAlign: 'left', display: 'flex', alignItems: 'center', gap: 18,
                          padding: '32px 24px',
                        }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                          background: answers.goal === g.value ? 'rgba(108,60,225,0.2)' : 'rgba(255,255,255,0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <i className={`fa-solid ${g.icon}`} style={{
                            fontSize: '1.3rem',
                            color: answers.goal === g.value ? 'var(--color-primary-light)' : 'var(--color-text-muted)'
                          }}></i>
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '1.05rem', display: 'block' }}>{g.label}</span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>{g.sub}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={{
                    padding: '14px 18px', borderRadius: 12, marginTop: 24,
                    background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                    color: '#F87171', fontSize: '0.9rem'
                  }}>
                    <i className="fa-solid fa-exclamation-circle" style={{ marginRight: 8 }}></i>{error}
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
                  {step > 0 ? (
                    <button onClick={handleBack} className="btn btn-secondary">
                      <i className="fa-solid fa-arrow-left"></i> Kembali
                    </button>
                  ) : <div />}
                  <button onClick={handleNext} className="btn btn-primary btn-lg"
                    disabled={!canProceed()}
                    style={{ opacity: canProceed() ? 1 : 0.4 }}>
                    {step === STEPS.length - 1 ? (
                      <><i className="fa-solid fa-wand-magic-sparkles"></i> Dapatkan Rekomendasi</>
                    ) : (
                      <>Lanjut <i className="fa-solid fa-arrow-right"></i></>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
