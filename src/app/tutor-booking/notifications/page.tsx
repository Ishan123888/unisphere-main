'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'success', title: 'Booking Confirmed!', message: 'Amal Perera confirmed your session on Mon 10:00 AM.', time: '2 mins ago', read: false },
  { id: 2, type: 'info', title: 'Session Reminder', message: 'Your session with Dilki Jayawardena starts in 1 hour. Check your email for the Google Meet link.', time: '1 hour ago', read: false },
  { id: 3, type: 'warning', title: 'Payment Due', message: 'Payment of Rs. 1,260 is pending for your session with Dilki Jayawardena.', time: '3 hours ago', read: false },
  { id: 4, type: 'success', title: 'Session Completed', message: 'Your session with Tharaka Silva has been marked as completed. Please leave a review!', time: 'Yesterday', read: true },
  { id: 5, type: 'info', title: 'New Tutor Available', message: 'Sanduni Wickrama is now available for Mathematics sessions. Check their profile!', time: 'Yesterday', read: true },
  { id: 6, type: 'error', title: 'Booking Cancelled', message: 'Your booking with Nethmi Rodrigo (UNI-004) has been cancelled as requested.', time: '2 days ago', read: true },
];

const TYPE_STYLES: Record<string, { bg: string; border: string; icon: string; dot: string }> = {
  success: { bg: 'bg-green-50', border: 'border-green-100', icon: '✅', dot: 'bg-green-500' },
  info: { bg: 'bg-indigo-50', border: 'border-indigo-100', icon: '📢', dot: 'bg-indigo-500' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-100', icon: '⚠️', dot: 'bg-yellow-500' },
  error: { bg: 'bg-red-50', border: 'border-red-100', icon: '❌', dot: 'bg-red-400' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === 'UNREAD' ? notifications.filter(n => !n.read) : notifications;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="text-indigo-200 text-sm font-bold mb-4 block hover:text-white transition-colors">
            ← Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">Notifications</h1>
              <p className="text-indigo-200 font-medium mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-white/30 transition-all border border-white/20"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">

        {/* Filter */}
        <div className="bg-white rounded-2xl p-1.5 flex gap-1 mb-6 shadow-sm border border-slate-100 w-fit">
          {(['ALL', 'UNREAD'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filter === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab} {tab === 'UNREAD' && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
              <p className="text-4xl mb-4">🔔</p>
              <p className="font-black text-slate-700">No notifications</p>
              <p className="text-slate-400 text-sm font-medium mt-1">You are all caught up!</p>
            </div>
          ) : (
            filtered.map(notif => {
              const style = TYPE_STYLES[notif.type];
              return (
                <div
                  key={notif.id}
                  className={`rounded-3xl p-5 border transition-all ${notif.read ? 'bg-white border-slate-100' : `${style.bg} ${style.border}`}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0 mt-0.5">{style.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-slate-900 text-sm">{notif.title}</h3>
                        {!notif.read && <span className={`w-2 h-2 rounded-full ${style.dot} flex-shrink-0`} />}
                      </div>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{notif.message}</p>
                      <p className="text-slate-300 text-xs font-bold mt-2">{notif.time}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!notif.read && (
                        <button
                          onClick={() => markRead(notif.id)}
                          className="text-xs font-black text-indigo-500 hover:text-indigo-700 transition-colors"
                        >
                          Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotif(notif.id)}
                        className="text-xs font-black text-slate-300 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}