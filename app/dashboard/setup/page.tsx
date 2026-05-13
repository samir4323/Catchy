'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SetupSalon() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // 1. كنجيبو الـ ID ديال المستخدم اللي داخل دابا
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        alert("Please login first")
        router.push('/login')
        return
    }

    // 2. كنصيفطو المعلومات لـ Supabase
    const { error } = await supabase.from('salons').insert([
      { 
        name: name, 
        phone: phone, 
        city: city, 
        owner_id: user.id // هادي هي السنسلة اللي ربطنا فـ Supabase
      }
    ])

    if (!error) {
      // إيلا كولشي داز مزيان، كنصيفطوه للـ Dashboard
      router.push('/dashboard')
    } else {
      alert("Error: " + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-right" dir="rtl">
      <div className="w-full max-w-[500px] bg-[#1e293b] rounded-2xl p-8 border border-slate-700 shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">إعداد معلومات صالونك 💈</h1>
          <p className="text-slate-400 text-sm">هذه المعلومات هي التي ستظهر للزبناء</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">إسم الصالون</label>
            <input 
              className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="مثلا: صالون الأناقة"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">رقم الهاتف</label>
            <input 
              className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="0600000000"
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">المدينة</label>
            <input 
              className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="الدار البيضاء"
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'جاري حفظ البيانات...' : 'حفظ والدخول للوحة التحكم'}
          </button>
        </form>
      </div>
    </div>
  )
}