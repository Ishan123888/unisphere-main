'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, use } from 'react';

// ── Tutor type ────────────────────────────────────────────────────
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

interface Availability {
  id: number;
  tutorId: number;
  day: string;
  time: string;
  active: boolean;
}

const YEAR_LABELS: Record<string, string> = {
  '1ST_YEAR': '1st Year', '2ND_YEAR': '2nd Year', '3RD_YEAR': '3rd Year',
  '4TH_YEAR': '4th Year', 'GRADUATE': 'Graduate', 'POSTGRAD': 'Postgraduate',
};

const getTagList = (t: Tutor): string[] =>
  (t.tags || '').split(',').map(s => s.trim()).filter(Boolean);

const getInitials = (tutor: Tutor): string =>
  `${tutor.firstName?.[0] ?? ''}${tutor.lastName?.[0] ?? ''}`.toUpperCase();

const DEMO_REVIEWS = [
  { name: 'Kasun S.',   rating: 5, comment: 'Excellent tutor! Very clear explanations.', date: 'Mar 2026' },
  { name: 'Dilki R.',   rating: 5, comment: 'Helped me pass my exam with distinction.',  date: 'Feb 2026' },
  { name: 'Tharaka M.', rating: 4, comment: 'Great session, would book again.',          date: 'Feb 2026' },
];

export default function TutorProfilePage({ params }: { params: Promise<{ tutorId: string }> }) {
  const resolvedParams = use(params);
  const tutorId = resolvedParams.tutorId;

  const router       = useRouter();
  const searchParams = useSearchParams();

  const tutorNameUrl = searchParams.get('tutorName');
  const subjectUrl   = searchParams.get('subject');
  const avatarUrl    = searchParams.get('avatar');

  const [tutor,          setTutor]          = useState<Tutor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Availability[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');

  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [activeTab,      setActiveTab]      = useState<'about' | 'reviews' | 'slots'>('about');

  useEffect(() => {
    if (!tutorId) return;

    setLoading(true);
    const token = localStorage.getItem('token') || '';

    Promise.all([
      fetch(`http://localhost:8082/api/users/tutors/${tutorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }),
      fetch(`http://localhost:8081/api/bookings/tutor/${tutorId}/availability`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
    ])
    .then(async ([resTutor, resSlots]) => {
      if (!resTutor.ok) throw new Error('Tutor not found');

      const tutorData = await resTutor.json();
      let slotsData = [];

      if (resSlots.ok) {
        slotsData = await resSlots.json();
      }

      setTutor(tutorData);
      setAvailableSlots(Array.isArray(slotsData) ? slotsData.filter((s: Availability) => s.active) : []);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Fetch Error:", err);
      setError('Could not load tutor profile.');
      setLoading(false);
    });
  }, [tutorId]);

  // ✅ Helper function to format slot labels safely
  const formatSlotLabel = (slot: Availability | undefined) => {
    if (!slot) return '';
    const d = slot.day ? slot.day.slice(0, 3) : 'Day';
    const t = slot.time || 'TBD';
    return `${d} ${t}`;
  };

  const handleBook = () => {
    const selectedSlotData = availableSlots.find(s => s.id === selectedSlotId);
    if (!selectedSlotId || !selectedSlotData || !tutor) {
      alert('Please select a time slot before booking.');
      return;
    }

    const bookingParams = new URLSearchParams({
      tutorId:    tutor.id.toString(),
      tutorName:  tutorNameUrl || `${tutor.firstName} ${tutor.lastName}`,
      subject:    subjectUrl || tutor.subject || 'Subject',
      avatar:     avatarUrl || getInitials(tutor),
      slot:       formatSlotLabel(selectedSlotData),
      hourlyRate: tutor.hourlyRate.toString(),
    });

    router.push(`/tutor-booking/book?${bookingParams.toString()}`);
  };

  const handleDemoFill = () => {
    if (availableSlots.length > 0) {
      setSelectedSlotId(availableSlots[0].id);
      setActiveTab('slots');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-slate-700">
      <div className="animate-pulse text-indigo-600 text-lg uppercase tracking-widest">Loading Profile...</div>
    </div>
  );

  if (error || !tutor) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="text-6xl mb-6">🔍</div>
      <h3 className="text-2xl font-black text-slate-800 mb-2">Tutor Not Found</h3>
      <button onClick={() => router.push('/tutor-booking')} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg">
        ← Back to Explorer
      </button>
    </div>
  );

  const displayAvatar = avatarUrl || getInitials(tutor);
  const yearLabel = YEAR_LABELS[tutor.yearOfStudy] ?? tutor.yearOfStudy ?? '—';
  const currentSelectedData = availableSlots.find(s => s.id === selectedSlotId);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <button onClick={handleDemoFill} className="fixed bottom-8 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-2xl text-xs font-black uppercase hover:scale-105 transition-all">
        Demo Fill
      </button>

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-12 text-white">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => router.push('/tutor-booking')} className="text-indigo-200 text-sm font-bold mb-6 hover:text-white transition-colors">
            ← Back to Explorer
          </button>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-28 h-28 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center text-3xl font-black shadow-2xl border border-white/30">
              {displayAvatar}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black mb-1">{tutor.firstName} {tutor.lastName}</h1>
              <p className="text-indigo-200 font-bold mb-1">{subjectUrl || tutor.subject}</p>
              <p className="text-indigo-300 text-sm mb-4">{yearLabel} — {tutor.university || 'SLIIT'}</p>
              <div className="flex gap-6">
                <div className="text-center">
                   <p className="text-2xl font-black">{tutor.rating || '5.0'}</p>
                   <p className="text-indigo-200 text-xs font-bold">Rating</p>
                </div>
                <div className="text-center">
                   <p className="text-2xl font-black">{tutor.reviews || 0}+</p>
                   <p className="text-indigo-200 text-xs font-bold">Reviews</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-2xl w-full md:w-56 text-slate-900">
              <p className="text-slate-400 text-xs font-black uppercase mb-1">Per Hour</p>
              <p className="text-3xl font-black text-indigo-600 mb-4">Rs. {(tutor.hourlyRate || 0).toLocaleString()}</p>
              <button onClick={() => setActiveTab('slots')} className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-black text-sm">
                Select a Slot
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-6 flex gap-1">
          {(['about', 'reviews', 'slots'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-6 font-black text-sm capitalize border-b-2 transition-all ${
                activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'
              }`}
            >
              {tab === 'about' ? 'About' : tab === 'reviews' ? `Reviews (${DEMO_REVIEWS.length})` : 'Book a Slot'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === 'about' && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-lg font-black mb-4">About Me</h2>
            <p className="text-slate-600 font-medium leading-relaxed">{tutor.bio || 'Professional tutor.'}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {DEMO_REVIEWS.map((review, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <p className="font-black text-slate-900">{review.name}</p>
                <p className="text-slate-600 text-sm mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'slots' && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-lg font-black mb-6">Available Time Slots</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot) => {
                  const label = formatSlotLabel(slot);
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`py-4 rounded-2xl font-black text-sm border-2 transition-all ${
                        selectedSlotId === slot.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })
              ) : (
                <p className="col-span-full text-slate-400 font-bold py-12 text-center">No available slots this week.</p>
              )}
            </div>
            <button
              onClick={handleBook}
              disabled={!selectedSlotId}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
                selectedSlotId ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {selectedSlotId
                ? `Book ${formatSlotLabel(currentSelectedData)}`
                : 'Select a Slot to Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}