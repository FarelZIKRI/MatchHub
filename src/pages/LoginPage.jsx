import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn({ email, password })
    if (error) {
      if (error.message === 'Invalid login credentials') {
        setError('Email atau password salah. Silakan coba lagi.')
      } else if (error.message === 'Email not confirmed') {
        setError('Email belum diverifikasi. Silakan cek inbox email Anda untuk link konfirmasi, atau hubungi admin untuk konfirmasi manual.')
      } else {
        setError(error.message)
      }
    } else {
      showToast('Login berhasil! Selamat datang.')
      navigate('/')
    }
    setLoading(false)
  }

  async function handleGoogleLogin() {
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--gradient-hero)', padding: '24px'
    }}>
      <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: 440, padding: 40 }}>
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
          <h1 style={{ fontSize: '1.5rem', marginBottom: 6, color: 'var(--color-secondary)' }}>Selamat Datang Kembali</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Masuk ke akun Anda untuk melanjutkan
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

        {/* Google Login */}
        <button onClick={handleGoogleLogin} style={{
          width: '100%', padding: '12px', borderRadius: 12,
          background: 'var(--color-dark-surface)', border: '1px solid var(--color-border)',
          color: 'var(--color-text)', cursor: 'pointer', fontSize: '0.95rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontFamily: 'inherit', transition: 'all 0.2s', marginBottom: 24
        }}>
          <i className="fa-brands fa-google" style={{ color: '#FBBF24' }}></i>
          Masuk dengan Google
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
          <div style={{ marginBottom: 20 }}>
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-envelope" style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)', fontSize: '0.9rem'
              }}></i>
              <input type="email" className="input" required
                placeholder="nama@email.com"
                style={{ paddingLeft: 40 }}
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-lock" style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)', fontSize: '0.9rem'
              }}></i>
              <input type={showPassword ? 'text' : 'password'} className="input" required
                placeholder="Masukkan password"
                style={{ paddingLeft: 40, paddingRight: 44 }}
                value={password} onChange={e => setPassword(e.target.value)}
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

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}
            disabled={loading}>
            {loading ? (
              <><div className="spinner" style={{ width: 20, height: 20 }}></div> Memproses...</>
            ) : (
              <><i className="fa-solid fa-right-to-bracket"></i> Masuk</>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Daftar Sekarang</Link>
        </p>
      </div>
    </div>
  )
}
