'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMES = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

const INITIAL_SLOTS: Record<string, string[]> = {
  Monday: ['10:00 AM', '2:00 PM'],
  Tuesday: [],
  Wednesday: ['11:00 AM', '3:00 PM'],
  Thursday: [],
  Friday: ['9:00 AM', '1:00 PM'],
  Saturday: [],
};

export default function AvailabilityManagerPage() {
  const router = useRouter();
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [saved, setSaved] = useState(false);
  const [sessionDuration, setSessionDuration] = useState('60');
  const [sessionType, setSessionType] = useState('both');

  const toggleSlot = (day: string, time: string) => {
    setSlots(prev => {
      const daySlots = prev[day] || [];
      return {
        ...prev,
        [day]: daySlots.includes(time)
          ? daySlots.filter(t => t !== time)
          : [...daySlots, time],
      };
    });
    setSaved(false);
  };

  const handleDemoFill = () => {
    setSlots({
      Monday: ['10:00 AM', '2:00 PM'],
      Tuesday: ['9:00 AM', '3:00 PM'],
      Wednesday: ['11:00 AM'],
      Thursday: ['2:00 PM', '4:00 PM'],
      Friday: ['9:00 AM', '1:00 PM'],
      Saturday: ['10:00 AM'],
    });
    setSessionDuration('60');
    setSessionType('online');
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const totalSlots = Object.values(slots).reduce((s, v) => s + v.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      <button
        onClick={handleDemoFill}
        className="fixed bottom-8 right-8 z-50 bg-purple-600 text-white px-5 py-3 rounded-full shadow-2xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition-all hover:scale-105"
      >
        Demo Fill
      </button>

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="text-purple-200 text-sm font-bold mb-4 block hover:text-white">← Back</button>
          <h1 className="text-3xl font-black text-white">Availability Manager</h1>
          <p className="text-purple-200 font-medium mt-1">Set your weekly available time slots for students to book.</p>
          <div className="mt-4 bg-white/15 rounded-2xl px-5 py-3 border border-white/20 inline-flex items-center gap-3">
            <span className="text-white font-black text-xl">{totalSlots}</span>
            <span className="text-purple-200 text-sm font-bold">slots available this week</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Settings */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-black text-slate-900 mb-4">Session Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Session Duration</label>
              <select
                value={sessionDuration}
                onChange={e => setSessionDuration(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="60">1 Hour</option>
                <option value="120">2 Hours</option>
                <option value="180">3 Hours</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Session Type</label>
              <select
                value={sessionType}
                onChange={e => setSessionType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="both">Online & Physical</option>
                <option value="online">Online Only</option>
                <option value="physical">Physical Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-black text-slate-900 mb-2">Weekly Schedule</h2>
          <p className="text-slate-400 text-sm font-medium mb-6">Click on a time slot to mark yourself as available.</p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 text-xs font-black text-slate-400 uppercase tracking-wider w-24">Time</th>
                  {DAYS.map(day => (
                    <th key={day} className="text-center py-2 px-1 text-xs font-black text-slate-600 uppercase tracking-wider">
                      {day.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIMES.map(time => (
                  <tr key={time} className="border-t border-slate-50">
                    <td className="py-2 pr-4 text-xs font-bold text-slate-400">{time}</td>
                    {DAYS.map(day => {
                      const isSelected = slots[day]?.includes(time);
                      return (
                        <td key={day} className="py-1 px-1 text-center">
                          <button
                            onClick={() => toggleSlot(day, time)}
                            className={`w-full py-2 rounded-xl text-xs font-black transition-all ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-slate-50 text-slate-300 hover:bg-purple-50 hover:text-purple-400'
                            }`}
                          >
                            {isSelected ? '✓' : '·'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xl shadow-purple-100'
          }`}
        >
          {saved ? '✅ Availability Saved!' : 'Save Availability'}
        </button>
      </div>
    </div>
  );
}