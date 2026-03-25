'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ALL_BOOKINGS = [
  { id: 'UNI-001', student: 'Ishan Ekanayaka', studentId: 'IT22156700', tutor: 'Amal Perera', subject: 'Data Structures & Algorithms', slot: 'Mon 10:00 AM', date: 'Mar 24, 2026', duration: '2 Hours', amount: 3150, status: 'CONFIRMED' },
  { id: 'UNI-002', student: 'Kasun Perera', studentId: 'IT22345678', tutor: 'Dilki Jayawardena', subject: 'Database Management', slot: 'Tue 3:00 PM', date: 'Mar 25, 2026', duration: '1 Hour', amount: 1260, status: 'PENDING' },
  { id: 'UNI-003', student: 'Sanduni Wickrama', studentId: 'IT22456789', tutor: 'Tharaka Silva', subject: 'Web Technologies', slot: 'Fri 1:00 PM', date: 'Mar 21, 2026', duration: '2 Hours', amount: 4200, status: 'COMPLETED' },
  { id: 'UNI-004', student: 'Nuwan Fernando', studentId: 'IT22567890', tutor: 'Nethmi Rodrigo', subject: 'Computer Networks', slot: 'Wed 11:00 AM', date: 'Mar 20, 2026', duration: '1 Hour', amount: 1155, status: 'CANCELLED' },
  { id: 'UNI-005', student: 'Dilki Rathnayaka', studentId: 'IT22678901', tutor: 'Kasun Madushanka', subject: 'Software Engineering', slot: 'Thu 2:00 PM', date: 'Mar 22, 2026', duration: '2 Hours', amount: 3780, status: 'CONFIRMED' },
  { id: 'UNI-006', student: 'Tharaka Mendis', studentId: 'IT22789012', tutor: 'Amal Perera', subject: 'Data Structures & Algorithms', slot: 'Fri 9:00 AM', date: 'Mar 28, 2026', duration: '1 Hour', amount: 1575, status: 'PENDING' },
];

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-50 text-green-700 border border-green-200',
  PENDING: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  COMPLETED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  CANCELLED: 'bg-red-50 text-red-500 border border-red-200',
};

export default function ManageBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState(ALL_BOOKINGS);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = bookings.filter(b => {
    const matchFilter = filter === 'ALL' || b.status === filter;
    const matchSearch = !search || b.student.toLowerCase().includes(search.toLowerCase()) ||
      b.tutor.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleCancel = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
  };

  const totalRevenue = bookings.filter(b => b.status !== 'CANCELLED').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-gradient-to-br from-red-600 to-orange-600 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => router.back()} className="text-red-200 text-sm font-bold mb-4 block hover:text-white">← Back</button>
          <h1 className="text-3xl font-black text-white">Manage Bookings</h1>
          <p className="text-red-200 font-medium mt-1">Total Platform Revenue: <span className="text-white font-black">Rs. {totalRevenue.toLocaleString()}</span></p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Search + Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by student, tutor or booking ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-5 py-3 bg-white rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-400 placeholder:text-slate-300"
          />
          <div className="bg-white rounded-2xl p-1.5 flex gap-1 border border-slate-200">
            {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  filter === tab ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Booking ID', 'Student', 'Tutor', 'Subject', 'Date', 'Amount', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(booking => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-xs font-black text-indigo-600">{booking.id}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-black text-slate-900">{booking.student}</p>
                    <p className="text-xs text-slate-400 font-bold">{booking.studentId}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-700">{booking.tutor}</td>
                  <td className="px-5 py-4 text-xs font-bold text-slate-500">{booking.subject}</td>
                  <td className="px-5 py-4 text-xs font-bold text-slate-500">{booking.date}</td>
                  <td className="px-5 py-4 text-sm font-black text-slate-800">Rs. {booking.amount.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLES[booking.status]}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="text-xs font-black text-red-500 hover:text-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-slate-400 font-bold">No bookings found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}