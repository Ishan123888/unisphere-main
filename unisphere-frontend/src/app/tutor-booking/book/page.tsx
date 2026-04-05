'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
  agreeTerms: boolean;
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
  agreeTerms?: string;
}

const validate = (field: string, value: string | boolean, form: FormData): string | undefined => {
  switch (field) {
    case 'studentName':
      if (!String(value).trim()) return 'Full name is required';
      if (String(value).trim().length < 3) return 'At least 3 characters';
      if (!/^[A-Za-z\s]+$/.test(String(value))) return 'Letters only';
      break;
    case 'studentId':
      if (!String(value).trim()) return 'Student ID is required';
      if (!/^[a-zA-Z]{2}\d{8}$/.test(String(value).trim()))
        return '2 letters + 8 digits (e.g. IT22100001)';
      break;
    case 'email':
      if (!String(value).trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) return 'Invalid email address';
      break;
    case 'phone':
      if (String(value).trim() && !/^[\d\s\+\-]{9,15}$/.test(String(value)))
        return 'Invalid phone number';
      break;
    case 'duration':
      if (!value) return 'Please select duration';
      break;
    case 'sessionType':
      if (!value) return 'Please select session type';
      break;
    case 'topic':
      if (!String(value).trim()) return 'Please describe what you need help with';
      if (String(value).trim().length < 10) return 'At least 10 characters';
      break;
    case 'agreeTerms':
      if (!value) return 'You must agree to the terms';
      break;
  }
};

const validateAll = (form: FormData): Errors => {
  const e: Errors = {};
  const fields: (keyof Errors)[] = ['studentName','studentId','email','duration','sessionType','topic','agreeTerms'];
  fields.forEach(f => {
    const msg = validate(f, form[f as keyof FormData] as string | boolean, form);
    if (msg) (e as any)[f] = msg;
  });
  return e;
};

function BookingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tutorId    = searchParams.get('tutorId')    || '';
  const tutorName  = searchParams.get('tutorName')  || 'Expert Tutor';
  const subject    = searchParams.get('subject')    || 'Session';
  const avatar     = searchParams.get('avatar')     || 'TU';
  const slot       = searchParams.get('slot')       || 'Mon 10:00 AM';
  const hourlyRate = Number(searchParams.get('hourlyRate')) || 2500;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    studentName: '', studentId: '', email: '', phone: '',
    duration: '', sessionType: '', topic: '', notes: '',
    paymentMethod: 'card', agreeTerms: false,
  });
  const [errors,  setErrors]  = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ✅ Auto-fill from localStorage
  useEffect(() => {
    const username = localStorage.getItem('username') || '';
    setForm(prev => ({
      ...prev,
      studentId: username,
      email: username ? `${username}@my.sliit.lk` : '',
    }));
  }, []);

  const hours    = form.duration ? Number(form.duration) : 0;
  const subtotal = hourlyRate * hours;
  const fee      = Math.round(subtotal * 0.05);
  const total    = subtotal + fee;

  const update = (field: string, value: string | boolean) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validate(field, value, updated) }));
    }
  };

  const blur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validate(field, form[field as keyof FormData] as string | boolean, form) }));
  };

  const demoFill = () => {
    const username = localStorage.getItem('username') || 'it24100001';
    setForm({
      studentName: 'Ishan Ekanayaka',
      studentId: username,
      email: `${username}@my.sliit.lk`,
      phone: '0771234567',
      duration: '1',
      sessionType: 'online',
      topic: 'Need help understanding database normalization and SQL query optimization techniques.',
      notes: 'Please focus on practical examples with real datasets.',
      paymentMethod: 'card',
      agreeTerms: true,
    });
    setErrors({});
    setTouched({});
  };

  const nextStep = () => {
    const step1Fields = ['studentName', 'studentId', 'email'];
    const e: Errors = {};
    step1Fields.forEach(f => {
      const msg = validate(f, form[f as keyof FormData] as string, form);
      if (msg) (e as any)[f] = msg;
    });
    setTouched(prev => ({ ...prev, studentName: true, studentId: true, email: true }));
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allErrors = validateAll(form);
    setErrors(allErrors);
    setTouched(Object.fromEntries(Object.keys(form).map(k => [k, true])));
    if (Object.keys(allErrors).length > 0) return;

    setLoading(true);
    setSubmitError('');

    // Parse slot time
    let timePart = '10:00:00';
    const timeMatch = slot.match(/(\d{1,2}):(\d{2})/);
    const isPM = slot.toLowerCase().includes('pm');
    if (timeMatch) {
      let hrs = parseInt(timeMatch[1]);
      const mins = timeMatch[2];
      if (isPM && hrs !== 12) hrs += 12;
      if (!isPM && hrs === 12) hrs = 0;
      timePart = `${hrs.toString().padStart(2, '0')}:${mins}:00`;
    }

    const today = new Date();
    today.setDate(today.getDate() + 3);
    const dateStr = today.toISOString().split('T')[0];

    const payload = {
      studentId:       1,
      studentName:     form.studentName,
      studentUsername: form.studentId.toLowerCase(),
      tutorId:         Number(tutorId),
      tutorName:       tutorName,
      tutorAvatar:     avatar,
      subject:         subject,
      slot:            slot,
      date:            dateStr,
      scheduledSlot:   `${dateStr}T${timePart}`,
      duration:        `${form.duration} Hour${Number(form.duration) > 1 ? 's' : ''}`,
      sessionType:     form.sessionType.charAt(0).toUpperCase() + form.sessionType.slice(1),
      topic:           form.topic,
      notes:           form.notes || 'No additional notes',
      paymentMethod:   form.paymentMethod,
      totalPrice:      total,
      status:          'PENDING',
    };

    try {
      const res = await fetch('http://localhost:8081/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        localStorage.setItem('lastBooking', JSON.stringify(result));
        router.push('/tutor-booking/confirmation');
      } else {
        setSubmitError(result.message || 'Booking failed. Please try again.');
      }
    } catch {
      setSubmitError('Cannot connect to server. Make sure booking service is running on port 8081.');
    } finally {
      setLoading(false);
    }
  };

  // Field component
  const Field = ({ label, error, required, children }: {
    label: string; error?: string; required?: boolean; children: React.ReactNode;
  }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-xs font-bold flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );

  const inputCls = (field: string) =>
    `w-full px-4 py-3.5 rounded-2xl border-2 text-sm font-semibold text-slate-800 outline-none transition-all bg-white
    ${touched[field] && errors[field as keyof Errors]
      ? 'border-red-300 bg-red-50'
      : touched[field] && !errors[field as keyof Errors]
      ? 'border-emerald-400'
      : 'border-slate-200 focus:border-indigo-400 hover:border-slate-300'}`;

  const PAYMENT_OPTIONS = [
    { value: 'card',     label: 'Credit / Debit Card', icon: '💳' },
    { value: 'bank',     label: 'Bank Transfer',        icon: '🏦' },
    { value: 'cash',     label: 'Cash on Session',      icon: '💵' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 pb-20">

      {/* Demo Fill */}
      <button
        type="button" onClick={demoFill}
        className="fixed bottom-8 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 hover:scale-105 transition-all"
      >
        ⚡ Demo Fill
      </button>

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-6 py-10 text-white">
        <div className="max-w-2xl mx-auto">
          <button type="button" onClick={() => router.back()}
            className="text-indigo-200 text-sm font-bold mb-6 hover:text-white transition-colors flex items-center gap-1">
            ← Back to Profile
          </button>
          <h1 className="text-3xl font-black mb-1">Book a Session</h1>
          <p className="text-indigo-200 text-sm font-medium mb-6">Complete the form below to confirm your booking</p>

          {/* Tutor Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/20 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center font-black text-xl border border-white/30">
              {avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-lg leading-tight">{tutorName}</p>
              <p className="text-indigo-200 text-sm font-medium">{subject}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-yellow-300 font-black text-sm">{slot}</p>
              <p className="text-indigo-200 text-xs font-bold mt-0.5">Rs. {hourlyRate.toLocaleString()} / hr</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-3 mt-6">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step >= s ? 'bg-white text-indigo-700' : 'bg-white/20 text-white/60'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`text-xs font-bold ${step >= s ? 'text-white' : 'text-white/40'}`}>
                  {s === 1 ? 'Your Details' : 'Session & Payment'}
                </span>
                {s < 2 && <div className={`w-12 h-0.5 rounded-full ${step > s ? 'bg-white' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} noValidate>

          {/* ── STEP 1: Student Details ── */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-sm font-black">1</div>
                  <div>
                    <h2 className="font-black text-slate-900">Your Details</h2>
                    <p className="text-slate-400 text-xs font-medium">Tell us who you are</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <Field label="Full Name" error={errors.studentName} required>
                    <input
                      type="text"
                      value={form.studentName}
                      onChange={e => update('studentName', e.target.value)}
                      onBlur={() => blur('studentName')}
                      placeholder="Kasun Perera"
                      className={inputCls('studentName')}
                    />
                  </Field>

                  <Field label="Student ID (Username)" error={errors.studentId} required>
                    <input
                      type="text"
                      value={form.studentId}
                      onChange={e => update('studentId', e.target.value.toLowerCase())}
                      onBlur={() => blur('studentId')}
                      placeholder="it24100001"
                      className={`${inputCls('studentId')} font-mono tracking-widest`}
                    />
                    {!errors.studentId && (
                      <p className="text-[10px] text-slate-400 font-bold mt-1">
                        Format: <span className="text-amber-500">2 letters</span> + <span className="text-sky-500">8 digits</span>
                      </p>
                    )}
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Email Address" error={errors.email} required>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => update('email', e.target.value)}
                        onBlur={() => blur('email')}
                        placeholder="it24100001@my.sliit.lk"
                        className={inputCls('email')}
                      />
                    </Field>
                    <Field label="Phone (Optional)" error={errors.phone}>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => update('phone', e.target.value)}
                        onBlur={() => blur('phone')}
                        placeholder="+94 77 123 4567"
                        className={inputCls('phone')}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <button
                type="button" onClick={nextStep}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-base hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Continue to Session Details →
              </button>
            </div>
          )}

          {/* ── STEP 2: Session + Payment ── */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

              {/* Session Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-sm font-black">2</div>
                  <div>
                    <h2 className="font-black text-slate-900">Session Details</h2>
                    <p className="text-slate-400 text-xs font-medium">Configure your session</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Duration" error={errors.duration} required>
                      <select
                        value={form.duration}
                        onChange={e => update('duration', e.target.value)}
                        onBlur={() => blur('duration')}
                        className={inputCls('duration')}
                      >
                        <option value="">Select duration</option>
                        <option value="1">1 Hour</option>
                        <option value="2">2 Hours</option>
                        <option value="3">3 Hours</option>
                      </select>
                    </Field>

                    <Field label="Session Type" error={errors.sessionType} required>
                      <select
                        value={form.sessionType}
                        onChange={e => update('sessionType', e.target.value)}
                        onBlur={() => blur('sessionType')}
                        className={inputCls('sessionType')}
                      >
                        <option value="">Select type</option>
                        <option value="online">💻 Online</option>
                        <option value="physical">📍 Physical</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="What do you need help with?" error={errors.topic} required>
                    <textarea
                      value={form.topic}
                      onChange={e => update('topic', e.target.value)}
                      onBlur={() => blur('topic')}
                      placeholder="Describe the topic, specific areas you're struggling with, or learning goals..."
                      rows={4}
                      className={`${inputCls('topic')} resize-none`}
                    />
                    <p className="text-[10px] text-slate-300 font-bold text-right">{form.topic.length} chars</p>
                  </Field>

                  <Field label="Additional Notes (Optional)">
                    <textarea
                      value={form.notes}
                      onChange={e => update('notes', e.target.value)}
                      placeholder="Any special requests, preferred teaching style, materials needed..."
                      rows={3}
                      className={`${inputCls('notes')} resize-none`}
                    />
                  </Field>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-900 mb-4">Payment Method</h3>
                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('paymentMethod', opt.value)}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        form.paymentMethod === opt.value
                          ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                          : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <p className="text-2xl mb-1">{opt.icon}</p>
                      <p className={`text-[10px] font-black leading-tight ${
                        form.paymentMethod === opt.value ? 'text-indigo-700' : 'text-slate-500'
                      }`}>{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-900 mb-5">Booking Summary</h3>

                {/* Details */}
                <div className="bg-slate-50 rounded-2xl p-5 mb-5 space-y-3">
                  {[
                    { label: 'Tutor',    value: tutorName },
                    { label: 'Subject',  value: subject   },
                    { label: 'Slot',     value: slot      },
                    { label: 'Duration', value: form.duration ? `${form.duration} Hour${Number(form.duration) > 1 ? 's' : ''}` : '—' },
                    { label: 'Type',     value: form.sessionType ? (form.sessionType === 'online' ? '💻 Online' : '📍 Physical') : '—' },
                    { label: 'Payment',  value: PAYMENT_OPTIONS.find(p => p.value === form.paymentMethod)?.label || '—' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wide">{row.label}</span>
                      <span className="text-sm font-bold text-slate-700">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                {hours > 0 && (
                  <div className="space-y-2 mb-5">
                    <div className="flex justify-between text-sm font-bold text-slate-500">
                      <span>Rs. {hourlyRate.toLocaleString()} × {hours} hr{hours > 1 ? 's' : ''}</span>
                      <span>Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-400">
                      <span>Platform fee (5%)</span>
                      <span>Rs. {fee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-black text-lg text-indigo-600 pt-3 border-t border-slate-200">
                      <span>Total</span>
                      <span>Rs. {total.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer mb-5">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={form.agreeTerms}
                      onChange={e => update('agreeTerms', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      form.agreeTerms ? 'bg-indigo-600 border-indigo-600' : errors.agreeTerms ? 'border-red-400' : 'border-slate-300'
                    }`}>
                      {form.agreeTerms && <span className="text-white text-xs font-black">✓</span>}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 leading-relaxed">
                    I agree to the UniSphere{' '}
                    <span className="text-indigo-600 font-bold">Terms of Service</span> and{' '}
                    <span className="text-indigo-600 font-bold">Cancellation Policy</span>.
                    Cancellations must be made at least 2 hours before the session.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-red-500 text-xs font-bold mb-4 flex items-center gap-1">
                    <span>⚠</span> {errors.agreeTerms}
                  </p>
                )}

                {submitError && (
                  <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <p className="text-red-600 text-sm font-bold">{submitError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-black text-sm hover:border-slate-300 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || hours === 0}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-base hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                    ) : (
                      `Confirm Booking${total > 0 ? ` — Rs. ${total.toLocaleString()}` : ''}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function BookingFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    }>
      <BookingFormContent />
    </Suspense>
  );
}