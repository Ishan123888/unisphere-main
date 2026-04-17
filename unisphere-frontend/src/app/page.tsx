'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

const STATS = [
  { value: '2,400+', label: 'SLIIT Students', icon: '👨‍🎓' },
  { value: '180+', label: 'Expert Tutors', icon: '👨‍🏫' },
  { value: '8,500+', label: 'Sessions Done', icon: '📚' },
  { value: '4.9★', label: 'Avg Rating', icon: '⭐' },
];

const FEATURES = [
  { icon: '🎓', title: 'Smart Tutor Booking', desc: 'AI-powered matching connects you with the perfect SLIIT tutor in seconds. Filter by subject, rating, price and availability.', gradient: 'from-violet-600 to-indigo-600', link: '/login', tag: 'Most Popular' },
  { icon: '🛒', title: 'Student Marketplace', desc: 'Buy and sell textbooks, equipment and digital resources within the SLIIT community. Safe, verified, instant.', gradient: 'from-orange-500 to-rose-600', link: '/marketplace', tag: 'New' },
  { icon: '🏠', title: 'Study Lobby', desc: 'Create or join virtual study rooms with real-time collaboration tools and shared whiteboards.', gradient: 'from-teal-500 to-emerald-600', link: '/study-lobby', tag: 'Beta' },
];

const TUTORS = [
  { name: 'Amal Perera', subject: 'Data Structures & Algorithms', rating: 4.9, sessions: 312, avatar: 'AP', price: 1500, g: 'from-violet-500 to-indigo-600' },
  { name: 'Tharaka Silva', subject: 'Web Technologies', rating: 4.9, sessions: 487, avatar: 'TS', price: 2000, g: 'from-teal-500 to-emerald-600' },
  { name: 'Dilki Jayawardena', subject: 'Database Management Systems', rating: 4.8, sessions: 215, avatar: 'DJ', price: 1200, g: 'from-pink-500 to-rose-600' },
];

const TICKER_ITEMS = [
  { icon: '🎓', text: 'DSA Session Booked', sub: 'Amal Perera · Rs. 1,500' },
  { icon: '⭐', text: 'New 5-Star Review', sub: 'Tharaka Silva · Web Tech' },
  { icon: '🛒', text: 'Textbook Sold', sub: 'Data Structures 4th Ed.' },
  { icon: '🏠', text: 'Study Room Created', sub: 'IT3040 Group — 6 joined' },
  { icon: '✅', text: 'Booking Confirmed', sub: 'Dilki Jayawardena · DBMS' },
  { icon: '📊', text: 'Analytics Updated', sub: 'Tutor earnings +22%' },
  { icon: '🎓', text: 'New Tutor Joined', sub: 'Chamara B. · Machine Learning' },
  { icon: '💳', text: 'Payment Received', sub: 'Rs. 4,200 · Web Tech session' },
];

const HERO_SLIDES = [
  {
    img: 'https://i.imgur.com/IxDDaFB.png',
    title: 'Smart Tutor Booking',
    sub: 'Find your perfect SLIIT tutor in seconds',
    tag: 'Most Popular',
    color: 'from-violet-900/70 via-violet-900/40 to-transparent',
  },
  {
    img: 'https://i.imgur.com/Jl6f6AK.png',
    title: 'Student Marketplace',
    sub: 'Buy, sell and trade within the SLIIT community',
    tag: 'New',
    color: 'from-teal-900/70 via-teal-900/40 to-transparent',
  },
  {
    img: 'https://i.imgur.com/bacrOw1.png',
    title: 'Study Lobby',
    sub: 'Collaborate with batchmates in real-time',
    tag: 'Beta',
    color: 'from-pink-900/70 via-pink-900/40 to-transparent',
  },
];

export default function HomePage() {
  const router   = useRouter();
  const pathname = usePathname();
  const [dark, setDark]           = useState(true);
  const [time, setTime]           = useState('--:--:-- --');
  const [date, setDate]           = useState('');
  const [day, setDay]             = useState('');
  const [slide, setSlide]         = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [mouseX, setMouseX]       = useState(0);
  const [mouseY, setMouseY]       = useState(0);
  const [scrolled, setScrolled]   = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
      setDay(now.toLocaleDateString('en-US', { weekday: 'long' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setPrevSlide(slide);
        setSlide(s => (s + 1) % HERO_SLIDES.length);
        setAnimating(false);
      }, 600);
    }, 4500);
    return () => clearInterval(id);
  }, [slide]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      setMouseX(((e.clientX - left) / width - 0.5) * 40);
      setMouseY(((e.clientY - top) / height - 0.5) * 40);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const goToSlide = (i: number) => {
    if (i === slide) return;
    setAnimating(true);
    setTimeout(() => {
      setPrevSlide(slide);
      setSlide(i);
      setAnimating(false);
    }, 400);
  };

  const d = dark;
  const isHome = pathname === '/';

  const tk = {
    page: d ? 'bg-[#05050f]' : 'bg-slate-50',
    text: d ? 'text-white' : 'text-slate-900',
    sub: d ? 'text-slate-400' : 'text-slate-500',
    accent: d ? 'text-violet-400' : 'text-violet-600',
    nav: d
      ? (scrolled || !isHome ? 'bg-[#05050f]/95 border-white/[0.06] shadow-2xl' : 'bg-transparent border-transparent')
      : (scrolled || !isHome ? 'bg-white/95 border-slate-200 shadow-lg' : 'bg-transparent border-transparent'),
    navLink: d ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900',
    clock: d ? 'bg-white/[0.06] border-white/10' : 'bg-violet-50 border-violet-100',
    clockTime: d ? 'text-violet-400' : 'text-violet-700',
    clockSub: d ? 'text-slate-500' : 'text-violet-500',
    s2: d ? 'bg-[#080814]' : 'bg-white',
    s3: d ? 'bg-[#05050f]' : 'bg-slate-50',
    card: d ? 'bg-white/[0.05] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm',
    cardHover: d ? 'hover:bg-white/[0.08] hover:border-violet-500/50' : 'hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100',
    fCard: d ? 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-violet-500/40' : 'bg-white border-slate-200 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100/60',
    row: d ? 'bg-white/[0.04] border-white/[0.07]' : 'bg-slate-50 border-slate-200',
    ticker: d ? 'bg-[#080814] border-white/[0.06]' : 'bg-white border-slate-200',
    tickerCard: d ? 'bg-white/[0.05] border-white/[0.08]' : 'bg-slate-50 border-slate-200',
  };

  const current = HERO_SLIDES[slide];

  return (
    <div className={`min-h-screen ${tk.page} ${tk.text} overflow-x-hidden transition-colors duration-500`}>

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 ${tk.nav} border-b backdrop-blur-2xl transition-all duration-500`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          <button onClick={() => router.push('/')} className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/40 group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-base">U</span>
            </div>
            <span className={`font-black text-xl ${tk.text}`}>UniSphere</span>
          </button>

          <div className={`hidden md:flex flex-col items-center px-6 py-2 rounded-2xl border ${tk.clock}`}>
            <span className={`font-black text-xl tabular-nums tracking-widest leading-none ${tk.clockTime}`}>{time}</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${tk.clockSub}`}>{day} — {date}</span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setDark(x => !x)}
              className={`relative w-16 h-8 rounded-full transition-all duration-500 ${d ? 'bg-violet-600 shadow-lg shadow-violet-500/40' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center text-sm shadow transition-all duration-500 ${d ? 'translate-x-9 bg-[#05050f]' : 'translate-x-1 bg-white'}`}>
                {d ? '🌙' : '☀️'}
              </span>
            </button>
            <button
              onClick={() => router.push('/contact')}
              className={`hidden sm:block px-4 py-2 rounded-xl font-black text-sm transition-all ${tk.navLink} ${pathname === '/contact' ? (d ? 'text-white bg-white/5' : 'text-slate-900 bg-slate-100') : ''}`}
            >
              Contact
            </button>
            <button onClick={() => router.push('/login')} className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${tk.navLink}`}>
              Sign In
            </button>
            <button onClick={() => router.push('/register')} className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-95 transition-all">
              Sign Up Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#05050f]">
        <div className="absolute inset-0 overflow-hidden">
          {HERO_SLIDES.map((sl, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                opacity: i === slide ? 1 : 0,
                transform: i === slide ? 'translateX(0) scale(1.03)' : i === prevSlide ? 'translateX(-8%) scale(1)' : 'translateX(8%) scale(1)',
                transition: 'opacity 0.7s ease, transform 0.7s ease',
              }}
            >
              <img src={sl.img} alt={sl.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.35) saturate(1.2)' }} />
            </div>
          ))}
          <div className={`absolute inset-0 bg-gradient-to-r ${current.color}`} style={{ transition: 'background 0.7s ease' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050f] via-transparent to-[#05050f]/40" />
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        </div>

        <div className="absolute w-[600px] h-[600px] bg-violet-700 rounded-full opacity-[0.12] blur-[120px] pointer-events-none top-1/2 left-1/2 z-[2] transition-transform duration-500"
          style={{ transform: `translate(calc(-50% + ${mouseX * 0.4}px), calc(-50% + ${mouseY * 0.4}px))` }} />

        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)}
              className={`rounded-full transition-all duration-400 ${i === slide ? 'w-8 h-2 bg-violet-400' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`} />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto w-full px-6 pt-16 pb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest mb-10 border bg-violet-500/10 border-violet-500/25 text-violet-300">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Built Exclusively for SLIIT Students · 2026
          </div>

          <div className="mb-6 transition-transform duration-300 ease-out"
            style={{ transform: `perspective(1200px) rotateX(${mouseY * 0.01}deg) rotateY(${mouseX * 0.01}deg)` }}>
            <h1 className="font-black tracking-tighter leading-[0.88]">
              <span className="block text-5xl md:text-7xl lg:text-[6.5rem] text-white">The Ultimate</span>
              <span className="block text-5xl md:text-7xl lg:text-[6.5rem] bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent py-2">SLIIT Hub</span>
              <span className="block text-5xl md:text-7xl lg:text-[6.5rem] text-white">for Students</span>
            </h1>
          </div>

          <div className="h-8 mb-4 overflow-hidden">
            <p className="text-sm font-black uppercase tracking-widest text-violet-400 transition-all duration-500"
              style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)' }}>
              {current.sub}
            </p>
          </div>

          <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 leading-relaxed text-slate-300">
            Book tutors instantly, trade resources, and study together — everything your SLIIT life needs, in one platform.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <button onClick={() => router.push('/login')} className="group px-10 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all">
              Get Started Free <span className="ml-1 inline-block group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button onClick={() => router.push('/login')} className="px-10 py-5 rounded-2xl font-black text-lg border-2 border-white/20 text-slate-300 hover:border-violet-400 hover:text-white transition-all">
              Browse Tutors
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="rounded-2xl p-6 border bg-white/[0.05] border-white/[0.08] backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/[0.08] hover:border-violet-500/50">
                <div className="text-3xl mb-3">{s.icon}</div>
                <p className="text-2xl md:text-3xl font-black mb-1 text-white">{s.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE TICKER ────────────────────────────────────────── */}
      <div className={`py-4 border-y ${tk.ticker} overflow-hidden`}>
        <div className="flex gap-4" style={{ width: 'max-content', animation: 'ticker-scroll 25s linear infinite' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border flex-shrink-0 ${tk.tickerCard}`}>
              <span className="text-lg">{item.icon}</span>
              <div className="text-left">
                <p className={`font-black text-xs ${tk.text}`}>{item.text}</p>
                <p className={`text-[10px] font-bold ${tk.sub}`}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section className={`py-32 px-6 ${tk.s2}`}>
        <div className="max-w-6xl mx-auto text-center">
          <p className={`font-black text-xs uppercase tracking-widest mb-5 ${tk.accent}`}>Everything You Need</p>
          <h2 className={`text-5xl md:text-7xl font-black mb-20 ${tk.text}`}>Three powerful modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} onClick={() => router.push(f.link)} className={`group relative rounded-3xl p-8 border-2 cursor-pointer transition-all hover:-translate-y-3 ${tk.fCard}`}>
                <div className={`w-20 h-20 bg-gradient-to-br ${f.gradient} rounded-3xl flex items-center justify-center text-4xl mb-7 shadow-2xl group-hover:scale-110 transition-all`}>{f.icon}</div>
                <h3 className={`text-xl font-black mb-3 ${tk.text}`}>{f.title}</h3>
                <p className={`font-medium text-sm mb-7 ${tk.sub}`}>{f.desc}</p>
                <div className={`flex items-center gap-2 font-black text-sm ${tk.accent}`}>Explore module →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TUTOR SPOTLIGHT ────────────────────────────────────── */}
      <section className={`py-32 px-6 ${tk.s3}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <p className={`font-black text-xs uppercase tracking-widest mb-5 ${tk.accent}`}>Featured Module</p>
              <h2 className={`text-4xl md:text-6xl font-black leading-tight mb-6 ${tk.text}`}>
                Find your perfect <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">SLIIT tutor</span>
              </h2>
              <p className={`font-medium mb-10 ${tk.sub}`}>Find the best tutor for your subject, schedule, and budget. Book instantly, pay securely, and start learning.</p>
              <div className="space-y-3 mb-10">
                {[{ icon: '🔍', text: 'Search by subject, rating, price' }, { icon: '📅', text: 'Real-time slot booking' }, { icon: '💳', text: 'Secure payment gateways' }].map(item => (
                  <div key={item.text} className={`flex items-center gap-4 p-4 rounded-2xl border ${tk.row}`}>
                    <span className="text-xl">{item.icon}</span>
                    <span className={`font-bold text-sm ${tk.text}`}>{item.text}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push('/login')} className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-violet-500/30">
                Browse All Tutors →
              </button>
            </div>
            <div className="space-y-4">
              {TUTORS.map(tutor => (
                <div key={tutor.name} className={`group rounded-2xl p-5 border cursor-pointer transition-all ${tk.card} ${tk.cardHover}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${tutor.g} rounded-2xl flex items-center justify-center font-black text-white shadow-lg`}>{tutor.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-black ${tk.text}`}>{tutor.name}</p>
                      <p className={`text-sm font-bold ${tk.accent}`}>{tutor.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-black">{tutor.rating} ★</p>
                      <p className={`text-xs font-bold ${tk.sub}`}>{tutor.sessions} sessions</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <Footer />

      {/* Ticker animation */}
      <style jsx global>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}