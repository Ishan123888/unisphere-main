'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react'; // 🚀 Suspense import කළා
import axios from 'axios';

interface Booking {
  id: number;
  bookingRef: string;
  studentName: string;
  studentUsername: string;
  tutorName: string;
  subject: string;
  slot: string;
  date: string;
  duration: string;
  sessionType: string;
  totalPrice: number;
  status: string;
}

// 🛠️ Main Logic එක වෙනම Component එකකට ගත්තා (Suspense වැඩ කරන්න මේක ඕනේ)
function InvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL එකෙන් ID එක ලබා ගැනීම
  const id = searchParams.get('id');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // invoice/page.tsx ඇතුළේ useEffect එක මේ විදිහට හදන්න

  useEffect(() => {
    const fetchInvoice = async () => {
      // 💡 ID එක '1' නම් සහ database එකේ නැත්නම් 404 එන එක සාමාන්‍යයි.
      // ඒ නිසා අපි Dashboard එකෙන්ම ID 9 එවන්න ඕනේ.
      if (!id || id === 'undefined' || id === 'null') return;

      try {
        const response = await axios.get(`http://localhost:8081/api/bookings/${id}`);
        setBooking(response.data);
      } catch (error) {
        console.error("Fetch Error:", error);
        // 🚨 මෙතනදී error එකක් ආවොත්, ඒ කියන්නේ ID 1 database එකේ නැහැ කියන එකයි.
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);
  const downloadPDF = async () => {
    if (!id) return;
    try {
      window.open(`http://localhost:8081/api/v1/reports/invoice/${id}`, '_blank');
    } catch (error) {
      alert("Error downloading PDF");
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading Invoice...</div>;

  if (!id || !booking) return (
    <div className="p-20 text-center">
      <p className="text-red-500 font-bold uppercase tracking-widest">⚠️ Booking Not Found!</p>
      <p className="text-slate-400 text-sm mt-2">Could not find a record for ID: {id || 'Missing'}</p>
      <button onClick={() => router.back()} className="mt-6 px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all">
        Go Back
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="text-slate-500 font-bold text-sm hover:text-indigo-600">
            ← Back
          </button>
          <button
            onClick={downloadPDF}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-lg hover:bg-indigo-700"
          >
            Download Official PDF
          </button>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black">UniSphere</h1>
                <p className="text-indigo-200 text-xs">Official Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black">{booking.bookingRef}</p>
                <span className="bg-green-400 text-green-900 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Billed To</p>
                <p className="font-black text-slate-900">{booking.studentName}</p>
                <p className="text-slate-500 text-xs">{booking.studentUsername}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Details</p>
                <p className="text-slate-700 text-sm font-bold">Date: {booking.date}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs font-black text-slate-400 uppercase">Tutor</span>
                <span className="text-sm font-bold">{booking.tutorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-black text-slate-400 uppercase">Subject</span>
                <span className="text-sm font-bold">{booking.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-black text-slate-400 uppercase">Time Slot</span>
                <span className="text-sm font-bold">{booking.slot}</span>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
              <span className="font-black text-slate-900">Total Amount Paid</span>
              <span className="font-black text-indigo-600 text-2xl">Rs. {booking.totalPrice?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🚀 Final Export - Suspense Boundary එක අනිවාර්යයි
export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">Loading...</div>}>
      <InvoiceContent />
    </Suspense>
  );
}