import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30" dir="rtl">
      
      {/* 🟢 Navbar (الشريط العلوي) */}
      <nav className="border-b border-slate-800 bg-[#1e293b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">✂️</span>
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
              Catchy
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-bold text-slate-300 hover:text-white transition-colors hidden md:block"
            >
              تسجيل الدخول
            </Link>
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              ابدأ الآن مجاناً
            </Link>
          </div>
        </div>
      </nav>

      {/* 🟢 Hero Section (الواجهة الرئيسية) */}
      <section className="relative px-6 py-20 md:py-32 overflow-hidden flex flex-col items-center text-center">
        {/* ديكورات فالخلفية */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="bg-slate-800/80 border border-slate-700 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-bold mb-6 inline-block shadow-sm">
            🚀 المنصة رقم 1 لحلاقي المغرب
          </span>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            نظّم مواعيد صالونك، <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">وضاعف أرباحك.</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            منصة "أناقة" كتعطيك رابط خاص بيك باش الكليان يحجزو موعدهم فثواني، وكتنظم ليك وقتك وأرباحك بلا صداع الراس، وكولشي من تليفونك.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl text-lg font-black shadow-xl shadow-blue-600/30 transition-all active:scale-95"
            >
              صاوب حساب لصالونك دابا 💈
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-10 py-4 rounded-2xl text-lg font-bold border border-slate-700 transition-all"
            >
              كيفاش كتخدم؟ 👇
            </Link>
          </div>
        </div>
      </section>

      {/* 🟢 Features Section (المميزات) */}
      <section id="features" className="px-6 py-24 bg-[#1e293b]/30 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">علاش تختار منصة Catchy؟</h3>
            <p className="text-slate-400">صممناها خصيصاً باش نسهلو الخدمة على الحلاق ونريحو الكليان.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* ميزة 1 */}
            <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-800 shadow-xl hover:-translate-y-2 transition-transform">
              <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-blue-500/30">
                📱
              </div>
              <h4 className="text-xl font-black text-white mb-3">حجز ذكي 24/7</h4>
              <p className="text-slate-400 leading-relaxed">
                الكليان ديالك يقدرو يشوفو الأوقات الخاوية ويحجزو موعدهم فـ أي وقت بلا ما يصونيو عليك ويبرزطوك فالخدمة.
              </p>
            </div>

            {/* ميزة 2 */}
            <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-800 shadow-xl hover:-translate-y-2 transition-transform">
              <div className="bg-emerald-500/20 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-emerald-500/30">
                🔔
              </div>
              <h4 className="text-xl font-black text-white mb-3">تذكير عبر WhatsApp</h4>
              <p className="text-slate-400 leading-relaxed">
                بضغطة زر وحدة تقدر تصيفط ميساج للكليان فـ الواتساب تفكرو بالموعد ديالو باش مايضيعش ليك الوقت.
              </p>
            </div>

            {/* ميزة 3 */}
            <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-800 shadow-xl hover:-translate-y-2 transition-transform">
              <div className="bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-purple-500/30">
                💰
              </div>
              <h4 className="text-xl font-black text-white mb-3">تتبع الأرباح بدقة</h4>
              <p className="text-slate-400 leading-relaxed">
                لوحة تحكم (Dashboard) واعرة كتحسب ليك شحال دخلتي د الفلوس فاليوم وعدد الكليان اللي دازو عندك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🟢 How it works (كيفاش كتخدم) */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-16">طريقة الخدمة ساهلة بزاف!</h3>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 relative">
            <div className="bg-[#1e293b] w-full p-8 rounded-[2rem] border border-slate-800 shadow-lg relative z-10">
              <span className="absolute -top-5 -right-5 bg-blue-600 text-white w-12 h-12 flex items-center justify-center rounded-full text-xl font-black shadow-lg shadow-blue-500/30">1</span>
              <h4 className="text-lg font-black text-white mb-2">تسجل فـ المنصة</h4>
              <p className="text-slate-400 text-sm">دخل سميتك، نمرتك، والخدمات اللي كدير (مثلا: حسانة عادية 20 درهم).</p>
            </div>
            
            <div className="text-slate-600 text-3xl hidden md:block rotate-180">➔</div>
            
            <div className="bg-[#1e293b] w-full p-8 rounded-[2rem] border border-slate-800 shadow-lg relative z-10">
              <span className="absolute -top-5 -right-5 bg-blue-600 text-white w-12 h-12 flex items-center justify-center rounded-full text-xl font-black shadow-lg shadow-blue-500/30">2</span>
              <h4 className="text-lg font-black text-white mb-2">شارك الرابط</h4>
              <p className="text-slate-400 text-sm">كوبي الرابط ديالك وحطو فـ الانستغرام أو صيفطو للكليان فـ الواتساب.</p>
            </div>

            <div className="text-slate-600 text-3xl hidden md:block rotate-180">➔</div>

            <div className="bg-[#1e293b] w-full p-8 rounded-[2rem] border border-emerald-500/30 shadow-lg relative z-10">
              <span className="absolute -top-5 -right-5 bg-emerald-500 text-white w-12 h-12 flex items-center justify-center rounded-full text-xl font-black shadow-lg shadow-emerald-500/30">3</span>
              <h4 className="text-lg font-black text-white mb-2">استقبل المواعيد</h4>
              <p className="text-slate-400 text-sm">المواعيد غايبداو يبانو عندك فـ الداشبورد أوطوماتيكيا فالبلاصة.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🟢 Footer */}
      <footer className="border-t border-slate-800 bg-[#0f172a] py-8 text-center">
        <p className="text-slate-500 text-sm font-bold">
          © {new Date().getFullYear()} Catchy. صُنع بكل ❤️ لتطوير الحلاقة فالمغرب.
        </p>
      </footer>

    </div>
  )
}