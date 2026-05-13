'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(`❌ ${error.message}`)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
        
        <div className="p-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm">سجل الدخول لإدارة صالونك</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase ml-1 tracking-wider">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-[#0f172a] border border-slate-700 text-white p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                placeholder="example@mail.com" // هاهي تبدلات هنا أ سمير
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase ml-1 tracking-wider">Password</label>
              <input 
                type="password" 
                className="w-full bg-[#0f172a] border border-slate-700 text-white p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          {message && (
            <div className="mt-6 p-4 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-center text-sm">
              {message}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center text-slate-400 text-sm">
            Don't have an account? <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">Register Now</Link>
          </div>
        </div>
      </div>
    </div>
  )
}