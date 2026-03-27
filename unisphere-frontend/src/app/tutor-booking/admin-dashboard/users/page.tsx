'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/* ── Dummy Users ──────────────────────────────────────────────────── */
const INITIAL_USERS = [
  { id: 1,  username: 'it24100001', email: 'it24100001@my.sliit.lk', role: 'STUDENT', name: 'Ishan Ekanayaka',    status: 'ACTIVE',   joined: 'Mar 21, 2026', sessions: 3  },
  { id: 2,  username: 'it24100002', email: 'it24100002@my.sliit.lk', role: 'TUTOR',   name: 'Amal Perera',       status: 'ACTIVE',   joined: 'Mar 20, 2026', sessions: 312 },
  { id: 3,  username: 'it22345678', email: 'it22345678@my.sliit.lk', role: 'STUDENT', name: 'Kasun Perera',      status: 'ACTIVE',   joined: 'Mar 19, 2026', sessions: 8  },
  { id: 4,  username: 'it22456789', email: 'it22456789@my.sliit.lk', role: 'STUDENT', name: 'Sanduni Wickrama',  status: 'ACTIVE',   joined: 'Mar 18, 2026', sessions: 5  },
  { id: 5,  username: 'it22567890', email: 'it22567890@my.sliit.lk', role: 'TUTOR',   name: 'Tharaka Silva',     status: 'ACTIVE',   joined: 'Mar 17, 2026', sessions: 487 },
  { id: 6,  username: 'it22678901', email: 'it22678901@my.sliit.lk', role: 'STUDENT', name: 'Dilki Rathnayaka',  status: 'SUSPENDED', joined: 'Mar 15, 2026', sessions: 2  },
  { id: 7,  username: 'it22789012', email: 'it22789012@my.sliit.lk', role: 'TUTOR',   name: 'Dilki Jayawardena', status: 'ACTIVE',   joined: 'Mar 14, 2026', sessions: 215 },
  { id: 8,  username: 'it21123456', email: 'it21123456@my.sliit.lk', role: 'STUDENT', name: 'Nuwan Fernando',    status: 'ACTIVE',   joined: 'Mar 13, 2026', sessions: 4  },
  { id: 9,  username: 'it21234567', email: 'it21234567@my.sliit.lk', role: 'TUTOR',   name: 'Nethmi Rodrigo',    status: 'ACTIVE',   joined: 'Mar 12, 2026', sessions: 143 },
  { id: 10, username: 'ad00000001', email: 'admin@unisphere.lk',      role: 'ADMIN',   name: 'System Admin',      status: 'ACTIVE',   joined: 'Jan 01, 2026', sessions: 0  },
];

type Role   = 'ALL' | 'STUDENT' | 'TUTOR' | 'ADMIN';
type Status = 'ALL' | 'ACTIVE' | 'SUSPENDED';

const ROLE_STYLES: Record<string, string> = {
  STUDENT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  TUTOR:   'bg-purple-50 text-purple-700 border-purple-200',
  ADMIN:   'bg-red-50    text-red-700    border-red-200',
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:    'bg-green-50 text-green-700 border-green-200',
  SUSPENDED: 'bg-red-50   text-red-500   border-red-200',
};

export default function UserManagementPage() {
  const router = useRouter();
  const [users,       setUsers]       = useState(INITIAL_USERS);
  const [roleFilter,  setRoleFilter]  = useState<Role>('ALL');
  const [statusFilter,setStatusFilter]= useState<Status>('ALL');
  const [search,      setSearch]      = useState('');
  const [confirmId,   setConfirmId]   = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'SUSPENDED' | 'ACTIVE' | 'DELETE' | null>(null);

  /* ── Filter ─────────────────────────────────────────────────────── */
  const filtered = users.filter(u => {
    const matchRole   = roleFilter   === 'ALL' || u.role   === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  /* ── Actions ────────────────────────────────────────────────────── */
  const handleAction = (id: number, action: 'SUSPENDED' | 'ACTIVE' | 'DELETE') => {
    if (action === 'DELETE') {
      setUsers(prev => prev.filter(u => u.id !== id));
    } else {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: action } : u));
    }
    setConfirmId(null);
    setConfirmAction(null);
  };

  const openConfirm = (id: number, action: 'SUSPENDED' | 'ACTIVE' | 'DELETE') => {
    setConfirmId(id);
    setConfirmAction(action);
  };

  /* ── Stats ──────────────────────────────────────────────────────── */
  const stats = {
    total:     users.length,
    students:  users.filter(u => u.role === 'STUDENT').length,
    tutors:    users.filter(u => u.role === 'TUTOR').length,
    suspended: users.filter(u => u.status === 'SUSPENDED').length,
  };

  const selectedUser = users.find(u => u.id === confirmId);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-red-600 to-orange-600 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => router.back()} className="text-red-200 text-sm font-bold mb-4 block hover:text-white transition-colors">
            ← Back
          </button>
          <h1 className="text-3xl font-black text-white">User Management</h1>
          <p className="text-red-200 font-medium mt-1">Manage all platform users — Students, Tutors & Admins</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Users',   value: stats.total,     icon: '👥' },
              { label: 'Students',      value: stats.students,  icon: '👨‍🎓' },
              { label: 'Tutors',        value: stats.tutors,    icon: '👨‍🏫' },
              { label: 'Suspended',     value: stats.suspended, icon: '🚫' },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                <p className="text-xl mb-1">{s.icon}</p>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-red-200 text-xs font-bold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Search + Filters ───────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-6">

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, username or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-5 py-3 bg-white rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-300 placeholder:text-slate-300 shadow-sm"
          />

          {/* Role Filter */}
          <div className="bg-white rounded-2xl p-1.5 flex gap-1 border border-slate-200 shadow-sm">
            {(['ALL', 'STUDENT', 'TUTOR', 'ADMIN'] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  roleFilter === r ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="bg-white rounded-2xl p-1.5 flex gap-1 border border-slate-200 shadow-sm">
            {(['ALL', 'ACTIVE', 'SUSPENDED'] as Status[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  statusFilter === s ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs font-bold text-slate-400 mb-4">{filtered.length} user{filtered.length !== 1 ? 's' : ''} found</p>

        {/* ── User Table ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['User', 'Username', 'Role', 'Sessions', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">

                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                          user.role === 'STUDENT' ? 'bg-indigo-100 text-indigo-600' :
                          user.role === 'TUTOR'   ? 'bg-purple-100 text-purple-600' :
                                                    'bg-red-100 text-red-600'
                        }`}>
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                        {user.username}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${ROLE_STYLES[user.role]}`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Sessions */}
                    <td className="px-5 py-4 text-sm font-black text-slate-700">
                      {user.sessions}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-xs font-bold text-slate-400">
                      {user.joined}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${STATUS_STYLES[user.status]}`}>
                        {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      {user.role !== 'ADMIN' && (
                        <div className="flex gap-2">
                          {user.status === 'ACTIVE' ? (
                            <button
                              onClick={() => openConfirm(user.id, 'SUSPENDED')}
                              className="text-[10px] font-black px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 hover:bg-amber-100 transition-all"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => openConfirm(user.id, 'ACTIVE')}
                              className="text-[10px] font-black px-3 py-1.5 bg-green-50 text-green-600 rounded-xl border border-green-200 hover:bg-green-100 transition-all"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => openConfirm(user.id, 'DELETE')}
                            className="text-[10px] font-black px-3 py-1.5 bg-red-50 text-red-500 rounded-xl border border-red-200 hover:bg-red-100 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      {user.role === 'ADMIN' && (
                        <span className="text-[10px] font-bold text-slate-300">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-3xl mb-3">👥</p>
                <p className="font-black text-slate-700">No users found</p>
                <p className="text-slate-400 text-sm font-medium mt-1">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Confirm Modal ──────────────────────────────────────────────── */}
      {confirmId && confirmAction && selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100">

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 ${
              confirmAction === 'DELETE'    ? 'bg-red-50'    :
              confirmAction === 'SUSPENDED' ? 'bg-amber-50'  :
                                             'bg-green-50'
            }`}>
              {confirmAction === 'DELETE' ? '🗑️' : confirmAction === 'SUSPENDED' ? '🚫' : '✅'}
            </div>

            <h3 className="text-lg font-black text-slate-900 text-center mb-2">
              {confirmAction === 'DELETE'    ? 'Delete User?'    :
               confirmAction === 'SUSPENDED' ? 'Suspend User?'  :
                                              'Activate User?'}
            </h3>

            <p className="text-slate-400 text-sm font-medium text-center mb-1">
              <span className="font-black text-slate-700">{selectedUser.name}</span>
            </p>
            <p className="text-slate-400 text-xs text-center mb-6 font-mono">{selectedUser.username}</p>

            {confirmAction === 'DELETE' && (
              <p className="text-red-500 text-xs font-bold text-center mb-4 bg-red-50 px-4 py-2 rounded-xl">
                ⚠ This action cannot be undone.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmId(null); setConfirmAction(null); }}
                className="flex-1 py-3 rounded-2xl font-black text-sm border-2 border-slate-200 text-slate-600 hover:border-slate-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(confirmId, confirmAction)}
                className={`flex-1 py-3 rounded-2xl font-black text-sm text-white transition-all ${
                  confirmAction === 'DELETE'    ? 'bg-red-500 hover:bg-red-600'     :
                  confirmAction === 'SUSPENDED' ? 'bg-amber-500 hover:bg-amber-600' :
                                                 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {confirmAction === 'DELETE'    ? 'Yes, Delete'    :
                 confirmAction === 'SUSPENDED' ? 'Yes, Suspend'   :
                                                'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}