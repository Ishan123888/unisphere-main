'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ConfirmationPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [bookingRef, setBookingRef] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBookingRef(`UNI-${Math.floor(100000 + Math.random() * 900000)}`);

    const data = localStorage.getItem('lastBooking');
    if (data) {
      setBooking(JSON.parse(data));
    } else {
      // Fallback demo data
      setBooking({
        tutorName: 'Kasun Perera',
        subject: 'Computer Science',
        slot: 'Wed 11:00 AM',
        studentName: 'Ishan Ekanayaka',
        studentUsername: 'it22156700',
        duration: '1 Hour',
        sessionType: 'Physical',
        topic: 'Algorithm Complexity',
        paymentMethod: 'cash',
        totalPrice: 1575,
      });
    }
  }, []);

  // 📄 Invoice Download Logic
  const handleDownloadInvoice = () => {
    if (!booking) return;

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text('UniSphere Portal', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Official Booking Receipt', 14, 28);
    doc.text(`Date: ${date}`, 14, 34);
    doc.text(`Reference: ${bookingRef}`, 14, 40);

    autoTable(doc, {
      startY: 50,
      head: [['Description', 'Details']],
      body: [
        ['Student Name',    booking.studentName     || '—'],
        ['Student ID',      booking.studentUsername || '—'],
        ['Tutor Name',      booking.tutorName],
        ['Subject',         booking.subject],
        ['Scheduled Slot',  booking.slot],
        ['Duration',        booking.duration],
        ['Session Type',    booking.sessionType],
        ['Payment Method',  booking.paymentMethod?.toUpperCase()],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Total Amount: Rs. ${booking.totalPrice?.toLocaleString()}`, 14, finalY);

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Thank you for using UniSphere for your academic needs.', 14, 280);

    doc.save(`UniSphere_Invoice_${bookingRef}.pdf`);
  };

  const copyRef = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!booking) return (
    <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest">
      Loading UniSphere...
    </div>
  );

  // Normalise sessionType display (payload stores "Online" / "Physical")
  const sessionTypeLabel =
    booking.sessionType?.toLowerCase() === 'online'
      ? 'Online (Google Meet)'
      : 'Physical (SLIIT Campus)';

  // Normalise payment display
  const paymentLabel =
    booking.paymentMethod === 'card'
      ? 'Credit / Debit Card'
      : booking.paymentMethod === 'bank'
      ? 'Bank Transfer'
      : 'Cash on Session';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl space-y-6">

        {/* ── SUCCESS CARD ── */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />

          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-100">
            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Booking Confirmed!</h1>
          <p className="text-slate-400 font-medium px-4 leading-relaxed">
            Your session request has been sent to{' '}
            <span className="text-indigo-600 font-black">{booking.tutorName}</span>.
            You will receive a confirmation once approved.
          </p>

          {/* Reference Number */}
          <div className="mt-8 bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Booking Reference</p>
              <p className="text-2xl font-black text-slate-800 font-mono tracking-tighter">{bookingRef}</p>
            </div>
            <button
              onClick={copyRef}
              className={`px-6 py-3 rounded-2xl text-xs font-black transition-all active:scale-95 ${
                copied
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                  : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-indigo-400'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-[10px] font-bold text-slate-300 mt-4 uppercase tracking-widest text-center">
            Save this reference for future queries
          </p>
        </div>

        {/* ── BOOKING DETAILS ── */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-900 mb-6">Booking Details</h2>
          <div className="space-y-4">
            {[
              { label: 'Tutor',          value: booking.tutorName },
              { label: 'Subject',        value: booking.subject },
              { label: 'Scheduled Slot', value: booking.slot,            color: 'text-indigo-600' },
              { label: 'Duration',       value: booking.duration },
              { label: 'Session Type',   value: sessionTypeLabel },
              { label: 'Topic',          value: booking.topic || 'General Discussion' },
              { label: 'Payment Method', value: paymentLabel },
              {
                label: 'Total Amount',
                value: `Rs. ${booking.totalPrice?.toLocaleString() ?? '—'}`,
                color: 'text-indigo-600',
              },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-start py-3 border-b border-slate-50 last:border-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-36">{item.label}</span>
                <span className={`text-sm font-black text-right ${item.color || 'text-slate-700'}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-yellow-50/50 border border-yellow-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-yellow-900 font-black shadow-sm">!</div>
            <div>
              <p className="text-sm font-black text-yellow-800 tracking-tight">Awaiting Tutor Approval</p>
              <p className="text-xs text-yellow-600 font-medium leading-tight">
                You will be notified via SLIIT email once the tutor confirms.
              </p>
            </div>
          </div>
        </div>

        {/* ── NEXT STEPS ── */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-900 mb-6">What Happens Next?</h2>
          <div className="space-y-6">
            {[
              { step: '1', title: 'Tutor Reviews Request',   desc: 'The tutor will review your session details within 1 hour.',               color: 'bg-indigo-600' },
              { step: '2', title: 'Email Confirmation',      desc: 'Once approved, you will receive a calendar invite at your SLIIT email.',  color: 'bg-purple-600' },
              { step: '3', title: 'Join Your Session',       desc: 'Meet your tutor at the campus or join the link provided.',                color: 'bg-emerald-600' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-4">
                <div className={`w-8 h-8 ${item.color} text-white rounded-xl flex items-center justify-center text-xs font-black shadow-sm`}>
                  {item.step}
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm tracking-tight">{item.title}</p>
                  <p className="text-slate-400 text-xs font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/tutor-booking/student-dashboard')}
            className="bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-[1.25rem] font-black text-sm hover:border-indigo-400 transition-all active:scale-95"
          >
            View My Bookings
          </button>
          <button
            onClick={handleDownloadInvoice}
            className="bg-indigo-600 text-white py-4 rounded-[1.25rem] font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            Download Invoice
          </button>
        </div>

        <button
          onClick={() => router.push('/tutor-booking')}
          className="w-full bg-white border border-slate-200 text-slate-400 py-4 rounded-[1.25rem] font-bold text-sm hover:text-indigo-600 transition-all"
        >
          Book Another Tutor
        </button>

        <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-4">
          © 2026 UniSphere Ecosystem • Version 2.0.4
        </p>
      </div>
    </div>
  );
}