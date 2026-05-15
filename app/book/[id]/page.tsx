'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Image from 'next/image'

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

  // 🎉 واجهة النجاح بعد الحجز
  if (booked) {
    const formattedPhone = salon?.phone?.startsWith('0') 
      ? '212' + salon.phone.substring(1) 
      : salon?.phone;

    const whatsappMessage = `سلام عليكم، أنا *${name}* 👋\nحجزت موعد في صالونكم عبر منصة Catchy.\n\n✂️ الخدمة: *${selectedService?.name}*\n📅 التاريخ: *${date}*\n⏰ الوقت: *${time}*\n\nشكراً!`;
    const whatsappLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="bg-[#1e293b]/90 backdrop-blur-md p-10 rounded-[3rem] border border-emerald-500/20 shadow-2xl w-full max-w-md relative z-10" dir="rtl">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-500 text-white p-5 rounded-2xl shadow-lg shadow-emerald-500/30 animate-bounce text-3xl">
              ✓
            </div>
          </div>
          <h2 className="text-3xl font-black mb-4 text-white tracking-tight">تم الحجز بنجاح!</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            شكراً لك، موعدك مسجل دابا عند صالون <span className="text-blue-400 font-bold">{salon?.name}</span>.
          </p>
          
          <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20b958] text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(37,211,102,0.3)] transition-all hover:scale-[1.02] active:scale-95 mb-6 text-lg"
          >
            📱 أكد الموعد فـ WhatsApp
          </a>

          <button 
            onClick={() => {setBooked(false); setDate(''); setTime(''); setName(''); setPhone('');}} 
            className="text-slate-500 hover:text-slate-300 transition-colors underline decoration-dotted underline-offset-4 text-sm font-bold"
          >
            حجز موعد آخر
          </button>
        </div>
      </div>
    )
  }

  // 📝 واجهة الفورم الأساسية للحجز
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden" dir="rtl">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#1e293b]/90 backdrop-blur-md rounded-[3rem] p-8 border border-slate-800 shadow-2xl overflow-hidden relative z-10">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
        
        <header className="text-center mb-8 flex flex-col items-center">
          <span className="text-xs font-black tracking-[0.2em] uppercase text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mb-3">حجز موعد أونلاين</span>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">{salon?.name}</h1>
          <p className="text-slate-400 text-xs font-medium">📍 {salon?.city} | 📞 {salon?.phone}</p>
        </header>

        <form onSubmit={handleBook} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 mr-1">اسمك الكامل</label>
              <input dir="rtl" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="اكتب سميتك هنا..." className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none text-right focus:ring-2 focus:ring-blue-500 shadow-inner font-medium transition-all" required />
            </div>
            
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 mr-1">رقم الهاتف</label>
              <input dir="ltr" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="06..." className="w-full bg-[#0f172a] border border-slate-700 text-white p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left shadow-inner font-mono tracking-wider transition-all" required />
            </div>
            
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 mr-1">اختر الخدمة المطلوبة</label>
              <div className="relative">
                <select 
                  dir="rtl"
                  required 
                  onChange={(e) => { 
                    const s = services.find((srv: any) => srv.name === e.target.value); 
                    setSelectedService(s || null);
                  }}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none text-right focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none font-medium"
                >
                  <option value="">-- اضغط هنا لاختيار الخدمة --</option>
                  {services.map(s => <option key={s.id} value={s.name}>{s.name} ({s.price} DH)</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">▼</div>
              </div>
            </div>
          </div>

          <hr className="border-slate-800/80" />

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 mr-1 uppercase tracking-widest">اختر تاريخ الموعد</label>
              <input 
                dir="ltr"
                type="date" 
                value={date} 
                min={today} 
                onChange={e => setDate(e.target.value)} 
                className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl p-4 text-white outline-none text-center focus:ring-2 focus:ring-blue-500 cursor-pointer font-bold" 
                required 
              />
            </div>

            {date && (
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 mr-1 uppercase tracking-widest text-right">التوقيت المتاح</label>
                
                {loadingTimes ? (
                  <div className="flex items-center justify-center p-6 bg-slate-800/20 rounded-2xl border border-slate-800">
                    <p className="text-xs font-bold text-slate-400 animate-pulse">⏳ جاري جلب الأوقات الخاوية...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2" dir="ltr">
                    {timeSlots.map(slot => {
                      const isBooked = bookedTimes.includes(slot)
                      let isPast = false;
                      if (date === today) {
                        const now = new Date();
                        const [slotHour, slotMinute] = slot.split(':').map(Number);
                        if (slotHour < now.getHours() || (slotHour === now.getHours() && slotMinute <= now.getMinutes())) {
                          isPast = true;
                        }
                      }
                      const isDisabled = isBooked || isPast

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setTime(slot)}
                          className={`p-2.5 rounded-xl text-xs font-black transition-all ${
                            isDisabled 
                              ? 'bg-slate-800/40 text-slate-700 cursor-not-allowed line-through border border-transparent' 
                              : time === slot 
                                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105 border border-blue-500' 
                                : 'bg-[#0f172a] text-slate-300 hover:bg-slate-800 border border-slate-700'
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

          <button 
            type="submit" 
            disabled={loading || !time} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 mt-6 text-center text-lg"
          >
            {loading ? 'جاري تسجيل حجزك...' : 'تأكيد الحجز الآن ✅'}
          </button>
        </form>
      </div>
    </div>
  )
}