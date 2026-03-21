'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmationPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('lastBooking');
    if (data) {
      setBooking(JSON.parse(data));
    } else {
      // Demo fallback
      setBooking({
        tutorName: 'Amal Perera',
        subject: 'Data Structures & Algorithms',
        slot: 'Mon 10:00 AM',
        studentName: 'Ishan Ekanayaka',
        studentId: 'IT22156700',
        email: 'it22156700@my.sliit.lk',
        duration: '2',
        sessionType: 'online',
        topic: 'Binary Trees and Graph Algorithms',
        paymentMethod: 'card',
        total: 3150,
        status: 'PENDING',
      });
    }
  }, []);

  const bookingRef = `UNI-${Date.now().toString().slice(-6)}`;

  const copyRef = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start py-12 px-6">

      <div className="w-full max-w-2xl space-y-6">

        {/* Success Card */}
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center">
          {/* Animated checkmark */}
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-100">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-100">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-400 font-medium mb-6">
            Your session request has been sent to <span className="text-indigo-600 font-black">{booking.tutorName}</span>.
            You will receive a confirmation once the tutor approves.
          </p>

          {/* Booking Reference */}
          <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 flex items-center justify-between mb-2">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Booking Reference</p>
              <p className="text-xl font-black text-indigo-700">{bookingRef}</p>
            </div>
            <button
              onClick={copyRef}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-slate-400 font-medium">Save this reference number for future queries.</p>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-900 mb-6">Booking Details</h2>
          <div className="space-y-3">
            {[
              { label: 'Tutor', value: booking.tutorName },
              { label: 'Subject', value: booking.subject },
              { label: 'Scheduled Slot', value: booking.slot },
              { label: 'Duration', value: `${booking.duration} Hour${booking.duration > 1 ? 's' : ''}` },
              { label: 'Session Type', value: booking.sessionType === 'online' ? 'Online (Google Meet)' : 'Physical (SLIIT Campus)' },
              { label: 'Topic', value: booking.topic },
              { label: 'Payment Method', value: booking.paymentMethod === 'card' ? 'Credit / Debit Card' : booking.paymentMethod === 'bank' ? 'Bank Transfer' : 'Cash on Session' },
              { label: 'Total Amount', value: `Rs. ${booking.total?.toLocaleString()}` },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-start py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider w-36 flex-shrink-0">{item.label}</span>
                <span className="text-sm font-bold text-slate-700 text-right">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Status Badge */}
          <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-yellow-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-yellow-800">Awaiting Tutor Approval</p>
              <p className="text-xs text-yellow-600 font-medium">You will be notified within 1 hour once the tutor confirms.</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-900 mb-6">What Happens Next?</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Tutor Reviews Your Request', desc: 'The tutor will review your booking within 1 hour.', color: 'bg-indigo-600' },
              { step: '2', title: 'You Receive a Confirmation', desc: 'Check your SLIIT email and notifications for updates.', color: 'bg-purple-600' },
              { step: '3', title: 'Join Your Session', desc: booking.sessionType === 'online' ? 'A Google Meet link will be shared before the session.' : 'Meet your tutor at the agreed SLIIT Campus location.', color: 'bg-green-600' },
              { step: '4', title: 'Rate Your Experience', desc: 'After the session, leave a review to help other students.', color: 'bg-yellow-500' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-4">
                <div className={`w-8 h-8 ${item.color} text-white rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0`}>
                  {item.step}
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">{item.title}</p>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/tutor-booking/student-dashboard')}
            className="bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-black text-sm hover:border-indigo-400 hover:text-indigo-600 transition-all"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push('/tutor-booking/invoice')}
            className="bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Download Invoice
          </button>
        </div>

        <button
          onClick={() => router.push('/tutor-booking')}
          className="w-full bg-white border border-slate-200 text-slate-500 py-3 rounded-2xl font-bold text-sm hover:text-indigo-600 transition-all"
        >
          Book Another Tutor
        </button>
      </div>
    </div>
  );
}