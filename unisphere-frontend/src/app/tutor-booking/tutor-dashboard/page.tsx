'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INITIAL_REQUESTS = [
  { id: 'UNI-005', studentName: 'Kasun Perera', studentId: 'IT22345678', subject: 'Data Structures & Algorithms', topic: 'Binary Trees and Graph Traversal', slot: 'Mon 10:00 AM', date: 'Mar 24, 2026', duration: '2 Hours', sessionType: 'Online', amount: 3150, status: 'PENDING' },
  { id: 'UNI-006', studentName: 'Sanduni Wickrama', studentId: 'IT22456789', subject: 'Data Structures & Algorithms', topic: 'Dynamic Programming', slot: 'Wed 3:00 PM', date: 'Mar 26, 2026', duration: '1 Hour', sessionType: 'Physical', amount: 1575, status: 'PENDING' },
  { id: 'UNI-007', studentName: 'Nuwan Fernando', studentId: 'IT22567890', subject: 'Data Structures & Algorithms', topic: 'Sorting Algorithms', slot: 'Fri 1:00 PM', date: 'Mar 28, 2026', duration: '2 Hours', sessionType: 'Online', amount: 3150, status: 'CONFIRMED' },
  { id: 'UNI-008', studentName: 'Dilki Rathnayaka', studentId: 'IT22678901', subject: 'Data Structures & Algorithms', topic: 'Hash Tables', slot: 'Mon 2:00 PM', date: 'Mar 24, 2026', duration: '1 Hour', sessionType: 'Online', amount: 1575, status: 'COMPLETED' },
];

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-50 text-green-700 border border-green-200',
  PENDING: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  COMPLETED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  REJECTED: 'bg-red-50 text-red-500 border border-red-200',
};

export default function TutorDashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter);

  const stats = {
    pending: requests.filter(r => r.status === 'PENDING').length,
    confirmed: requests.filter(r => r.status === 'CONFIRMED').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
    earnings: requests.filter(r => r.status !== 'REJECTED').reduce((s, r) => s + r.amount, 0),
  };

  const handleAction = (id: string, action: 'CONFIRMED' | 'REJECTED') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-bold mb-1">Tutor Panel</p>
              <h1 className="text-3xl font-black text-white">Tutor Dashboard</h1>
              <p className="text-purple-200 font-medium mt-1">Manage your student requests</p>
            </div>
            <button
              onClick={() => router.push('/tutor-booking/availability-manager')}
              className="bg-white text-purple-600 px-5 py-3 rounded-2xl font-black text-sm hover:bg-purple-50 transition-all shadow-lg"
            >
              Manage Availability
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Pending Requests', value: stats.pending, icon: '⏳' },
              { label: 'Confirmed', value: stats.confirmed, icon: '✅' },
              { label: 'Completed', value: stats.completed, icon: '🎓' },
              { label: 'Total Earnings', value: `Rs. ${stats.earnings.toLocaleString()}`, icon: '💰' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                <p className="text-xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-purple-200 text-xs font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl p-1.5 flex gap-1 mb-6 shadow-sm border border-slate-100 w-fit">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filter === tab ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Requests */}
        <div className="space-y-4">
          {filtered.map(req => (
            <div key={req.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center font-black text-purple-600 text-sm flex-shrink-0">
                  {req.studentName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3 className="font-black text-slate-900">{req.studentName}</h3>
                    <span className="text-xs text-slate-400 font-bold">{req.studentId}</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLES[req.status]}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-purple-600 mb-2">{req.topic}</p>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                    <span>📅 {req.date}</span>
                    <span>🕐 {req.slot}</span>
                    <span>⏱ {req.duration}</span>
                    <span>{req.sessionType === 'Online' ? '💻' : '📍'} {req.sessionType}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-purple-600 text-lg mb-3">Rs. {req.amount.toLocaleString()}</p>
                  {req.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(req.id, 'REJECTED')}
                        className="px-4 py-2 text-xs font-black bg-red-50 text-red-500 rounded-xl border border-red-200 hover:bg-red-100 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'CONFIRMED')}
                        className="px-4 py-2 text-xs font-black bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-sm"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                  {req.status === 'CONFIRMED' && (
                    <button
                      onClick={() => router.push('/tutor-booking/session-portal')}
                      className="px-4 py-2 text-xs font-black bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
                    >
                      Start Session
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}