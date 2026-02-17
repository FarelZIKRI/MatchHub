
import { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null) // { message, type }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    // Auto hide after 3 seconds
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div style={{
          position: 'fixed', 
          top: 32, 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'var(--color-bg-card)',
          color: 'var(--color-text-main)',
          padding: '16px 20px', 
          borderRadius: 12,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          fontWeight: 600, 
          fontSize: '0.95rem', 
          minWidth: 340,
          border: '1px solid var(--color-border)',
          borderLeft: `6px solid ${
            toast.type === 'error' ? '#EF4444' : 
            toast.type === 'info' ? 'var(--color-primary)' : 
            'var(--color-accent)'
          }`,
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'slideDownFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <i className={`fa-solid ${
            toast.type === 'error' ? 'fa-circle-xmark' : 
            toast.type === 'info' ? 'fa-circle-info' : 
            'fa-circle-check'
          }`} style={{
            fontSize: '1.2rem',
            color: toast.type === 'error' ? '#EF4444' : 
                   toast.type === 'info' ? 'var(--color-primary)' : 
                   'var(--color-accent)'
          }}></i>
          <span>{toast.message}</span>
        </div>
      )}
      <style>{`
        @keyframes slideDownFade {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
