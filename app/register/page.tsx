'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image' // ✅ زدنا هادي للوغو

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
      setMessage({ text: '✅ تم إنشاء الحساب بنجاح! تفقد بريدك الإلكتروني.', type: 'success' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 🌌 تأثير الإضاءة في الخلفية */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* 🏢 كارت إنشاء حساب جديد */}
      <div className="w-full max-w-[420px] bg-[#1e293b]/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-800 overflow-hidden relative z-10">
        {/* خط الديكور العلوي بالأزرق البراند */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
        
        <div className="p-10">
          {/* 🎯 شعار المنصة والعنوان */}
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="mb-6 hover:scale-105 transition-transform duration-300">
              <Image 
                src="/logo.png" 
                alt="Catchy Logo" 
                width={150} 
                height={50} 
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Create Account</h1>
            <p className="text-slate-400 text-sm font-medium">أنشئ حسابك دابا وابدأ تنظيم صالونك</p>
          </div>

          {/* 📝 الفورم */}
          <form onSubmit={handleRegister} className="space-y-6 text-right" dir="rtl">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase mr-1 tracking-widest block">البريد الإلكتروني (Email)</label>
              <input 
                type="email" 
                dir="ltr"
                className="w-full bg-[#0f172a] border border-slate-700 text-white p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700 shadow-inner font-medium text-left"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase mr-1 tracking-widest block">كلمة المرور (Password)</label>
              <input 
                type="password" 
                dir="ltr"
                className="w-full bg-[#0f172a] border border-slate-700 text-white p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700 shadow-inner font-medium text-left"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-8 text-center"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
            </button>
          </form>

          {/* ✅ / ⚠️ رسائل النجاح أو الخطأ */}
          {message.text && (
            <div className={`mt-6 p-4 rounded-xl text-sm text-center font-bold border ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
              {message.text}
            </div>
          )}

          {/* 🔗 رابط العودة لتسجيل الدخول */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-slate-400 text-sm font-medium">
            عندك حساب أصلاً؟{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-4 transition-colors">
              دخل من هنا ديريكت
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}