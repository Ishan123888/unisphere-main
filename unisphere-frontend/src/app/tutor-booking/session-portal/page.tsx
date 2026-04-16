'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface Booking {
  id: number;
  studentName: string;
  studentUsername: string;
  tutorId: number;
  tutorName: string;
  tutorAvatar: string;
  subject: string;
  slot: string;
  date: string;
  scheduledSlot: string;
  duration: string;
  sessionType: string;
  topic: string;
  notes: string;
  paymentMethod: string;
  totalPrice: number;
  status: string;
  meetLink?: string;
}

function SessionPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking]           = useState<Booking | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [sessionStatus, setSessionStatus] = useState<'upcoming' | 'active' | 'completed'>('upcoming');
  const [notes, setNotes]               = useState('');
  const [notesError, setNotesError]     = useState('');
  const [completing, setCompleting]     = useState(false);
  const [starting, setStarting]         = useState(false);

  // ── Fetch booking from API ─────────────────────────────────────────
  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError('');

      try {
        // If bookingId passed via query param, fetch that specific booking
        if (bookingId) {
          const res = await fetch(`http://localhost:8081/api/bookings/${bookingId}`);
          if (!res.ok) throw new Error('Booking not found');
          const data: Booking = await res.json();
          setBooking(data);
          mapStatus(data.status);
          return;
        }

        // Otherwise find the active/upcoming session for the logged-in tutor
        const tutorUsername = localStorage.getItem('username') || '';
        if (!tutorUsername) {
          setError('Could not determine tutor identity. Please sign in again.');
          return;
        }

        // Fetch all bookings and filter for this tutor's active/upcoming session
        const res = await fetch(`http://localhost:8081/api/bookings?tutorUsername=${tutorUsername}`);
        if (!res.ok) throw new Error('Failed to load bookings');
        const list: Booking[] = await res.json();

        // Prefer ACTIVE first, then first PENDING/CONFIRMED
        const active    = list.find(b => b.status === 'ACTIVE');
        const upcoming  = list.find(b => b.status === 'PENDING' || b.status === 'CONFIRMED');
        const target    = active || upcoming || list[0];

        if (!target) {
          setError('No active or upcoming sessions found.');
          return;
        }

        setBooking(target);
        mapStatus(target.status);
      } catch (err: any) {
        setError(err.message || 'Cannot connect to server. Make sure booking service is running on port 8081.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const mapStatus = (apiStatus: string) => {
    if (apiStatus === 'ACTIVE')                      setSessionStatus('active');
    else if (apiStatus === 'COMPLETED')              setSessionStatus('completed');
    else                                             setSessionStatus('upcoming');
  };

  // ── Start Session ──────────────────────────────────────────────────
  const handleStart = async () => {
    if (!booking) return;
    setStarting(true);
    try {
      const res = await fetch(`http://localhost:8081/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      if (res.ok) {
        setSessionStatus('active');
        setBooking(prev => prev ? { ...prev, status: 'ACTIVE' } : prev);
      } else {
        // Optimistic update even if endpoint missing
        setSessionStatus('active');
      }
    } catch {
      // Optimistic update if server unreachable for PATCH
      setSessionStatus('active');
    } finally {
      setStarting(false);
    }
  };

  // ── Complete Session ───────────────────────────────────────────────
  const handleComplete = async () => {
    if (!notes.trim()) {
      setNotesError('Please add session notes before completing.');
      return;
    }
    if (notes.trim().length < 10) {
      setNotesError('Notes must be at least 10 characters.');
      return;
    }
    if (!booking) return;

    setCompleting(true);
    setNotesError('');

    try {
      const res = await fetch(`http://localhost:8081/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED', sessionNotes: notes }),
      });
      if (res.ok) {
        setSessionStatus('completed');
        setBooking(prev => prev ? { ...prev, status: 'COMPLETED' } : prev);
      } else {
        // Optimistic update
        setSessionStatus('completed');
      }
    } catch {
      setSessionStatus('completed');
    } finally {
      setCompleting(false);
    }
  };

  // ── Resolve meet link ──────────────────────────────────────────────
  const meetLink = booking?.meetLink || 'https://meet.google.com/uni-sliit-session';

  // ── Format date ────────────────────────────────────────────────────
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch { return dateStr; }
  };

  // ── Payment label ──────────────────────────────────────────────────
  const paymentLabel = (method: string) => {
    if (method === 'card') return 'Credit / Debit Card';
    if (method === 'bank') return 'Bank Transfer';
    return 'Cash on Session';
  };

  // ── Avatar initials ────────────────────────────────────────────────
  const initials = (name: string) =>
    name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';

  // ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => router.back()} className="text-purple-200 text-sm font-bold mb-4 block hover:text-white">← Back</button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">Session Portal</h1>
              <p className="text-purple-200 font-medium mt-1">Manage your active tutoring session</p>
            </div>
            <span className={`text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider ${
              sessionStatus === 'active'    ? 'bg-green-400 text-green-900' :
              sessionStatus === 'completed' ? 'bg-indigo-300 text-indigo-900' :
                                             'bg-yellow-400 text-yellow-900'
            }`}>
              {sessionStatus === 'active' ? '● Live' : sessionStatus === 'completed' ? 'Completed' : 'Upcoming'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* ── LOADING ── */}
        {loading && (
          <div className="bg-white rounded-3xl p-16 shadow-sm border border-slate-100 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-sm">Loading session data...</p>
          </div>
        )}

        {/* ── ERROR ── */}
        {!loading && error && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-red-100 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="font-black text-slate-900 mb-2">Unable to Load Session</h2>
            <p className="text-slate-400 text-sm font-medium mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-purple-700 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── SESSION DATA ── */}
        {!loading && !error && booking && (
          <>
            {/* Session Info */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="font-black text-slate-900 mb-6">Session Details</h2>

              {/* Student Card */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center font-black text-purple-600 text-lg">
                  {booking.tutorAvatar || initials(booking.studentName)}
                </div>
                <div>
                  <p className="font-black text-slate-900">{booking.studentName}</p>
                  <p className="text-slate-400 text-sm font-bold uppercase">{booking.studentUsername}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-black text-purple-600 text-lg">Rs. {booking.totalPrice?.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs font-bold">{booking.duration}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Subject',  value: booking.subject },
                  { label: 'Topic',    value: booking.topic },
                  { label: 'Date',     value: formatDate(booking.date) },
                  { label: 'Slot',     value: booking.slot },
                  { label: 'Duration', value: booking.duration },
                  { label: 'Type',     value: booking.sessionType },
                  { label: 'Payment',  value: paymentLabel(booking.paymentMethod) },
                  { label: 'Booking',  value: `#${booking.id}` },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                    <p className="text-sm font-black text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Student Notes */}
              {booking.notes && booking.notes !== 'No additional notes' && (
                <div className="mt-4 bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Student Notes</p>
                  <p className="text-sm font-bold text-amber-800">{booking.notes}</p>
                </div>
              )}
            </div>

            {/* Google Meet Link */}
            {sessionStatus !== 'completed' && booking.sessionType?.toLowerCase() === 'online' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="font-black text-slate-900 mb-4">Meeting Link</h2>
                <div className="flex items-center gap-3 bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                  <span className="text-2xl">💻</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-0.5">Google Meet</p>
                    <p className="text-sm font-black text-indigo-700 truncate">{meetLink}</p>
                  </div>
                  <button
                    onClick={() => window.open(meetLink, '_blank')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all flex-shrink-0"
                  >
                    Join
                  </button>
                </div>

                {sessionStatus === 'upcoming' && (
                  <button
                    onClick={handleStart}
                    disabled={starting}
                    className="w-full mt-4 bg-green-500 text-white py-3 rounded-2xl font-black text-sm hover:bg-green-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {starting
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Starting...</>
                      : 'Start Session'}
                  </button>
                )}
              </div>
            )}

            {/* Physical session start button */}
            {sessionStatus !== 'completed' && booking.sessionType?.toLowerCase() === 'physical' && sessionStatus === 'upcoming' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="font-black text-slate-900 mb-4">Session Location</h2>
                <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mb-4">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="text-xs font-black text-emerald-500 uppercase tracking-wider mb-0.5">Physical</p>
                    <p className="text-sm font-black text-emerald-800">SLIIT Main Campus</p>
                  </div>
                </div>
                <button
                  onClick={handleStart}
                  disabled={starting}
                  className="w-full bg-green-500 text-white py-3 rounded-2xl font-black text-sm hover:bg-green-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {starting
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Starting...</>
                    : 'Start Session'}
                </button>
              </div>
            )}

            {/* Session Notes & Complete */}
            {sessionStatus !== 'completed' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="font-black text-slate-900 mb-4">Session Notes</h2>
                <textarea
                  rows={4}
                  placeholder="Add notes about what was covered in this session..."
                  className={`w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300 resize-none transition-all ${
                    notesError ? 'ring-2 ring-red-400 bg-red-50' : 'focus:ring-2 focus:ring-purple-400'
                  }`}
                  value={notes}
                  onChange={e => { setNotes(e.target.value); setNotesError(''); }}
                />
                {notesError && (
                  <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                    <span>⚠</span> {notesError}
                  </p>
                )}
                <button
                  onClick={handleComplete}
                  disabled={sessionStatus === 'upcoming' || completing}
                  className={`w-full py-4 rounded-2xl font-black text-sm mt-4 transition-all flex items-center justify-center gap-2 ${
                    sessionStatus === 'active'
                      ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {completing
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Completing...</>
                    : sessionStatus === 'upcoming'
                    ? 'Start Session First'
                    : 'Mark as Completed'}
                </button>
              </div>
            )}

            {/* Completed State */}
            {sessionStatus === 'completed' && (
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎓</div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Session Completed!</h2>
                <p className="text-slate-400 font-medium mb-2">
                  Great job! The student will be prompted to leave a review.
                </p>
                <p className="text-indigo-600 font-black mb-6">
                  Rs. {booking.totalPrice?.toLocaleString()} earned
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/tutor-booking/tutor-dashboard')}
                    className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/tutor-booking/analytics')}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-2xl font-black text-sm hover:bg-purple-700 transition-all"
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SessionPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    }>
      <SessionPortalContent />
    </Suspense>
  );
}