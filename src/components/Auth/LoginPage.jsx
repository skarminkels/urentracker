import { useState } from 'react'
import { Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl text-sm outline-none transition-[border-color,box-shadow] duration-150'
  const inputStyle = {
    backgroundColor: '#faf8f4',
    border: '1px solid rgba(43,42,39,0.12)',
    color: '#2b2a27',
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#e8e4dd' }}>
      <div
        className="rounded-2xl w-full max-w-sm p-8"
        style={{
          backgroundColor: '#f6f3ee',
          boxShadow: '0 20px 40px rgba(55,44,22,0.08)',
          border: '1px solid rgba(43,42,39,0.06)',
        }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#f1c93b' }}
          >
            <Clock size={20} style={{ color: '#20242c' }} />
          </div>
          <h1 className="text-xl font-semibold" style={{ color: '#2b2a27' }}>Urentracker</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className={inputClass}
              style={inputStyle}
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(241,201,59,0.30)'}
              onBlur={e => e.currentTarget.style.boxShadow = ''}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={inputClass}
              style={inputStyle}
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(241,201,59,0.30)'}
              onBlur={e => e.currentTarget.style.boxShadow = ''}
            />
          </div>

          {error && (
            <p
              className="text-sm px-4 py-3 rounded-xl"
              style={{ color: '#EF4444', backgroundColor: '#fef2f2', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium text-white transition-[transform,background-color] duration-150 active:scale-[0.97] disabled:opacity-60"
            style={{ backgroundColor: '#20242c' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#2d3340' }}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#20242c'}
          >
            {loading ? 'Inloggen…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  )
}
