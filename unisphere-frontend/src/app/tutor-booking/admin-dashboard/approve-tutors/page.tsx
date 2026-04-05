'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Tutor {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  subjects: string;
  tags: string;
  bio: string;
  yearOfStudy: string;
  experience: string;
  hourlyRate: number;
  sessionType: string;
  university: string;
  qualification: string;
  status: string;
  rating: number;
  reviews: number;
  sessions: number;
}

const YEAR_LABELS: Record<string, string> = {
  '1ST_YEAR': '1st Year', '2ND_YEAR': '2nd Year', '3RD_YEAR': '3rd Year',
  '4TH_YEAR': '4th Year', 'GRADUATE': 'Graduate', 'POSTGRAD': 'Postgraduate',
};

const EXP_LABELS: Record<string, string> = {
  'LESS_THAN_1': '< 1 year', '1_TO_2': '1–2 years',
  '3_TO_5': '3–5 years', 'MORE_THAN_5': '5+ years',
};

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

const API = 'http://localhost:8082/api/users';
const token = () => typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

export default function ApproveTutorsPage() {
  const router = useRouter();
  const [tutors,   setTutors]   = useState<Tutor[]>([]);
  const [filter,   setFilter]   = useState('PENDING_REVIEW');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [acting,   setActing]   = useState<number | null>(null);

  // ── Fetch all tutors ────────────────────────────────────────
  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/tutors`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error('Failed to fetch tutors');
      const data: Tutor[] = await res.json();
      setTutors(data);
    } catch {
      setError('Could not load tutor applications. Please retry.');
    } finally {
      setLoading(false);
    }
  };

 const handleAction = async (id: number, action: 'approve' | 'reject') => {
   setActing(id);
   const currentToken = localStorage.getItem('token'); // Token එක මෙතනදී ගන්න

   try {
     const res = await fetch(`${API}/tutors/${id}/${action}`, {
       method: 'PUT',
       headers: {
         'Authorization': `Bearer ${currentToken}`,
         'Content-Type': 'application/json'
       },
     });

     if (!res.ok) {
       const errorData = await res.json();
       throw new Error(errorData.message || 'Action failed');
     }

     // Database එකේ status එක update වුණාම UI එකත් update කරනවා
     const newStatus = action === 'approve' ? 'ACTIVE' : 'REJECTED';
     setTutors(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

     alert(`Success: Tutor is now ${newStatus}!`);

   } catch (err: any) {
     setError(err.message || 'Could not update status.');
   } finally {
     setActing(null);
   }
 };

  const filtered = filter === 'ALL'
    ? tutors
    : tutors.filter(t => t.status === filter);

  const pendingCount = tutors.filter(t => t.status === 'PENDING_REVIEW').length;

  const statusStyle = (status: string) => {
    if (status === 'ACTIVE')         return 'bg-green-50 text-green-600 border border-green-200';
    if (status === 'REJECTED')       return 'bg-red-50 text-red-500 border border-red-200';
    if (status === 'PENDING_REVIEW') return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    return 'bg-slate-50 text-slate-500 border border-slate-200';
  };

  const statusLabel = (status: string) => {
    if (status === 'ACTIVE')         return 'Approved';
    if (status === 'PENDING_REVIEW') return 'Pending';
    if (!status) return 'Unknown';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-orange-600 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => router.back()}
            className="text-red-200 text-sm font-bold mb-4 block hover:text-white transition-colors">
            ← Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">Approve Tutors</h1>
              <p className="text-red-200 font-medium mt-1">
                Review tutor applications from registration
              </p>
            </div>
            {pendingCount > 0 && (
              <span className="bg-white text-red-600 text-sm font-black px-4 py-2 rounded-full shadow-lg">
                {pendingCount} pending
              </span>
            )}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: 'Pending',  value: tutors.filter(t => t.status === 'PENDING_REVIEW').length, color: 'text-yellow-300' },
              { label: 'Approved', value: tutors.filter(t => t.status === 'ACTIVE').length,         color: 'text-green-300'  },
              { label: 'Rejected', value: tutors.filter(t => t.status === 'REJECTED').length,       color: 'text-red-300'   },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-3 text-center border border-white/10">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-white/60 text-xs font-bold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
            <span className="text-red-500 text-sm">⚠️</span>
            <p className="text-red-600 text-sm font-bold flex-1">{error}</p>
            <button onClick={fetchTutors}
              className="text-xs font-black text-red-600 hover:text-red-800 underline">
              Retry
            </button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="bg-white rounded-2xl p-1.5 flex gap-1 mb-6 shadow-sm border border-slate-100 w-fit">
          {[
            { key: 'PENDING_REVIEW', label: 'Pending'  },
            { key: 'ACTIVE',         label: 'Approved' },
            { key: 'REJECTED',       label: 'Rejected' },
            { key: 'ALL',            label: 'All'      },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                ${filter === tab.key
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="font-black text-slate-700">Loading applications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <p className="text-4xl mb-4">✅</p>
            <p className="font-black text-slate-700">No applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(tutor => (
              <div key={tutor.id}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden
                  hover:shadow-md transition-all">

                {/* Main row */}
                <div className="p-6">
                  <div className="flex items-start gap-4">

                    {/* Avatar */}
                    <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center
                      font-black text-red-600 text-sm flex-shrink-0">
                      {getInitials(tutor.firstName, tutor.lastName)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-black text-slate-900 text-lg">
                          {tutor.firstName} {tutor.lastName}
                        </h3>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider
                          ${statusStyle(tutor.status)}`}>
                          {statusLabel(tutor.status)}
                        </span>
                      </div>

                      <p className="text-indigo-600 font-black mb-2">
                        {tutor.subject || tutor.subjects?.split(',')[0] || '—'}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-400 mb-3">
                        <span>🎓 {YEAR_LABELS[tutor.yearOfStudy] ?? tutor.yearOfStudy ?? '—'}</span>
                        <span>⏱ {EXP_LABELS[tutor.experience] ?? tutor.experience ?? '—'}</span>
                        <span>💰 Rs. {tutor.hourlyRate?.toLocaleString() ?? '—'}/hr</span>
                        <span>📧 {tutor.email ?? '—'}</span>
                        <span>🔖 {tutor.username}</span>
                      </div>

                      {/* Skill tags */}
                      {tutor.tags && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {tutor.tags.split(',').map(tag => (
                            <span key={tag}
                              className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full
                                text-xs font-bold border border-indigo-100">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpanded(expanded === tutor.id ? null : tutor.id)}
                        className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors">
                        {expanded === tutor.id ? '▲ Hide details' : '▼ View full details'}
                      </button>
                    </div>

                    {/* Action buttons */}
                    {tutor.status === 'PENDING_REVIEW' && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleAction(tutor.id, 'approve')}
                          disabled={acting === tutor.id}
                          className="px-5 py-2.5 bg-green-500 text-white rounded-xl text-xs font-black
                            hover:bg-green-600 transition-all shadow-sm disabled:opacity-60
                            disabled:cursor-not-allowed flex items-center gap-1.5">
                          {acting === tutor.id
                            ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : '✓'} Approve
                        </button>
                        <button
                          onClick={() => handleAction(tutor.id, 'reject')}
                          disabled={acting === tutor.id}
                          className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-black
                            border border-red-200 hover:bg-red-100 transition-all
                            disabled:opacity-60 disabled:cursor-not-allowed">
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded detail panel */}
                {expanded === tutor.id && (
                  <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {tutor.bio && (
                        <div className="md:col-span-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Bio</p>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed">{tutor.bio}</p>
                        </div>
                      )}

                      {tutor.university && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">University</p>
                          <p className="text-sm font-bold text-slate-700">{tutor.university}</p>
                        </div>
                      )}

                      {tutor.qualification && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Qualification</p>
                          <p className="text-sm font-bold text-slate-700">{tutor.qualification}</p>
                        </div>
                      )}

                      {tutor.subjects && (
                        <div className="md:col-span-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">All subjects</p>
                          <div className="flex flex-wrap gap-1.5">
                            {tutor.subjects.split(',').map(s => (
                              <span key={s}
                                className="px-2.5 py-1 bg-white text-slate-600 rounded-full
                                  text-xs font-bold border border-slate-200">
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Session type</p>
                        <p className="text-sm font-bold text-slate-700">{tutor.sessionType ?? '—'}</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Hourly rate</p>
                        <p className="text-sm font-bold text-slate-700">Rs. {tutor.hourlyRate?.toLocaleString() ?? '—'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}