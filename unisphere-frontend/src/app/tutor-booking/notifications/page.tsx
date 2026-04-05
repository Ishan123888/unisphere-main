'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

const NOTIF_API = 'http://localhost:8081/api/v1/notifications';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

const TYPE_CONFIG: Record<string, { icon: string; bg: string; border: string; badge: string }> = {
  SUCCESS: { icon: '✅', bg: 'bg-emerald-50', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700' },
  WARNING: { icon: '⚠️', bg: 'bg-amber-50',   border: 'border-amber-100',   badge: 'bg-amber-100 text-amber-700'   },
  ERROR:   { icon: '❌', bg: 'bg-rose-50',     border: 'border-rose-100',    badge: 'bg-rose-100 text-rose-600'     },
  INFO:    { icon: '📢', bg: 'bg-indigo-50',   border: 'border-indigo-100',  badge: 'bg-indigo-100 text-indigo-700' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [markingAll, setMarkingAll] = useState(false);

  const username =
    typeof window !== 'undefined'
      ? localStorage.getItem('username') || 'it24100001'
      : 'it24100001';

  useEffect(() => {
    fetchNotifications();
  }, [username]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${NOTIF_API}/${username}`);
      setNotifications(res.data);
    } catch {
      setError('Cannot load notifications. Ensure booking service is running on port 8081.');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: number) => {
    try {
      await axios.put(`${NOTIF_API}/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      // silently fail
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    const unread = notifications.filter(n => !n.read);
    await Promise.allSettled(unread.map(n => axios.put(`${NOTIF_API}/${n.id}/read`)));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setMarkingAll(false);
  };

  const filtered = filter === 'ALL'
    ? notifications
    : filter === 'UNREAD'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Notifications</h1>
          <p className="text-slate-400 text-sm font-medium mt-0.5">
            {loading ? 'Loading...' : `${notifications.length} total · `}
            {!loading && unreadCount > 0 && (
              <span className="text-indigo-600 font-black">{unreadCount} unread</span>
            )}
            {!loading && unreadCount === 0 && (
              <span className="text-emerald-600 font-black">All caught up!</span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="text-xs font-black px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all disabled:opacity-60"
            >
              {markingAll ? '...' : '✓ Mark All Read'}
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="text-xs font-black px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3">
          <span>⚠️</span>
          <p className="text-rose-600 text-sm font-bold flex-1">{error}</p>
          <button onClick={fetchNotifications} className="text-xs font-black text-rose-600 underline">Retry</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-1.5 flex gap-1 mb-6 shadow-sm border border-slate-100 w-fit overflow-x-auto">
        {['ALL', 'UNREAD', 'SUCCESS', 'INFO', 'WARNING', 'ERROR'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              filter === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
            {tab === 'UNREAD' && unreadCount > 0 && (
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${filter === tab ? 'bg-white/20' : 'bg-rose-100 text-rose-600'}`}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black text-slate-600 text-sm">Loading notifications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
          <p className="text-4xl mb-4">🎉</p>
          <p className="font-black text-slate-700">
            {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications found'}
          </p>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            {filter === 'UNREAD' ? "You're all caught up!" : 'Notifications appear here when bookings are made.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(notif => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG['INFO'];
            return (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition-all ${
                  notif.read
                    ? 'bg-white border-slate-100'
                    : `${config.bg} ${config.border} shadow-sm`
                }`}
              >
                <div className="flex gap-4">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-black text-sm ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                          {notif.title}
                        </h3>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                        )}
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${config.badge}`}>
                          {notif.type}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap flex-shrink-0">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                    {!notif.read && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="mt-3 text-[10px] font-black text-indigo-600 uppercase tracking-wide hover:text-indigo-800 transition-colors"
                      >
                        Mark as Read →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-8">
        Notifications are synced from the booking service
      </p>
    </div>
  );
}