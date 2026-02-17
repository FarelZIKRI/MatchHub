import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', userType: 'sme'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Password tidak cocok. Silakan periksa kembali.')
      return
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)
    const { error } = await signUp({
      email: form.email,
      password: form.password,
      name: form.name,
      userType: form.userType
    })

    if (error) {
      setError(error.message)
    } else {
      showToast('Registrasi berhasil! Silakan cek email Anda.')
      navigate('/login')
    }
    setLoading(false)
  }

  async function handleGoogleRegister() {
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--gradient-hero)', padding: '24px'
    }}>
      <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: 480, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '1.1rem'
            }}>
              <i className="fa-solid fa-link"></i>
            </div>
            <span style={{ color: 'var(--color-secondary)', fontWeight: 800, fontSize: '1.4rem' }}>
              Match<span style={{ color: 'var(--color-primary)' }}>Hub</span>
            </span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 6, color: 'var(--color-secondary)' }}>Buat Akun Baru</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Bergabunglah dengan MatchHub sekarang
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 20,
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
            color: '#F87171', fontSize: '0.88rem'
          }}>
            <i className="fa-solid fa-exclamation-circle" style={{ marginRight: 8 }}></i>{error}
          </div>
        )}

        <button onClick={handleGoogleRegister} style={{
          width: '100%', padding: '12px', borderRadius: 12,
          background: 'var(--color-dark-surface)', border: '1px solid var(--color-border)',
          color: 'var(--color-text)', cursor: 'pointer', fontSize: '0.95rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontFamily: 'inherit', transition: 'all 0.2s', marginBottom: 24
        }}>
          <i className="fa-brands fa-google" style={{ color: '#FBBF24' }}></i>
          Daftar dengan Google
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
          color: 'var(--color-text-muted)', fontSize: '0.85rem'
        }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
          atau
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label>Nama Lengkap</label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-user" style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)', fontSize: '0.9rem', width: 20, textAlign: 'center'
              }}></i>
              <input type="text" className="input" required placeholder="Nama lengkap Anda"
                style={{ paddingLeft: 40 }}
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-envelope" style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)', fontSize: '0.9rem'
              }}></i>
              <input type="email" className="input" required placeholder="nama@email.com"
                style={{ paddingLeft: 40 }}
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label>Tipe Akun</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { value: 'sme', icon: 'fa-store', label: 'UMKM' },
                { value: 'influencer', icon: 'fa-user-tie', label: 'Influencer' }
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setForm({ ...form, userType: opt.value })}
                  style={{
                    padding: '14px', borderRadius: 10, cursor: 'pointer',
                    background: form.userType === opt.value ? 'rgba(0, 102, 255, 0.1)' : 'var(--color-bg-surface)',
                    border: `2px solid ${form.userType === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    color: form.userType === opt.value ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600,
                    transition: 'all 0.2s', textAlign: 'center'
                  }}
                >
                  <i className={`fa-solid ${opt.icon}`} style={{ display: 'block', fontSize: '1.2rem', marginBottom: 4 }}></i>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-lock" style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)', fontSize: '0.9rem'
              }}></i>
              <input type={showPassword ? 'text' : 'password'} className="input" required
                placeholder="Minimal 6 karakter"
                style={{ paddingLeft: 40, paddingRight: 44 }}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--color-text-muted)',
                cursor: 'pointer', fontSize: '0.9rem'
              }}>
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label>Konfirmasi Password</label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-lock" style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)', fontSize: '0.9rem'
              }}></i>
              <input type={showPassword ? 'text' : 'password'} className="input" required
                placeholder="Ulangi password"
                style={{ paddingLeft: 40 }}
                value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}
            disabled={loading}>
            {loading ? (
              <><div className="spinner" style={{ width: 20, height: 20 }}></div> Memproses...</>
            ) : (
              <><i className="fa-solid fa-user-plus"></i> Daftar</>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Dengan mendaftar, Anda menyetujui{' '}
          <Link to="/terms" style={{ color: 'var(--color-primary-light)' }}>Syarat & Ketentuan</Link> kami.
        </p>

        <p style={{ textAlign: 'center', marginTop: 12, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Masuk</Link>
        </p>
      </div>
    </div>
  )
}
