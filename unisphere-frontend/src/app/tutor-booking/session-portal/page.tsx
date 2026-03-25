'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionPortalPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'active' | 'completed'>('upcoming');
  const [feedbackError, setFeedbackError] = useState('');

  const session = {
    id: 'UNI-007',
    studentName: 'Nuwan Fernando',
    studentId: 'IT22567890',
    subject: 'Data Structures & Algorithms',
    topic: 'Sorting Algorithms',
    slot: 'Fri 1:00 PM',
    date: 'March 28, 2026',
    duration: '2 Hours',
    sessionType: 'Online',
    meetLink: 'https://meet.google.com/uni-sliit-123',
    amount: 3150,
  };

  const handleComplete = () => {
    if (!feedback.trim()) {
      setFeedbackError('Please add session notes before completing.');
      return;
    }
    if (feedback.trim().length < 10) {
      setFeedbackError('Notes must be at least 10 characters.');
      return;
    }
    setStatus('completed');
    setFeedbackError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => router.back()} className="text-purple-200 text-sm font-bold mb-4 block hover:text-white">← Back</button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">Session Portal</h1>
              <p className="text-purple-200 font-medium mt-1">Manage your active tutoring session</p>
            </div>
            <span className={`text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider ${
              status === 'active' ? 'bg-green-400 text-green-900' :
              status === 'completed' ? 'bg-indigo-300 text-indigo-900' :
              'bg-yellow-400 text-yellow-900'
            }`}>
              {status === 'active' ? '● Live' : status === 'completed' ? 'Completed' : 'Upcoming'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Session Info */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="font-black text-slate-900 mb-6">Session Details</h2>
          <div className="flex items-center gap-4 mb-6 p-4 bg-purple-50 rounded-2xl border border-purple-100">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center font-black text-purple-600">NF</div>
            <div>
              <p className="font-black text-slate-900">{session.studentName}</p>
              <p className="text-slate-400 text-sm font-bold">{session.studentId}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-black text-purple-600 text-lg">Rs. {session.amount.toLocaleString()}</p>
              <p className="text-slate-400 text-xs font-bold">{session.duration}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Subject', value: session.subject },
              { label: 'Topic', value: session.topic },
              { label: 'Date', value: session.date },
              { label: 'Slot', value: session.slot },
              { label: 'Duration', value: session.duration },
              { label: 'Type', value: session.sessionType },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                <p className="text-sm font-black text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Google Meet Link */}
        {status !== 'completed' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-black text-slate-900 mb-4">Meeting Link</h2>
            <div className="flex items-center gap-3 bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
              <span className="text-2xl">💻</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-0.5">Google Meet</p>
                <p className="text-sm font-black text-indigo-700 truncate">{session.meetLink}</p>
              </div>
              <button
                onClick={() => window.open(session.meetLink, '_blank')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all flex-shrink-0"
              >
                Join
              </button>
            </div>

            {/* Session Controls */}
            <div className="flex gap-3 mt-4">
              {status === 'upcoming' && (
                <button
                  onClick={() => setStatus('active')}
                  className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-black text-sm hover:bg-green-600 transition-all"
                >
                  Start Session
                </button>
              )}
            </div>
          </div>
        )}

        {/* Session Notes & Complete */}
        {status !== 'completed' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-black text-slate-900 mb-4">Session Notes</h2>
            <textarea
              rows={4}
              placeholder="Add notes about what was covered in this session..."
              className={`w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300 resize-none transition-all ${
                feedbackError ? 'ring-2 ring-red-400 bg-red-50' : 'focus:ring-2 focus:ring-purple-400'
              }`}
              value={feedback}
              onChange={e => { setFeedback(e.target.value); setFeedbackError(''); }}
            />
            {feedbackError && <p className="text-red-500 text-xs font-bold mt-1">{feedbackError}</p>}

            <button
              onClick={handleComplete}
              disabled={status === 'upcoming'}
              className={`w-full py-4 rounded-2xl font-black text-sm mt-4 transition-all ${
                status === 'active'
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {status === 'upcoming' ? 'Start Session First' : 'Mark as Completed'}
            </button>
          </div>
        )}

        {/* Completed State */}
        {status === 'completed' && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎓</div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Session Completed!</h2>
            <p className="text-slate-400 font-medium mb-6">Great job! The student will be prompted to leave a review.</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/tutor-booking/tutor-dashboard')}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => router.push('/tutor-booking/analytics')}
                className="flex-1 bg-purple-600 text-white py-3 rounded-2xl font-black text-sm hover:bg-purple-700 transition-all"
              >
                View Analytics
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}