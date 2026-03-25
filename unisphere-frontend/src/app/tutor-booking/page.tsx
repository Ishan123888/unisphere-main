'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ── AI scoring ───────────────────────────────────────────────────
const AI_WEIGHTS = { subject: 0.40, rating: 0.25, availability: 0.15, experience: 0.10, price: 0.10 };

const calcAIScore = (tutor: any, search: string, maxPrice: number, availableOnly: boolean, subject: string) => {
  let subjectScore = 70;
  const tutorSubjects = (tutor.subjects || tutor.subject || '').toLowerCase();
  const tutorTags     = (tutor.tags || '').toLowerCase();

  if (subject !== 'All Subjects') {
    subjectScore = tutorSubjects.includes(subject.toLowerCase()) ? 100 : 0;
  } else if (search.trim()) {
    const q = search.toLowerCase();
    if (tutorSubjects.includes(q))  subjectScore = 100;
    else if (tutorTags.includes(q)) subjectScore = 85;
    else if ((tutor.bio || '').toLowerCase().includes(q)) subjectScore = 60;
    else {
      const hits = q.split(' ').filter((w: string) => tutorSubjects.includes(w) || tutorTags.includes(w)).length;
      subjectScore = hits > 0 ? (hits / q.split(' ').length) * 50 : 20;
    }
  }

  const rating         = tutor.rating   ?? 0;
  const reviews        = tutor.reviews  ?? 0;
  const sessions       = tutor.sessions ?? 0;
  const hourlyRate     = tutor.hourlyRate ?? 9999;
  const available      = tutor.available ?? true;

  const ratingScore       = Math.min(((rating - 3.0) / 2.0) * 100 + Math.min(reviews / 200 * 10, 10), 100);
  const availabilityScore = available ? 100 : (availableOnly ? 0 : 40);
  const experienceScore   = Math.min((sessions / 500) * 100, 100);
  let priceScore = 0;
  if (hourlyRate <= maxPrice) {
    const ratio = hourlyRate / maxPrice;
    priceScore  = ratio <= 0.5 ? 90 : ratio <= 0.7 ? 100 : ratio <= 0.9 ? 85 : 70;
  }

  const aiScore = Math.round(
    subjectScore * AI_WEIGHTS.subject + ratingScore * AI_WEIGHTS.rating +
    availabilityScore * AI_WEIGHTS.availability + experienceScore * AI_WEIGHTS.experience +
    priceScore * AI_WEIGHTS.price
  );

  const reasons: string[] = [];
  if (ratingScore >= 85 && rating > 0) reasons.push(`Top rated ${rating}★ (${reviews} reviews)`);
  if (available)                        reasons.push('Available for booking now');
  if (experienceScore >= 70)            reasons.push(`${sessions}+ sessions completed`);
  if (priceScore >= 90 && hourlyRate)   reasons.push(`Great value — Rs. ${hourlyRate.toLocaleString()}/hr`);
  if (subjectScore >= 85 && search)     reasons.unshift(`Strong match for "${search}"`);

  return {
    aiScore,
    reasons: reasons.slice(0, 3),
    breakdown: { subjectScore, ratingScore, availabilityScore, experienceScore, priceScore },
  };
};

const getMatchLabel = (score: number) => {
  if (score >= 85) return { label: 'Excellent Match', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (score >= 70) return { label: 'Good Match',      color: 'text-blue-600 bg-blue-50 border-blue-200' };
  if (score >= 50) return { label: 'Partial Match',   color: 'text-amber-600 bg-amber-50 border-amber-200' };
  return                   { label: 'Low Match',      color: 'text-slate-500 bg-slate-50 border-slate-200' };
};

// ── Tutor interface (maps to UserCredential fields) ───────────────
interface Tutor {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  subjects: string;
  tags: string;
  bio: string;
  yearOfStudy: string;
  experience: string;
  hourlyRate: number;
  sessionType: string;
  rating: number;
  reviews: number;
  sessions: number;
  available: boolean;
  status: string;
}

const YEAR_LABELS: Record<string, string> = {
  '1ST_YEAR': '1st Year', '2ND_YEAR': '2nd Year', '3RD_YEAR': '3rd Year',
  '4TH_YEAR': '4th Year', 'GRADUATE': 'Graduate',  'POSTGRAD': 'Postgraduate',
};

const SORT_OPTIONS = ['🤖 AI Match Score', 'Top Rated', 'Most Reviews', 'Price: Low to High', 'Price: High to Low'];

// ── AI system prompt ──────────────────────────────────────────────
const SYSTEM_PROMPT = `You are UniSphere AI Assistant — a helpful tutor booking assistant for SLIIT students.
You help students find the right tutor, understand the booking process, and learn about available tutors.
Platform info:
- All tutors are verified SLIIT students approved by admin
- Sessions: Online (Google Meet) or Physical (SLIIT Campus)
- Durations: 1, 2, or 3 hours
- Payment: Card, Bank Transfer, or Cash
- 5% platform fee applies
- Cancellations must be 2 hours before session
Keep responses concise and friendly.`;

// ── AI Chatbot ────────────────────────────────────────────────────
function AIChatBot() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant' as const, content: "Hi! 👋 I'm UniSphere AI. What subject are you looking for help with?" }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user' as const, content: userMsg }]);
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMsg }],
        }),
      });
      const data  = await response.json();
      const reply = data.content?.[0]?.text || 'Sorry, please try again.';
      setMessages(prev => [...prev, { role: 'assistant' as const, content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant' as const, content: 'Something went wrong. Please try again! 🙏' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-8 left-8 z-50 w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-full shadow-2xl shadow-violet-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
        {open
          ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
          : <span className="text-2xl">🤖</span>}
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"/>}
      </button>

      {open && (
        <div className="fixed bottom-28 left-8 z-50 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col" style={{ height: '480px' }}>
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl">🤖</div>
            <div className="flex-1">
              <p className="text-white font-black text-sm">UniSphere AI</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>
                <span className="text-white/70 text-[10px] font-bold">Online · Powered by Claude</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <div className="w-7 h-7 bg-violet-100 rounded-xl flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">🤖</div>}
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-violet-100 rounded-xl flex items-center justify-center text-sm mr-2">🤖</div>
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  {[0,150,300].map(d => <span key={d} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
          <div className="px-4 py-3 bg-white border-t border-slate-100 flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..." disabled={loading}
              className="flex-1 px-4 py-2.5 bg-slate-50 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-violet-400 placeholder:text-slate-300 border border-slate-200 disabled:opacity-50"/>
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              className="w-10 h-10 bg-violet-600 text-white rounded-2xl flex items-center justify-center hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-40 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function TutorExplorerPage() {
  const router = useRouter();

  const [tutors,        setTutors]        = useState<Tutor[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState('');
  const [subject,       setSubject]       = useState('All Subjects');
  const [sort,          setSort]          = useState('🤖 AI Match Score');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxPrice,      setMaxPrice]      = useState(5000);
  const [showAI,        setShowAI]        = useState(false);
  const [expandedId,    setExpandedId]    = useState<number | null>(null);

  // ── Fetch ACTIVE tutors from identity-service ─────────────────
  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8082/api/users/tutors/approved', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (!res.ok) throw new Error('Failed');
      const data: Tutor[] = await res.json();
      setTutors(data);
    } catch {
      setError('Could not load tutors from server. Showing demo data.');
      // Fallback demo data
      setTutors([
        { id: 1, username: 'it24100002', firstName: 'Kasun', lastName: 'Perera', email: 'it24100002@my.sliit.lk', subject: 'Computer Science', subjects: 'Computer Science,Mathematics', tags: 'Java,Python,DSA', bio: 'Test tutor bio.', yearOfStudy: '4TH_YEAR', experience: '1_TO_2', hourlyRate: 1500, sessionType: 'ONLINE', rating: 4.8, reviews: 95, sessions: 215, available: true, status: 'ACTIVE' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Build subject list dynamically from loaded tutors
  const subjectList = useMemo(() => {
    const all = new Set<string>();
    tutors.forEach(t => {
      (t.subjects || t.subject || '').split(',').forEach(s => { if (s.trim()) all.add(s.trim()); });
    });
    return ['All Subjects', ...Array.from(all).sort()];
  }, [tutors]);

  // ── Compute AI scores + filter + sort ─────────────────────────
  const results = useMemo(() => {
    let list = tutors.map(tutor => ({
      ...tutor,
      ...calcAIScore(tutor, search, maxPrice, availableOnly, subject),
    }));

    if (availableOnly) list = list.filter(t => t.available);
    if (subject !== 'All Subjects') {
      list = list.filter(t =>
        (t.subjects || t.subject || '').toLowerCase().includes(subject.toLowerCase())
      );
    }
    list = list.filter(t => (t.hourlyRate ?? 0) <= maxPrice);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
        (t.subjects || t.subject || '').toLowerCase().includes(q) ||
        (t.tags || '').toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case '🤖 AI Match Score':  list.sort((a, b) => b.aiScore - a.aiScore);      break;
      case 'Top Rated':          list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case 'Most Reviews':       list.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0)); break;
      case 'Price: Low to High': list.sort((a, b) => (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0)); break;
      case 'Price: High to Low': list.sort((a, b) => (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0)); break;
    }
    return list;
  }, [tutors, search, subject, sort, availableOnly, maxPrice]);

  // ── Helpers ───────────────────────────────────────────────────
  const getInitials = (t: Tutor) =>
    `${t.firstName?.[0] ?? ''}${t.lastName?.[0] ?? ''}`.toUpperCase();

  const getPrimarySubject = (t: Tutor) =>
    t.subject || (t.subjects || '').split(',')[0]?.trim() || '—';

  const getTagList = (t: Tutor): string[] =>
    (t.tags || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">

      <AIChatBot />

      <button onClick={() => { setSearch(''); setSubject('All Subjects'); setAvailableOnly(false); setShowAI(true); fetchTutors(); }}
        className="fixed bottom-8 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
        ⚡ Demo Fill
      </button>

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 px-6 py-14 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
            🤖 AI-Powered Matching · {tutors.filter(t => t.available).length} Available Now
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Find Your Perfect <span className="text-yellow-300">SLIIT Tutor</span>
          </h1>
          <p className="text-indigo-100 text-base font-medium mb-8">
            AI scores and ranks tutors by subject relevance, rating, availability, experience & price fit.
          </p>
          <div className="relative max-w-xl mx-auto">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, subject, or skill..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white text-slate-800 font-semibold text-sm shadow-2xl outline-none focus:ring-4 focus:ring-yellow-300/50 placeholder:text-slate-400"/>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3 items-center">
          <select value={subject} onChange={e => setSubject(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer">
            {subjectList.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer">
            {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
            <span className="text-xs font-black text-slate-500">Max:</span>
            <input type="range" min={500} max={10000} step={100} value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))} className="w-24 accent-indigo-600"/>
            <span className="text-sm font-black text-indigo-600">Rs. {maxPrice.toLocaleString()}</span>
          </div>
          <button onClick={() => setAvailableOnly(!availableOnly)}
            className={`px-4 py-2 rounded-xl text-sm font-black border transition-all ${availableOnly ? 'bg-green-500 text-white border-green-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-green-400'}`}>
            🟢 Available Now
          </button>
          <button onClick={() => setShowAI(!showAI)}
            className={`px-4 py-2 rounded-xl text-sm font-black border transition-all ${showAI ? 'bg-violet-600 text-white border-violet-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-400'}`}>
            🤖 AI Scores
          </button>
          <span className="ml-auto text-sm font-bold text-slate-400">
            {loading ? 'Loading...' : `${results.length} tutor${results.length !== 1 ? 's' : ''} found`}
          </span>
        </div>
      </div>

      {/* AI weights bar */}
      {showAI && (
        <div className="bg-violet-50 border-b border-violet-100 px-6 py-3">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-3 items-center text-xs">
            <span className="font-black text-violet-700">🤖 Scoring Weights:</span>
            {[
              { label: 'Subject Match', w: '40%', color: 'bg-violet-200 text-violet-800' },
              { label: 'Rating',        w: '25%', color: 'bg-indigo-200 text-indigo-800' },
              { label: 'Availability',  w: '15%', color: 'bg-green-200 text-green-800'   },
              { label: 'Experience',    w: '10%', color: 'bg-amber-200 text-amber-800'   },
              { label: 'Price Fit',     w: '10%', color: 'bg-rose-200 text-rose-800'     },
            ].map(f => (
              <span key={f.label} className={`px-3 py-1 rounded-full font-black ${f.color}`}>{f.label}: {f.w}</span>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <div className="px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <span>⚠️</span>
            <p className="text-amber-700 text-sm font-bold flex-1">{error}</p>
            <button onClick={fetchTutors} className="text-xs font-black text-amber-600 hover:text-amber-800 underline">Retry</button>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"/>
            <p className="font-black text-slate-700">Loading tutors...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-slate-700 mb-2">No Tutors Found</h3>
            <p className="text-slate-400 font-medium">Try adjusting your filters or ask our AI chatbot! 🤖</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((tutor, rank) => {
              const matchInfo  = getMatchLabel(tutor.aiScore);
              const isExpanded = expandedId === tutor.id;
              const tagList    = getTagList(tutor);
              const primarySub = getPrimarySubject(tutor);
              const initials   = getInitials(tutor);
              const yearLabel  = YEAR_LABELS[tutor.yearOfStudy] ?? tutor.yearOfStudy ?? '—';

              return (
                <div key={tutor.id}
                  onClick={() => router.push(`/tutor-booking/${tutor.id}`)}
                  className="bg-white rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden">

                  {showAI && (
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 text-xs font-black">#{rank + 1}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${matchInfo.color}`}>{matchInfo.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white/60 text-[10px]">AI Score</span>
                        <span className="text-white font-black">{tutor.aiScore}%</span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar — initials from registration */}
                        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-sm shadow-sm">
                          {initials}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-base leading-tight">
                            {tutor.firstName} {tutor.lastName}
                          </h3>
                          <p className="text-xs text-indigo-500 font-bold">{yearLabel}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${tutor.available ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                        {tutor.available ? '● Online' : '○ Busy'}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-700 mb-2">{primarySub}</p>
                    <p className="text-xs text-slate-400 font-medium mb-4 leading-relaxed line-clamp-2">{tutor.bio || '—'}</p>

                    {/* Skill tags from registration */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tagList.length > 0
                        ? tagList.map(tag => (
                            <span key={tag} className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">{tag}</span>
                          ))
                        : <span className="text-[10px] text-slate-300 font-medium">No tags</span>
                      }
                    </div>

                    {showAI && tutor.reasons.length > 0 && (
                      <div className="mb-3 bg-violet-50 rounded-2xl p-3 border border-violet-100">
                        <p className="text-[9px] font-black text-violet-500 uppercase tracking-widest mb-1.5">🤖 Why matched</p>
                        {tutor.reasons.map((r, i) => (
                          <p key={i} className="text-[10px] font-bold text-violet-700 flex items-center gap-1">
                            <span className="text-violet-400">✓</span> {r}
                          </p>
                        ))}
                      </div>
                    )}

                    {showAI && (
                      <button onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : tutor.id); }}
                        className="w-full text-[10px] font-black text-slate-400 hover:text-violet-600 transition-colors mb-2 text-left">
                        {isExpanded ? '▲ Score breakdown' : '▼ Score breakdown'}
                      </button>
                    )}

                    {showAI && isExpanded && (
                      <div className="mb-3 bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-100">
                        {[
                          { label: 'Subject',      score: tutor.breakdown.subjectScore,      color: 'bg-violet-500' },
                          { label: 'Rating',       score: tutor.breakdown.ratingScore,       color: 'bg-indigo-500' },
                          { label: 'Availability', score: tutor.breakdown.availabilityScore, color: 'bg-green-500'  },
                          { label: 'Experience',   score: tutor.breakdown.experienceScore,   color: 'bg-amber-500'  },
                          { label: 'Price Fit',    score: tutor.breakdown.priceScore,        color: 'bg-rose-500'   },
                        ].map(f => (
                          <div key={f.label}>
                            <div className="flex justify-between mb-0.5">
                              <span className="text-[10px] font-black text-slate-500">{f.label}</span>
                              <span className="text-[10px] font-black text-slate-700">{Math.round(f.score)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full ${f.color} rounded-full`} style={{ width: `${f.score}%` }}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-5 py-3 border-t border-slate-50">
                      {(tutor.rating ?? 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-sm">★</span>
                          <span className="text-sm font-black text-slate-800">{tutor.rating}</span>
                          <span className="text-xs text-slate-400 font-medium">({tutor.reviews})</span>
                        </div>
                      )}
                      {(tutor.sessions ?? 0) > 0 && (
                        <div className="text-xs text-slate-400 font-medium">🎓 {tutor.sessions} sessions</div>
                      )}
                      {(tutor.rating ?? 0) === 0 && (tutor.sessions ?? 0) === 0 && (
                        <div className="text-xs text-slate-300 font-medium">New tutor</div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-medium">Per Hour</span>
                        <p className="text-lg font-black text-indigo-600">
                          Rs. {(tutor.hourlyRate ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); router.push(`/tutor-booking/${tutor.id}`); }}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all group-hover:shadow-lg active:scale-95">
                        View Profile →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}