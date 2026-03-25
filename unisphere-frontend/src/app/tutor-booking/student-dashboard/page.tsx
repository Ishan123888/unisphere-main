'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-50 text-green-700 border border-green-200',
  PENDING:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
  COMPLETED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  CANCELLED: 'bg-red-50 text-red-500 border border-red-200',
};

interface Booking {
  id: number;
  bookingRef: string;
  tutorName: string;
  tutorAvatar: string;
  subject: string;
  slot: string;
  date: string;
  duration: string;
  sessionType: string;
  totalPrice: number;
  status: string;
}

export default function StudentDashboardPage() {
  const router   = useRouter();
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [filter,    setFilter]    = useState('ALL');
  const [cancelId,  setCancelId]  = useState<number | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  /* ── Fetch bookings from backend ─────────────────────────────── */
  useEffect(() => {
    const username = localStorage.getItem('username') || 'it24100001';
    fetchBookings(username);
  }, []);

  const fetchBookings = async (username: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:8081/api/bookings/student/${username}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError('Could not load bookings. Using demo data.');
      // Fallback to dummy data if backend not running
      setBookings([
        { id: 1, bookingRef: 'UNI-001', tutorName: 'Amal Perera',       tutorAvatar: 'AP', subject: 'Data Structures & Algorithms', slot: 'Mon 10:00 AM', date: 'Mar 24, 2026', duration: '2 Hours', sessionType: 'Online',   totalPrice: 3150, status: 'CONFIRMED' },
        { id: 2, bookingRef: 'UNI-002', tutorName: 'Dilki Jayawardena',  tutorAvatar: 'DJ', subject: 'Database Management Systems',  slot: 'Tue 3:00 PM',  date: 'Mar 25, 2026', duration: '1 Hour',  sessionType: 'Physical', totalPrice: 1260, status: 'PENDING'   },
        { id: 3, bookingRef: 'UNI-003', tutorName: 'Tharaka Silva',      tutorAvatar: 'TS', subject: 'Web Technologies',             slot: 'Fri 1:00 PM',  date: 'Mar 21, 2026', duration: '2 Hours', sessionType: 'Online',   totalPrice: 4200, status: 'COMPLETED' },
        { id: 4, bookingRef: 'UNI-004', tutorName: 'Nethmi Rodrigo',     tutorAvatar: 'NR', subject: 'Computer Networks',            slot: 'Wed 11:00 AM', date: 'Mar 20, 2026', duration: '1 Hour',  sessionType: 'Physical', totalPrice: 1155, status: 'CANCELLED' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ── Cancel booking via API ──────────────────────────────────── */
  const handleCancel = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8081/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
      }
    } catch {
      // Fallback: update locally
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
    }
    setCancelId(null);
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    total:     bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    spent:     bookings.filter(b => b.status !== 'CANCELLED').reduce((s, b) => s + b.totalPrice, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm font-bold mb-1">Welcome back</p>
              <h1 className="text-3xl font-black text-white">My Dashboard</h1>
              <p className="text-indigo-200 font-medium mt-1">Manage your tutor sessions</p>
            </div>
            <button onClick={() => router.push('/tutor-booking')}
              className="bg-white text-indigo-600 px-5 py-3 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all shadow-lg">
              + Book a Tutor
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Bookings', value: stats.total,                              icon: '📚' },
              { label: 'Confirmed',      value: stats.confirmed,                           icon: '✅' },
              { label: 'Completed',      value: stats.completed,                           icon: '🎓' },
              { label: 'Total Spent',    value: `Rs. ${stats.spent.toLocaleString()}`,     icon: '💰' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                <p className="text-xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-indigo-200 text-xs font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <span>⚠️</span>
            <p className="text-amber-700 text-sm font-bold">{error}</p>
            <button onClick={() => fetchBookings(localStorage.getItem('username') || 'it24100001')}
              className="ml-auto text-xs font-black text-amber-600 hover:text-amber-800 underline">
              Retry
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl p-1.5 flex gap-1 mb-6 shadow-sm border border-slate-100 w-fit">
          {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filter === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="font-black text-slate-700">Loading your bookings...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
                <p className="text-4xl mb-4">📭</p>
                <p className="font-black text-slate-700 text-lg">No bookings found</p>
                <p className="text-slate-400 text-sm font-medium mt-1">Try a different filter or book a new session.</p>
              </div>
            ) : (
              filtered.map(booking => (
                <div key={booking.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-sm flex-shrink-0">
                      {booking.tutorAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="font-black text-slate-900">{booking.tutorName}</h3>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLES[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-indigo-600 mb-2">{booking.subject}</p>
                      <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                        <span>📅 {booking.date}</span>
                        <span>🕐 {booking.slot}</span>
                        <span>⏱ {booking.duration}</span>
                        <span>{booking.sessionType === 'Online' ? '💻' : '📍'} {booking.sessionType}</span>
                        <span>🔖 {booking.bookingRef}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-indigo-600 text-lg">Rs. {booking.totalPrice.toLocaleString()}</p>
                      <div className="flex gap-2 mt-3 justify-end flex-wrap">
                        {booking.status === 'COMPLETED' && (
                          <button onClick={() => router.push('/tutor-booking/rating-feedback')}
                            className="text-xs font-black px-3 py-2 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-200 hover:bg-yellow-100 transition-all">
                            Rate Session
                          </button>
                        )}
                        {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                          <button onClick={() => router.push('/tutor-booking/invoice')}
                            className="text-xs font-black px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all">
                            Invoice
                          </button>
                        )}
                        {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                          <button onClick={() => setCancelId(booking.id)}
                            className="text-xs font-black px-3 py-2 bg-red-50 text-red-500 rounded-xl border border-red-200 hover:bg-red-100 transition-all">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">⚠️</div>
            <h3 className="text-lg font-black text-slate-900 text-center mb-2">Cancel Booking?</h3>
            <p className="text-slate-400 text-sm font-medium text-center mb-6">
              This action cannot be undone. Cancellations within 2 hours may incur a fee.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelId(null)}
                className="flex-1 py-3 rounded-2xl font-black text-sm border-2 border-slate-200 text-slate-600 hover:border-slate-400 transition-all">
                Keep Booking
              </button>
              <button onClick={() => handleCancel(cancelId)}
                className="flex-1 py-3 rounded-2xl font-black text-sm bg-red-500 text-white hover:bg-red-600 transition-all">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}