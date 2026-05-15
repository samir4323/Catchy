'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// 👑 هادا هو الإيميل ديالك نتا (المدير)
const ADMIN_EMAIL = 'samir@gmail.com' 

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [salon, setSalon] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)

  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [service, setService] = useState('')
  const [modalDate, setModalDate] = useState('')
  const [modalTime, setModalTime] = useState('')
  const [modalBookedTimes, setModalBookedTimes] = useState<string[]>([])
  const [loadingModalTimes, setLoadingModalTimes] = useState(false)

  const [editName, setEditName] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (salon) {
      setEditName(salon.name)
      setEditCity(salon.city)
      setEditPhone(salon.phone)
    }
  }, [salon])

  useEffect(() => {
    if (salon?.id) {
      fetchAppointments(salon.id, selectedDate)
    }
  }, [selectedDate, salon?.id])

  useEffect(() => {
    if (!salon?.id) return

    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments', filter: `salon_id=eq.${salon.id}` }, 
        () => fetchAppointments(salon.id, selectedDate)
      )
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'services', filter: `salon_id=eq.${salon.id}` }, 
        () => fetchServices(salon.id)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [salon?.id, selectedDate])

  useEffect(() => {
    if (!modalDate || !salon?.id) return

    const fetchBookedTimes = async () => {
      setLoadingModalTimes(true)
      const { data } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('salon_id', salon.id)
        .gte('appointment_time', `${modalDate}T00:00:00`)
        .lte('appointment_time', `${modalDate}T23:59:59`)

      if (data) {
        const times = data.map(app => app.appointment_time.substring(11, 16))
        setModalBookedTimes(times)
      }
      setLoadingModalTimes(false)
    }
    
    fetchBookedTimes()
    setModalTime('')
  }, [modalDate, salon?.id])

  const generateTimeSlots = () => {
    const slots = []
    for (let i = 10; i <= 21; i++) {
      slots.push(`${i < 10 ? '0'+i : i}:00`)
      slots.push(`${i < 10 ? '0'+i : i}:30`)
    }
    return slots
  }
  const timeSlots = generateTimeSlots()

  const handleUpdateSalon = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const { data, error } = await supabase
      .from('salons')
      .update({ name: editName, city: editCity, phone: editPhone })
      .eq('id', salon.id)
      .select() 

    if (!error) {
      setSalon({ ...salon, name: editName, city: editCity, phone: editPhone })
      alert("✅ تم حفظ التعديلات بنجاح!")
    } else {
      alert("❌ فشل الحفظ: " + error.message)
    }
    setIsSaving(false)
  }

  const fetchInitialData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) { 
      router.push('/login'); 
      return; 
    }

    if (user.email === ADMIN_EMAIL) {
      router.push('/admin');
      return;
    }

    setUser(user)

    const { data: salonData } = await supabase.from('salons').select('*').eq('owner_id', user.id).single()

    if (!salonData) { 
      router.push('/dashboard/setup') 
    } else { 
      setSalon(salonData)
      fetchAppointments(salonData.id, selectedDate)
      fetchServices(salonData.id)
    }
    setLoading(false)
  }

  const fetchAppointments = async (salonId: number, dateToFetch: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salonId)
      .gte('appointment_time', `${dateToFetch}T00:00:00`)
      .lte('appointment_time', `${dateToFetch}T23:59:59`)
      .order('appointment_time', { ascending: true })

    if (!error) setAppointments(data || [])
  }

  const fetchServices = async (salonId: number) => {
    const { data } = await supabase.from('services').select('*').eq('salon_id', salonId)
    setServices(data || [])
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('services').insert([
      { salon_id: salon.id, name: newServiceName, price: parseFloat(newServicePrice) }
    ])
    setNewServiceName(''); setNewServicePrice(''); fetchServices(salon.id) 
  }

  const updatePrice = async (id: string, price: string) => {
    const numPrice = parseFloat(price) || 0
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, price: numPrice } : a))
    await supabase.from('appointments').update({ price: numPrice }).eq('id', id)
  }

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalDate || !modalTime) { alert("عفاك اختار التاريخ والوقت"); return; }
    
    const selectedSrv = services.find(s => s.name === service)
    const servicePrice = selectedSrv ? selectedSrv.price : 0
    const fullDateTime = `${modalDate}T${modalTime}`

    const { error } = await supabase.from('appointments').insert([{ 
      salon_id: salon.id, client_name: clientName, client_phone: clientPhone, 
      appointment_time: fullDateTime, service_name: service || '---', status: 'pending', price: servicePrice 
    }])

    if (!error) {
      fetchAppointments(salon.id, selectedDate)
      setIsModalOpen(false)
      setClientName(''); setClientPhone(''); setModalDate(''); setModalTime(''); setService('');
      if (modalDate !== selectedDate) alert(`✅ تم التسجيل بنجاح!`);
    } else { alert('❌ خطأ: ' + error.message); }
  }

  const dateEarnings = appointments.reduce((sum, app) => sum + (Number(app.price) || 0), 0)
  const dateLabel = selectedDate === today ? 'اليوم' : selectedDate

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-bold animate-pulse font-sans">جاري التحميل...</div>

  if (salon && salon.is_approved === false) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex items-center justify-center p-6" dir="rtl">
        <div className="bg-[#1e293b] max-w-md w-full p-10 rounded-[2.5rem] border border-yellow-500/30 shadow-2xl text-center">
          <div className="text-6xl mb-6 animate-bounce">⏳</div>
          <h2 className="text-2xl font-black text-white mb-4">حسابك قيد المراجعة</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            مرحباً بك في منصة <strong>Catchy</strong>! لقد تم تسجيل صالونك بنجاح، ولكن الحساب يحتاج إلى تفعيل من طرف الإدارة قبل أن تتمكن من استخدامه.
          </p>
          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))} 
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30" dir="rtl">
      
      {/* 🟢 Navbar - Glassmorphism Effect */}
      <nav className="border-b border-slate-800 bg-[#1e293b]/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
            <Image 
              src="/logo.png" 
              alt="Catchy Logo" 
              width={160} 
              height={50} 
              className="object-contain"
              priority
            />
          </div>
          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} 
            className="text-xs font-black bg-slate-800 hover:bg-red-500/20 hover:text-red-400 px-5 py-2.5 rounded-xl transition-all border border-slate-700 uppercase tracking-widest"
          >
            خروج
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="text-right">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">لوحة التحكم 👋</h2>
            <div className="flex flex-wrap gap-3">
               <span className="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full border border-blue-500/20 text-sm font-bold">📍 {salon?.city}</span>
               <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-500/20 text-sm font-bold">📞 {salon?.phone}</span>
            </div>
          </div>
          <button 
            onClick={() => { const bookingUrl = `${window.location.origin}/book/${salon.id}`; navigator.clipboard.writeText(bookingUrl); alert("✅ تم نسخ رابط الحجز!"); }} 
            className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-black transition-all border border-slate-700 flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95"
          >
            🔗 نسخ رابط الحجز للكليان
          </button>
        </header>

        {/* 📊 Stats Cards with Glow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1e293b] p-8 rounded-[2rem] border-b-4 border-blue-500 shadow-xl shadow-blue-500/5 transition-transform hover:-translate-y-1">
            <p className="text-slate-500 text-xs mb-2 font-black uppercase tracking-[0.2em]">مواعيد ({dateLabel})</p>
            <p className="text-5xl font-black text-white">{appointments.length}</p>
          </div>
          <div className="bg-[#1e293b] p-8 rounded-[2rem] border-b-4 border-purple-500 shadow-xl shadow-purple-500/5 transition-transform hover:-translate-y-1">
            <p className="text-slate-500 text-xs mb-2 font-black uppercase tracking-[0.2em]">الزبناء ({dateLabel})</p>
            <p className="text-5xl font-black text-white">{new Set(appointments.map(a => a.client_phone)).size}</p>
          </div>
          <div className="bg-[#1e293b] p-8 rounded-[2rem] border-b-4 border-emerald-500 shadow-xl shadow-emerald-500/5 transition-transform hover:-translate-y-1">
            <p className="text-slate-500 text-xs mb-2 font-black uppercase tracking-[0.2em]">أرباح ({dateLabel})</p>
            <p className="text-5xl font-black text-emerald-400">{dateEarnings} <span className="text-xl">DH</span></p>
          </div>
        </div>

        {/* 📅 Appointments Table */}
        <div className="mb-12 bg-[#1e293b] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-8 bg-slate-800/40 flex flex-wrap justify-between items-center border-b border-slate-800/50 gap-6">
            <div className="flex items-center gap-4">
              <h3 className="font-black text-2xl text-white tracking-tight">جدول المواعيد</h3>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm" 
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              + إضافة موعد جديد
            </button>
          </div>
          
          <div className="overflow-x-auto p-2">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="text-slate-500 text-xs font-black uppercase tracking-widest border-b border-slate-800/50">
                  <th className="p-6">الزبون</th>
                  <th className="p-6 text-center">الخدمة</th>
                  <th className="p-6 text-center">الثمن (DH)</th>
                  <th className="p-6 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-sans">
                {appointments.length > 0 ? appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 group transition-all">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg shadow-inner">👤</div>
                        <div>
                          <p className="text-white font-black flex items-center gap-2">
                            {app.client_name} 
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-lg border border-blue-500/20">
                              {app.appointment_time?.substring(11, 16)}
                            </span>
                          </p>
                          <p className="text-slate-500 text-xs font-medium tracking-tighter">{app.client_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center text-slate-300 font-bold">{app.service_name || '---'}</td>
                    <td className="p-6 text-center">
                      <input 
                        type="number" 
                        value={app.price || ''} 
                        onChange={(e) => updatePrice(app.id, e.target.value)} 
                        className="w-24 bg-[#0f172a] border border-slate-700 rounded-xl py-2 px-3 text-center text-emerald-400 font-black outline-none focus:ring-1 focus:ring-emerald-500 transition-all" 
                      />
                    </td>
                    <td className="p-6">
                       <div className="flex items-center justify-center gap-4">
                        <button onClick={() => { 
                          const phone = app.client_phone?.startsWith('0') ? '212' + app.client_phone.substring(1) : app.client_phone;
                          const time = app.appointment_time?.substring(11, 16);
                          const msg = `سلام *${app.client_name}* 👋 كنفكروك بموعدك فـ صالون ${salon.name} مع *${time}*. مرحبا بك!`;
                          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                        }} className="text-xl grayscale group-hover:grayscale-0 transition-all hover:scale-125" title="واتساب">🔔</button>
                        
                        <button onClick={async () => { if(confirm('تمسح الموعد؟')) { await supabase.from('appointments').delete().eq('id', app.id); setAppointments(prev => prev.filter(a => a.id !== app.id)); } }} className="opacity-0 group-hover:opacity-100 text-red-500 hover:scale-110 transition-all">🗑️</button>
                        
                        <button 
                          onClick={async () => {
                            const newStatus = app.status === 'completed' ? 'pending' : 'completed';
                            await supabase.from('appointments').update({ status: newStatus }).eq('id', app.id);
                            setAppointments(prev => prev.map(a => a.id === app.id ? {...a, status: newStatus} : a));
                          }} 
                          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${app.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}
                        >
                          {app.status === 'completed' ? 'تمت ✓' : 'انتظار'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={4} className="p-24 text-center text-slate-600 font-bold italic tracking-widest">لا توجد مواعيد مبرمجة... ☕</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* ⚙️ Profile and Services Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <h3 className="font-black text-2xl text-white mb-8 flex items-center gap-3">📝 معلومات صالون Catchy</h3>
            <form onSubmit={handleUpdateSalon} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-xs font-black text-slate-500 mb-2 mr-2 uppercase tracking-widest text-right">اسم الصالون</label><input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-xs font-black text-slate-500 mb-2 mr-2 uppercase tracking-widest text-right">المدينة</label><input type="text" value={editCity} onChange={e => setEditCity(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block text-xs font-black text-slate-500 mb-2 mr-2 uppercase tracking-widest text-right">رقم الهاتف</label><input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 hover:scale-[1.01]">
                {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات بنجاح ✅'}
              </button>
            </form>
          </section>

          <section className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <h3 className="font-black text-2xl text-white mb-8 flex items-center gap-3">⚙️ إدارة الخدمات والأسعار</h3>
            <form onSubmit={handleAddService} className="flex gap-3 mb-8">
              <input type="text" placeholder="اسم الخدمة (مثلاً: تحسينة عادية)" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} className="flex-1 bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="number" placeholder="DH" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} className="w-24 bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none text-center focus:ring-2 focus:ring-blue-500" required />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-2xl font-black transition-all shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95">+</button>
            </form>
            <div className="flex flex-wrap gap-3">
              {services.map(s => (
                <div key={s.id} className="bg-[#0f172a] px-5 py-3 rounded-2xl border border-slate-700 text-sm font-bold flex items-center gap-4 transition-all hover:border-blue-500/50">
                  <span className="text-slate-300">{s.name}</span>
                  <span className="text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-lg">{s.price} DH</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 🕒 Modal Adding Appointment */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#1e293b] w-full max-w-md rounded-[3rem] border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden text-right">
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                <h3 className="text-2xl font-black text-white tracking-tight">إضافة موعد يدوي</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white text-4xl transition-colors">×</button>
              </div>
              <form onSubmit={handleAddAppointment} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="space-y-4">
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="اسم الزبون" className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white text-right outline-none focus:ring-2 focus:ring-blue-500" required />
                  <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="رقم الهاتف (06..)" className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white text-right outline-none focus:ring-2 focus:ring-blue-500" />
                  <select value={service} onChange={(e) => setService(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white text-right outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" required>
                    <option value="">-- اختر الخدمة --</option>
                    {services.map(s => <option key={s.id} value={s.name}>{s.name} ({s.price} DH)</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <input type="date" min={today} value={modalDate} onChange={e => setModalDate(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white text-right outline-none focus:ring-2 focus:ring-blue-500" required />
                  {modalDate && (
                    <div className="grid grid-cols-4 gap-2" dir="ltr">
                      {timeSlots.map(slot => {
                        const isBooked = modalBookedTimes.includes(slot)
                        let isPast = false;
                        if (modalDate === today) {
                          const now = new Date();
                          const [slotHour, slotMinute] = slot.split(':').map(Number);
                          if (slotHour < now.getHours() || (slotHour === now.getHours() && slotMinute <= now.getMinutes())) isPast = true;
                        }
                        const disabled = isBooked || isPast;
                        return (
                          <button key={slot} type="button" disabled={disabled} onClick={() => setModalTime(slot)} className={`p-2 rounded-xl text-[10px] font-black transition-all ${disabled ? 'bg-slate-800/50 text-slate-700 line-through' : modalTime === slot ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-[#0f172a] text-slate-400 border border-slate-700 hover:border-blue-500'}`}>{slot}</button>
                        )
                      })}
                    </div>
                  )}
                </div>
                <button type="submit" disabled={!modalTime} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50">تأكيد الحجز الآن ⚡</button>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 bg-[#0f172a] py-8 text-center">
        <p className="text-slate-600 text-xs font-black uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} Catchy . Powered by Samir
        </p>
      </footer>
    </div>
  )
}