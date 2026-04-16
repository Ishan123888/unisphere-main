'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const BOOKING_API = 'http://localhost:8081/api/bookings';

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-200',
  COMPLETED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  REJECTED:  'bg-rose-50 text-rose-500 border border-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border border-slate-200',
};

interface Booking {
  id: number;
  bookingRef: string;
  studentId: number;
  studentName: string;
  studentUsername: string;
  subject: string;
  slot: string;
  date: string;
  scheduledSlot: string;
  duration: string;
  sessionType: string;
  topic: string;
  totalPrice: number;
  status: string;
  meetingLink?: string;
}

export default function TutorDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState<number | null>(null);

  // 🛠️ LocalStorage එකෙන් ID එක ලබා ගැනීම
  const storedTutorId = typeof window !== 'undefined'
    ? (localStorage.getItem('tutorId') || localStorage.getItem('userId'))
    : null;

  const tutorId = storedTutorId ? Number(storedTutorId) : null;

  useEffect(() => {
    // ID එක තියෙනවා නම් විතරක් fetch කරනවා
    if (tutorId && !isNaN(tutorId)) {
      fetchBookings();
    } else {
      setError('Tutor ID not found. Please login again.');
      setLoading(false);
    }
  }, [tutorId]);

  const fetchBookings = async () => {
    // මෙතනදීත් safety check එකක් කරනවා 500 error එකක් එන එක නවත්තන්න
    if (!tutorId || isNaN(tutorId)) {
      setError('Invalid Tutor ID. Please log out and log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Backend එකට request එක යැවීම
      const res = await axios.get(`${BOOKING_API}/tutor/${tutorId}`);
      setBookings(res.data);
    } catch (err: any) {
      console.error("Fetch error details:", err.response?.data || err.message);
      // Backend එකේ real error message එක පෙන්වමු
      const msg = err.response?.data?.message || 'Cannot connect to booking service. Ensure it is running on port 8081.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
    setActing(id);
    try {
      await axios.put(`${BOOKING_API}/${id}/status`, null, { params: { status } });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (err: any) {
      setError('Action failed. ' + (err.response?.data?.message || 'Please try again.'));
    } finally {
      setActing(null);
    }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    pending:   bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    earnings:  bookings
      .filter(b => b.status !== 'CANCELLED' && b.totalPrice)
      .reduce((s, b) => s + b.totalPrice, 0),
  };

  const formatDateTime = (iso: string) => {
    if (!iso) return { date: '—', time: '—' };
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const TABS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-purple-200 text-sm font-bold mb-1">Tutor Panel (ID: {tutorId})</p>
              <h1 className="text-3xl font-black text-white">My Sessions</h1>
              <p className="text-purple-200 text-sm mt-1">
                {loading ? 'Loading...' : `${bookings.length} total requests`}
              </p>
            </div>
            <button
              onClick={() => router.push('/tutor-booking/availability-manager')}
              className="bg-white text-purple-600 px-5 py-3 rounded-2xl font-black text-sm hover:bg-purple-50 transition-all shadow-lg"
            >
              📅 Manage Availability
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Pending',       value: stats.pending,                           icon: '⏳', color: 'text-amber-300' },
              { label: 'Confirmed',     value: stats.confirmed,                         icon: '✅', color: 'text-emerald-300' },
              { label: 'Completed',     value: stats.completed,                         icon: '🎓', color: 'text-white' },
              { label: 'Total Earned',  value: `Rs. ${stats.earnings.toLocaleString()}`, icon: '💰', color: 'text-yellow-300' },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                <p className="text-xl mb-1">{s.icon}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-purple-200 text-xs font-bold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 px-5 py-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3">
            <span>⚠️</span>
            <p className="text-rose-600 text-sm font-bold flex-1">{error}</p>
            <button onClick={fetchBookings} className="text-xs font-black text-rose-600 underline">Retry</button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-1.5 flex gap-1 mb-6 shadow-sm border border-slate-100 w-fit overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === tab ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab}
              {tab === 'PENDING' && stats.pending > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${filter === tab ? 'bg-white/20' : 'bg-amber-100 text-amber-700'}`}>
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="font-black text-slate-600 text-sm uppercase tracking-widest">Loading session data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <p className="text-5xl mb-4">📭</p>
            <p className="font-black text-slate-700">No {filter !== 'ALL' ? filter.toLowerCase() : ''} sessions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => {
              const dt = booking.scheduledSlot ? formatDateTime(booking.scheduledSlot) : null;
              const initials = booking.studentName
                ? booking.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                : 'ST';

              return (
                <div key={booking.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center font-black text-purple-600 text-sm flex-shrink-0">
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-black text-slate-900">{booking.studentName}</h3>
                          <span className="text-xs text-slate-400 font-bold font-mono">{booking.studentUsername}</span>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLES[booking.status]}`}>
                            {booking.status}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-purple-600 mb-1">{booking.subject}</p>
                        {booking.topic && <p className="text-xs text-slate-500 mb-3">📖 {booking.topic}</p>}

                        <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-400 uppercase">
                          {dt ? (
                            <><span>📅 {dt.date}</span><span>🕐 {dt.time}</span></>
                          ) : (
                            <><span>📅 {booking.date}</span><span>🕐 {booking.slot}</span></>
                          )}
                          <span>⏱ {booking.duration}</span>
                          <span>{booking.sessionType === 'Online' ? '💻' : '📍'} {booking.sessionType}</span>
                          <span className="text-indigo-400">🔖 {booking.bookingRef}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <p className="font-black text-purple-600 text-xl mb-3">
                          Rs. {(booking.totalPrice || 0).toLocaleString()}
                        </p>

                        <div className="flex flex-col gap-2">
                          {booking.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                                disabled={acting === booking.id}
                                className="px-4 py-2 text-xs font-black bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-sm disabled:opacity-60 flex items-center gap-1.5 justify-center"
                              >
                                {acting === booking.id ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✓'} Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                                disabled={acting === booking.id}
                                className="px-4 py-2 text-xs font-black bg-rose-50 text-rose-500 rounded-xl border border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-60"
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => router.push('/tutor-booking/session-portal')}
                                className="px-4 py-2 text-xs font-black bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
                              >
                                ▶ Start Session
                              </button>
                              <button
                                onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                                disabled={acting === booking.id}
                                className="px-4 py-2 text-xs font-black bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all disabled:opacity-60"
                              >
                                ✅ Mark Done
                              </button>
                            </>
                          )}
                          {booking.status === 'COMPLETED' && (
                            <button
                              onClick={() => router.push('/tutor-booking/analytics')}
                              className="px-4 py-2 text-xs font-black bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                            >
                              📊 Analytics
                            </button>
                          )}
                        </div>
                      </div>
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