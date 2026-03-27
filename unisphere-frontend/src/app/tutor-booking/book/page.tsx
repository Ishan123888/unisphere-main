'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const TUTORS: Record<number, any> = {
  1: { id: 1, name: 'Amal Perera',      subject: 'Data Structures & Algorithms', avatar: 'AP', hourlyRate: 1500 },
  2: { id: 2, name: 'Dilki Jayawardena', subject: 'Database Management Systems',  avatar: 'DJ', hourlyRate: 1200 },
  3: { id: 3, name: 'Kasun Madushanka', subject: 'Software Engineering',           avatar: 'KM', hourlyRate: 1800 },
  4: { id: 4, name: 'Nethmi Rodrigo',   subject: 'Computer Networks',              avatar: 'NR', hourlyRate: 1100 },
  5: { id: 5, name: 'Tharaka Silva',    subject: 'Web Technologies',               avatar: 'TS', hourlyRate: 2000 },
};

interface FormData {
  studentName: string;
  studentId: string;
  email: string;
  phone: string;
  duration: string;
  sessionType: string;
  topic: string;
  notes: string;
  paymentMethod: string;
}

interface Errors {
  studentName?: string;
  studentId?: string;
  email?: string;
  phone?: string;
  duration?: string;
  sessionType?: string;
  topic?: string;
  paymentMethod?: string;
  terms?: string;
}

type Field = keyof Omit<Errors, 'terms'>;

/* ── Validation rules ─────────────────────────────────────────────── */
const SL_PHONE_PREFIXES = ['070','071','072','074','075','076','077','078'];

const validateField = (field: Field, value: string, formData: FormData): string | undefined => {
  switch (field) {

    case 'studentName':
      if (!value.trim())                       return 'Full name is required.';
      if (value.trim().length < 3)             return 'Name must be at least 3 characters.';
      if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Name can only contain letters and spaces.';
      break;

    case 'studentId':
      if (!value.trim()) return 'Student ID is required.';
      if (!/^[a-zA-Z]{2}\d{8}$/.test(value.trim()))
        return 'Must be 2 letters + 8 digits  (e.g. IT22156700)';
      break;

    case 'email':
      if (!value.trim()) return 'SLIIT email is required.';
      if (!/^[a-zA-Z]{2}\d{8}@my\.sliit\.lk$/.test(value.trim()))
        return 'Use your SLIIT email  (e.g. it22156700@my.sliit.lk)';
      // Email prefix must match Student ID prefix
      if (formData.studentId && /^[a-zA-Z]{2}\d{8}$/.test(formData.studentId.trim())) {
        const idPrefix = formData.studentId.trim().toLowerCase();
        const emailPrefix = value.trim().toLowerCase().split('@')[0];
        if (idPrefix !== emailPrefix)
          return 'Email must match your Student ID  (e.g. it22156700@my.sliit.lk)';
      }
      break;

    case 'phone':
      if (!value.trim()) return 'Phone number is required.';
      if (!/^\d{10}$/.test(value.trim())) return 'Enter a valid 10-digit Sri Lankan phone number.';
      if (!SL_PHONE_PREFIXES.some(p => value.trim().startsWith(p)))
        return `Must start with a valid prefix: ${SL_PHONE_PREFIXES.join(', ')}`;
      break;

    case 'duration':
      if (!value) return 'Please select a session duration.';
      break;

    case 'sessionType':
      if (!value) return 'Please select a session type.';
      break;

    case 'topic':
      if (!value.trim())                return 'Please describe what you need help with.';
      if (value.trim().length < 10)     return `Too short — ${10 - value.trim().length} more characters needed.`;
      if (value.trim().length > 500)    return 'Topic must be under 500 characters.';
      break;

    case 'paymentMethod':
      if (!value) return 'Please select a payment method.';
      break;
  }
};

export default function BookingFormPage() {
  const router      = useRouter();
  const searchParams = useSearchParams();

  const tutorId = Number(searchParams?.get('tutorId')) || 1;
  const slot    = searchParams?.get('slot') || 'Mon 10:00 AM';
  const tutor   = TUTORS[tutorId] || TUTORS[1];

  const [formData, setFormData] = useState<FormData>({
    studentName: '', studentId: '', email: '', phone: '',
    duration: '', sessionType: '', topic: '', notes: '', paymentMethod: '',
  });
  const [errors,        setErrors]        = useState<Errors>({});
  const [touched,       setTouched]       = useState<Record<string, boolean>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [topicLen,      setTopicLen]      = useState(0);

  const hourlyRate  = tutor.hourlyRate;
  const hours       = formData.duration ? Number(formData.duration) : 0;
  const subtotal    = hourlyRate * hours;
  const platformFee = Math.round(subtotal * 0.05);
  const total       = subtotal + platformFee;

  /* ── Update a field + live validate ──────────────────────────── */
  const update = (field: Field, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (field === 'topic') setTopicLen(value.trim().length);

    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value, updated) }));
    }
    // Re-validate email when studentId changes (and vice versa)
    if (field === 'studentId' && touched.email) {
      setErrors(prev => ({ ...prev, email: validateField('email', updated.email, updated) }));
    }
    if (field === 'email' && touched.studentId) {
      setErrors(prev => ({ ...prev, studentId: validateField('studentId', updated.studentId, updated) }));
    }
  };

  const handleBlur = (field: Field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field], formData) }));
  };

  /* ── Run all validations on submit ───────────────────────────── */
  const runAll = (): boolean => {
    const fields: Field[] = ['studentName','studentId','email','phone','duration','sessionType','topic','paymentMethod'];
    const newErrors: Errors = {};
    const newTouched: Record<string, boolean> = {};

    fields.forEach(f => {
      newTouched[f] = true;
      const err = validateField(f, formData[f], formData);
      if (err) newErrors[f] = err;
    });

    if (!agreedToTerms) newErrors.terms = 'You must agree to the Terms & Conditions to proceed.';

    setTouched(newTouched);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runAll()) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    localStorage.setItem('lastBooking', JSON.stringify({
      tutorId: tutor.id, tutorName: tutor.name, subject: tutor.subject,
      slot, ...formData, total, status: 'PENDING',
    }));
    router.push('/tutor-booking/confirmation');
  };

  /* ── Demo fill ────────────────────────────────────────────────── */
  const handleDemoFill = () => {
    const demo: FormData = {
      studentName: 'Ishan Ekanayaka',
      studentId:   'IT22156700',
      email:       'it22156700@my.sliit.lk',
      phone:       '0771234567',
      duration:    '2',
      sessionType: 'online',
      topic:       'Binary Trees and Graph Algorithms for upcoming exam.',
      notes:       'I need help with BFS and DFS implementations.',
      paymentMethod: 'card',
    };
    setFormData(demo);
    setTopicLen(demo.topic.trim().length);
    setAgreedToTerms(true);
    setErrors({});
    setTouched({
      studentName: true, studentId: true, email: true, phone: true,
      duration: true, sessionType: true, topic: true, paymentMethod: true,
    });
  };

  /* ── Field styling ────────────────────────────────────────────── */
  const fc = (field: Field) => {
    const base = 'w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300 transition-all border';
    if (!touched[field])  return `${base} border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100`;
    if (errors[field])    return `${base} border-red-400 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100`;
    return `${base} border-emerald-400 bg-emerald-50/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100`;
  };

  const Badge = ({ field }: { field: Field }) =>
    touched[field] && !errors[field] ? (
      <span className="text-[10px] font-black text-emerald-500">Valid</span>
    ) : null;

  const ErrMsg = ({ field }: { field: Field | 'terms' }) =>
    errors[field] ? (
      <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-1 flex items-center gap-1">
        <span>⚠</span> {errors[field]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Demo fill button */}
      <button
        onClick={handleDemoFill}
        className="fixed bottom-8 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all hover:scale-105"
      >
        Demo Fill
      </button>

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-indigo-200 text-sm font-bold mb-6 flex items-center gap-2 hover:text-white transition-colors"
          >
            ← Back to Profile
          </button>
          <h1 className="text-3xl font-black text-white mb-2">Book a Session</h1>
          <p className="text-indigo-200 font-medium">Complete the form below to confirm your booking.</p>

          <div className="mt-6 bg-white/15 backdrop-blur rounded-3xl p-5 border border-white/20 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center font-black text-white text-lg">
              {tutor.avatar}
            </div>
            <div className="flex-1">
              <p className="font-black text-white">{tutor.name}</p>
              <p className="text-indigo-200 text-sm">{tutor.subject}</p>
            </div>
            <div className="text-right">
              <p className="text-yellow-300 font-black">{slot}</p>
              <p className="text-indigo-200 text-sm">Rs. {hourlyRate.toLocaleString()} / hr</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* ── Section 1: Student Details ──────────────────────── */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-black">1</span>
              Student Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name *</label>
                  <Badge field="studentName" />
                </div>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={formData.studentName}
                  onChange={e => update('studentName', e.target.value)}
                  onBlur={() => handleBlur('studentName')}
                  className={fc('studentName')}
                />
                <ErrMsg field="studentName" />
              </div>

              {/* Student ID */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student ID *</label>
                  <Badge field="studentId" />
                </div>
                <input
                  type="text"
                  placeholder="IT22156700"
                  value={formData.studentId}
                  onChange={e => update('studentId', e.target.value.toUpperCase())}
                  onBlur={() => handleBlur('studentId')}
                  maxLength={10}
                  className={`${fc('studentId')} font-mono tracking-widest`}
                />
                {!formData.studentId && (
                  <p className="text-[10px] font-bold mt-1.5 ml-1 text-slate-400">
                    <span className="text-amber-500">2 letters</span> + <span className="text-sky-500">8 digits</span>
                    <span className="text-slate-300"> · e.g. </span>
                    <span className="text-indigo-400 font-mono">IT22156700</span>
                  </p>
                )}
                <ErrMsg field="studentId" />
              </div>

              {/* SLIIT Email */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">SLIIT Email *</label>
                  <Badge field="email" />
                </div>
                <input
                  type="text"
                  placeholder="it22156700@my.sliit.lk"
                  value={formData.email}
                  onChange={e => update('email', e.target.value.toLowerCase())}
                  onBlur={() => handleBlur('email')}
                  className={fc('email')}
                />
                {!formData.email && (
                  <p className="text-[10px] font-bold mt-1.5 ml-1 text-slate-400">
                    Must match Student ID + <span className="text-indigo-500">@my.sliit.lk</span>
                  </p>
                )}
                <ErrMsg field="email" />
              </div>

              {/* Phone */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number *</label>
                  <Badge field="phone" />
                </div>
                <input
                  type="tel"
                  placeholder="077XXXXXXX"
                  value={formData.phone}
                  onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onBlur={() => handleBlur('phone')}
                  maxLength={10}
                  className={fc('phone')}
                />
                {!formData.phone && (
                  <p className="text-[10px] font-bold mt-1.5 ml-1 text-slate-400">
                    10 digits · starts with <span className="text-indigo-500">070–078</span>
                  </p>
                )}
                <ErrMsg field="phone" />
              </div>
            </div>
          </div>

          {/* ── Section 2: Session Details ──────────────────────── */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-black">2</span>
              Session Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Duration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Duration *</label>
                  <Badge field="duration" />
                </div>
                <select
                  value={formData.duration}
                  onChange={e => update('duration', e.target.value)}
                  onBlur={() => handleBlur('duration')}
                  className={fc('duration')}
                >
                  <option value="">Select duration</option>
                  <option value="1">1 Hour — Rs. {hourlyRate.toLocaleString()}</option>
                  <option value="2">2 Hours — Rs. {(hourlyRate * 2).toLocaleString()}</option>
                  <option value="3">3 Hours — Rs. {(hourlyRate * 3).toLocaleString()}</option>
                </select>
                <ErrMsg field="duration" />
              </div>

              {/* Session Type */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Session Type *</label>
                  <Badge field="sessionType" />
                </div>
                <select
                  value={formData.sessionType}
                  onChange={e => update('sessionType', e.target.value)}
                  onBlur={() => handleBlur('sessionType')}
                  className={fc('sessionType')}
                >
                  <option value="">Select type</option>
                  <option value="online">Online (Google Meet)</option>
                  <option value="physical">Physical (SLIIT Campus)</option>
                </select>
                <ErrMsg field="sessionType" />
              </div>
            </div>

            {/* Topic */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Topic / What Do You Need Help With? *
                </label>
                <span className={`text-[10px] font-black tabular-nums ${
                  topicLen > 500 ? 'text-red-500' : topicLen >= 10 ? 'text-emerald-500' : 'text-slate-400'
                }`}>
                  {topicLen} / 500
                </span>
              </div>
              <textarea
                placeholder="Describe the topic or problem you need help with..."
                rows={3}
                value={formData.topic}
                onChange={e => update('topic', e.target.value)}
                onBlur={() => handleBlur('topic')}
                className={`${fc('topic')} resize-none`}
              />
              {/* Min length progress bar */}
              {formData.topic && topicLen < 10 && (
                <div className="mt-1.5 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full transition-all duration-300"
                    style={{ width: `${(topicLen / 10) * 100}%` }}
                  />
                </div>
              )}
              <ErrMsg field="topic" />
            </div>

            {/* Notes (optional) */}
            <div className="mt-5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">
                Additional Notes <span className="font-medium normal-case tracking-normal text-slate-300">(Optional)</span>
              </label>
              <textarea
                placeholder="Any special requirements or questions..."
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              />
            </div>
          </div>

          {/* ── Section 3: Payment ──────────────────────────────── */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-black">3</span>
              Payment Method
            </h2>

            <div className="grid grid-cols-3 gap-3 mb-2">
              {[
                { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
                { value: 'bank', label: 'Bank Transfer',       icon: '🏦' },
                { value: 'cash', label: 'Cash on Session',     icon: '💵' },
              ].map(method => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => {
                    update('paymentMethod', method.value);
                    setTouched(prev => ({ ...prev, paymentMethod: true }));
                  }}
                  className={`p-4 rounded-2xl border-2 text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    formData.paymentMethod === method.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                      : errors.paymentMethod && touched.paymentMethod
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200 bg-slate-50 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{method.icon}</div>
                  <p className={`text-[10px] font-black leading-tight ${
                    formData.paymentMethod === method.value ? 'text-indigo-600' : 'text-slate-500'
                  }`}>
                    {method.label}
                  </p>
                </button>
              ))}
            </div>
            <ErrMsg field="paymentMethod" />

            {/* Price breakdown */}
            {hours > 0 && (
              <div className="mt-6 bg-slate-50 rounded-2xl p-5 space-y-2 border border-slate-100">
                <div className="flex justify-between text-sm font-bold text-slate-600">
                  <span>Session ({hours}hr × Rs. {hourlyRate.toLocaleString()})</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-400">
                  <span>Platform Fee (5%)</span>
                  <span>Rs. {platformFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900">
                  <span>Total</span>
                  <span className="text-indigo-600 text-lg">Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Section 4: Terms & Submit ───────────────────────── */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">

            <label className={`flex items-start gap-3 cursor-pointer mb-2 p-4 rounded-2xl border-2 transition-all ${
              errors.terms
                ? 'border-red-300 bg-red-50'
                : agreedToTerms
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-200 hover:border-indigo-300'
            }`}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={e => {
                  setAgreedToTerms(e.target.checked);
                  if (e.target.checked) setErrors(prev => ({ ...prev, terms: undefined }));
                  else setErrors(prev => ({ ...prev, terms: 'You must agree to the Terms & Conditions to proceed.' }));
                }}
                className="mt-0.5 w-4 h-4 accent-indigo-600 flex-shrink-0"
              />
              <span className="text-sm font-bold text-slate-600 leading-relaxed">
                I agree to the{' '}
                <span className="text-indigo-600 underline cursor-pointer">Terms & Conditions</span>
                {' '}and understand that cancellations must be made at least 2 hours before the session.
              </span>
            </label>
            <ErrMsg field="terms" />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-3 mt-5 ${
                loading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:scale-[1.01]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-4 border-slate-300 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm Booking${hours > 0 ? ` — Rs. ${total.toLocaleString()}` : ''}`
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}