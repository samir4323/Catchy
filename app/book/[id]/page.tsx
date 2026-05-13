'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function BookingPage() {
  const { id: salonId } = useParams()
  const [salon, setSalon] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('') 
  const [time, setTime] = useState('') 
  
  const [selectedService, setSelectedService] = useState<any>(null)
  const [bookedTimes, setBookedTimes] = useState<string[]>([]) 
  
  const [loadingTimes, setLoadingTimes] = useState(false) 
  const [loading, setLoading] = useState(false) 
  const [booked, setBooked] = useState(false) 

  // 🌟 دالة باش نجيبو تاريخ اليوم مضبوط 100% بلا مشاكل ديال Timezone
  const getLocalToday = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const today = getLocalToday()

  useEffect(() => {
    const fetchSalonData = async () => {
      const { data: salonData } = await supabase.from('salons').select('*').eq('id', salonId).single()
      setSalon(salonData)

      const { data: servicesData } = await supabase.from('services').select('*').eq('salon_id', salonId)
      setServices(servicesData || [])
    }
    fetchSalonData()
  }, [salonId])

  useEffect(() => {
    if (!date) return

    const fetchBookedTimes = async () => {
      setLoadingTimes(true) 
      
      const { data } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('salon_id', salonId)
        .gte('appointment_time', `${date}T00:00:00`)
        .lte('appointment_time', `${date}T23:59:59`)

      if (data) {
        // 🌟 استخراج الوقت بشكل ذكي ومضمون وخا يتبدل الفورما ديال الداتابيز
        const times = data.map(app => {
          const match = app.appointment_time?.match(/\d{2}:\d{2}/)
          return match ? match[0] : ''
        }).filter(Boolean)
        
        setBookedTimes(times)
      }
      
      setLoadingTimes(false) 
    }
    
    fetchBookedTimes()
    setTime('') 
  }, [date, salonId])

  const generateTimeSlots = () => {
    const slots = []
    for (let i = 10; i <= 21; i++) {
      slots.push(`${i < 10 ? '0'+i : i}:00`)
      slots.push(`${i < 10 ? '0'+i : i}:30`)
    }
    return slots
  }
  const timeSlots = generateTimeSlots()

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!selectedService) { alert("عفاك اختار الخدمة"); return; }
    if(!time) { alert("عفاك اختار التوقيت المناسب"); return; }
    
    setLoading(true)

    // 🌟 زدنا الثواني باش نضمنو يتسجل مزيان
    const fullDateTime = `${date}T${time}:00`

    const { error } = await supabase.from('appointments').insert([
      {
        salon_id: salonId,
        client_name: name,
        client_phone: phone,
        appointment_time: fullDateTime,
        service_name: selectedService.name,
        price: selectedService.price,
        status: 'pending'
      }
    ])

    if (!error) { setBooked(true) } 
    else { alert('❌ خطأ في الحجز: ' + error.message) }
    setLoading(false)
  }

  if (booked) {
    const formattedPhone = salon?.phone?.startsWith('0') 
      ? '212' + salon.phone.substring(1) 
      : salon?.phone;

    const whatsappMessage = `السلام عليكم، أنا *${name}* 👋%0Aحجزت موعد عندكم في الصالون.%0A✂️ الخدمة: *${selectedService?.name}*%0A📅 التاريخ: *${date}*%0A⏰ الوقت: *${time}*%0Aشكراً!`;
    const whatsappLink = `https://wa.me/${formattedPhone}?text=${whatsappMessage}`;

    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-[#1e293b] p-10 rounded-[3rem] border border-emerald-500/30 shadow-2xl w-full max-w-md" dir="rtl">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20 animate-bounce">
              <span className="text-4xl">✅</span>
            </div>
          </div>
          <h2 className="text-3xl font-black mb-4 text-white">تم الحجز بنجاح!</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            شكراً لك، موعدك مسجل عند <span className="text-blue-400 font-bold">{salon?.name}</span>.
          </p>
          
          <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20b958] text-white font-black py-4 rounded-2xl shadow-lg shadow-[#25D366]/20 transition-all active:scale-95 mb-4"
          >
            <span className="text-2xl">📱</span>
            تأكيد عبر الواتساب
          </a>

          <button 
            onClick={() => {setBooked(false); setDate(''); setTime(''); setName(''); setPhone('');}} 
            className="text-slate-500 hover:text-white transition-colors underline decoration-dotted underline-offset-4 text-sm font-bold"
          >
            حجز موعد آخر
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6 font-sans" dir="rtl">
      <div className="w-full max-w-md bg-[#1e293b] rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
        
        <header className="text-center mb-8">
          <h1 className="text-2xl font-black text-blue-400 mb-1 uppercase tracking-wider">{salon?.name}</h1>
          <p className="text-slate-500 text-xs italic">📍 {salon?.city} | 📞 {salon?.phone}</p>
        </header>

        <form onSubmit={handleBook} className="space-y-6">
          <div className="space-y-4">
            {/* 🌟 الخانات دابا كلهم dir="ltr" و text-left */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">اسمك الكامل</label>
              <input dir="ltr" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom complet..." className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none text-left focus:ring-2 focus:ring-blue-500 transition-all" required />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">رقم الهاتف</label>
              <input dir="ltr" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="06..." className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none text-left focus:ring-2 focus:ring-blue-500 transition-all" required />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">الخدمة</label>
              <select 
                dir="ltr"
                required 
                onChange={(e) => { 
                  const s = services.find(srv => s.name === e.target.value); 
                  setSelectedService(s) 
                }} 
                className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none text-left focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
              >
                <option value="">-- Sélectionner le service --</option>
                {services.map(s => <option key={s.id} value={s.name}>{s.name} ({s.price} DH)</option>)}
              </select>
            </div>
          </div>

          <hr className="border-slate-800" />

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">تاريخ الموعد</label>
              <input 
                dir="ltr"
                type="date" 
                value={date} 
                min={today} 
                onChange={e => setDate(e.target.value)} 
                className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none text-left focus:ring-2 focus:ring-blue-500 cursor-pointer" 
                required 
              />
            </div>

            {date && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">التوقيت المتاح</label>
                
                {loadingTimes ? (
                  <div className="flex items-center justify-center p-6 bg-slate-800/20 rounded-2xl border border-slate-800">
                    <p className="text-sm font-bold text-slate-400 animate-pulse">⏳ جاري جلب الأوقات المتاحة...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2" dir="ltr">
                    {timeSlots.map(slot => {
                      // 1. واش محجوز؟
                      const isBooked = bookedTimes.includes(slot)
                      
                      // 2. واش داز؟
                      let isPast = false;
                      if (date === today) {
                        const now = new Date();
                        const currentHour = now.getHours();
                        const currentMinute = now.getMinutes();
                        const [slotHour, slotMinute] = slot.split(':').map(Number);
                        
                        if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
                          isPast = true;
                        }
                      }

                      // البوطونة غاتحبس إيلا كان الوقت محجوز أو داز
                      const isDisabled = isBooked || isPast

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setTime(slot)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all ${
                            isDisabled 
                              ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed line-through' 
                              : time === slot 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                                : 'bg-[#0f172a] text-slate-300 hover:bg-slate-700 border border-slate-700'
                          }`}
                        >
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading || !time} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 mt-4">
            {loading ? 'جاري تأكيد الموعد...' : 'تأكيد الحجز الآن ✅'}
          </button>
        </form>
      </div>
    </div>
  )
}