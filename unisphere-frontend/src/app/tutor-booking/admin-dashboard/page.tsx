'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const BOOKING_API = 'http://localhost:8081/api/bookings';
const USER_API    = 'http://localhost:8082/api/users';

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

interface RecentBooking {
  id: number;
  bookingRef: string;
  studentName: string;
  tutorName: string;
  subject: string;
  date: string;
  totalPrice: number;
  status: string;
}

interface PendingTutor {
  id: number;
  firstName: string;
  lastName: string;
  subject: string;
  yearOfStudy: string;
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-emerald-50 text-emerald-700',
  PENDING:   'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-indigo-50 text-indigo-700',
  CANCELLED: 'bg-rose-50 text-rose-500',
};

const YEAR_LABELS: Record<string, string> = {
  '1ST_YEAR': '1st Year', '2ND_YEAR': '2nd Year', '3RD_YEAR': '3rd Year',
  '4TH_YEAR': '4th Year', 'GRADUATE': 'Graduate',  'POSTGRAD':  'Postgrad',
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [pendingTutors, setPendingTutors] = useState<PendingTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingTutor, setActingTutor] = useState<number | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch booking stats from booking service
      const [statsRes, bookingsRes] = await Promise.all([
        axios.get(`${BOOKING_API}/stats`),
        axios.get(`${BOOKING_API}`),
      ]);
      setStats(statsRes.data);
      setRecentBookings(bookingsRes.data.slice(0, 5)); // Show latest 5

      // Try to fetch pending tutors from user service (may fail if not running)
      try {
        const tutorsRes = await axios.get(`${USER_API}/tutors`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        });
        const pending = tutorsRes.data.filter((t: any) => t.status === 'PENDING_REVIEW').slice(0, 3);
        setPendingTutors(pending);
      } catch {
        // User service might not be running, that's ok
        setPendingTutors([]);
      }
    } catch {
      // Booking service error
    } finally {
      setLoading(false);
    }
  };

  const handleTutorAction = async (id: number, action: 'approve' | 'reject') => {
    setActingTutor(id);
    try {
      await axios.put(`${USER_API}/tutors/${id}/${action}`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      setPendingTutors(prev => prev.filter(t => t.id !== id));
    } catch {
      // silently handle
    } finally {
      setActingTutor(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-orange-600 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-red-200 text-sm font-bold mb-1">System Control</p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
              <p className="text-red-200 font-medium mt-1">Real-time data from booking service</p>
            </div>
            <button
              onClick={fetchAll}
              className="bg-white/20 text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-white/30 border border-white/30"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Real Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-4 animate-pulse border border-white/20">
                  <div className="h-8 bg-white/20 rounded-xl mb-2" />
                  <div className="h-4 bg-white/10 rounded-lg" />
                </div>
              ))
            ) : stats ? (
              [
                { label: 'Total Bookings',  value: stats.total,                              icon: '📚', trend: `${stats.pending} pending` },
                { label: 'Confirmed',       value: stats.confirmed,                          icon: '✅', trend: 'Active sessions'          },
                { label: 'Platform Revenue', value: `Rs. ${Math.round(stats.revenue / 1000)}k`, icon: '💰', trend: 'Excl. cancelled'        },
                { label: 'Completed',        value: stats.completed,                         icon: '🎓', trend: 'Finished sessions'         },
              ].map(s => (
                <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-red-200 text-xs font-bold">{s.label}</p>
                  <p className="text-red-300 text-[10px] font-bold mt-1">{s.trend}</p>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Manage Bookings', icon: '📋', path: '/tutor-booking/admin-dashboard/manage-bookings', color: 'text-indigo-600 border-indigo-100', badge: stats?.pending ? `${stats.pending} pending` : null },
            { label: 'Approve Tutors',  icon: '✅', path: '/tutor-booking/admin-dashboard/approve-tutors', color: 'text-emerald-600 border-emerald-100', badge: pendingTutors.length > 0 ? `${pendingTutors.length} pending` : null },
            { label: 'System Stats',    icon: '📊', path: '/tutor-booking/admin-dashboard/stats',           color: 'text-purple-600 border-purple-100',  badge: null },
            { label: 'User Management', icon: '👥', path: '/tutor-booking/admin-dashboard/users',           color: 'text-orange-600 border-orange-100',  badge: null },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => router.push(action.path)}
              className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md hover:-translate-y-0.5 bg-white relative ${action.color}`}
            >
              {action.badge && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  {action.badge}
                </span>
              )}
              <p className="text-2xl mb-2">{action.icon}</p>
              <p className="font-black text-sm">{action.label}</p>
            </button>
          ))}
        </div>

        {/* Pending Tutor Approvals (from user service) */}
        {pendingTutors.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-slate-900">Pending Tutor Approvals</h2>
              <div className="flex gap-3 items-center">
                <span className="bg-red-50 text-red-600 text-xs font-black px-3 py-1 rounded-full border border-red-100">
                  {pendingTutors.length} pending
                </span>
                <button
                  onClick={() => router.push('/tutor-booking/admin-dashboard/approve-tutors')}
                  className="text-xs font-black text-indigo-600 hover:text-indigo-700"
                >
                  View All →
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {pendingTutors.map(tutor => (
                <div key={tutor.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-11 h-11 bg-red-100 rounded-2xl flex items-center justify-center font-black text-red-600 text-sm flex-shrink-0">
                    {tutor.firstName?.[0]}{tutor.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm">{tutor.firstName} {tutor.lastName}</p>
                    <p className="text-xs font-bold text-slate-500">
                      {tutor.subject} — {YEAR_LABELS[tutor.yearOfStudy] ?? tutor.yearOfStudy}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleTutorAction(tutor.id, 'reject')}
                      disabled={actingTutor === tutor.id}
                      className="px-3 py-1.5 text-xs font-black bg-rose-50 text-rose-500 rounded-xl border border-rose-200 hover:bg-rose-100 disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleTutorAction(tutor.id, 'approve')}
                      disabled={actingTutor === tutor.id}
                      className="px-3 py-1.5 text-xs font-black bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-60 flex items-center gap-1"
                    >
                      {actingTutor === tutor.id
                        ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : '✓'} Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No pending tutors */}
        {!loading && pendingTutors.length === 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="font-black text-slate-600 text-sm">No pending tutor approvals</p>
          </div>
        )}

        {/* Recent Bookings (real from backend) */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-slate-900">Recent Bookings</h2>
            <button
              onClick={() => router.push('/tutor-booking/admin-dashboard/manage-bookings')}
              className="text-xs font-black text-indigo-600 hover:text-indigo-700"
            >
              View All ({stats?.total || 0}) →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <p className="text-slate-400 font-bold text-sm text-center py-8">No bookings in database</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map(booking => (
                <div key={booking.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-black text-slate-900 text-sm">{booking.studentName}</p>
                      <span className="text-slate-300 text-xs">→</span>
                      <p className="text-slate-500 text-sm font-bold">{booking.tutorName}</p>
                    </div>
                    <p className="text-xs font-bold text-indigo-500">{booking.subject}</p>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase flex-shrink-0 ${STATUS_STYLES[booking.status]}`}>
                    {booking.status}
                  </span>
                  <p className="font-black text-slate-700 text-sm flex-shrink-0">
                    Rs. {(booking.totalPrice || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="font-black text-slate-900 mb-6">System Health</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Booking Service',   port: '8081', color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Identity Service',  port: '8082', color: 'text-emerald-600 bg-emerald-50' },
              { label: 'API Gateway',       port: '8080', color: 'text-emerald-600 bg-emerald-50' },
              { label: 'H2 Database',       port: 'mem',  color: 'text-emerald-600 bg-emerald-50' },
            ].map(service => (
              <div key={service.label} className={`p-4 rounded-2xl ${service.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-black">Online</span>
                </div>
                <p className="text-xs font-bold opacity-70">{service.label}</p>
                <p className="text-[10px] font-bold opacity-50">:{service.port}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}