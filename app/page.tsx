'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30" dir="rtl">
      
      {/* 🟢 Navbar - Glassmorphism */}
      <nav className="border-b border-slate-800 bg-[#1e293b]/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center hover:opacity-80 transition-all cursor-pointer">
            <Image 
              src="/logo.png" 
              alt="Catchy Logo" 
              width={160} 
              height={55} 
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-black text-slate-400 hover:text-white transition-colors hidden md:block uppercase tracking-wider"
            >
              تسجيل الدخول
            </Link>
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-2xl text-sm font-black shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              ابدأ الآن مجاناً
            </Link>
          </div>
        </div>
      </nav>

      {/* 🟢 Hero Section */}
      <section className="relative px-6 py-20 md:py-32 overflow-hidden flex flex-col items-center text-center">
        {/* ديكورات فالخلفية - Blue Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-5 py-2 rounded-full text-xs font-black mb-8 inline-block shadow-sm tracking-widest uppercase">
            🚀 المنصة رقم 1 لحلاقي المغرب
          </span>
          <h2 className="text-5xl md:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tighter">
            نظّم مواعيد صالونك، <br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">وضاعف أرباحك.</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            منصة <span className="text-blue-400 font-bold">Catchy</span> كتعطيك رابط خاص بيك باش الكليان يحجزو موعدهم فثواني، وكتنظم ليك وقتك وأرباحك بلا صداع الراس.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link 
              href="/login" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[2rem] text-xl font-black shadow-[0_10px_40px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              صاوب حساب لصالونك دابا 💈
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto bg-slate-800/50 hover:bg-slate-800 text-white px-10 py-5 rounded-[2rem] text-lg font-bold border border-slate-700 transition-all hover:border-slate-500"
            >
              كيفاش كتخدم؟ 👇
            </Link>
          </div>
        </div>
      </section>

      {/* 🟢 Features Section */}
      <section id="features" className="px-6 py-24 bg-[#1e293b]/20 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-3xl md:text-5xl font-black text-white mb-6">علاش تختار منصة Catchy؟</h3>
            <p className="text-slate-400 text-lg">صممناها خصيصاً باش نسهلو الخدمة على الحلاق ونريحو الكليان.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* ميزة 1 */}
            <div className="bg-[#1e293b]/40 p-10 rounded-[3rem] border border-slate-800 shadow-xl hover:border-blue-500/30 transition-all group">
              <div className="bg-blue-600/10 w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-8 border border-blue-600/20 group-hover:scale-110 transition-transform">
                📱
              </div>
              <h4 className="text-2xl font-black text-white mb-4">حجز ذكي 24/7</h4>
              <p className="text-slate-400 leading-relaxed font-medium">
                الكليان ديالك يقدرو يشوفو الأوقات الخاوية ويحجزو موعدهم فـ أي وقت بلا ما يبرزطوك فالخدمة.
              </p>
            </div>

            {/* ميزة 2 */}
            <div className="bg-[#1e293b]/40 p-10 rounded-[3rem] border border-slate-800 shadow-xl hover:border-emerald-500/30 transition-all group">
              <div className="bg-emerald-600/10 w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-8 border border-emerald-600/20 group-hover:scale-110 transition-transform">
                🔔
              </div>
              <h4 className="text-2xl font-black text-white mb-4">تذكير WhatsApp</h4>
              <p className="text-slate-400 leading-relaxed font-medium">
                بضغطة زر وحدة صيفط ميساج للكليان فـ الواتساب تفكرو بالموعد ديالو باش مايضيعش ليك الوقت.
              </p>
            </div>

            {/* ميزة 3 */}
            <div className="bg-[#1e293b]/40 p-10 rounded-[3rem] border border-slate-800 shadow-xl hover:border-purple-500/30 transition-all group">
              <div className="bg-purple-600/10 w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-8 border border-purple-600/20 group-hover:scale-110 transition-transform">
                💰
              </div>
              <h4 className="text-2xl font-black text-white mb-4">تتبع الأرباح</h4>
              <p className="text-slate-400 leading-relaxed font-medium">
                لوحة تحكم احترافية كتحسب ليك شحال دخلتي د الفلوس فاليوم وعدد الكليان اللي دازو عندك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🟢 How it works */}
      <section className="px-6 py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-20 tracking-tighter">طريقة الخدمة ساهلة بزاف!</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white w-16 h-16 flex items-center justify-center rounded-[1.5rem] text-2xl font-black shadow-lg shadow-blue-600/40 mb-6">1</div>
              <h4 className="text-xl font-black text-white mb-3">تسجل فـ المنصة</h4>
              <p className="text-slate-500 font-medium">دخل معلومات صالونك والخدمات اللي كتقدمها.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white w-16 h-16 flex items-center justify-center rounded-[1.5rem] text-2xl font-black shadow-lg shadow-blue-600/40 mb-6">2</div>
              <h4 className="text-xl font-black text-white mb-3">شارك الرابط</h4>
              <p className="text-slate-500 font-medium">حط رابط الحجز فـ الانستغرام أو صيفطو فـ الواتساب.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-emerald-500 text-white w-16 h-16 flex items-center justify-center rounded-[1.5rem] text-2xl font-black shadow-lg shadow-emerald-500/40 mb-6">3</div>
              <h4 className="text-xl font-black text-white mb-3">استقبل المواعيد</h4>
              <p className="text-slate-500 font-medium">غاتبدا توصل بالمواعيد وتشوفها فـ الداشبورد ديالك.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🟢 Footer */}
      <footer className="border-t border-slate-800 bg-[#0f172a] py-12 text-center">
        <Image 
          src="/logo.png" 
          alt="Catchy Logo" 
          width={120} 
          height={40} 
          className="object-contain mx-auto mb-6 opacity-50 grayscale hover:grayscale-0 transition-all"
        />
        <p className="text-slate-600 text-sm font-black tracking-widest uppercase">
          © {new Date().getFullYear()} Catchy . صُنع بكل ❤️ لتطوير الحلاقة فالمغرب.
        </p>
      </footer>

    </div>
  )
}