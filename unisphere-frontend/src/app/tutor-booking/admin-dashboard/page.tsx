'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const RECENT_BOOKINGS = [
  { id: 'UNI-001', student: 'Ishan Ekanayaka', tutor: 'Amal Perera', subject: 'DSA', amount: 3150, status: 'CONFIRMED', date: 'Mar 24' },
  { id: 'UNI-002', student: 'Kasun Perera', tutor: 'Dilki Jayawardena', subject: 'DBMS', amount: 1260, status: 'PENDING', date: 'Mar 25' },
  { id: 'UNI-003', student: 'Sanduni W.', tutor: 'Tharaka Silva', subject: 'Web Tech', amount: 4200, status: 'COMPLETED', date: 'Mar 21' },
  { id: 'UNI-004', student: 'Nuwan F.', tutor: 'Nethmi Rodrigo', subject: 'Networks', amount: 1155, status: 'CANCELLED', date: 'Mar 20' },
];

const PENDING_TUTORS = [
  { id: 1, name: 'Chamara Bandara', subject: 'Machine Learning', year: '4th Year', gpa: '3.9', avatar: 'CB' },
  { id: 2, name: 'Prasadi Wijesinghe', subject: 'Mobile Development', year: '3rd Year', gpa: '3.7', avatar: 'PW' },
];

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-50 text-green-700',
  PENDING: 'bg-yellow-50 text-yellow-700',
  COMPLETED: 'bg-indigo-50 text-indigo-700',
  CANCELLED: 'bg-red-50 text-red-500',
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tutors, setTutors] = useState(PENDING_TUTORS);

  const handleTutorAction = (id: number, action: 'approve' | 'reject') => {
    setTutors(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-orange-600 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-red-200 text-sm font-bold mb-1">System Control</p>
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          <p className="text-red-200 font-medium mt-1">Real-time platform monitoring</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Students', value: '247', icon: '👨‍🎓', trend: '+12 this week' },
              { label: 'Active Tutors', value: '38', icon: '👨‍🏫', trend: '+3 pending' },
              { label: 'Total Bookings', value: '1,284', icon: '📚', trend: '+28 today' },
              { label: 'Platform Revenue', value: 'Rs. 64,200', icon: '💰', trend: '+15% this month' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                <p className="text-xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-red-200 text-xs font-bold">{stat.label}</p>
                <p className="text-red-300 text-[10px] font-bold mt-1">{stat.trend}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Manage Bookings', icon: '📋', path: '/tutor-booking/admin-dashboard/manage-bookings', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
            { label: 'Approve Tutors', icon: '✅', path: '/tutor-booking/admin-dashboard/approve-tutors', color: 'bg-green-50 text-green-600 border-green-100' },
            { label: 'System Stats', icon: '📊', path: '/tutor-booking/admin-dashboard/stats', color: 'bg-purple-50 text-purple-600 border-purple-100' },
            { label: 'User Management', icon: '👥', path: '/tutor-booking/admin-dashboard/users', color: 'bg-orange-50 text-orange-600 border-orange-100' },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => router.push(action.path)}
              className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${action.color} bg-white`}
            >
              <p className="text-2xl mb-2">{action.icon}</p>
              <p className="font-black text-sm">{action.label}</p>
            </button>
          ))}
        </div>

        {/* Pending Tutor Approvals */}
        {tutors.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-slate-900">Pending Tutor Approvals</h2>
              <span className="bg-red-50 text-red-600 text-xs font-black px-3 py-1 rounded-full border border-red-100">
                {tutors.length} pending
              </span>
            </div>
            <div className="space-y-4">
              {tutors.map(tutor => (
                <div key={tutor.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center font-black text-red-600 text-sm flex-shrink-0">
                    {tutor.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900">{tutor.name}</p>
                    <p className="text-sm font-bold text-slate-500">{tutor.subject} — {tutor.year} — GPA {tutor.gpa}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTutorAction(tutor.id, 'reject')}
                      className="px-4 py-2 text-xs font-black bg-red-50 text-red-500 rounded-xl border border-red-200 hover:bg-red-100 transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleTutorAction(tutor.id, 'approve')}
                      className="px-4 py-2 text-xs font-black bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tutors.length === 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <p className="font-black text-slate-700">No pending tutor approvals</p>
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-slate-900">Recent Bookings</h2>
            <button
              onClick={() => router.push('/tutor-booking/admin-dashboard/manage-bookings')}
              className="text-xs font-black text-indigo-600 hover:text-indigo-700"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {RECENT_BOOKINGS.map(booking => (
              <div key={booking.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-black text-slate-900 text-sm truncate">{booking.student}</p>
                    <span className="text-slate-300 text-xs">→</span>
                    <p className="text-slate-500 text-sm font-bold truncate">{booking.tutor}</p>
                  </div>
                  <p className="text-xs font-bold text-indigo-500">{booking.subject} — {booking.date}</p>
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLES[booking.status]}`}>
                  {booking.status}
                </span>
                <p className="font-black text-slate-700 text-sm flex-shrink-0">Rs. {booking.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="font-black text-slate-900 mb-6">System Health</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'API Gateway', status: 'Online', color: 'text-green-600 bg-green-50' },
              { label: 'Identity Service', status: 'Online', color: 'text-green-600 bg-green-50' },
              { label: 'Booking Service', status: 'Online', color: 'text-green-600 bg-green-50' },
              { label: 'Database', status: 'Online', color: 'text-green-600 bg-green-50' },
            ].map(service => (
              <div key={service.label} className={`p-4 rounded-2xl ${service.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs font-black">{service.status}</span>
                </div>
                <p className="text-xs font-bold opacity-70">{service.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}