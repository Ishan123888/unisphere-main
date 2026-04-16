'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const BOOKING_API = 'http://localhost:8081/api/bookings';

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  PENDING:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400'  },
  COMPLETED: { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  dot: 'bg-indigo-500' },
  CANCELLED: { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200',    dot: 'bg-rose-400'   },
};

interface Booking {
  id: number;
  bookingRef: string;
  tutorId: number;
  tutorName: string;
  tutorAvatar: string;
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

export default function StudentDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string>('');

  const fetchBookings = async (uname: string, showLoading = true) => {
    if (!uname) return;
    if (showLoading) setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      // Headers වලට 'Content-Type' එකත් අනිවාර්යයෙන්ම එකතු කළා
      const res = await axios.get(`${BOOKING_API}/student/${uname}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Response Data:", res.data);
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Axios Fetch Error:", err);
      setError('Connection failed. Please check if Backend is running on 8081.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || 'it24100001';
    setCurrentUsername(storedUsername);

    fetchBookings(storedUsername);

    const stompClient = new Client({
      brokerURL: 'ws://localhost:8081/ws-booking',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.webSocketFactory = () => new SockJS('http://localhost:8081/ws-booking');

    stompClient.onConnect = () => {
      stompClient.subscribe(`/topic/bookings/${storedUsername}`, () => {
        fetchBookings(storedUsername, false);
      });
    };

    stompClient.activate();

    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, []);

  const handleCancel = async (id: number) => {
    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BOOKING_API}/${id}/cancel`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
    } catch {
      setError('Failed to cancel booking.');
    } finally {
      setCancelling(false);
      setCancelId(null);
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    total:     bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    pending:   bookings.filter(b => b.status === 'PENDING').length,
    spent:     bookings
      .filter(b => b.status !== 'CANCELLED' && b.totalPrice)
      .reduce((s, b) => s + b.totalPrice, 0),
  };

  const TABS = ['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-indigo-200 text-sm font-bold mb-1">
                Welcome back, <span className="text-white">{currentUsername}</span>
              </p>
              <h1 className="text-3xl font-black text-white">My Bookings</h1>
              <p className="text-indigo-200 text-sm mt-1">
                {loading ? 'Loading...' : `${bookings.length} total sessions`}
              </p>
            </div>
<<<<<<< HEAD
            <button
              onClick={() => router.push('/tutor-booking')}
              className="bg-white text-indigo-600 px-5 py-3 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all shadow-lg"
            >
              + Book a Tutor
            </button>
=======
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/portfolio')}
                className="bg-white/15 border border-white/30 text-white px-5 py-3 rounded-2xl font-black text-sm hover:bg-white/25 transition-all shadow-lg flex items-center gap-2">
                🎓 My Portfolio
              </button>
              <button onClick={() => router.push('/tutor-booking')}
                className="bg-white text-indigo-600 px-5 py-3 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all shadow-lg">
                + Book a Tutor
              </button>
            </div>
>>>>>>> DEV
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Bookings', value: stats.total,                           icon: '📚', color: 'text-white' },
              { label: 'Confirmed',      value: stats.confirmed,                       icon: '✅', color: 'text-emerald-300' },
              { label: 'Pending',        value: stats.pending,                         icon: '⏳', color: 'text-amber-300' },
              { label: 'Total Spent',    value: `Rs. ${stats.spent.toLocaleString()}`, icon: '💰', color: 'text-yellow-300' },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                <p className="text-xl mb-1">{s.icon}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-indigo-200 text-xs font-bold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 px-5 py-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3">
            <span className="text-rose-500">⚠️</span>
            <p className="text-rose-600 text-sm font-bold flex-1">{error}</p>
            <button onClick={() => fetchBookings(currentUsername)} className="text-xs font-black text-rose-600 underline">Retry</button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-1.5 flex gap-1 mb-6 shadow-sm border border-slate-100 overflow-x-auto w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab}
              {tab !== 'ALL' && bookings.filter(b => b.status === tab).length > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  filter === tab ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  {bookings.filter(b => b.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="font-black text-slate-600 text-sm uppercase tracking-widest">Loading from server...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <p className="text-5xl mb-4">📭</p>
            <p className="font-black text-slate-700 text-lg">No {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings</p>
            <p className="text-slate-400 text-sm mt-1">
              {filter === 'ALL' ? 'Start by booking your first tutor session!' : 'No bookings with this status found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => {
              const style = STATUS_STYLES[booking.status] || STATUS_STYLES['PENDING'];
              const dt = booking.scheduledSlot ? formatDateTime(booking.scheduledSlot) : null;

              return (
                <div key={booking.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all overflow-hidden">
                  <div className={`h-1 w-full ${style.dot}`} />
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-sm flex-shrink-0">
                        {/* Mapping fix for tutor name keys */}
                        {booking.tutorAvatar || (booking.tutorName || (booking as any).tutor_name || "TU").split(' ').map((n:any) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-black text-slate-900 text-lg">
                            {booking.tutorName || (booking as any).tutor_name || "Unknown Tutor"}
                          </h3>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider flex items-center gap-1.5 ${style.bg} ${style.text} ${style.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-indigo-600 mb-2">{booking.subject}</p>
                        {booking.topic && <p className="text-xs text-slate-500 mb-3 font-medium">📖 {booking.topic}</p>}
                        <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                          {dt && <><span>📅 {dt.date}</span><span>🕐 {dt.time}</span></>}
                          <span>⏱ {booking.duration}</span>
                          <span>{booking.sessionType === 'Online' ? '💻' : '📍'} {booking.sessionType}</span>
                          <span className="text-indigo-400">🔖 {booking.bookingRef || (booking as any).booking_ref}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-left md:text-right">
                        <p className="font-black text-slate-900 text-xl">Rs. {(booking.totalPrice || 0).toLocaleString()}</p>
                        <div className="flex flex-wrap gap-2 mt-3 md:justify-end">
                          {booking.status === 'CONFIRMED' && booking.meetingLink && (
                            <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all">Join Meet 🔗</a>
                          )}
                          {booking.status === 'COMPLETED' && (
                            <button onClick={() => router.push(`/tutor-booking/rating-feedback?bookingId=${booking.id}&tutorId=${booking.tutorId}`)} className="text-[10px] font-black px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-200 hover:bg-yellow-100 transition-all">⭐ Rate</button>
                          )}
                          {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                            <button onClick={() => router.push(`/tutor-booking/invoice?id=${booking.id}`)} className="text-[10px] font-black px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all">📄 Invoice</button>
                          )}
                          {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                            <button onClick={() => setCancelId(booking.id)} className="text-[10px] font-black px-4 py-2 bg-rose-50 text-rose-500 rounded-xl border border-rose-200 hover:bg-rose-100 transition-all">Cancel</button>
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

      {cancelId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🚫</div>
            <h3 className="text-lg font-black text-slate-900 text-center mb-2">Cancel Session?</h3>
            <p className="text-slate-400 text-sm font-medium text-center mb-2">
              Booking <span className="font-black text-slate-600">{bookings.find(b => b.id === cancelId)?.bookingRef}</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelId(null)} className="flex-1 py-3 rounded-2xl font-black text-sm border-2 border-slate-200 text-slate-600">Keep It</button>
              <button onClick={() => handleCancel(cancelId)} disabled={cancelling} className="flex-1 py-3 rounded-2xl font-black text-sm bg-rose-500 text-white disabled:opacity-60">{cancelling ? '...' : 'Yes, Cancel'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}