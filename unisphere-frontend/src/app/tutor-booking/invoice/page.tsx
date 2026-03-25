'use client';
import { useRouter } from 'next/navigation';

export default function InvoicePage() {
  const router = useRouter();

  const invoice = {
    id: 'INV-2026-001',
    bookingRef: 'UNI-001',
    date: 'March 24, 2026',
    dueDate: 'March 24, 2026',
    student: { name: 'Ishan Ekanayaka', id: 'IT22156700', email: 'it22156700@my.sliit.lk' },
    tutor: { name: 'Amal Perera', subject: 'Data Structures & Algorithms' },
    slot: 'Mon 10:00 AM',
    duration: '2 Hours',
    sessionType: 'Online (Google Meet)',
    hourlyRate: 1500,
    hours: 2,
    platformFee: 150,
    total: 3150,
    paymentMethod: 'Credit / Debit Card',
    status: 'PAID',
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="text-slate-500 font-bold text-sm hover:text-indigo-600 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => window.print()}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-indigo-700 transition-all"
          >
            Download PDF
          </button>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black text-white mb-1">UniSphere</h1>
                <p className="text-indigo-200 text-sm font-medium">SLIIT Tutor Booking Platform</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Invoice</p>
                <p className="text-xl font-black text-white">{invoice.id}</p>
                <span className="bg-green-400 text-green-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          <div className="px-8 py-8 space-y-6">

            {/* Billing Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Billed To</p>
                <p className="font-black text-slate-900">{invoice.student.name}</p>
                <p className="text-slate-500 text-sm font-medium">{invoice.student.id}</p>
                <p className="text-slate-500 text-sm font-medium">{invoice.student.email}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Invoice Details</p>
                <p className="text-slate-700 text-sm font-bold">Date: {invoice.date}</p>
                <p className="text-slate-700 text-sm font-bold">Booking: {invoice.bookingRef}</p>
                <p className="text-slate-700 text-sm font-bold">Payment: {invoice.paymentMethod}</p>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Session Details */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Session Details</p>
              <div className="bg-slate-50 rounded-2xl p-5 space-y-2">
                {[
                  { label: 'Tutor', value: invoice.tutor.name },
                  { label: 'Subject', value: invoice.tutor.subject },
                  { label: 'Scheduled Slot', value: invoice.slot },
                  { label: 'Duration', value: invoice.duration },
                  { label: 'Session Type', value: invoice.sessionType },
                ].map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wide">{item.label}</span>
                    <span className="text-sm font-bold text-slate-700">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Price Breakdown */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Price Breakdown</p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-slate-600">Session Fee ({invoice.hours}hr × Rs. {invoice.hourlyRate.toLocaleString()})</span>
                  <span className="text-sm font-bold text-slate-700">Rs. {(invoice.hours * invoice.hourlyRate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-slate-400">Platform Fee (5%)</span>
                  <span className="text-sm font-bold text-slate-400">Rs. {invoice.platformFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="font-black text-slate-900">Total Amount</span>
                  <span className="font-black text-indigo-600 text-xl">Rs. {invoice.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Footer */}
            <div className="text-center">
              <p className="text-slate-400 text-xs font-medium">Thank you for using UniSphere!</p>
              <p className="text-slate-300 text-xs font-medium mt-1">For support: support@unisphere.sliit.lk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}