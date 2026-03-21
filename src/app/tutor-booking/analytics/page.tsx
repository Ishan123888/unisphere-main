'use client';
import { useRouter } from 'next/navigation';

const MONTHLY_DATA = [
  { month: 'Oct', sessions: 8, earnings: 14400 },
  { month: 'Nov', sessions: 12, earnings: 21600 },
  { month: 'Dec', sessions: 6, earnings: 10800 },
  { month: 'Jan', sessions: 15, earnings: 27000 },
  { month: 'Feb', sessions: 18, earnings: 32400 },
  { month: 'Mar', sessions: 22, earnings: 39600 },
];

const TOP_STUDENTS = [
  { name: 'Kasun Perera', sessions: 8, spent: 12600 },
  { name: 'Sanduni Wickrama', sessions: 6, spent: 9450 },
  { name: 'Nuwan Fernando', sessions: 5, spent: 7875 },
  { name: 'Dilki Rathnayaka', sessions: 3, spent: 4725 },
];

const maxEarnings = Math.max(...MONTHLY_DATA.map(d => d.earnings));

export default function AnalyticsPage() {
  const router = useRouter();

  const totalSessions = MONTHLY_DATA.reduce((s, d) => s + d.sessions, 0);
  const totalEarnings = MONTHLY_DATA.reduce((s, d) => s + d.earnings, 0);
  const avgRating = 4.9;
  const completionRate = 98;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="text-purple-200 text-sm font-bold mb-4 block hover:text-white">← Back</button>
          <h1 className="text-3xl font-black text-white">Analytics</h1>
          <p className="text-purple-200 font-medium mt-1">Your tutoring performance overview</p>

          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Sessions', value: totalSessions, icon: '📚', suffix: '' },
              { label: 'Total Earnings', value: `Rs. ${totalEarnings.toLocaleString()}`, icon: '💰', suffix: '' },
              { label: 'Avg Rating', value: avgRating, icon: '⭐', suffix: '/5.0' },
              { label: 'Completion Rate', value: completionRate, icon: '✅', suffix: '%' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                <p className="text-xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-black text-white">{stat.value}{stat.suffix}</p>
                <p className="text-purple-200 text-xs font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Earnings Chart */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-slate-900">Monthly Earnings</h2>
            <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              +22% this month
            </span>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-3 h-48">
            {MONTHLY_DATA.map((data, i) => {
              const height = (data.earnings / maxEarnings) * 100;
              const isLast = i === MONTHLY_DATA.length - 1;
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <p className="text-[10px] font-black text-slate-500">
                    Rs.{(data.earnings / 1000).toFixed(0)}k
                  </p>
                  <div className="w-full relative" style={{ height: '160px' }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-xl transition-all ${isLast ? 'bg-purple-600' : 'bg-purple-200'}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <p className="text-xs font-black text-slate-500">{data.month}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sessions Chart */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="font-black text-slate-900 mb-6">Sessions Per Month</h2>
          <div className="space-y-3">
            {MONTHLY_DATA.map(data => (
              <div key={data.month} className="flex items-center gap-4">
                <span className="text-xs font-black text-slate-500 w-8">{data.month}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all"
                    style={{ width: `${(data.sessions / 22) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-black text-slate-600 w-12 text-right">{data.sessions} sessions</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="font-black text-slate-900 mb-6">Top Students</h2>
          <div className="space-y-3">
            {TOP_STUDENTS.map((student, i) => (
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
                  <p className="text-slate-400 text-xs font-bold">{student.sessions} sessions</p>
                </div>
                <p className="font-black text-purple-600">Rs. {student.spent.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
            <p className="text-4xl font-black text-purple-600 mb-1">{avgRating}</p>
            <div className="flex justify-center gap-1 mb-2">
              {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400">★</span>)}
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Average Rating</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
            <p className="text-4xl font-black text-green-600 mb-1">{completionRate}%</p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 mb-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completion Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}