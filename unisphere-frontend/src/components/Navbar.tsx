'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [dark, setDark] = useState(true);
  const [time, setTime] = useState('--:--:-- --');
  const [date, setDate] = useState('');
  const [day, setDay] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('unisphere-dark');
    if (saved !== null) setDark(saved === 'true');
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('unisphere-dark', String(next));
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  const d = dark;
  const isHome = pathname === '/';

  // ── All module links redirect to /login (auth required) ──────────
  const NAV_LINKS = [
    { label: '📚 Study Lobby', path: '/study-lobby', icon: '📚' },
    { label: '💬 Chat', path: '/chat', icon: '💬' },
    { label: '📖 Tutor Booking', path: '/tutor-booking', icon: '📖' },
    { label: '🛒 Marketplace', path: '/marketplace', icon: '🛒' },
    { label: '📋 Contact', path: '/contact', icon: '📋' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-4 transition-all duration-500 ${
      scrolled || !isHome
        ? d
          ? 'bg-[#05050f]/95 border-b border-white/[0.06] py-3 backdrop-blur-2xl shadow-2xl shadow-black/20'
          : 'bg-white/95 border-b border-slate-200 py-3 backdrop-blur-2xl shadow-lg'
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* ── Logo ─────────────────────────────────────────────── */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-3 flex-shrink-0 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/40 group-hover:scale-110 transition-transform">
            <span className="text-white font-black text-base">U</span>
          </div>
          <span className={`font-black text-xl ${d ? 'text-white' : 'text-slate-900'}`}>UniSphere</span>
        </button>

        {/* ── Nav Links — desktop ───────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(link => {
            // Active highlight only for Contact (real page)
            const isActive = link.path !== '/login' && pathname === link.path;
            return (
              <button
                key={link.label}
                onClick={() => router.push(link.path)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? d
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'bg-violet-100 text-violet-700'
                    : d
                      ? 'text-slate-400 hover:text-white hover:bg-white/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs">{link.icon}</span>
                {link.label}
                {/* Small lock badge on protected routes */}
                {link.path === '/login' && (
                  <span className="text-[9px] opacity-40">🔒</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Live Clock ────────────────────────────────────────── */}
        <div className={`hidden xl:flex flex-col items-center px-5 py-2 rounded-2xl border ${
          d ? 'bg-white/[0.05] border-white/10' : 'bg-violet-50 border-violet-100'
        }`}>
          <span className={`font-black text-lg tabular-nums tracking-widest leading-none ${d ? 'text-violet-400' : 'text-violet-700'}`}>
            {time}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${d ? 'text-slate-500' : 'text-violet-500'}`}>
            {day} — {date}
          </span>
        </div>

        {/* ── Right Actions ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className={`relative w-14 h-7 rounded-full transition-all duration-500 ${
              d ? 'bg-violet-600 shadow-lg shadow-violet-500/40' : 'bg-slate-300'
            }`}
          >
            <span className={`absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow transition-all duration-500 ${
              d ? 'translate-x-7 bg-[#05050f]' : 'translate-x-0.5 bg-white'
            }`}>
              {d ? '🌙' : '☀️'}
            </span>
          </button>

          {/* Sign In */}
          <button
            onClick={() => router.push('/login')}
            className={`hidden md:block px-4 py-2 rounded-xl font-black text-sm transition-all ${
              d ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>

          {/* Join Free CTA */}
          <button
            onClick={() => router.push('/register')}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-95 transition-all"
          >
            Join Free
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className={`lg:hidden p-2 rounded-xl transition-all ${
              d ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="w-5 flex flex-col gap-1">
              <span className={`h-0.5 rounded-full transition-all duration-300 ${d ? 'bg-white' : 'bg-slate-600'} ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
              <span className={`h-0.5 rounded-full transition-all duration-300 ${d ? 'bg-white' : 'bg-slate-600'} ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`h-0.5 rounded-full transition-all duration-300 ${d ? 'bg-white' : 'bg-slate-600'} ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu (animated) ────────────────────────────────── */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
        <div className={`rounded-2xl border p-4 ${d ? 'bg-[#0a0a1a] border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
          {NAV_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => { router.push(link.path); setMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all mb-1 flex items-center gap-3 ${
                d
                  ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              {link.path === '/login' && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                  d ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-600'
                }`}>
                  Sign in required
                </span>
              )}
            </button>
          ))}

          <div className={`mt-3 pt-3 border-t ${d ? 'border-white/10' : 'border-slate-200'} flex gap-3`}>
            <button
              onClick={() => { router.push('/login'); setMenuOpen(false); }}
              className={`flex-1 py-2.5 rounded-xl font-black text-sm border transition-all ${
                d
                  ? 'border-white/20 text-slate-300 hover:border-violet-400 hover:text-white'
                  : 'border-slate-300 text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { router.push('/login'); setMenuOpen(false); }}
              className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-violet-500/20"
            >
              Join Free
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}