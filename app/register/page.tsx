'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage({ text: `❌ ${error.message}`, type: 'error' })
    } else {
      setMessage({ text: '✅ Account created! Welcome to the club.', type: 'success' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[400px] bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        
        {/* Header Decor */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        
        <div className="p-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">BarberPro</h1>
            <p className="text-slate-400 text-sm">أنشئ حسابك وابدأ في تنظيم صالونك</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-[#0f172a] border border-slate-700 text-white p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Password</label>
              <input 
                type="password" 
                className="w-full bg-[#0f172a] border border-slate-700 text-white p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Create My Account'}
            </button>
          </form>

          {message.text && (
            <div className={`mt-6 p-4 rounded-lg text-sm text-center font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
              {message.text}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center text-slate-400 text-sm">
            Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}