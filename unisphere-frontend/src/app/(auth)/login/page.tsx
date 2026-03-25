'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-10-8-10-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 10 8 10 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const validateUsername = (val: string): string | undefined => {
  if (!val.trim()) return 'Username is required.';
  if (!/^[a-zA-Z]{2}\d{8}$/.test(val.trim()))
    return 'Must be 2 letters + 8 digits  (e.g. it23810464)';
};

const validatePassword = (val: string): string | undefined => {
  if (!val)           return 'Password is required.';
  if (val.length < 6) return 'Password must be at least 6 characters.';
  if (val.length > 100) return 'Password is too long.';
};

const getStrength = (pw: string): { level: number; label: string; color: string } => {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^a-zA-Z0-9]/.test(pw))  score++;
  const map: Record<number, { label: string; color: string }> = {
    1: { label: 'Weak',   color: 'bg-red-500'     },
    2: { label: 'Fair',   color: 'bg-amber-500'   },
    3: { label: 'Good',   color: 'bg-blue-500'    },
    4: { label: 'Strong', color: 'bg-emerald-500' },
  };
  return { level: score, ...(map[score] ?? { label: 'Weak', color: 'bg-red-500' }) };
};

/*
  LOGIN DEMO CREDENTIALS
  These must match exactly what is saved in the database.
  Before the presentation, register these accounts once using
  the Register page (or use the DataSeeder in Spring Boot).

  Student : it24100001 / Student@2026
  Tutor   : it24100002 / Tutor@2026
  Admin   : ad00000001 / Admin@2026  (seeded via DataLoader)
*/
const DEMOS = {
  student: { username: 'it24100001', password: 'Student@2026' },
  tutor:   { username: 'it24100002', password: 'Tutor@2026'   },
  admin:   { username: 'ad00000001', password: 'Admin@2026'   },
} as const;

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors,   setErrors]   = useState<{ username?: string; password?: string }>({});
  const [touched,  setTouched]  = useState<{ username?: boolean; password?: boolean }>({});
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [loginErr, setLoginErr] = useState('');

  const handleChange = (field: 'username' | 'password', value: string) => {
    const sanitized = field === 'username' ? value.toLowerCase() : value;
    setFormData(prev => ({ ...prev, [field]: sanitized }));
    setLoginErr('');
    if (touched[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: field === 'username' ? validateUsername(sanitized) : validatePassword(sanitized),
      }));
    }
  };

  const handleBlur = (field: 'username' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({
      ...prev,
      [field]: field === 'username'
        ? validateUsername(formData.username)
        : validatePassword(formData.password),
    }));
  };

  const runAll = (): boolean => {
    const e = {
      username: validateUsername(formData.username),
      password: validatePassword(formData.password),
    };
    setErrors(e);
    setTouched({ username: true, password: true });
    return !e.username && !e.password;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runAll()) return;
    setLoading(true);
    setLoginErr('');
    try {
      const response = await api.post('/auth/login', {
        username: formData.username.trim(),
        password: formData.password,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      const { token, role } = response.data;
      if (token) {
        localStorage.setItem('token',    token);
        localStorage.setItem('userRole', role || 'STUDENT');
        localStorage.setItem('username', formData.username.trim());
        const userRole = (role || 'STUDENT').toUpperCase();
        switch (userRole) {
          case 'TUTOR': router.push('/tutor-booking/tutor-dashboard');  break;
          case 'ADMIN': router.push('/tutor-booking/admin-dashboard');  break;
          default:      router.push('/tutor-booking/student-dashboard');
        }
      } else {
        throw new Error('Token not received from server');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data || error.message;
      setLoginErr(
        msg === 'Forbidden'
          ? 'Access denied. Please check your credentials and try again.'
          : 'Invalid username or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: keyof typeof DEMOS) => {
    setFormData({ ...DEMOS[role] });
    setErrors({});
    setTouched({ username: true, password: true });
    setLoginErr('');
  };

  const strength  = getStrength(formData.password);
  const uVal      = formData.username;
  const lettersOk = /^[a-zA-Z]{2}/.test(uVal) && uVal.length >= 2;
  const digitsOk  = /^[a-zA-Z]{2}\d{8}$/.test(uVal);

  const fc = (field: 'username' | 'password') => {
    if (!touched[field]) return 'border-white/10 focus:border-violet-500/60';
    if (errors[field])   return 'border-red-500/60 bg-red-500/5';
    return 'border-emerald-500/50';
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-6">

      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://i.imgur.com/bacrOw1.png"
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.22) saturate(1.1)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-slate-900/30 to-indigo-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-700 rounded-full opacity-[0.08] blur-[120px] pointer-events-none" />
      </div>

      <div className="relative w-full max-w-md z-10">

        <div className="rounded-[2rem] overflow-hidden shadow-2xl"
          style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)' }}>

          {/* Banner */}
          <div className="relative h-28">
            <img
              src="https://i.imgur.com/bacrOw1.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ filter: 'brightness(0.55) saturate(1.3)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#05050f]" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <div className="px-6 py-2 rounded-xl shadow-xl"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.55)' }}>
                <span className="text-white font-black text-base tracking-tight">UniSphere</span>
              </div>
            </div>
          </div>

          {/* Dark body */}
          <div className="bg-white/[0.04] border-x border-b border-white/[0.08] backdrop-blur-2xl px-8 md:px-10 pt-6 pb-8">

            <div className="text-center mb-7">
              <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
              <p className="text-slate-500 text-sm font-medium mt-1.5">Sign in to your UniSphere account</p>
            </div>

            {/* Demo fill */}
            <div className="mb-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3 text-center">Quick Demo Fill</p>
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'tutor', 'admin'] as const).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => fillDemo(role)}
                    className="py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-1"
                    style={{
                      background:  role === 'student' ? 'rgba(124,58,237,0.12)' : role === 'tutor' ? 'rgba(20,184,166,0.12)'  : 'rgba(245,158,11,0.12)',
                      borderColor: role === 'student' ? 'rgba(124,58,237,0.3)'  : role === 'tutor' ? 'rgba(20,184,166,0.3)'   : 'rgba(245,158,11,0.3)',
                      color:       role === 'student' ? '#a78bfa'                : role === 'tutor' ? '#2dd4bf'                : '#fbbf24',
                    }}
                  >
                    <span>{role === 'student' ? 'Student' : role === 'tutor' ? 'Tutor' : 'Admin'}</span>
                    <span className="font-mono text-[8px] opacity-60 normal-case tracking-normal">{DEMOS[role].username}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Login error */}
            {loginErr && (
              <div className="mb-5 px-5 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-red-400 text-xs font-bold leading-relaxed">{loginErr}</p>
              </div>
            )}

            <form onSubmit={handleLogin} noValidate className="space-y-5">

              {/* Username */}
              <div>
                <label className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Username</span>
                  {touched.username && !errors.username && (
                    <span className="text-[10px] font-black text-emerald-400">Valid</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => handleChange('username', e.target.value)}
                  onBlur={() => handleBlur('username')}
                  placeholder="it24100001"
                  autoComplete="username"
                  maxLength={10}
                  className={`w-full px-5 py-4 bg-white/[0.05] border rounded-2xl focus:outline-none text-white text-sm font-black placeholder:text-slate-600 transition-all font-mono tracking-widest ${fc('username')}`}
                />
                {uVal && !(touched.username && !errors.username) && (
                  <div className="mt-2 ml-1 flex items-center gap-3">
                    <span className={`text-[10px] font-black ${lettersOk ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {lettersOk ? '✓' : '○'} 2 letters
                    </span>
                    <span className={`text-[10px] font-black ${digitsOk ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {digitsOk ? '✓' : '○'} 8 digits
                    </span>
                  </div>
                )}
                {!uVal && (
                  <p className="text-[10px] font-bold mt-2 ml-1 text-slate-600">
                    <span className="text-amber-400">2 letters</span>{' + '}
                    <span className="text-sky-400">8 digits</span>
                    {'  ·  '}
                    <span className="text-violet-400 font-mono">it24100001</span>
                  </p>
                )}
                {touched.username && errors.username && (
                  <p className="text-red-400 text-[11px] font-bold mt-2 ml-1">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</span>
                  {touched.password && !errors.password && formData.password && (
                    <span className={`text-[10px] font-black ${strength.color.replace('bg-','text-')}`}>{strength.label}</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full px-5 py-4 pr-14 bg-white/[0.05] border rounded-2xl focus:outline-none text-white text-sm font-bold placeholder:text-slate-600 transition-all ${fc('password')}`}
                  />
                  <button type="button" onClick={() => setShowPw(x => !x)} tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {formData.password && touched.password && !errors.password && (
                  <div className="mt-2 flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-white/10'}`} />
                    ))}
                  </div>
                )}
                {touched.password && errors.password && (
                  <p className="text-red-400 text-[11px] font-bold mt-2 ml-1">{errors.password}</p>
                )}
              </div>

              <div className="text-right">
                <button type="button" onClick={() => router.push('/forgot-password')}
                  className="text-[11px] font-black text-slate-500 hover:text-violet-400 transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 shadow-xl"
                style={{
                  background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  boxShadow:  loading ? 'none' : '0 8px 32px rgba(124,58,237,0.35)',
                }}>
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                ) : 'Sign In Now'}
              </button>

              <p className="text-center text-[11px] text-slate-600 font-medium pt-1">
                Secured with JWT authentication
              </p>
            </form>

            <div className="mt-7 pt-6 border-t border-white/[0.06] text-center">
              <p className="text-sm font-bold text-slate-500">
                Don't have an account?{' '}
                <Link href="/register" className="text-violet-400 hover:text-violet-300 font-black transition-colors">
                  Register as a Member
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 px-6 py-4 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-700 mb-2">Validation Rules</p>
          <div className="grid grid-cols-2 gap-1">
            {['Username: 2 letters + 8 digits','Works for Student, Tutor & Admin','Password: min 6 characters','Password: strength indicator'].map(r => (
              <p key={r} className="text-[10px] text-slate-600 font-medium flex items-center gap-1">
                <span className="text-violet-600">·</span> {r}
              </p>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}