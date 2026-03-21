'use client';
import { useState, useRef } from 'react';
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

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface FormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'STUDENT' | 'TUTOR';
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const validateUsername = (val: string): string | undefined => {
  if (!val.trim()) return 'Username is required.';
  if (!/^[a-zA-Z]{2}\d{8}$/.test(val.trim()))
    return 'Must be 2 letters followed by 8 digits  (e.g. it24100001)';
};

const validateEmail = (val: string): string | undefined => {
  if (!val.trim()) return 'SLIIT Mail is required.';
  if (!/^[a-zA-Z]{2}\d{8}@my\.sliit\.lk$/.test(val.trim()))
    return 'Only @my.sliit.lk addresses are accepted.';
};

const validatePassword = (val: string): string | undefined => {
  if (!val) return 'Password is required.';
  if (val.length < 8) return 'Minimum 8 characters required.';
  if (!/[A-Z]/.test(val)) return 'At least one uppercase letter required.';
  if (!/[0-9]/.test(val)) return 'At least one number required.';
  if (val.length > 100) return 'Password exceeds maximum length.';
};

const validateConfirm = (val: string, pw: string): string | undefined => {
  if (!val) return 'Please re-enter your password.';
  if (val !== pw) return 'Passwords do not match.';
};

const getStrength = (pw: string) => {
  if (!pw) return { level: 0, label: '', color: '', bg: '' };
  let s = 0;
  if (pw.length >= 8)           s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^a-zA-Z0-9]/.test(pw))  s++;
  const map: Record<number, { label: string; color: string; bg: string }> = {
    1: { label: 'Weak',   color: '#ef4444', bg: 'bg-red-400'     },
    2: { label: 'Fair',   color: '#f97316', bg: 'bg-orange-400'  },
    3: { label: 'Good',   color: '#3b82f6', bg: 'bg-blue-400'    },
    4: { label: 'Strong', color: '#10b981', bg: 'bg-emerald-500' },
  };
  return { level: s, ...(map[s] ?? map[1]) };
};

const ROLES = [
  { id: 'STUDENT' as const, label: 'Student', desc: 'Book tutors & join study rooms', accent: '#6366f1', light: '#eef2ff', border: '#c7d2fe' },
  { id: 'TUTOR'   as const, label: 'Tutor',   desc: 'Teach students & earn money',    accent: '#0d9488', light: '#f0fdfa', border: '#99f6e4' },
];

/*
  REGISTER DEMO CREDENTIALS
  These match exactly what LoginPage uses for demo login.
  Register these once before the presentation.

  Student : it24100001 / it24100001@my.sliit.lk / Student@2026
  Tutor   : it24100002 / it24100002@my.sliit.lk / Tutor@2026
*/
const DEMOS: Record<string, FormState> = {
  STUDENT: { username: 'it24100001', email: 'it24100001@my.sliit.lk', password: 'Student@2026', confirmPassword: 'Student@2026', role: 'STUDENT' },
  TUTOR:   { username: 'it24100002', email: 'it24100002@my.sliit.lk', password: 'Tutor@2026',   confirmPassword: 'Tutor@2026',   role: 'TUTOR'   },
};

export default function RegisterPage() {
  const router  = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormState>({
    username: '', email: '', password: '', confirmPassword: '', role: 'STUDENT',
  });
  const [errors,  setErrors]  = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPw,  setShowPw]  = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState('');
  const [tilt,    setTilt]    = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - left) / width  - 0.5) * 6,
      y: ((e.clientY - top)  / height - 0.5) * -6,
    });
  };

  const validate = (field: keyof FormErrors, value: string): string | undefined => {
    switch (field) {
      case 'username':        return validateUsername(value);
      case 'email':           return validateEmail(value);
      case 'password':        return validatePassword(value);
      case 'confirmPassword': return validateConfirm(value, form.password);
    }
  };

  const handleChange = (field: keyof FormState, value: string) => {
    const v = field === 'username' ? value.toLowerCase() : value;
    setForm(prev => ({ ...prev, [field]: v }));
    setApiErr('');
    if (touched[field])
      setErrors(prev => ({ ...prev, [field]: validate(field as keyof FormErrors, v) }));
    if (field === 'password' && touched.confirmPassword)
      setErrors(prev => ({ ...prev, confirmPassword: validateConfirm(form.confirmPassword, v) }));
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validate(field, form[field]) }));
  };

  const runAll = (): boolean => {
    const e: FormErrors = {
      username:        validateUsername(form.username),
      email:           validateEmail(form.email),
      password:        validatePassword(form.password),
      confirmPassword: validateConfirm(form.confirmPassword, form.password),
    };
    setErrors(e);
    setTouched({ username: true, email: true, password: true, confirmPassword: true });
    return !Object.values(e).some(Boolean);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runAll()) return;
    setLoading(true);
    setApiErr('');
    try {
      await api.post('/auth/register', {
        username: form.username,
        email:    form.email,
        password: form.password,
        role:     form.role,
      });
      router.push('/login?registered=true');
    } catch (err: any) {
      setApiErr(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: FormState['role']) => {
    setForm(DEMOS[role]);
    setErrors({});
    setTouched({ username: true, email: true, password: true, confirmPassword: true });
    setApiErr('');
  };

  const fieldState = (field: keyof FormErrors) => {
    if (!touched[field]) return 'default';
    return errors[field] ? 'error' : 'success';
  };

  const inputClass = (field: keyof FormErrors) => {
    const base = 'w-full px-4 py-3 rounded-2xl outline-none text-slate-800 text-sm font-semibold placeholder:text-slate-300 transition-all duration-200 border bg-white';
    const s = fieldState(field);
    if (s === 'error')   return `${base} border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/50`;
    if (s === 'success') return `${base} border-emerald-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-emerald-50/30`;
    return `${base} border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100`;
  };

  const strength   = getStrength(form.password);
  const uVal       = form.username;
  const lettersOk  = /^[a-zA-Z]{2}/.test(uVal);
  const digitsOk   = /^[a-zA-Z]{2}\d{8}$/.test(uVal);
  const isStudent  = form.role === 'STUDENT';
  const activeRole = ROLES.find(r => r.id === form.role)!;

  return (
    <main className="min-h-screen relative flex items-start justify-center py-8 px-4 overflow-y-auto">

      {/* Fixed page background */}
      <div className="fixed inset-0 z-0">
        <img src="https://i.imgur.com/bacrOw1.png" alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.22) saturate(1.1)' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900/30 to-teal-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-xl z-10"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
        <div ref={cardRef} className="rounded-[2rem] shadow-2xl overflow-hidden"
          style={{
            transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
            transition: 'transform 0.15s ease-out',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.15)',
          }}>

          {/* Banner */}
          <div className="relative" style={{ height: '160px' }}>
            <img src="https://i.imgur.com/bacrOw1.png" alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ filter: 'brightness(0.55) saturate(1.3)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <div className="px-6 py-2 rounded-xl shadow-xl"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.55)' }}>
                <span className="text-white font-black text-base tracking-tight">UniSphere</span>
              </div>
            </div>
          </div>

          {/* White body */}
          <div className="bg-white px-7 md:px-9 pt-5 pb-6">

            <div className="text-center mb-5">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Create Account</h1>
              <p className="text-slate-400 text-xs mt-1 font-medium">Join the UniSphere community today</p>
            </div>

            {/* Role selector */}
            <div className="mb-4">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2.5 text-center">I am a...</p>
              <div className="grid grid-cols-2 gap-2.5">
                {ROLES.map(r => (
                  <button key={r.id} type="button"
                    onClick={() => setForm(prev => ({ ...prev, role: r.id }))}
                    className="relative py-3 px-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: form.role === r.id ? r.light : 'white',
                      border: `2px solid ${form.role === r.id ? r.border : '#e2e8f0'}`,
                      boxShadow: form.role === r.id ? `0 4px 16px ${r.accent}18` : 'none',
                    }}>
                    {form.role === r.id && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white"
                        style={{ background: r.accent, boxShadow: `0 2px 8px ${r.accent}50` }}>
                        <CheckIcon />
                      </span>
                    )}
                    <p className="font-black text-sm mb-0.5" style={{ color: form.role === r.id ? r.accent : '#334155' }}>{r.label}</p>
                    <p className="text-[10px] font-medium text-slate-400 leading-tight">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Demo fill */}
            <div className="mb-4">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2 text-center">Quick Demo Fill</p>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => (
                  <button key={r.id} type="button" onClick={() => fillDemo(r.id)}
                    className="py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                    style={{ background: r.light, border: `1px solid ${r.border}`, color: r.accent }}>
                    {r.label} Demo
                  </button>
                ))}
              </div>
            </div>

            {/* API error */}
            {apiErr && (
              <div className="mb-3 px-4 py-3 rounded-2xl flex items-start gap-2.5 bg-red-50 border border-red-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-red-600 text-xs font-semibold leading-relaxed">{apiErr}</p>
              </div>
            )}

            <form onSubmit={handleRegister} noValidate className="space-y-3.5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Username */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Username</span>
                    {touched.username && !errors.username && (
                      <span className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5"><CheckIcon /> Valid</span>
                    )}
                  </div>
                  <input type="text" value={form.username}
                    onChange={e => handleChange('username', e.target.value)}
                    onBlur={() => handleBlur('username')}
                    placeholder="it24100001" maxLength={10}
                    className={`${inputClass('username')} font-mono tracking-widest`} />
                  {uVal && !(touched.username && !errors.username) && (
                    <div className="mt-1 ml-1 flex items-center gap-3">
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 ${lettersOk ? 'text-emerald-500' : 'text-slate-300'}`}>
                        {lettersOk ? <CheckIcon /> : '○'} 2 letters
                      </span>
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 ${digitsOk ? 'text-emerald-500' : 'text-slate-300'}`}>
                        {digitsOk ? <CheckIcon /> : '○'} 8 digits
                      </span>
                    </div>
                  )}
                  {!uVal && (
                    <p className="text-[10px] font-semibold mt-1 ml-1 text-slate-400">
                      <span className="text-amber-500">2 letters</span> + <span className="text-sky-500">8 digits</span>
                      <span className="text-slate-300"> · </span>
                      <span className="text-indigo-400 font-mono">it24100001</span>
                    </p>
                  )}
                  {touched.username && errors.username && (
                    <p className="text-red-500 text-[11px] font-semibold mt-1 ml-1">{errors.username}</p>
                  )}
                </div>

                {/* SLIIT Mail */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">SLIIT Mail</span>
                    {touched.email && !errors.email && (
                      <span className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5"><CheckIcon /> Verified</span>
                    )}
                  </div>
                  <input type="text" value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="it24100001@my.sliit.lk"
                    className={inputClass('email')} />
                  {!form.email && (
                    <p className="text-[10px] font-semibold mt-1 ml-1 text-slate-400">
                      Must end with <span className="text-indigo-500">@my.sliit.lk</span>
                    </p>
                  )}
                  {touched.email && errors.email && (
                    <p className="text-red-500 text-[11px] font-semibold mt-1 ml-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password</span>
                    {touched.password && !errors.password && form.password && (
                      <span className="text-[10px] font-black" style={{ color: strength.color }}>{strength.label}</span>
                    )}
                  </div>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={form.password}
                      onChange={e => handleChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      placeholder="Min 8 · A-Z · 0-9"
                      className={`${inputClass('password')} pr-10`} />
                    <button type="button" tabIndex={-1} onClick={() => setShowPw(x => !x)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors">
                      {showPw ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {form.password && touched.password && !errors.password && (
                    <div className="mt-1.5 flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.bg : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  )}
                  {touched.password && errors.password && (
                    <p className="text-red-500 text-[11px] font-semibold mt-1 ml-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Confirm Password</span>
                    {touched.confirmPassword && !errors.confirmPassword && form.confirmPassword && (
                      <span className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5"><CheckIcon /> Matched</span>
                    )}
                  </div>
                  <div className="relative">
                    <input type={showCPw ? 'text' : 'password'} value={form.confirmPassword}
                      onChange={e => handleChange('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="Re-enter password"
                      className={`${inputClass('confirmPassword')} pr-10`} />
                    <button type="button" tabIndex={-1} onClick={() => setShowCPw(x => !x)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors">
                      {showCPw ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-red-500 text-[11px] font-semibold mt-1 ml-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg"
                style={{
                  background: loading ? '#c7d2fe' : isStudent ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #14b8a6, #0d9488)',
                  boxShadow: loading ? 'none' : isStudent ? '0 8px 24px rgba(99,102,241,0.35)' : '0 8px 24px rgba(20,184,166,0.35)',
                }}>
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" /> Creating Account...</>
                ) : `Join as ${form.role === 'STUDENT' ? 'Student' : 'Tutor'}`}
              </button>

              <p className="text-center text-[10px] text-slate-400 font-medium">Your data is encrypted and secure.</p>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <p className="text-sm font-semibold text-slate-400">
                Already a member?{' '}
                <Link href="/login" className="font-black transition-colors hover:opacity-75" style={{ color: activeRole.accent }}>
                  Sign In Here
                </Link>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border-t border-slate-100 px-7 md:px-9 py-3.5">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Validation Rules</p>
            <div className="grid grid-cols-2 gap-1">
              {['Username: 2 letters + 8 digits','SLIIT Mail: @my.sliit.lk only','Password: min 8 chars + A-Z + 0-9','Confirm password must match'].map(r => (
                <p key={r} className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <span style={{ color: activeRole.accent }}>·</span> {r}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}