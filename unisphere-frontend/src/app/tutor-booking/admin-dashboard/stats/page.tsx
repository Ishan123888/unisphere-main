'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const BOOKING_API = 'http://localhost:8081/api/bookings';

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

interface SubjectCount {
  subject: string;
  count: number;
}

export default function SystemStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        axios.get(`${BOOKING_API}/stats`),
        axios.get(`${BOOKING_API}`),
      ]);
      setStats(statsRes.data);
      setBookings(bookingsRes.data);
    } catch {
      setError('Cannot connect to booking service on port 8081.');
    } finally {
      setLoading(false);
    }
  };

  // Compute subject breakdown from real bookings
  const subjectCounts: SubjectCount[] = (() => {
    const map: Record<string, number> = {};
    bookings.forEach(b => {
      if (b.subject) map[b.subject] = (map[b.subject] || 0) + 1;
    });
    return Object.entries(map)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  })();

  const maxSubjectCount = subjectCounts[0]?.count || 1;

  // Completion rate
  const completionRate = stats && stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  // Cancellation rate
  const cancellationRate = stats && stats.total > 0
    ? Math.round((stats.cancelled / stats.total) * 100)
    : 0;

  // Success rate (non-cancelled)
  const successRate = stats && stats.total > 0
    ? Math.round(((stats.total - stats.cancelled) / stats.total) * 100)
    : 0;

  // Session type breakdown
  const onlineCount = bookings.filter(b => b.sessionType === 'Online').length;
  const physicalCount = bookings.filter(b => b.sessionType === 'Physical').length;

  // Payment method breakdown
  const paymentBreakdown: Record<string, number> = {};
  bookings.forEach(b => {
    if (b.paymentMethod) paymentBreakdown[b.paymentMethod] = (paymentBreakdown[b.paymentMethod] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-orange-600 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => router.back()} className="text-red-200 text-sm font-bold mb-4 block hover:text-white">← Back</button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-white">System Statistics</h1>
              <p className="text-red-200 font-medium mt-1">Real-time platform analytics from database</p>
            </div>
            <button onClick={fetchData} className="bg-white/20 text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-white/30 border border-white/30">
              🔄 Refresh
            </button>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Total Bookings', value: stats.total,                            icon: '📚' },
                { label: 'Platform Revenue', value: `Rs. ${Math.round(stats.revenue / 1000)}k`, icon: '💰' },
                { label: 'Completed Sessions', value: stats.completed,                    icon: '🎓' },
                { label: 'Active (Confirmed)', value: stats.confirmed,                    icon: '✅' },
              ].map(s => (
                <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-red-200 text-xs font-bold">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3">
            <span>⚠️</span>
            <p className="text-rose-600 text-sm font-bold flex-1">{error}</p>
            <button onClick={fetchData} className="text-xs font-black text-rose-600 underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="font-black text-slate-600 text-sm">Fetching analytics from database...</p>
          </div>
        ) : stats ? (
          <>
            {/* Status Breakdown Bar Chart */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-slate-900">Booking Status Breakdown</h2>
                <span className="text-xs font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  {stats.total} total
                </span>
              </div>
              <div className="flex items-end gap-4 h-48">
                {[
                  { label: 'Pending',   value: stats.pending,   color: 'bg-amber-400' },
                  { label: 'Confirmed', value: stats.confirmed, color: 'bg-emerald-500' },
                  { label: 'Completed', value: stats.completed, color: 'bg-indigo-500' },
                  { label: 'Cancelled', value: stats.cancelled, color: 'bg-rose-400' },
                ].map(bar => {
                  const pct = stats.total > 0 ? (bar.value / stats.total) * 100 : 0;
                  return (
                    <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
                      <p className="text-sm font-black text-slate-700">{bar.value}</p>
                      <div className="w-full relative" style={{ height: '160px' }}>
                        <div
                          className={`absolute bottom-0 w-full rounded-xl ${bar.color}`}
                          style={{ height: `${Math.max(pct, 4)}%`, transition: 'height 0.8s ease' }}
                        />
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase">{bar.label}</p>
                      <p className="text-[10px] font-bold text-slate-400">{Math.round(pct)}%</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue Info */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="font-black text-slate-900 mb-6">Revenue Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Revenue</p>
                  <p className="text-2xl font-black text-emerald-700">Rs. {stats.revenue.toLocaleString()}</p>
                  <p className="text-xs text-emerald-500 font-bold mt-1">From all non-cancelled bookings</p>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Avg Per Booking</p>
                  <p className="text-2xl font-black text-indigo-700">
                    Rs. {stats.total > 0 ? Math.round(stats.revenue / Math.max(stats.total - stats.cancelled, 1)).toLocaleString() : 0}
                  </p>
                  <p className="text-xs text-indigo-500 font-bold mt-1">Average booking value</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Success Rate</p>
                  <p className="text-2xl font-black text-amber-700">{successRate}%</p>
                  <p className="text-xs text-amber-500 font-bold mt-1">Non-cancelled bookings</p>
                </div>
              </div>
            </div>

            {/* Most Booked Subjects (real data) */}
            {subjectCounts.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="font-black text-slate-900 mb-6">Most Booked Subjects</h2>
                <div className="space-y-4">
                  {subjectCounts.map((item, i) => (
                    <div key={item.subject}>
                      <div className="flex justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                            i === 0 ? 'bg-yellow-400 text-yellow-900' :
                            i === 1 ? 'bg-slate-300 text-slate-700' :
                            i === 2 ? 'bg-orange-300 text-orange-900' :
                            'bg-slate-100 text-slate-500'
                          }`}>#{i + 1}</span>
                          <span className="text-sm font-black text-slate-800">{item.subject}</span>
                        </div>
                        <span className="text-sm font-black text-slate-500">{item.count} booking{item.count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-red-500 to-orange-400 h-2.5 rounded-full transition-all duration-700"
                          style={{ width: `${(item.count / maxSubjectCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session Type + Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="font-black text-slate-900 mb-4">Session Types</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Online', value: onlineCount, color: 'bg-indigo-500', icon: '💻' },
                    { label: 'Physical', value: physicalCount, color: 'bg-emerald-500', icon: '📍' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-black text-slate-700">{item.label}</span>
                          <span className="text-sm font-black text-slate-500">{item.value}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full">
                          <div
                            className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${bookings.length > 0 ? (item.value / bookings.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="font-black text-slate-900 mb-4">Payment Methods</h2>
                <div className="space-y-3">
                  {Object.entries(paymentBreakdown).map(([method, count]) => (
                    <div key={method} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                      <span className="text-sm font-black text-slate-700 capitalize">{method}</span>
                      <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                        {count} bookings
                      </span>
                    </div>
                  ))}
                  {Object.keys(paymentBreakdown).length === 0 && (
                    <p className="text-slate-400 text-sm font-bold text-center py-4">No payment data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Health Metrics */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Completion Rate', value: `${completionRate}%`, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { label: 'Cancellation Rate', value: `${cancellationRate}%`, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
                { label: 'Active Rate', value: `${successRate}%`, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
              ].map(item => (
                <div key={item.label} className={`${item.bg} rounded-3xl p-6 border ${item.border} text-center`}>
                  <p className={`text-3xl font-black mb-1 ${item.color}`}>{item.value}</p>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}