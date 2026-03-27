'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get('role');
  const isTutor = role === 'tutor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-100 rounded-full opacity-40" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-100 rounded-full opacity-40" />
      </div>

      <div className="relative w-full max-w-md text-center">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Uni<span className="text-indigo-600">Sphere</span>
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-10 border border-slate-100">

          {/* Success icon */}
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl
            ${isTutor ? 'bg-amber-50' : 'bg-green-50'}`}>
            {isTutor ? '📋' : '🎉'}
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-3">
            {isTutor ? 'Application submitted!' : 'Welcome aboard!'}
          </h2>

          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
            {isTutor
              ? 'Your tutor profile is under review. Our team will verify your credentials and notify you within 24 hours once your account is approved.'
              : 'Your student account is ready to go. Start exploring tutors and book your first session today!'}
          </p>

          {/* Status strip */}
          <div className={`rounded-2xl p-4 mb-8 ${isTutor ? 'bg-amber-50 border border-amber-100' : 'bg-green-50 border border-green-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${isTutor ? 'bg-amber-400' : 'bg-green-500'}`} />
              <p className={`text-xs font-bold ${isTutor ? 'text-amber-700' : 'text-green-700'}`}>
                {isTutor ? 'Status: Pending review — check your email for updates' : 'Status: Active — you can start booking sessions now'}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push(isTutor ? '/login' : '/tutor-booking')}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-sm
              hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200"
          >
            {isTutor ? 'Go to login' : 'Explore tutors →'}
          </button>

          {!isTutor && (
            <button
              onClick={() => router.push('/login')}
              className="w-full mt-3 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-black text-sm
                hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              Sign in to your account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}