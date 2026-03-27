'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ── Password strength ────────────────────────────────────────────
function getStrength(pw: string): { level: number; label: string; color: string } {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)            score++;
  if (/[A-Z]/.test(pw))          score++;
  if (/[0-9]/.test(pw))          score++;
  if (/[^a-zA-Z0-9]/.test(pw))   score++;
  const map: Record<number, { label: string; color: string }> = {
    1: { label: 'Weak',   color: 'bg-red-500'     },
    2: { label: 'Fair',   color: 'bg-amber-500'   },
    3: { label: 'Good',   color: 'bg-blue-500'    },
    4: { label: 'Strong', color: 'bg-emerald-500' },
  };
  return { level: score, ...(map[Math.min(score, 4)] ?? { label: 'Weak', color: 'bg-red-500' }) };
}

// ── Field validators ─────────────────────────────────────────────
const validators = {
  username: (v: string) => {
    if (!v.trim()) return 'Username is required';
    if (!/^[a-zA-Z]{2}\d{8}$/.test(v.trim()))
      return 'Must be 2 letters + 8 digits  (e.g. it24100001)';
  },
  firstName: (v: string) => {
    if (!v.trim()) return 'First name is required';
    if (v.trim().length < 2) return 'At least 2 characters';
    if (!/^[A-Za-z\s]+$/.test(v)) return 'Letters only';
  },
  lastName: (v: string) => {
    if (!v.trim()) return 'Last name is required';
    if (v.trim().length < 2) return 'At least 2 characters';
    if (!/^[A-Za-z\s]+$/.test(v)) return 'Letters only';
  },
  email: (v: string) => {
    if (!v.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Invalid email address';
  },
  password: (v: string) => {
    if (!v) return 'Password is required';
    if (v.length < 6) return 'Minimum 6 characters';
    if (v.length > 100) return 'Password is too long';
  },
  confirmPassword: (v: string, pw: string) => {
    if (!v) return 'Please confirm your password';
    if (v !== pw) return 'Passwords do not match';
  },
};

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<'STUDENT' | 'TUTOR' | null>(null);
  const [form, setForm] = useState({
    username: '', firstName: '', lastName: '',
    email: '', password: '', confirmPassword: '',
  });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(form.password);

  // Username format hints
  const uVal      = form.username;
  const lettersOk = /^[a-zA-Z]{2}/.test(uVal) && uVal.length >= 2;
  const digitsOk  = /^[a-zA-Z]{2}\d{8}$/.test(uVal);

  const validate = (field: string, value: string) => {
    if (field === 'confirmPassword')
      return validators.confirmPassword(value, form.password) ?? '';
    return (validators[field as keyof typeof validators] as (v: string) => string | undefined)?.(value) ?? '';
  };

  const handleChange = (field: string, value: string) => {
    const sanitized = field === 'username' ? value.toLowerCase() : value;
    setForm(p => ({ ...p, [field]: sanitized }));
    if (touched[field]) {
      setErrors(p => ({ ...p, [field]: validate(field, sanitized) }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(p => ({ ...p, [field]: true }));
    setErrors(p => ({ ...p, [field]: validate(field, form[field as keyof typeof form]) }));
  };

  const validateAll = () => {
    const e: Record<string, string> = {};
    Object.keys(validators).forEach(k => {
      const msg = k === 'confirmPassword'
        ? validators.confirmPassword(form.confirmPassword, form.password)
        : (validators[k as keyof typeof validators] as (v: string) => string | undefined)(form[k as keyof typeof form]);
      if (msg) e[k] = msg;
    });
    if (!role) e.role = 'Please select your role to continue';
    return e;
  };

  const DEMOS = {
    student: { username: "it24100001", firstName: "Kasun",   lastName: "Perera",   email: "it24100001@my.sliit.lk", password: "Student@2026", confirmPassword: "Student@2026" },
    tutor:   { username: "it24100003", firstName: "Dilshan", lastName: "Fernando", email: "it24100003@my.sliit.lk", password: "Tutor@2026",   confirmPassword: "Tutor@2026"   },
  };

  const fillDemo = (type: "student" | "tutor") => {
    const d = DEMOS[type];
    setForm({ username: d.username, firstName: d.firstName, lastName: d.lastName, email: d.email, password: d.password, confirmPassword: d.confirmPassword });
    setRole(type === "student" ? "STUDENT" : "TUTOR");
    setErrors({});
    setTouched(Object.fromEntries(Object.keys(validators).map(k => [k, true])));
  };

  const handleContinue = async () => {
    const e = validateAll();
    setErrors(e);
    setTouched(Object.fromEntries(Object.keys(validators).map(k => [k, true])));
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    // Store step-1 data — picked up by tutor-details / student-details
    sessionStorage.setItem('reg_step1', JSON.stringify({ ...form, role }));
    await new Promise(r => setTimeout(r, 350));
    setLoading(false);
    router.push(role === 'TUTOR' ? '/register/tutor-details' : '/register/student-details');
  };

  // Border colour helper — matches login page style
  const fc = (field: string) => {
    if (!touched[field]) return 'border-slate-100 focus:border-indigo-400 hover:border-slate-200';
    if (errors[field])   return 'border-red-300 bg-red-50 focus:border-red-400';
    return 'border-green-300 focus:border-indigo-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50
      flex items-center justify-center px-4 py-12">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-100 rounded-full opacity-40" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-100 rounded-full opacity-40" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Uni<span className="text-indigo-600">Sphere</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Create your account</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center
              text-white text-xs font-black">1</div>
            <span className="text-xs font-bold text-indigo-600">Account info</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200 rounded" />
          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center
              text-slate-400 text-xs font-black">2</div>
            <span className="text-xs font-bold text-slate-400">Profile details</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-8 border border-slate-100">


          {/* ── Demo fill ── */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">⚡ Demo Fill</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => fillDemo('student')}
                className="py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border
                  bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition-all">
                🎓 Student Demo
              </button>
              <button type="button" onClick={() => fillDemo('tutor')}
                className="py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border
                  bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100 transition-all">
                📚 Tutor Demo
              </button>
            </div>
          </div>

          {/* ── Username (SLIIT ID) ── */}
          <div className="mb-4">
            <label className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Username
              </span>
              {touched.username && !errors.username && form.username && (
                <span className="text-xs font-black text-emerald-500">✓ Valid</span>
              )}
            </label>
            <input
              type="text"
              placeholder="it24100001"
              value={form.username}
              maxLength={10}
              autoComplete="username"
              onChange={e => handleChange('username', e.target.value)}
              onBlur={() => handleBlur('username')}
              className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-mono font-bold
                tracking-widest bg-white text-slate-800 outline-none transition-all ${fc('username')}`}
            />
            {/* Format hint */}
            {form.username && !(touched.username && !errors.username) && (
              <div className="mt-1.5 flex items-center gap-3">
                <span className={`text-xs font-bold ${lettersOk ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {lettersOk ? '✓' : '○'} 2 letters
                </span>
                <span className={`text-xs font-bold ${digitsOk ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {digitsOk ? '✓' : '○'} 8 digits
                </span>
              </div>
            )}
            {!form.username && (
              <p className="text-xs text-slate-400 font-medium mt-1.5">
                Format:{' '}
                <span className="text-amber-500 font-bold">2 letters</span>
                {' + '}
                <span className="text-sky-500 font-bold">8 digits</span>
                {'  ·  '}
                <span className="font-mono text-indigo-500">it24100001</span>
              </p>
            )}
            {touched.username && errors.username && (
              <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.username}
              </p>
            )}
          </div>

          {/* ── Name row ── */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(['firstName', 'lastName'] as const).map(field => (
              <div key={field}>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {field === 'firstName' ? 'First name' : 'Last name'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={field === 'firstName' ? 'Kasun' : 'Perera'}
                    value={form[field]}
                    onChange={e => handleChange(field, e.target.value)}
                    onBlur={() => handleBlur(field)}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-medium
                      bg-white text-slate-800 outline-none transition-all ${fc(field)}`}
                  />
                  {touched[field] && !errors[field] && form[field] && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-sm">✓</span>
                  )}
                </div>
                {touched[field] && errors[field] && (
                  <p className="text-red-500 text-xs font-bold mt-1">{errors[field]}</p>
                )}
              </div>
            ))}
          </div>

          {/* ── Email ── */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Email address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="kasun@university.lk"
                value={form.email}
                autoComplete="email"
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-medium
                  bg-white text-slate-800 outline-none transition-all ${fc('email')}`}
              />
              {touched.email && !errors.email && form.email && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-sm">✓</span>
              )}
            </div>
            {touched.email && errors.email && (
              <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.email}
              </p>
            )}
          </div>

          {/* ── Password ── */}
          <div className="mb-4">
            <label className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</span>
              {form.password && touched.password && !errors.password && (
                <span className={`text-xs font-black ${
                  strength.color.replace('bg-','text-')
                }`}>{strength.label}</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                autoComplete="new-password"
                onChange={e => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full px-4 py-3 pr-16 rounded-xl border-2 text-sm font-medium
                  bg-white text-slate-800 outline-none transition-all ${fc('password')}`}
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black
                  text-slate-400 hover:text-indigo-600 transition-colors">
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            {/* Strength bar */}
            {form.password && (
              <div className="mt-2 flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300
                    ${i <= strength.level ? strength.color : 'bg-slate-100'}`} />
                ))}
              </div>
            )}
            {touched.password && errors.password && (
              <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.password}
              </p>
            )}
          </div>

          {/* ── Confirm password ── */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showCpw ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                autoComplete="new-password"
                onChange={e => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`w-full px-4 py-3 pr-16 rounded-xl border-2 text-sm font-medium
                  bg-white text-slate-800 outline-none transition-all ${fc('confirmPassword')}`}
              />
              <button type="button" onClick={() => setShowCpw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black
                  text-slate-400 hover:text-indigo-600 transition-colors">
                {showCpw ? 'Hide' : 'Show'}
              </button>
              {form.confirmPassword && form.confirmPassword === form.password && (
                <span className="absolute right-14 top-1/2 -translate-y-1/2 text-emerald-500 text-sm">✓</span>
              )}
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* ── Role selection ── */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              I am joining as a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'STUDENT' as const, emoji: '🎓', title: 'Student',
                  desc: 'Find tutors & book sessions' },
                { value: 'TUTOR'   as const, emoji: '📚', title: 'Tutor',
                  desc: 'Teach & earn with expertise' },
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => { setRole(opt.value); setErrors(p => ({ ...p, role: '' })); }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all
                    ${role === opt.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                      : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                  <div className="text-2xl mb-1.5">{opt.emoji}</div>
                  <div className={`text-sm font-black
                    ${role === opt.value ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {opt.title}
                  </div>
                  <div className="text-xs font-medium text-slate-400 mt-0.5 leading-tight">
                    {opt.desc}
                  </div>
                  {role === opt.value && (
                    <div className="mt-2 text-indigo-500 text-xs font-black">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>
            {errors.role && (
              <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1">
                <span>⚠</span> {errors.role}
              </p>
            )}
          </div>

          {/* ── Continue ── */}
          <button onClick={handleContinue} disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-sm
              hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200
              disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <><span>Continue</span><span className="text-indigo-300">→</span></>
            )}
          </button>

          <p className="text-center text-xs font-medium text-slate-400 mt-5">
            Already have an account?{' '}
            <Link href="/login"
              className="text-indigo-600 font-bold hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4 font-medium">
          🔒 Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
}