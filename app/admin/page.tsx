'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// 👑 الإيميل ديال الإدارة
const ADMIN_EMAIL = 'samir@gmail.com' 

export default function AdminPanel() {
  const [salons, setSalons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdminAndFetchData()
  }, [])

  const checkAdminAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) { router.push('/login'); return; }
    if (user.email !== ADMIN_EMAIL) { setIsAdmin(false); setLoading(false); return; }

    setIsAdmin(true)
    
    // 🚀 هنا فين كان المشكل! صلحناه دابا ورتبناهم بـ id بلاصة created_at
    const { data, error } = await supabase.from('salons').select('*').order('id', { ascending: false })
    
    if (!error && data) {
      setSalons(data)
    } else if (error) {
      console.error("Error fetching salons:", error)
    }
    setLoading(false)
  }

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    const { error } = await supabase.from('salons').update({ is_approved: newStatus }).eq('id', id)
    if (!error) {
      setSalons(prev => prev.map(s => s.id === id ? { ...s, is_approved: newStatus } : s))
    } else {
      alert("❌ وقع شي خطأ: " + error.message)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-bold animate-pulse font-sans">⏳ جاري تحميل لوحة الإدارة...</div>

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center font-sans" dir="rtl">
        <div className="text-6xl mb-4">⛔</div>
        <h1 className="text-3xl font-black text-red-500 mb-4">غير مصرح لك بالدخول</h1>
        <p className="text-slate-400 mb-8">هذه الصفحة مخصصة للإدارة العامة فقط.</p>
        <button onClick={() => router.push('/')} className="bg-slate-800 hover:bg-slate-700 px-8 py-3 rounded-xl font-bold transition-all">الرجوع للرئيسية</button>
      </div>
    )
  }

  // إحصائيات الإدارة
  const totalSalons = salons.length
  const activeSalons = salons.filter(s => s.is_approved).length
  const pendingSalons = totalSalons - activeSalons

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans" dir="rtl">
      
      {/* 👑 شريط التنقل (Navbar) */}
      <nav className="border-b border-red-500/20 bg-[#1e293b]/80 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-red-900/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <span className="text-2xl drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">👑</span> 
            الإدارة <span className="text-red-400">العامة</span>
          </h1>
          <button onClick={() => router.push('/dashboard')} className="text-sm font-bold bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl transition-all border border-slate-700 shadow-md">
            العودة للداشبورد
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* 📊 مربعات الإحصائيات (Stats) */}
        <header className="mb-10">
          <h2 className="text-3xl font-black text-white mb-6">نظرة عامة على المنصة 🌍</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1e293b] p-6 rounded-3xl border-r-4 border-blue-500 shadow-xl relative overflow-hidden">
              <p className="text-slate-400 text-xs mb-2 font-bold uppercase tracking-wider">إجمالي الصالونات</p>
              <p className="text-4xl font-black text-white">{totalSalons}</p>
              <div className="absolute top-6 left-6 text-4xl opacity-10">📊</div>
            </div>
            <div className="bg-[#1e293b] p-6 rounded-3xl border-r-4 border-emerald-500 shadow-xl relative overflow-hidden">
              <p className="text-slate-400 text-xs mb-2 font-bold uppercase tracking-wider">صالونات مفعلة</p>
              <p className="text-4xl font-black text-emerald-400">{activeSalons}</p>
              <div className="absolute top-6 left-6 text-4xl opacity-10">✅</div>
            </div>
            <div className="bg-[#1e293b] p-6 rounded-3xl border-r-4 border-yellow-500 shadow-xl relative overflow-hidden">
              <p className="text-slate-400 text-xs mb-2 font-bold uppercase tracking-wider">قيد الانتظار</p>
              <p className="text-4xl font-black text-yellow-400">{pendingSalons}</p>
              <div className="absolute top-6 left-6 text-4xl opacity-10">⏳</div>
            </div>
          </div>
        </header>

        {/* 📋 جدول الحلاقين */}
        <div className="bg-[#1e293b] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-6 bg-slate-800/30 flex justify-between items-center border-b border-slate-800/50">
            <h3 className="font-bold text-xl text-white flex items-center gap-2">
              📋 قائمة طلبات التسجيل
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-800/20 text-slate-400 text-sm font-bold">
                  <th className="p-5 tracking-wider">الصالون</th>
                  <th className="p-5 text-center tracking-wider">المدينة</th>
                  <th className="p-5 text-center tracking-wider">الهاتف</th>
                  <th className="p-5 text-center tracking-wider">الحالة</th>
                  <th className="p-5 text-center tracking-wider">القرار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {salons.length > 0 ? salons.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/20 group transition-colors">
                    
                    {/* اسم الصالون */}
                    <td className="p-5">
                      <p className="text-white font-black text-base">{s.name}</p>
                      <p className="text-slate-500 text-xs mt-1">ID: {s.id}</p>
                    </td>
                    
                    {/* المدينة */}
                    <td className="p-5 text-center">
                      <span className="bg-slate-800/50 text-slate-300 px-3 py-1 rounded-full text-xs border border-slate-700">
                        {s.city || '---'}
                      </span>
                    </td>
                    
                    {/* الهاتف */}
                    <td className="p-5 text-center text-blue-400 font-mono text-sm tracking-wider font-bold">
                      {s.phone}
                    </td>
                    
                    {/* الحالة */}
                    <td className="p-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm border ${
                        s.is_approved 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse'
                      }`}>
                        {s.is_approved ? 'مُفعل ✅' : 'قيد المراجعة ⏳'}
                      </span>
                    </td>
                    
                    {/* الإجراء (البوطونة) */}
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => toggleApproval(s.id, s.is_approved)}
                        className={`px-5 py-2 rounded-xl text-xs font-black transition-all shadow-lg active:scale-95 ${
                          s.is_approved 
                          ? 'bg-[#0f172a] text-red-400 hover:bg-red-500/10 border border-red-500/30' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20 border border-emerald-500'
                        }`}
                      >
                        {s.is_approved ? 'إلغاء التفعيل ❌' : 'تفعيل الحساب ✅'}
                      </button>
                    </td>
                    
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-slate-500 text-lg font-bold">
                      📭 لا توجد أي صالونات مسجلة حتى الآن.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

    </div>
  )
}