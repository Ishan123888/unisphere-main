'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// ── Tutor type (maps exactly to UserCredential entity) ────────────
interface Tutor {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  subject: string;
  subjects: string;
  tags: string;
  bio: string;
  yearOfStudy: string;
  experience: string;
  hourlyRate: number;
  sessionType: string;
  avatar: string;
  rating: number;
  reviews: number;
  sessions: number;
  available: boolean;
  qualification: string;
  university: string;
  phone: string;
}

const YEAR_LABELS: Record<string, string> = {
  '1ST_YEAR': '1st Year', '2ND_YEAR': '2nd Year', '3RD_YEAR': '3rd Year',
  '4TH_YEAR': '4th Year', 'GRADUATE': 'Graduate', 'POSTGRAD': 'Postgraduate',
};

// ── Helpers ───────────────────────────────────────────────────────
const getInitials = (t: Tutor) =>
  `${t.firstName?.[0] ?? ''}${t.lastName?.[0] ?? ''}`.toUpperCase();

const getTagList = (t: Tutor): string[] =>
  (t.tags || '').split(',').map(s => s.trim()).filter(Boolean);

const getPrimarySubject = (t: Tutor) =>
  t.subject || (t.subjects || '').split(',')[0]?.trim() || '—';

// ── Demo reviews (until review service is ready) ──────────────────
const DEMO_REVIEWS = [
  { name: 'Kasun S.',   rating: 5, comment: 'Excellent tutor! Very clear explanations.', date: 'Mar 2026' },
  { name: 'Dilki R.',   rating: 5, comment: 'Helped me pass my exam with distinction.',  date: 'Feb 2026' },
  { name: 'Tharaka M.', rating: 4, comment: 'Great session, would book again.',          date: 'Feb 2026' },
];

// ── Main Page ─────────────────────────────────────────────────────
export default function TutorProfilePage() {
  const params   = useParams();
  const router   = useRouter();
  const tutorId  = params?.tutorId;

  const [tutor,       setTutor]       = useState<Tutor | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [activeTab,   setActiveTab]   = useState<'about' | 'reviews' | 'slots'>('about');

  // ── Fetch tutor by ID from identity-service ───────────────────
  useEffect(() => {
    if (!tutorId) return;
    setLoading(true);
    setError('');

    fetch(`http://localhost:8082/api/users/tutors/${tutorId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Tutor not found');
        return res.json();
      })
      .then((data: Tutor) => {
        setTutor(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load tutor profile.');
        setLoading(false);
      });
  }, [tutorId]);

  // ── Derived values ────────────────────────────────────────────
  const slots = tutor ? [
    'Mon 10:00 AM', 'Mon 2:00 PM', 'Wed 11:00 AM',
    'Wed 3:00 PM',  'Fri 9:00 AM', 'Fri 1:00 PM',
  ] : [];

  const handleBook = () => {
    if (!selectedSlot || !tutor) {
      alert('Please select a time slot before booking.');
      return;
    }
    router.push(
      `/tutor-booking/book?tutorId=${tutor.id}&slot=${encodeURIComponent(selectedSlot)}&rate=${tutor.hourlyRate}`
    );
  };

  const handleDemoFill = () => {
    setSelectedSlot(slots[0]);
    setActiveTab('slots');
  };

  // ── Loading state ─────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"/>
        <p className="font-black text-slate-700">Loading profile...</p>
      </div>
    </div>
  );

  // ── Error state ───────────────────────────────────────────────
  if (error || !tutor) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-black text-slate-700 mb-2">Tutor Not Found</h3>
        <p className="text-slate-400 font-medium mb-6">{error || 'This tutor profile does not exist.'}</p>
        <button
          onClick={() => router.push('/tutor-booking')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black hover:bg-indigo-700 transition-all"
        >
          ← Back to Explorer
        </button>
      </div>
    </div>
  );

  const initials   = getInitials(tutor);
  const tagList    = getTagList(tutor);
  const primarySub = getPrimarySubject(tutor);
  const yearLabel  = YEAR_LABELS[tutor.yearOfStudy] ?? tutor.yearOfStudy ?? '—';

  const badges: string[] = [];
  if ((tutor.rating ?? 0) >= 4.5)   badges.push('Top Rated');
  if ((tutor.sessions ?? 0) >= 100)  badges.push('100+ Sessions');
  if (tutor.available)               badges.push('Available Now');

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Demo Button */}
      <button
        onClick={handleDemoFill}
        className="fixed bottom-8 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all hover:scale-105"
      >
        Demo Fill
      </button>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/tutor-booking')}
            className="text-indigo-200 text-sm font-bold mb-6 flex items-center gap-2 hover:text-white transition-colors"
          >
            ← Back to Explorer
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="w-28 h-28 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl border border-white/30 flex-shrink-0">
              {tutor.avatar || initials}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {badges.map(badge => (
                  <span key={badge} className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    {badge}
                  </span>
                ))}
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${tutor.available ? 'bg-green-400 text-green-900' : 'bg-slate-400 text-slate-100'}`}>
                  {tutor.available ? '● Available Now' : '○ Busy'}
                </span>
              </div>

              <h1 className="text-3xl font-black text-white mb-1">
                {tutor.firstName} {tutor.lastName}
              </h1>
              <p className="text-indigo-200 font-bold mb-1">{primarySub}</p>
              <p className="text-indigo-300 text-sm mb-4">{yearLabel} — {tutor.university || 'SLIIT'}</p>

              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <p className="text-2xl font-black text-white">{tutor.rating ?? '—'}</p>
                  <p className="text-indigo-200 text-xs font-bold">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-white">{tutor.reviews ?? 0}+</p>
                  <p className="text-indigo-200 text-xs font-bold">Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-white">{tutor.sessions ?? 0}</p>
                  <p className="text-indigo-200 text-xs font-bold">Sessions</p>
                </div>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl w-full md:w-56 flex-shrink-0">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Per Hour</p>
              <p className="text-3xl font-black text-indigo-600 mb-4">
                Rs. {(tutor.hourlyRate ?? 0).toLocaleString()}
              </p>
              <button
                onClick={() => setActiveTab('slots')}
                className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
              >
                Select a Slot
              </button>
              <p className="text-center text-slate-400 text-xs font-medium mt-3">
                Session: {tutor.sessionType || 'Online'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 flex gap-1">
          {(['about', 'reviews', 'slots'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-6 font-black text-sm capitalize transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab === 'about' ? 'About' : tab === 'reviews' ? `Reviews (${DEMO_REVIEWS.length})` : 'Book a Slot'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-lg font-black text-slate-900 mb-4">About Me</h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                {tutor.bio || 'No bio provided yet.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-900 mb-4">Details</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Education',     value: tutor.qualification || '—' },
                    { label: 'University',    value: tutor.university    || 'SLIIT' },
                    { label: 'Session Type',  value: tutor.sessionType   || '—' },
                    { label: 'Experience',    value: tutor.experience    || '—' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm font-bold text-slate-700">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-900 mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {tagList.length > 0
                    ? tagList.map(tag => (
                        <span key={tag} className="bg-indigo-50 text-indigo-700 font-black text-xs px-4 py-2 rounded-full border border-indigo-100">
                          {tag}
                        </span>
                      ))
                    : <span className="text-slate-300 text-sm">No skills listed.</span>
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-8">
              <div className="text-center">
                <p className="text-5xl font-black text-slate-900">{tutor.rating ?? '—'}</p>
                <div className="flex gap-1 justify-center my-2">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={`text-lg ${i <= Math.round(tutor.rating ?? 0) ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                  ))}
                </div>
                <p className="text-slate-400 text-xs font-bold">{DEMO_REVIEWS.length} reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5,4,3,2,1].map(star => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 w-4">{star}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: star === 5 ? '75%' : star === 4 ? '20%' : '5%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {DEMO_REVIEWS.map((review, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-sm">
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">{review.name}</p>
                      <p className="text-slate-400 text-xs">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${s <= review.rating ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Slots Tab */}
        {activeTab === 'slots' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-lg font-black text-slate-900 mb-2">Available Time Slots</h2>
              <p className="text-slate-400 text-sm font-medium mb-6">Select a slot that works best for you.</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {slots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-4 px-4 rounded-2xl font-black text-sm border-2 transition-all ${
                      selectedSlot === slot
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <div className="bg-indigo-50 rounded-2xl p-4 mb-6 border border-indigo-100">
                  <p className="text-sm font-bold text-indigo-700">
                    Selected: <span className="font-black">{selectedSlot}</span> — Rs. {(tutor.hourlyRate ?? 0).toLocaleString()} / hour
                  </p>
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={!selectedSlot}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 ${
                  selectedSlot
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {selectedSlot ? `Book ${selectedSlot}` : 'Select a Slot to Continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}