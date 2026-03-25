'use client';
import { useRouter } from 'next/navigation';

const MONTHLY = [
  { month: 'Oct', bookings: 42, revenue: 63000, students: 28 },
  { month: 'Nov', bookings: 67, revenue: 100500, students: 45 },
  { month: 'Dec', bookings: 35, revenue: 52500, students: 24 },
  { month: 'Jan', bookings: 89, revenue: 133500, students: 62 },
  { month: 'Feb', bookings: 112, revenue: 168000, students: 78 },
  { month: 'Mar', bookings: 134, revenue: 201000, students: 94 },
];

const TOP_SUBJECTS = [
  { subject: 'Data Structures & Algorithms', bookings: 287, percent: 85 },
  { subject: 'Web Technologies', bookings: 198, percent: 59 },
  { subject: 'Database Management', bookings: 176, percent: 52 },
  { subject: 'Software Engineering', bookings: 143, percent: 42 },
  { subject: 'Computer Networks', bookings: 98, percent: 29 },
];

const maxBookings = Math.max(...MONTHLY.map(d => d.bookings));

export default function SystemStatsPage() {
  const router = useRouter();

  const totalBookings = MONTHLY.reduce((s, d) => s + d.bookings, 0);
  const totalRevenue = MONTHLY.reduce((s, d) => s + d.revenue, 0);
  const totalStudents = 247;
  const totalTutors = 38;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-orange-600 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="text-red-200 text-sm font-bold mb-4 block hover:text-white">← Back</button>
          <h1 className="text-3xl font-black text-white">System Statistics</h1>
          <p className="text-red-200 font-medium mt-1">Platform-wide performance overview</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Bookings', value: totalBookings.toLocaleString(), icon: '📚' },
              { label: 'Platform Revenue', value: `Rs. ${(totalRevenue / 1000).toFixed(0)}k`, icon: '💰' },
              { label: 'Registered Students', value: totalStudents, icon: '👨‍🎓' },
              { label: 'Active Tutors', value: totalTutors, icon: '👨‍🏫' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                <p className="text-xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-red-200 text-xs font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Bookings Chart */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-slate-900">Monthly Bookings</h2>
            <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              +20% this month
            </span>
          </div>
          <div className="flex items-end gap-3 h-48">
            {MONTHLY.map((data, i) => {
              const height = (data.bookings / maxBookings) * 100;
              const isLast = i === MONTHLY.length - 1;
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <p className="text-[10px] font-black text-slate-500">{data.bookings}</p>
                  <div className="w-full relative" style={{ height: '160px' }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-xl ${isLast ? 'bg-red-500' : 'bg-red-200'}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <p className="text-xs font-black text-slate-500">{data.month}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="font-black text-slate-900 mb-6">Revenue Trend</h2>
          <div className="space-y-3">
            {MONTHLY.map((data, i) => (
              <div key={data.month} className="flex items-center gap-4">
                <span className="text-xs font-black text-slate-500 w-8">{data.month}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-red-500 to-orange-400 h-3 rounded-full"
                    style={{ width: `${(data.revenue / 201000) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-black text-slate-600 w-20 text-right">
                  Rs. {(data.revenue / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Subjects */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="font-black text-slate-900 mb-6">Most Booked Subjects</h2>
          <div className="space-y-4">
            {TOP_SUBJECTS.map((item, i) => (
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
                  <span className="text-sm font-black text-slate-500">{item.bookings} bookings</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-red-500 to-orange-400 h-2.5 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Health */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Booking Success Rate', value: '94%', color: 'text-green-600' },
            { label: 'Avg Session Rating', value: '4.8 ★', color: 'text-yellow-600' },
            { label: 'Tutor Approval Rate', value: '72%', color: 'text-indigo-600' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
              <p className={`text-3xl font-black mb-1 ${item.color}`}>{item.value}</p>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}