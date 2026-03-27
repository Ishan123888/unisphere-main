'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Computer Science', 'Economics', 'Accounting',
  'Statistics', 'Business Studies', 'Web Technologies',
  'Data Structures & Algorithms', 'Database Management Systems',
  'Computer Networks', 'Software Engineering', 'Operating Systems',
];

const EXPERIENCE_OPTIONS = [
  { value: 'LESS_THAN_1', label: 'Less than 1 year' },
  { value: '1_TO_2',      label: '1 – 2 years'      },
  { value: '3_TO_5',      label: '3 – 5 years'      },
  { value: 'MORE_THAN_5', label: '5+ years'          },
];

const YEAR_OPTIONS = [
  { value: '1ST_YEAR', label: '1st Year' },
  { value: '2ND_YEAR', label: '2nd Year' },
  { value: '3RD_YEAR', label: '3rd Year' },
  { value: '4TH_YEAR', label: '4th Year' },
  { value: 'GRADUATE',  label: 'Graduate' },
  { value: 'POSTGRAD',  label: 'Postgraduate' },
];

// Suggested skill tags — tutor picks relevant ones (shown as pills on AI Explorer card)
const SUGGESTED_TAGS = [
  'React', 'Node.js', 'Spring Boot', 'Python', 'Java', 'C++', 'C#',
  'MySQL', 'MongoDB', 'Docker', 'AWS', 'DSA', 'TCP/IP', 'Cisco',
  'UML', 'Agile', 'SDLC', 'Calculus', 'Statistics', 'Discrete Math',
  'Oracle', 'NoSQL', 'Network+', 'Machine Learning', 'Flutter',
];

interface Step1Data {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

export default function TutorDetailsPage() {
  const router = useRouter();
  const [step1, setStep1]         = useState<Step1Data | null>(null);
  const [subjects, setSubjects]   = useState<string[]>([]);
  const [tags, setTags]           = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [form, setForm] = useState({
    phone:        '',
    university:   '',
    qualification:'',
    yearOfStudy:  '',
    experience:   '',
    hourlyRate:   '',
    sessionType:  'ONLINE',
    bio:          '',
  });
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [loading, setLoading]         = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('reg_step1');
    if (!raw) { router.replace('/register'); return; }
    const data = JSON.parse(raw) as Step1Data;
    if (data.role !== 'TUTOR') { router.replace('/register/student-details'); return; }
    setStep1(data);
  }, [router]);

  const toggleSubject = (s: string) => {
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setErrors(p => ({ ...p, subjects: '' }));
  };

  const toggleTag = (t: string) => {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !tags.includes(t) && tags.length < 6) {
      setTags(prev => [...prev, t]);
      setCustomTag('');
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.phone.trim())      e.phone       = 'Phone number is required';
    if (!form.university.trim()) e.university  = 'University / institution is required';
    if (!form.yearOfStudy)       e.yearOfStudy = 'Please select your year';
    if (!form.experience)        e.experience  = 'Please select experience level';
    if (!form.hourlyRate || isNaN(Number(form.hourlyRate)) || Number(form.hourlyRate) <= 0)
                                 e.hourlyRate  = 'Enter a valid hourly rate';
    if (subjects.length === 0)   e.subjects    = 'Select at least one subject';
    if (!form.bio.trim())        e.bio         = 'Short bio is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (!step1) return;

    setLoading(true);
    setSubmitError('');

    // Payload maps 1-to-1 with TutorCard fields on AI Explorer:
    // name        ← firstName + lastName
    // yearOfStudy ← "4th Year" badge on card
    // subject     ← subjects[0]  (primary subject line)
    // tags        ← skill pills on card (max 6)
    // bio         ← card bio text
    // hourlyRate  ← "Per Hour Rs. X"
    // sessionType ← Online/Physical badge
    // experience  ← AI match score weight (experience 10%)
    const payload = {
      firstName:     step1.firstName,
      lastName:      step1.lastName,
      email:         step1.email,
      username:      step1.username,
      password:      step1.password,
      role:          'TUTOR',
      phone:         form.phone,
      university:    form.university,
      qualification: form.qualification,
      yearOfStudy:   form.yearOfStudy,
      experience:    form.experience,
      hourlyRate:    Number(form.hourlyRate),
      subjectsRaw:   subjects,
      tagsRaw:       tags.slice(0, 6),
      sessionType:   form.sessionType,
      bio:           form.bio,
      status:        'PENDING_REVIEW',
    };

    try {
      const res = await fetch('http://localhost:8082/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Registration failed');
      }

      sessionStorage.removeItem('reg_step1');
      router.push('/register/success?role=tutor');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (key: string) =>
    `w-full px-4 py-3 rounded-xl border-2 text-sm font-medium bg-white text-slate-800 outline-none transition-all
     ${errors[key]
       ? 'border-red-300 bg-red-50'
       : 'border-slate-100 focus:border-indigo-400 hover:border-slate-200'}`;

  if (!step1) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 px-4 py-12">

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
          <p className="text-slate-500 text-sm font-medium mt-1">Set up your tutor profile</p>
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
            <span className="text-xs font-bold text-indigo-600">Tutor profile</span>
          </div>
        </div>

        {/* Welcome strip */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">📚</div>
          <div>
            <p className="text-white font-black text-sm">Hello, {step1.firstName}!</p>
            <p className="text-indigo-200 text-xs font-medium">Complete your tutor profile to start teaching</p>
          </div>
          <div className="ml-auto bg-amber-400 text-amber-900 text-xs font-black px-3 py-1 rounded-full">
            Pending review
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-8 border border-slate-100">

          {submitError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
              <span className="text-red-500 text-sm">⚠️</span>
              <p className="text-red-600 text-sm font-bold">{submitError}</p>
            </div>
          )}

          {/* ── Personal ── */}
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Personal details</p>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
            <input
              type="tel" placeholder="+94 7X XXX XXXX"
              value={form.phone}
              onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })); }}
              className={inputClass('phone')}
            />
            {errors.phone && <p className="text-red-500 text-xs font-bold mt-1">{errors.phone}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">University / Institution</label>
            <input
              type="text" placeholder="University of Moratuwa"
              value={form.university}
              onChange={e => { setForm(p => ({ ...p, university: e.target.value })); setErrors(p => ({ ...p, university: '' })); }}
              className={inputClass('university')}
            />
            {errors.university && <p className="text-red-500 text-xs font-bold mt-1">{errors.university}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Highest qualification</label>
            <input
              type="text" placeholder="BSc Computer Science (Hons)"
              value={form.qualification}
              onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))}
              className={inputClass('qualification')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Year of study
                <span className="ml-1 text-indigo-400 normal-case font-medium">(card badge)</span>
              </label>
              <select
                value={form.yearOfStudy}
                onChange={e => { setForm(p => ({ ...p, yearOfStudy: e.target.value })); setErrors(p => ({ ...p, yearOfStudy: '' })); }}
                className={inputClass('yearOfStudy')}
              >
                <option value="">Select...</option>
                {YEAR_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.yearOfStudy && <p className="text-red-500 text-xs font-bold mt-1">{errors.yearOfStudy}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Teaching experience</label>
              <select
                value={form.experience}
                onChange={e => { setForm(p => ({ ...p, experience: e.target.value })); setErrors(p => ({ ...p, experience: '' })); }}
                className={inputClass('experience')}
              >
                <option value="">Select...</option>
                {EXPERIENCE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.experience && <p className="text-red-500 text-xs font-bold mt-1">{errors.experience}</p>}
            </div>
          </div>

          {/* ── Teaching ── */}
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 mt-6 pt-5 border-t border-slate-100">
            Teaching details
          </p>

          {/* Subjects */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Subjects I can teach
              <span className="ml-1 text-indigo-400 normal-case font-medium">(used for AI match scoring)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(s => (
                <button key={s} type="button" onClick={() => toggleSubject(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all
                    ${subjects.includes(s)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-100 text-slate-500 hover:border-indigo-200'}`}>
                  {s}
                </button>
              ))}
            </div>
            {errors.subjects && <p className="text-red-500 text-xs font-bold mt-2">{errors.subjects}</p>}
          </div>

          {/* Skill tags */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Skill tags
              <span className="ml-1 text-indigo-400 normal-case font-medium">(pills on your tutor card · max 6)</span>
            </label>
            <p className="text-xs text-slate-400 mb-2">e.g. React, Java, MySQL — what students see on the card</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_TAGS.map(t => (
                <button key={t} type="button" onClick={() => toggleTag(t)}
                  disabled={!tags.includes(t) && tags.length >= 6}
                  className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-all
                    ${tags.includes(t)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-100 text-slate-400 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text" placeholder="Add custom skill..."
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                disabled={tags.length >= 6}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-100 text-xs font-medium
                  bg-white text-slate-800 outline-none focus:border-indigo-400 disabled:opacity-40"
              />
              <button type="button" onClick={addCustomTag}
                disabled={!customTag.trim() || tags.length >= 6}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black
                  hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-2 font-bold">CARD PREVIEW — skill pills:</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <span key={t}
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                      {t}
                      <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))}
                        className="text-indigo-400 hover:text-indigo-700 leading-none">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rate + session type */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Hourly rate (LKR)
                <span className="ml-1 text-indigo-400 normal-case font-medium">(card)</span>
              </label>
              <input
                type="number" placeholder="1500"
                value={form.hourlyRate}
                onChange={e => { setForm(p => ({ ...p, hourlyRate: e.target.value })); setErrors(p => ({ ...p, hourlyRate: '' })); }}
                className={inputClass('hourlyRate')}
              />
              {errors.hourlyRate && <p className="text-red-500 text-xs font-bold mt-1">{errors.hourlyRate}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Session type
                <span className="ml-1 text-indigo-400 normal-case font-medium">(badge)</span>
              </label>
              <select
                value={form.sessionType}
                onChange={e => setForm(p => ({ ...p, sessionType: e.target.value }))}
                className={inputClass('sessionType')}
              >
                <option value="ONLINE">Online only</option>
                <option value="PHYSICAL">In-person only</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Short bio
              <span className="ml-1 text-indigo-400 normal-case font-medium">(shown on card)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Tell students about your teaching style, experience, and what makes you a great tutor..."
              value={form.bio}
              onChange={e => { setForm(p => ({ ...p, bio: e.target.value })); setErrors(p => ({ ...p, bio: '' })); }}
              className={`${inputClass('bio')} resize-none`}
            />
            {errors.bio && <p className="text-red-500 text-xs font-bold mt-1">{errors.bio}</p>}
          </div>

          {/* Note */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <p className="text-amber-700 text-xs font-bold">
              📋 Your profile will be reviewed by our team within 24 hours before appearing on the AI Explorer.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="px-5 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-black text-sm
                hover:border-slate-300 hover:bg-slate-50 transition-all">
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-sm
                hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200
                disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : 'Submit for review'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}