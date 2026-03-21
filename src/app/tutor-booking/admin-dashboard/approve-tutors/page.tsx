'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INITIAL_TUTORS = [
  { id: 1, name: 'Chamara Bandara', subject: 'Machine Learning', year: '4th Year', gpa: '3.9', email: 'it21123456@my.sliit.lk', avatar: 'CB', experience: 'Research assistant, 2 published papers', appliedDate: 'Mar 19, 2026', status: 'PENDING' },
  { id: 2, name: 'Prasadi Wijesinghe', subject: 'Mobile Development', year: '3rd Year', gpa: '3.7', email: 'it22234567@my.sliit.lk', avatar: 'PW', experience: 'Published 3 Flutter apps on Play Store', appliedDate: 'Mar 20, 2026', status: 'PENDING' },
  { id: 3, name: 'Ruwan Dissanayake', subject: 'Cloud Computing', year: '4th Year', gpa: '3.8', email: 'it21345678@my.sliit.lk', avatar: 'RD', experience: 'AWS Certified Solutions Architect', appliedDate: 'Mar 18, 2026', status: 'PENDING' },
  { id: 4, name: 'Malindi Fernando', subject: 'Cybersecurity', year: '4th Year', gpa: '3.6', email: 'it21456789@my.sliit.lk', avatar: 'MF', experience: 'CEH certified, SLIIT CTF winner', appliedDate: 'Mar 17, 2026', status: 'APPROVED' },
];

export default function ApproveTutorsPage() {
  const router = useRouter();
  const [tutors, setTutors] = useState(INITIAL_TUTORS);
  const [filter, setFilter] = useState('PENDING');

  const filtered = filter === 'ALL' ? tutors : tutors.filter(t => t.status === filter);

  const handleAction = (id: number, action: 'APPROVED' | 'REJECTED') => {
    setTutors(prev => prev.map(t => t.id === id ? { ...t, status: action } : t));
  };

  const pending = tutors.filter(t => t.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-gradient-to-br from-red-600 to-orange-600 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="text-red-200 text-sm font-bold mb-4 block hover:text-white">← Back</button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">Approve Tutors</h1>
              <p className="text-red-200 font-medium mt-1">Review and approve tutor applications</p>
            </div>
            {pending > 0 && (
              <span className="bg-white text-red-600 text-sm font-black px-4 py-2 rounded-full shadow-lg">
                {pending} pending
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Filter */}
        <div className="bg-white rounded-2xl p-1.5 flex gap-1 mb-6 shadow-sm border border-slate-100 w-fit">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filter === tab ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map(tutor => (
            <div key={tutor.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center font-black text-red-600 flex-shrink-0">
                  {tutor.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-black text-slate-900 text-lg">{tutor.name}</h3>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                      tutor.status === 'APPROVED' ? 'bg-green-50 text-green-600 border border-green-200' :
                      tutor.status === 'REJECTED' ? 'bg-red-50 text-red-500 border border-red-200' :
                      'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                      {tutor.status}
                    </span>
                  </div>
                  <p className="text-indigo-600 font-black mb-1">{tutor.subject}</p>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 mb-3">
                    <span>🎓 {tutor.year}</span>
                    <span>📊 GPA {tutor.gpa}</span>
                    <span>📧 {tutor.email}</span>
                    <span>📅 Applied: {tutor.appliedDate}</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Experience</p>
                    <p className="text-sm font-bold text-slate-600">{tutor.experience}</p>
                  </div>
                </div>
                {tutor.status === 'PENDING' && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(tutor.id, 'APPROVED')}
                      className="px-5 py-2.5 bg-green-500 text-white rounded-xl text-xs font-black hover:bg-green-600 transition-all shadow-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(tutor.id, 'REJECTED')}
                      className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-black border border-red-200 hover:bg-red-100 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
              <p className="text-4xl mb-4">✅</p>
              <p className="font-black text-slate-700">No applications found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}