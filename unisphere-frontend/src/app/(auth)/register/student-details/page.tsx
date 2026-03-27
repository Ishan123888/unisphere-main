'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Computer Science', 'Economics', 'Accounting',
  'Statistics', 'Business Studies',
];

const LEVELS = [
  { value: 'OL', label: 'O/L (Ordinary Level)' },
  { value: 'AL', label: 'A/L (Advanced Level)' },
  { value: 'UG_Y1', label: 'Undergraduate — Year 1' },
  { value: 'UG_Y2', label: 'Undergraduate — Year 2' },
  { value: 'UG_Y3', label: 'Undergraduate — Year 3' },
  { value: 'UG_Y4', label: 'Undergraduate — Year 4' },
  { value: 'POSTGRAD', label: 'Postgraduate' },
];

interface Step1Data {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

export default function StudentDetailsPage() {
  const router = useRouter();
  const [step1, setStep1] = useState<Step1Data | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [form, setForm] = useState({
    phone: '',
    university: '',
    level: '',
    sessionType: 'ONLINE',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('reg_step1');
    if (!raw) { router.replace('/register'); return; }
    const data = JSON.parse(raw) as Step1Data;
    if (data.role !== 'STUDENT') { router.replace('/register/tutor-details'); return; }
    setStep1(data);
  }, [router]);

  const toggleSubject = (s: string) => {
    setSubjects(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
    setErrors(p => ({ ...p, subjects: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.university.trim()) e.university = 'University / school is required';
    if (!form.level) e.level = 'Please select your level';
    if (subjects.length === 0) e.subjects = 'Select at least one subject';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (!step1) return;

    setLoading(true);
    setSubmitError('');

    const payload = {
      firstName: step1.firstName,
      lastName: step1.lastName,
      email: step1.email,
      username: step1.username,
      password: step1.password,
      role: 'STUDENT',
      phone: form.phone,
      university: form.university,
      level: form.level,
      preferredSubjectsRaw: subjects,
      sessionType: form.sessionType,
    };

    try {
      const res = await fetch('http://localhost:8082/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Registration failed');
      }

      sessionStorage.removeItem('reg_step1');
      router.push('/register/success?role=student');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (key: string) =>
    `w-full px-4 py-3 rounded-xl border-2 text-sm font-medium bg-white text-slate-800 outline-none transition-all
    ${errors[key] ? 'border-red-300 bg-red-50' : 'border-slate-100 focus:border-indigo-400 hover:border-slate-200'}`;

  if (!step1) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 px-4 py-12">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-100 rounded-full opacity-40" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-100 rounded-full opacity-40" />
      </div>

      <div className="relative w-full max-w-lg mx-auto">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Uni<span className="text-indigo-600">Sphere</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Complete your student profile</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-black">✓</div>
            <span className="text-xs font-bold text-green-600">Account info</span>
          </div>
          <div className="flex-1 h-0.5 bg-indigo-300 rounded" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-black">2</div>
            <span className="text-xs font-bold text-indigo-600">Student profile</span>
          </div>
        </div>

        {/* Welcome strip */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🎓</div>
          <div>
            <p className="text-white font-black text-sm">Welcome, {step1.firstName}!</p>
            <p className="text-indigo-200 text-xs font-medium">Almost done — tell us about your learning needs</p>
          </div>
          <div className="ml-auto bg-green-400 text-green-900 text-xs font-black px-3 py-1 rounded-full">
            Free account
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-8 border border-slate-100">

          {submitError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <p className="text-red-600 text-sm font-bold">{submitError}</p>
            </div>
          )}

          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Your details</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
              <input
                type="tel" placeholder="+94 7X XXX XXXX"
                value={form.phone}
                onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })); }}
                className={inputClass('phone')}
              />
              {errors.phone && <p className="text-red-500 text-xs font-bold mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current level</label>
              <select
                value={form.level}
                onChange={e => { setForm(p => ({ ...p, level: e.target.value })); setErrors(p => ({ ...p, level: '' })); }}
                className={inputClass('level')}
              >
                <option value="">Select...</option>
                {LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              {errors.level && <p className="text-red-500 text-xs font-bold mt-1">{errors.level}</p>}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              University / School
            </label>
            <input
              type="text" placeholder="University of Colombo"
              value={form.university}
              onChange={e => { setForm(p => ({ ...p, university: e.target.value })); setErrors(p => ({ ...p, university: '' })); }}
              className={inputClass('university')}
            />
            {errors.university && <p className="text-red-500 text-xs font-bold mt-1">{errors.university}</p>}
          </div>

          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 mt-6 pt-5 border-t border-slate-100">
            Learning preferences
          </p>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Subjects I need help with
            </label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(s => (
                <button
                  key={s} type="button"
                  onClick={() => toggleSubject(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all
                    ${subjects.includes(s)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-100 text-slate-500 hover:border-indigo-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {errors.subjects && <p className="text-red-500 text-xs font-bold mt-2">{errors.subjects}</p>}
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Preferred session type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'ONLINE', label: 'Online', icon: '💻' },
                { value: 'PHYSICAL', label: 'In-person', icon: '📍' },
                { value: 'BOTH', label: 'Both', icon: '🔄' },
              ].map(opt => (
                <button
                  key={opt.value} type="button"
                  onClick={() => setForm(p => ({ ...p, sessionType: opt.value }))}
                  className={`p-3 rounded-xl border-2 text-center transition-all
                    ${form.sessionType === opt.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-100 hover:border-indigo-200'}`}
                >
                  <div className="text-lg mb-1">{opt.icon}</div>
                  <div className={`text-xs font-black ${form.sessionType === opt.value ? 'text-indigo-700' : 'text-slate-500'}`}>
                    {opt.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="px-5 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-black text-sm
                hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-sm
                hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200
                disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Complete registration'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}