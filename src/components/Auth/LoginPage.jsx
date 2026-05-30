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

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-8" style={{ boxShadow: '0 20px 40px rgba(15,23,42,0.08)', border: '1px solid rgba(15,23,42,0.05)' }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6B5CF6 0%, #A855F7 100%)' }}>
            <Clock size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-[#111827]">Urentracker</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6B5CF6] focus:ring-2 focus:ring-[#6B5CF6]/20 transition-[border-color,box-shadow] duration-150"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6B5CF6] focus:ring-2 focus:ring-[#6B5CF6]/20 transition-[border-color,box-shadow] duration-150"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#6B5CF6] hover:bg-[#5347d4] text-white text-sm font-medium transition-[transform,background-color] duration-150 active:scale-[0.97] disabled:opacity-60"
          >
            {loading ? 'Inloggen…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  )
}
