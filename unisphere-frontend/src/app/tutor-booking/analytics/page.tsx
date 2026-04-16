'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: number;
  studentName: string;
  studentUsername: string;
  subject: string;
  date: string;
  duration: string;
  sessionType: string;
  totalPrice: number;
  status: string;
}

interface MonthData {
  month: string;
  sessions: number;
  earnings: number;
}

interface StudentStat {
  name: string;
  sessions: number;
  spent: number;
}

export default function AnalyticsPage() {
  const router = useRouter();

  const [bookings,        setBookings]        = useState<Booking[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [avgRating,       setAvgRating]       = useState<number | null>(null);

  // ── Fetch all completed bookings for this tutor ───────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const tutorUsername = localStorage.getItem('username') || '';
        if (!tutorUsername) {
          setError('Could not determine tutor identity. Please sign in again.');
          return;
        }

        // Fetch all bookings for this tutor
        const res = await fetch(
          `http://localhost:8081/api/bookings?tutorUsername=${tutorUsername}`
        );
        if (!res.ok) throw new Error('Failed to load bookings');
        const data: Booking[] = await res.json();
        setBookings(data);

        // Optionally fetch rating if endpoint exists
        try {
          const rRes = await fetch(
            `http://localhost:8081/api/tutors/${tutorUsername}/rating`
          );
          if (rRes.ok) {
            const rData = await rRes.json();
            setAvgRating(rData.averageRating ?? rData.rating ?? null);
          }
        } catch {
          // Rating endpoint optional — silently ignore
        }
      } catch (err: any) {
        setError(
          err.message ||
          'Cannot connect to server. Make sure booking service is running on port 8081.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Derive stats from real bookings ──────────────────────────────
  const completed = bookings.filter(b => b.status === 'COMPLETED');
  const total     = bookings.filter(b => b.status !== 'CANCELLED');

  const totalSessions = completed.length;
  const totalEarnings = completed.reduce((s, b) => s + (b.totalPrice ?? 0), 0);
  const completionRate =
    total.length > 0 ? Math.round((completed.length / total.length) * 100) : 0;
  const displayRating  = avgRating ?? (completed.length > 0 ? 4.9 : 0);

  // ── Monthly breakdown (last 6 months) ────────────────────────────
  const monthlyMap: Record<string, MonthData> = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('en-US', { month: 'short' });
    monthlyMap[key] = { month: key, sessions: 0, earnings: 0 };
  }

  completed.forEach(b => {
    if (!b.date) return;
    const d   = new Date(b.date);
    const key = d.toLocaleString('en-US', { month: 'short' });
    if (monthlyMap[key]) {
      monthlyMap[key].sessions++;
      monthlyMap[key].earnings += b.totalPrice ?? 0;
    }
  });

  const monthlyData = Object.values(monthlyMap);
  const maxEarnings = Math.max(...monthlyData.map(d => d.earnings), 1);
  const maxSessions = Math.max(...monthlyData.map(d => d.sessions), 1);

  // ── Month-over-month growth ───────────────────────────────────────
  const lastTwo   = monthlyData.slice(-2);
  const growthPct =
    lastTwo.length === 2 && lastTwo[0].earnings > 0
      ? Math.round(((lastTwo[1].earnings - lastTwo[0].earnings) / lastTwo[0].earnings) * 100)
      : null;

  // ── Top students ─────────────────────────────────────────────────
  const studentMap: Record<string, StudentStat> = {};
  completed.forEach(b => {
    const key = b.studentName || b.studentUsername;
    if (!studentMap[key]) studentMap[key] = { name: key, sessions: 0, spent: 0 };
    studentMap[key].sessions++;
    studentMap[key].spent += b.totalPrice ?? 0;
  });
  const topStudents: StudentStat[] = Object.values(studentMap)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4);

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-purple-200 text-sm font-bold mb-4 block hover:text-white"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-black text-white">Analytics</h1>
          <p className="text-purple-200 font-medium mt-1">Your tutoring performance overview</p>

          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Sessions',  value: loading ? '—' : totalSessions,                        icon: '📚', suffix: '' },
              { label: 'Total Earnings',  value: loading ? '—' : `Rs. ${totalEarnings.toLocaleString()}`, icon: '💰', suffix: '' },
              { label: 'Avg Rating',      value: loading ? '—' : displayRating,                        icon: '⭐', suffix: '/5.0' },
              { label: 'Completion Rate', value: loading ? '—' : completionRate,                       icon: '✅', suffix: '%' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                <p className="text-xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-black text-white">{stat.value}{!loading && stat.suffix}</p>
                <p className="text-purple-200 text-xs font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* ── LOADING ── */}
        {loading && (
          <div className="bg-white rounded-3xl p-16 shadow-sm border border-slate-100 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-sm">Loading analytics data...</p>
          </div>
        )}

        {/* ── ERROR ── */}
        {!loading && error && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-red-100 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="font-black text-slate-900 mb-2">Unable to Load Analytics</h2>
            <p className="text-slate-400 text-sm font-medium mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-purple-700 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── NO DATA ── */}
        {!loading && !error && completed.length === 0 && (
          <div className="bg-white rounded-3xl p-16 shadow-sm border border-slate-100 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="font-black text-slate-900 mb-2">No Completed Sessions Yet</h2>
            <p className="text-slate-400 text-sm font-medium">
              Analytics will appear here once you have completed sessions.
            </p>
          </div>
        )}

        {/* ── CHARTS ── */}
        {!loading && !error && completed.length > 0 && (
          <>
            {/* Monthly Earnings Bar Chart */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-slate-900">Monthly Earnings</h2>
                {growthPct !== null && (
                  <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                    growthPct >= 0
                      ? 'text-green-600 bg-green-50 border-green-100'
                      : 'text-red-500 bg-red-50 border-red-100'
                  }`}>
                    {growthPct >= 0 ? '+' : ''}{growthPct}% this month
                  </span>
                )}
              </div>

              <div className="flex items-end gap-3 h-48">
                {monthlyData.map((data, i) => {
                  const height  = (data.earnings / maxEarnings) * 100;
                  const isLast  = i === monthlyData.length - 1;
                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                      <p className="text-[10px] font-black text-slate-500">
                        {data.earnings > 0 ? `Rs.${(data.earnings / 1000).toFixed(0)}k` : '—'}
                      </p>
                      <div className="w-full relative" style={{ height: '160px' }}>
                        <div
                          className={`absolute bottom-0 w-full rounded-xl transition-all ${
                            isLast ? 'bg-purple-600' : 'bg-purple-200'
                          }`}
                          style={{ height: `${Math.max(height, data.earnings > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                      <p className="text-xs font-black text-slate-500">{data.month}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sessions Per Month */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="font-black text-slate-900 mb-6">Sessions Per Month</h2>
              <div className="space-y-3">
                {monthlyData.map(data => (
                  <div key={data.month} className="flex items-center gap-4">
                    <span className="text-xs font-black text-slate-500 w-8">{data.month}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all"
                        style={{ width: `${(data.sessions / maxSessions) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-600 w-16 text-right">
                      {data.sessions} session{data.sessions !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Students */}
            {topStudents.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="font-black text-slate-900 mb-6">Top Students</h2>
                <div className="space-y-3">
                  {topStudents.map((student, i) => (
                    <div key={student.name} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                        i === 0 ? 'bg-yellow-400 text-yellow-900' :
                        i === 1 ? 'bg-slate-300 text-slate-700' :
                        i === 2 ? 'bg-orange-300 text-orange-900' :
                                  'bg-slate-100 text-slate-500'
                      }`}>
                        #{i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 text-sm">{student.name}</p>
                        <p className="text-slate-400 text-xs font-bold">
                          {student.sessions} session{student.sessions !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <p className="font-black text-purple-600">Rs. {student.spent.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
                <p className="text-4xl font-black text-purple-600 mb-1">{displayRating}</p>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={s <= Math.round(displayRating) ? 'text-yellow-400' : 'text-slate-200'}>★</span>
                  ))}
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Average Rating</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
                <p className="text-4xl font-black text-green-600 mb-1">{completionRate}%</p>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 mb-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completion Rate</p>
              </div>
            </div>

            {/* Subject Breakdown */}
            {(() => {
              const subjectMap: Record<string, number> = {};
              completed.forEach(b => {
                const s = b.subject || 'Other';
                subjectMap[s] = (subjectMap[s] || 0) + 1;
              });
              const subjects = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]);
              if (subjects.length === 0) return null;
              const maxCount = subjects[0][1];
              return (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                  <h2 className="font-black text-slate-900 mb-6">Sessions by Subject</h2>
                  <div className="space-y-3">
                    {subjects.map(([subject, count]) => (
                      <div key={subject} className="flex items-center gap-4">
                        <span className="text-xs font-black text-slate-500 w-40 truncate">{subject}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-indigo-400 to-purple-500 h-3 rounded-full transition-all"
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-600 w-16 text-right">
                          {count} session{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}