'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const BOOKING_API = 'http://localhost:8081/api/bookings';

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-200',
  COMPLETED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  CANCELLED: 'bg-rose-50 text-rose-500 border border-rose-200',
};

interface Booking {
  id: number;
  bookingRef: string;
  studentName: string;
  studentUsername: string;
  tutorName: string;
  subject: string;
  date: string;
  slot: string;
  scheduledSlot: string;
  duration: string;
  sessionType: string;
  totalPrice: number;
  status: string;
  paymentMethod: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export default function ManageBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState<number | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        axios.get(`${BOOKING_API}`),
        axios.get(`${BOOKING_API}/stats`),
      ]);
      setBookings(bookingsRes.data);
      setStats(statsRes.data);
    } catch {
      setError('Cannot connect to booking service on port 8081.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    setActing(id);
    try {
      await axios.put(`${BOOKING_API}/${id}/cancel`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
      if (stats) setStats({ ...stats, cancelled: stats.cancelled + 1, confirmed: Math.max(0, stats.confirmed - 1) });
    } catch {
      setError('Failed to cancel booking.');
    } finally {
      setActing(null);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    setActing(id);
    try {
      await axios.put(`${BOOKING_API}/${id}/status`, null, { params: { status } });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch {
      setError('Failed to update status.');
    } finally {
      setActing(null);
    }
  };

  const filtered = bookings.filter(b => {
    const matchFilter = filter === 'ALL' || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      b.studentName?.toLowerCase().includes(q) ||
      b.tutorName?.toLowerCase().includes(q) ||
      b.bookingRef?.toLowerCase().includes(q) ||
      b.subject?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const TABS = ['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-orange-600 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => router.back()} className="text-red-200 text-sm font-bold mb-4 block hover:text-white">← Back</button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-white">Manage Bookings</h1>
              <p className="text-red-200 font-medium mt-1">
                {loading ? 'Loading...' : `${bookings.length} total bookings in database`}
              </p>
            </div>
            <button
              onClick={fetchAll}
              className="bg-white/20 text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-white/30 transition-all border border-white/30"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Stats from real backend */}
          {stats && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
              {[
                { label: 'Total',     value: stats.total,     color: 'text-white' },
                { label: 'Pending',   value: stats.pending,   color: 'text-amber-300' },
                { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-300' },
                { label: 'Completed', value: stats.completed, color: 'text-indigo-300' },
                { label: 'Cancelled', value: stats.cancelled, color: 'text-rose-300' },
                { label: 'Revenue',   value: `Rs.${Math.round(stats.revenue / 1000)}k`, color: 'text-yellow-300' },
              ].map(s => (
                <div key={s.label} className="bg-white/10 rounded-2xl p-3 text-center border border-white/10">
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3">
            <span>⚠️</span>
            <p className="text-rose-600 text-sm font-bold flex-1">{error}</p>
            <button onClick={fetchAll} className="text-xs font-black text-rose-600 underline">Retry</button>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by student, tutor, booking ID or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-60 px-5 py-3 bg-white rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-400 placeholder:text-slate-300"
          />
          <div className="bg-white rounded-2xl p-1.5 flex gap-1 border border-slate-200 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === tab ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs font-bold text-slate-400 mb-4">{filtered.length} record{filtered.length !== 1 ? 's' : ''} shown</p>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="font-black text-slate-600 text-sm">Loading from database...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Ref', 'Student', 'Tutor', 'Subject', 'Date / Time', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(booking => (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 text-xs font-black text-indigo-600 whitespace-nowrap">{booking.bookingRef}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-black text-slate-900">{booking.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-bold font-mono">{booking.studentUsername}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-700 whitespace-nowrap">{booking.tutorName}</td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-500 max-w-32 truncate">{booking.subject}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="text-xs font-bold text-slate-700">{booking.date || '—'}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{booking.slot || '—'}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-slate-800 whitespace-nowrap">
                        Rs. {(booking.totalPrice || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-lg uppercase">
                          {booking.paymentMethod || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap ${STATUS_STYLES[booking.status] || ''}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {booking.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                              disabled={acting === booking.id}
                              className="text-[10px] font-black px-3 py-1.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-60"
                            >
                              Approve
                            </button>
                          )}
                          {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              disabled={acting === booking.id}
                              className="text-[10px] font-black px-3 py-1.5 bg-rose-50 text-rose-500 rounded-xl border border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-60"
                            >
                              {acting === booking.id ? '...' : 'Cancel'}
                            </button>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                              disabled={acting === booking.id}
                              className="text-[10px] font-black px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all disabled:opacity-60"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-3xl mb-3">🔍</p>
                  <p className="font-black text-slate-700">No bookings found</p>
                  <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}