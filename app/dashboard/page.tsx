'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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
      alert("✅ تم الحفظ فـ الداتابيز بنجاح!")
    } else {
      alert("❌ فشل الحفظ: " + error.message)
    }
    setIsSaving(false)
  }

  // 🚀 هادي هي الدالة اللي تبدلات باش تعرفك بلي نتا هو المدير
  const fetchInitialData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) { 
      router.push('/login'); 
      return; 
    }

    // 🚀 الشرط السحري: إيلا كان هادا هو الإيميل ديال المدير، صيفطو ديريكت لـ admin
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

  // 🔒 الشاشة ديال الحظر للحلاقة العاديين
  if (salon && salon.is_approved === false) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex items-center justify-center p-6" dir="rtl">
        <div className="bg-[#1e293b] max-w-md w-full p-10 rounded-[2.5rem] border border-yellow-500/30 shadow-2xl text-center">
          <div className="text-6xl mb-6 animate-pulse">⏳</div>
          <h2 className="text-2xl font-black text-white mb-4">حسابك قيد المراجعة</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            مرحباً بك في منصة <strong>Catchy</strong>! لقد تم تسجيل صالونك بنجاح، ولكن الحساب يحتاج إلى تفعيل من طرف الإدارة قبل أن تتمكن من استخدامه.
          </p>
          <div className="bg-[#0f172a] rounded-2xl p-4 border border-slate-700 mb-8">
            <p className="text-xs text-slate-500">للتسريع بعملية التفعيل، يرجى التواصل معنا عبر الواتساب.</p>
          </div>
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

  // واجهة الداشبورد العادية
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans" dir="rtl">
      <nav className="border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent uppercase tracking-tight">{salon?.name}</h1>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-sm font-bold bg-slate-800 hover:bg-red-500/20 hover:text-red-400 px-4 py-2 rounded-xl transition-all border border-slate-700">خروج</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="text-right">
            <h2 className="text-4xl font-black text-white mb-2">لوحة التحكم 👋</h2>
            <div className="flex items-center gap-3 text-slate-400 font-medium">
               <span className="bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700 text-sm">📍 {salon?.city}</span>
               <span className="bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700 text-sm">📞 {salon?.phone}</span>
            </div>
          </div>
          <button onClick={() => { const bookingUrl = `${window.location.origin}/book/${salon.id}`; navigator.clipboard.writeText(bookingUrl); alert("✅ تم نسخ رابط الحجز!"); }} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-2xl font-bold transition-all border border-slate-700 flex items-center gap-3 shadow-xl">🔗 نسخ رابط الحجز</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#1e293b] p-8 rounded-3xl border-r-4 border-blue-500 shadow-xl relative overflow-hidden"><p className="text-slate-400 text-xs mb-1 font-bold uppercase tracking-wider">مواعيد ({dateLabel})</p><p className="text-4xl font-black text-white">{appointments.length}</p></div>
          <div className="bg-[#1e293b] p-8 rounded-3xl border-r-4 border-purple-500 shadow-xl relative overflow-hidden"><p className="text-slate-400 text-xs mb-1 font-bold uppercase tracking-wider">الزبناء ({dateLabel})</p><p className="text-4xl font-black text-white">{new Set(appointments.map(a => a.client_phone)).size}</p></div>
          <div className="bg-[#1e293b] p-8 rounded-3xl border-r-4 border-emerald-500 shadow-xl relative overflow-hidden"><p className="text-slate-400 text-xs mb-1 font-bold uppercase tracking-wider">أرباح ({dateLabel})</p><p className="text-4xl font-black text-emerald-400">{dateEarnings} <span className="text-sm font-medium">DH</span></p></div>
        </div>

        <div className="mb-10 bg-[#1e293b] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-6 bg-slate-800/30 flex flex-wrap justify-between items-center border-b border-slate-800/50 gap-4">
            <div className="flex items-center gap-4">
              <h3 className="font-bold text-xl text-white">جدول المواعيد</h3>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-[#0f172a] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:ring-1 focus:ring-blue-500 text-sm font-bold shadow-inner" />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl text-sm font-bold shadow-lg transition-all">+ إضافة موعد</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead><tr className="bg-slate-800/20 text-slate-400 text-sm font-bold"><th className="p-4 tracking-wider">الزبون</th><th className="p-4 text-center tracking-wider">الخدمة</th><th className="p-4 text-center tracking-wider">الثمن (DH)</th><th className="p-4 text-center tracking-wider">الحالة</th></tr></thead>
              <tbody className="divide-y divide-slate-800">
                {appointments.length > 0 ? appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/5 group transition-colors">
                    <td className="p-4">
                      <p className="text-white font-bold flex items-center gap-2">{app.client_name} <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">{app.appointment_time?.substring(11, 16)}</span></p>
                      <p className="text-slate-500 text-xs font-mono">{app.client_phone}</p>
                    </td>
                    <td className="p-4 text-center text-slate-300 font-medium">{app.service_name || '---'}</td>
                    <td className="p-4 flex justify-center"><input type="number" value={app.price || ''} onChange={(e) => updatePrice(app.id, e.target.value)} placeholder="0" className="w-20 bg-[#0f172a] border border-slate-700 rounded-xl p-2 text-center text-emerald-400 font-bold outline-none" /></td>
                    <td className="p-4 text-center">
                       <div className="flex items-center justify-center gap-3">
                        <button onClick={() => { const phone = app.client_phone?.startsWith('0') ? '212' + app.client_phone.substring(1) : app.client_phone; const timeOnly = app.appointment_time ? app.appointment_time.substring(11, 16) : ''; const msg = `سلام *${app.client_name}* 👋%0Aكنفكروك بلي موعد الحلاقة ديالك قرب (مع *${timeOnly}*).%0Aمرحبا بك فـ صالون ${salon.name}!`; window.open(`https://wa.me/${phone}?text=${msg}`, '_blank'); }} className="text-green-500/50 hover:text-green-500 transition-all opacity-0 group-hover:opacity-100 text-lg" title="تذكير الكليان فـ WhatsApp">🔔</button>
                        <button onClick={async () => { if(confirm('تمسح الموعد؟')) { await supabase.from('appointments').delete().eq('id', app.id); setAppointments(prev => prev.filter(a => a.id !== app.id)); } }} className="text-red-500/50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">🗑️</button>
                        <button onClick={async () => { const newStatus = app.status === 'completed' ? 'pending' : 'completed'; await supabase.from('appointments').update({ status: newStatus }).eq('id', app.id); setAppointments(prev => prev.map(a => a.id === app.id ? {...a, status: newStatus} : a)); }} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${app.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>{app.status === 'completed' ? 'تمت الحلاقة ✓' : 'قيد الانتظار'}</button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={4} className="p-20 text-center text-slate-600 font-medium italic">لا توجد مواعيد مبرمجة في هذا اليوم...</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <section className="mb-10 bg-[#1e293b] p-6 rounded-[2rem] border border-slate-800 shadow-lg">
          <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2">📝 تعديل معلومات الصالون</h3>
          <form onSubmit={handleUpdateSalon} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs font-black text-slate-500 mb-2 mr-2">اسم الصالون</label><input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-1 focus:ring-blue-500" /></div>
            <div><label className="block text-xs font-black text-slate-500 mb-2 mr-2">المدينة</label><input type="text" value={editCity} onChange={e => setEditCity(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-1 focus:ring-blue-500" /></div>
            <div><label className="block text-xs font-black text-slate-500 mb-2 mr-2">رقم الهاتف</label><input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-1 focus:ring-blue-500" /></div>
            <div className="md:col-span-3 flex justify-end"><button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50">{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</button></div>
          </form>
        </section>

        <section className="mb-10 bg-[#1e293b] p-6 rounded-[2rem] border border-slate-800 shadow-lg">
          <h3 className="font-bold text-xl text-white mb-4">⚙️ إدارة قائمة الخدمات</h3>
          <form onSubmit={handleAddService} className="flex flex-wrap gap-4 mb-6">
            <input type="text" placeholder="اسم الخدمة" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} className="flex-1 min-w-[200px] bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-white outline-none" required />
            <input type="number" placeholder="الثمن" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} className="w-32 bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-white outline-none" required />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all">إضافة</button>
          </form>
          <div className="flex flex-wrap gap-2">
            {services.map(s => (
              <div key={s.id} className="bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 text-sm font-medium flex gap-3">
                <span className="text-slate-200">{s.name}</span>
                <span className="text-emerald-400 font-bold pr-3 border-r border-slate-700">{s.price} DH</span>
              </div>
            ))}
          </div>
        </section>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#1e293b] w-full max-w-md rounded-[2rem] border border-slate-700 shadow-2xl overflow-hidden text-right">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
                <h3 className="text-xl font-black text-white">تسجيل موعد يدوي</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white text-3xl">×</button>
              </div>
              <form onSubmit={handleAddAppointment} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold text-slate-400 mb-2">اسم الزبون</label><input dir="ltr" type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nom du client..." className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none text-left focus:ring-2 focus:ring-blue-500" required /></div>
                  <div><label className="block text-xs font-bold text-slate-400 mb-2">رقم الهاتف</label><input dir="ltr" type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="06..." className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none text-left focus:ring-2 focus:ring-blue-500" /></div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">الخدمة</label>
                    <select dir="ltr" value={service} onChange={(e) => setService(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none text-left focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer" required>
                      <option value="">-- Sélectionner le service --</option>
                      {services.map(s => <option key={s.id} value={s.name}>{s.name} ({s.price} DH)</option>)}
                    </select>
                  </div>
                </div>
                <hr className="border-slate-800" />
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold text-slate-400 mb-2">تاريخ الموعد</label><input dir="ltr" type="date" min={today} value={modalDate} onChange={e => setModalDate(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none text-left focus:ring-2 focus:ring-blue-500 cursor-pointer" required /></div>
                  {modalDate && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-3">التوقيت المتاح</label>
                      {loadingModalTimes ? (
                        <div className="flex items-center justify-center p-4 bg-slate-800/20 rounded-2xl border border-slate-800"><p className="text-xs font-bold text-slate-400 animate-pulse">⏳ جاري جلب الأوقات...</p></div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2" dir="ltr">
                          {timeSlots.map(slot => {
                            const isBooked = modalBookedTimes.includes(slot)
                            let isPast = false;
                            if (modalDate === today) {
                              const now = new Date(); const currentHour = now.getHours(); const currentMinute = now.getMinutes();
                              const [slotHour, slotMinute] = slot.split(':').map(Number);
                              if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) isPast = true;
                            }
                            const isDisabled = isBooked || isPast
                            return (
                              <button key={slot} type="button" disabled={isDisabled} onClick={() => setModalTime(slot)} className={`p-2 rounded-xl text-xs font-bold transition-all ${isDisabled ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed line-through' : modalTime === slot ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'bg-[#0f172a] text-slate-300 hover:bg-slate-700 border border-slate-700'}`}>{slot}</button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button type="submit" disabled={!modalTime} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl mt-4 active:scale-95 disabled:opacity-50">تأكيد الموعد ✅</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}