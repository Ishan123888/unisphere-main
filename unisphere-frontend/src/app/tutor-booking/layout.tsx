'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('User');
  const [initials, setInitials] = useState<string>('U');
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('userRole') || 'STUDENT';
    const name = localStorage.getItem('username') || 'UniSphere User';
    setUserRole(role);
    setUsername(name);

    const parts = name.split(' ');
    setInitials(parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase());
  }, []);

  if (!mounted) return null;

  const studentMenu = [
    { name: 'AI Explorer', path: '/tutor-booking', icon: '🔍', desc: 'Find tutors' },
    { name: 'My Dashboard', path: '/tutor-booking/student-dashboard', icon: '👨‍🎓', desc: 'My bookings' },
    { name: 'Invoices', path: '/tutor-booking/invoice', icon: '📄', desc: 'Billing history' },
    { name: 'Notifications', path: '/tutor-booking/notifications', icon: '🔔', desc: 'Alerts' },
  ];

  const tutorMenu = [
    { name: 'Tutor Dashboard', path: '/tutor-booking/tutor-dashboard', icon: '👨‍🏫', desc: 'Requests' },
    { name: 'Availability', path: '/tutor-booking/availability-manager', icon: '🕒', desc: 'Set slots' },
    { name: 'Analytics', path: '/tutor-booking/analytics', icon: '📈', desc: 'Earnings' },
    { name: 'Session Portal', path: '/tutor-booking/session-portal', icon: '💻', desc: 'Live sessions' },
    { name: 'Notifications', path: '/tutor-booking/notifications', icon: '🔔', desc: 'Alerts' },
  ];

  const adminMenu = [
    { name: 'Admin Dashboard', path: '/tutor-booking/admin-dashboard', icon: '🛡️', desc: 'Overview' },
    { name: 'Manage Bookings', path: '/tutor-booking/admin-dashboard/manage-bookings', icon: '📋', desc: 'All bookings' },
    { name: 'Approve Tutors', path: '/tutor-booking/admin-dashboard/approve-tutors', icon: '✅', desc: 'Applications' },
    { name: 'System Stats', path: '/tutor-booking/admin-dashboard/stats', icon: '📊', desc: 'Analytics' },
  ];

  // අලුතින් එක් කළ Quick Links (Home/Marketplace)
  const quickLinks = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Marketplace', path: '/marketplace', icon: '🛒' },
  ];

  const menuItems = userRole === 'TUTOR' ? tutorMenu : userRole === 'ADMIN' ? adminMenu : studentMenu;

  const roleColor = userRole === 'TUTOR' ? 'from-purple-500 to-indigo-600' : userRole === 'ADMIN' ? 'from-red-500 to-orange-500' : 'from-indigo-500 to-violet-600';
  const roleBadgeColor = userRole === 'TUTOR' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : userRole === 'ADMIN' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';

  const handleSignOut = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside className={`${collapsed ? 'w-20' : 'w-72'} bg-slate-900 border-r border-white/[0.06] flex flex-col fixed h-full z-50 transition-all duration-300 ease-in-out`}>

        {/* Header */}
        <div className={`flex items-center ${collapsed ? 'justify-center px-4' : 'justify-between px-6'} py-6 border-b border-white/[0.06]`}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                <span className="text-white font-black text-sm">U</span>
              </div>
              <div>
                <p className="text-white font-black text-sm leading-none">UniSphere</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Portal</p>
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-all flex-shrink-0">
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Dashboard Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          <p className={`px-4 mb-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ${collapsed ? 'text-center' : ''}`}>
            {collapsed ? '•' : 'Main Menu'}
          </p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} title={collapsed ? item.name : ''} className={`flex items-center gap-3 px-3 py-3 rounded-2xl font-bold transition-all group ${isActive ? `bg-gradient-to-r ${roleColor} text-white shadow-lg` : 'text-slate-400 hover:bg-white/5 hover:text-white'} ${collapsed ? 'justify-center' : ''}`}>
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black leading-none truncate">{item.name}</p>
                    <p className={`text-[10px] font-bold mt-1 truncate ${isActive ? 'text-white/70' : 'text-slate-600'}`}>{item.desc}</p>
                  </div>
                )}
              </Link>
            );
          })}

          {/* ═════════ QUICK LINKS SECTION (Home/Marketplace) ═════════ */}
          <div className="my-6 border-t border-white/[0.06] pt-6" />
          <p className={`px-4 mb-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ${collapsed ? 'text-center' : ''}`}>
            {collapsed ? '•' : 'General'}
          </p>
          {quickLinks.map((link) => (
            <Link key={link.path} href={link.path} title={collapsed ? link.name : ''} className={`flex items-center gap-4 px-3 py-3 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all font-bold ${collapsed ? 'justify-center' : ''}`}>
              <span className="text-xl">{link.icon}</span>
              {!collapsed && <span className="text-sm">{link.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile Card */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className={`${collapsed ? '' : 'bg-white/5 border border-white/[0.08]'} rounded-2xl p-2`}>
            {!collapsed && (
              <div className="flex items-center gap-3 p-2 mb-2">
                <div className={`w-9 h-9 bg-gradient-to-br ${roleColor} rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg`}>{initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-xs truncate">{username}</p>
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-tighter">{userRole}</p>
                </div>
              </div>
            )}
            <button onClick={handleSignOut} className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${collapsed ? 'bg-red-500/20 text-red-500' : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'}`}>
              {collapsed ? '✖' : 'Sign Out'}
            </button>
          </div>
        </div>
      </aside>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-72'} min-h-screen transition-all duration-300`}>

        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-black text-slate-900 text-lg uppercase tracking-tight">
               {menuItems.find(m => m.path === pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`hidden md:block px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${roleBadgeColor}`}>
              {userRole} Mode
            </div>
            <Link href="/tutor-booking/notifications" className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-indigo-50 flex items-center justify-center transition-all text-lg shadow-sm border border-slate-200/50">
              🔔
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8 max-w-[1400px] mx-auto">
          {children}
        </div>

        <footer className="px-8 py-6 text-center md:text-left border-t border-slate-100/50">
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
             © 2026 UniSphere Ecosystem • Version 2.0.4
           </p>
        </footer>
      </main>
    </div>
  );
}