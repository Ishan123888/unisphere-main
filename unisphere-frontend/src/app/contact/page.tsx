'use client';
import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/* ════════════════════════════════════════════════════════════════════
   EmailJS Configuration
   ─────────────────────────────────────────────────────────────────
   1. Go to https://www.emailjs.com and create a free account
   2. Add a Service (Gmail recommended) → copy Service ID
   3. Create an Email Template → copy Template ID
   4. Go to Account → copy Public Key
   Replace the 3 values below with your own:
════════════════════════════════════════════════════════════════════ */
const EMAILJS_SERVICE_ID  = 'service_h5tncpr';
const EMAILJS_TEMPLATE_ID = 'template_2eyuv9u';
const EMAILJS_PUBLIC_KEY  = 'RC_x_gkPkk7O6EeZQ';

/*
  EmailJS Template variables used (set these in your template):
  ┌─────────────────┬──────────────────────────────┐
  │ Variable        │ Value                        │
  ├─────────────────┼──────────────────────────────┤
  │ {{from_name}}   │ Sender's full name           │
  │ {{from_email}}  │ Sender's SLIIT email         │
  │ {{subject}}     │ Selected subject             │
  │ {{message}}     │ Message body                 │
  │ {{reply_to}}    │ Same as from_email           │
  └─────────────────┴──────────────────────────────┘
*/

/* ── Types ────────────────────────────────────────────────────────── */
interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

/* ── Validation helpers ───────────────────────────────────────────── */
const validateName = (name: string): string | undefined => {
  if (!name.trim())                          return 'Full name is required.';
  if (name.trim().length < 3)               return 'Name must be at least 3 characters.';
  if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) return 'Name can only contain letters and spaces.';
};

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return 'Email address is required.';
  if (!/^[a-zA-Z0-9._%+-]+@my\.sliit\.lk$/.test(email.trim()))
    return 'Only @my.sliit.lk student emails are accepted.';
};

const validateMessage = (message: string): string | undefined => {
  if (!message.trim())             return 'Message cannot be empty.';
  if (message.trim().length < 20)  return `Too short — ${20 - message.trim().length} more characters needed.`;
  if (message.trim().length > 1000) return 'Message must be under 1000 characters.';
};

/* ── Static data ──────────────────────────────────────────────────── */
const CONTACT_INFO = [
  { icon: '📍', label: 'Our Hub',      value: 'New Kandy Rd, Malabe',    sub: 'SLIIT Main Campus, Sri Lanka' },
  { icon: '📧', label: 'Email Us',     value: 'support@unisphere.lk',    sub: '24/7 Support for Students'    },
  { icon: '📞', label: 'Call Support', value: '+94 11 234 5678',          sub: 'Mon – Fri · 9 AM – 5 PM'     },
];

const SUBJECTS = [
  'General Inquiry',
  'Tutor Booking Support',
  'Marketplace Issue',
  'Study Lobby Help',
  'Account & Billing',
  'Bug Report',
  'Partnership',
];

const FAQS = [
  { q: 'How do I apply as a tutor?',              a: 'Sign up with your SLIIT email and submit your tutor application from your dashboard.' },
  { q: 'Are the sessions physical or online?',    a: 'Both! Tutors can offer in-person sessions on campus or virtual sessions via our platform.' },
  { q: 'Is it safe to trade in the marketplace?', a: 'Yes — all listings are verified by SLIIT email and transactions are escrow-protected.' },
  { q: 'How do payments work?',                   a: 'We use Stripe and local payment gateways. Funds are released after session confirmation.' },
];

/* ── Component ────────────────────────────────────────────────────── */
export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm]     = useState<FormState>({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [sendError, setSendError] = useState('');
  const [openFaq, setOpenFaq]     = useState<number | null>(null);

  /* ── Validation ───────────────────────────────────────────────── */
  const validateField = (field: keyof FormState, value: string) => {
    let err: string | undefined;
    if (field === 'name')    err = validateName(value);
    if (field === 'email')   err = validateEmail(value);
    if (field === 'message') err = validateMessage(value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSendError('');
    if (touched[field]) validateField(field, value);
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, form[field]);
  };

  const runAllValidations = (): boolean => {
    const newErrors: FormErrors = {
      name:    validateName(form.name),
      email:   validateEmail(form.email),
      message: validateMessage(form.message),
    };
    setErrors(newErrors);
    setTouched({ name: true, email: true, message: true });
    return !Object.values(newErrors).some(Boolean);
  };

  /* ── Submit — sends real email via EmailJS ─────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runAllValidations()) return;

    setPending(true);
    setSendError('');

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  form.name,
          from_email: form.email,
          reply_to:   form.email,
          subject:    form.subject,
          message:    form.message,
        },
        EMAILJS_PUBLIC_KEY
      );

      setSent(true);
    } catch (err: any) {
      console.error('EmailJS error:', err);
      setSendError(
        err?.text ||
        'Failed to send message. Please try again or email us directly at support@unisphere.lk'
      );
    } finally {
      setPending(false);
    }
  };

  const msgLen = form.message.trim().length;

  const fieldClass = (field: keyof FormErrors) => {
    if (!touched[field]) return 'border-white/10 focus:border-violet-500/60';
    if (errors[field])   return 'border-red-500/60 focus:border-red-500/80 bg-red-500/5';
    return 'border-emerald-500/50 focus:border-emerald-500/70';
  };

  return (
    <div className="min-h-screen bg-[#05050f] text-white selection:bg-violet-500/30">
      <Navbar />

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative pt-36 pb-24 overflow-hidden min-h-[420px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://i.imgur.com/bacrOw1.png"
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.28) saturate(1.1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#05050f]" />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/30 via-transparent to-indigo-900/20" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center w-full">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            Get In Touch
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
            We're here to{' '}
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              help you.
            </span>
          </h1>
          <p className="text-slate-300 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Have a question about tutor booking, the marketplace, or just want to say hi?
            Drop us a message and our team will get back to you within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {[
              { label: 'Avg Response Time', value: '< 2 hrs'  },
              { label: 'Support Days',      value: 'Mon – Fri' },
              { label: 'Student Queries',   value: '1,200+'   },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center px-6 py-3 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md">
                <span className="text-white font-black text-lg">{s.value}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ MAIN CONTENT ══════════════════ */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── LEFT: Contact Form ──────────────────────── */}
          <div className="lg:col-span-7">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl shadow-black/30">

              {/* Success state */}
              {sent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-6">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-5xl border border-emerald-500/20">
                    ✅
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Message Sent!</h3>
                    <p className="text-slate-400 font-medium">
                      We'll get back to you at{' '}
                      <span className="text-violet-400 font-black">{form.email}</span> soon.
                    </p>
                    <p className="text-slate-600 text-xs mt-2">
                      A copy has been sent to your inbox via EmailJS.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' });
                      setTouched({});
                      setErrors({});
                      setSendError('');
                    }}
                    className="px-8 py-3 rounded-2xl border border-white/10 text-slate-400 font-black text-sm hover:text-white hover:border-violet-500/40 transition-all"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">

                  {/* Send error banner */}
                  {sendError && (
                    <div className="px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                      <span className="text-red-400 flex-shrink-0 mt-0.5">⚠</span>
                      <p className="text-red-400 text-xs font-bold leading-relaxed">{sendError}</p>
                    </div>
                  )}

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Full Name */}
                    <div>
                      <label className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</span>
                        {touched.name && !errors.name && (
                          <span className="text-[10px] font-black text-emerald-400">✓ Looks good</span>
                        )}
                      </label>
                      <input
                        name="from_name"
                        type="text"
                        value={form.name}
                        onChange={e => handleChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder="Ishan Ekanayaka"
                        className={`w-full bg-white/[0.05] border rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none transition-all ${fieldClass('name')}`}
                      />
                      {touched.name && errors.name && (
                        <p className="text-red-400 text-[11px] font-bold mt-2 ml-1 flex items-center gap-1">
                          <span>⚠</span> {errors.name}
                        </p>
                      )}
                    </div>

                    {/* SLIIT Email */}
                    <div>
                      <label className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">SLIIT Student Email</span>
                        {touched.email && !errors.email && (
                          <span className="text-[10px] font-black text-emerald-400">✓ Verified</span>
                        )}
                      </label>
                      <input
                        name="from_email"
                        type="email"
                        value={form.email}
                        onChange={e => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        placeholder="it22xxxxxx@my.sliit.lk"
                        className={`w-full bg-white/[0.05] border rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none transition-all ${fieldClass('email')}`}
                      />
                      {!(touched.email && errors.email) && (
                        <p className="text-[10px] font-bold mt-2 ml-1 text-slate-600">
                          Must end with <span className="text-violet-400">@my.sliit.lk</span>
                        </p>
                      )}
                      {touched.email && errors.email && (
                        <p className="text-red-400 text-[11px] font-bold mt-2 ml-1 flex items-center gap-1">
                          <span>⚠</span> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2.5 ml-1">
                      Subject
                    </label>
                    <div className="relative">
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={e => handleChange('subject', e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-violet-500/60 appearance-none cursor-pointer transition-all"
                      >
                        {SUBJECTS.map(s => (
                          <option key={s} className="bg-[#0a0a1a] text-white">{s}</option>
                        ))}
                      </select>
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-xs">▼</span>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Your Message</span>
                      <span className={`text-[10px] font-black tabular-nums ${
                        msgLen > 1000 ? 'text-red-400' : msgLen >= 20 ? 'text-emerald-400' : 'text-slate-600'
                      }`}>
                        {msgLen} / 1000
                      </span>
                    </label>
                    <textarea
                      name="message"
                      rows={6}
                      value={form.message}
                      onChange={e => handleChange('message', e.target.value)}
                      onBlur={() => handleBlur('message')}
                      placeholder="How can we assist you today? Please be as detailed as possible..."
                      className={`w-full bg-white/[0.05] border rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none transition-all resize-none ${fieldClass('message')}`}
                    />
                    {touched.message && errors.message && (
                      <p className="text-red-400 text-[11px] font-bold mt-2 ml-1 flex items-center gap-1">
                        <span>⚠</span> {errors.message}
                      </p>
                    )}
                    {msgLen < 20 && msgLen > 0 && (
                      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500/60 rounded-full transition-all duration-300"
                          style={{ width: `${(msgLen / 20) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-violet-500/20 hover:scale-[1.02] hover:shadow-violet-500/40 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {pending ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>Send Message 🚀</>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-slate-600 font-medium">
                    🔒 Encrypted & secure. Only <span className="text-violet-500">@my.sliit.lk</span> addresses accepted.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* ── RIGHT: Info cards + Map ──────────────────── */}
          <div className="lg:col-span-5 space-y-5">
            {CONTACT_INFO.map(info => (
              <div key={info.label} className="group bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-7 hover:bg-white/[0.06] hover:border-violet-500/30 transition-all duration-300">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400 mb-0.5">{info.label}</p>
                    <p className="text-base font-black text-white leading-tight">{info.value}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{info.sub}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Map */}
            <div className="relative rounded-[2rem] overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40">
              <div className="absolute inset-0 bg-violet-900/20 pointer-events-none z-10" />
              <iframe
                title="SLIIT Malabe Campus"
                src="https://www.openstreetmap.org/export/embed.html?bbox=79.9680%2C6.9100%2C79.9800%2C6.9200&layer=mapnik&marker=6.91490%2C79.97400"
                className="w-full h-64 border-0 grayscale contrast-75 brightness-50"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-[#05050f]/90 backdrop-blur-md border border-violet-500/30 px-5 py-2.5 rounded-full shadow-2xl whitespace-nowrap">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                <span className="text-white font-black text-xs">SLIIT Main Campus · Malabe</span>
              </div>
              <a
                href="https://www.openstreetmap.org/?mlat=6.9149&mlon=79.9740#map=17/6.9149/79.9740"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#05050f]/80 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-300 hover:text-white hover:border-violet-500/40 transition-all"
              >
                Open Map ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ FAQ ══════════════════ */}
      <section className="py-28 border-t border-white/[0.04] bg-[#03030a]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-4">Support</p>
            <h2 className="text-4xl font-black">Common Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-7 py-5 text-left group"
                >
                  <span className="font-black text-sm text-slate-200 group-hover:text-white transition-colors">{faq.q}</span>
                  <span className={`text-violet-400 font-black text-lg transition-transform duration-300 flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40' : 'max-h-0'}`}>
                  <p className="px-7 pb-5 text-slate-400 text-sm font-medium leading-relaxed border-t border-white/[0.05] pt-4">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}