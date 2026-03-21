'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const TUTORS = [
  {
    id: 1,
    name: 'Amal Perera',
    subject: 'Data Structures & Algorithms',
    rating: 4.9,
    reviews: 128,
    hourlyRate: 1500,
    tags: ['DSA', 'Java', 'Python'],
    avatar: '👨‍💻',
    available: true,
    experience: '3rd Year',
    bio: 'Top performer in DSA. Helped 100+ students ace their exams.',
    sessions: 312,
  },
  {
    id: 2,
    name: 'Dilki Jayawardena',
    subject: 'Database Management Systems',
    rating: 4.8,
    reviews: 95,
    hourlyRate: 1200,
    tags: ['MySQL', 'Oracle', 'NoSQL'],
    avatar: '👩‍💻',
    available: true,
    experience: '4th Year',
    bio: 'Database wizard. Industry internship at WSO2.',
    sessions: 215,
  },
  {
    id: 3,
    name: 'Kasun Madushanka',
    subject: 'Software Engineering',
    rating: 4.7,
    reviews: 74,
    hourlyRate: 1800,
    tags: ['UML', 'Agile', 'SDLC'],
    avatar: '🧑‍🏫',
    available: false,
    experience: '4th Year',
    bio: 'SE project lead. Loves teaching design patterns.',
    sessions: 189,
  },
  {
    id: 4,
    name: 'Nethmi Rodrigo',
    subject: 'Computer Networks',
    rating: 4.6,
    reviews: 61,
    hourlyRate: 1100,
    tags: ['TCP/IP', 'Cisco', 'Network+'],
    avatar: '👩‍🔬',
    available: true,
    experience: '3rd Year',
    bio: 'Networks enthusiast. Cisco certified at 22.',
    sessions: 143,
  },
  {
    id: 5,
    name: 'Tharaka Silva',
    subject: 'Web Technologies',
    rating: 4.9,
    reviews: 210,
    hourlyRate: 2000,
    tags: ['React', 'Node.js', 'Spring Boot'],
    avatar: '🧑‍💻',
    available: true,
    experience: '4th Year',
    bio: 'Full stack developer. Built 3 production apps.',
    sessions: 487,
  },
  {
    id: 6,
    name: 'Sanduni Wickrama',
    subject: 'Mathematics for Computing',
    rating: 4.5,
    reviews: 88,
    hourlyRate: 900,
    tags: ['Calculus', 'Statistics', 'Discrete Math'],
    avatar: '👩‍🎓',
    available: true,
    experience: '2nd Year',
    bio: 'Math olympiad winner. Makes maths fun.',
    sessions: 201,
  },
];

const SUBJECTS = ['All Subjects', 'Data Structures & Algorithms', 'Database Management Systems', 'Software Engineering', 'Computer Networks', 'Web Technologies', 'Mathematics for Computing'];
const SORT_OPTIONS = ['Top Rated', 'Most Reviews', 'Price: Low to High', 'Price: High to Low'];

export default function TutorExplorerPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All Subjects');
  const [sort, setSort] = useState('Top Rated');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2000);

  const filtered = useMemo(() => {
    let result = [...TUTORS];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (subject !== 'All Subjects') {
      result = result.filter(t => t.subject === subject);
    }

    if (availableOnly) {
      result = result.filter(t => t.available);
    }

    result = result.filter(t => t.hourlyRate <= maxPrice);

    switch (sort) {
      case 'Top Rated': result.sort((a, b) => b.rating - a.rating); break;
      case 'Most Reviews': result.sort((a, b) => b.reviews - a.reviews); break;
      case 'Price: Low to High': result.sort((a, b) => a.hourlyRate - b.hourlyRate); break;
      case 'Price: High to Low': result.sort((a, b) => b.hourlyRate - a.hourlyRate); break;
    }

    return result;
  }, [search, subject, sort, availableOnly, maxPrice]);

  const handleQuickFill = () => {
    setSearch('React');
    setSubject('All Subjects');
    setSort('Top Rated');
    setAvailableOnly(true);
    setMaxPrice(2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ⚡ Demo Button */}
      <button
        onClick={handleQuickFill}
        className="fixed bottom-8 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
      >
        ⚡ Demo Filter
      </button>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 px-6 py-14 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
            🎓 UniSphere Tutor Network — {TUTORS.filter(t => t.available).length} Available Now
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Find Your Perfect <span className="text-yellow-300">SLIIT Tutor</span>
          </h1>
          <p className="text-indigo-100 text-base font-medium mb-8">
            AI-powered matching with top-performing students. Book in seconds.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, subject, or skill..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white text-slate-800 font-semibold text-sm shadow-2xl outline-none focus:ring-4 focus:ring-yellow-300/50 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3 items-center">

          {/* Subject Filter */}
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
          >
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
          >
            {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Price Range */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Max:</span>
            <input
              type="range"
              min={900} max={2000} step={100}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-24 accent-indigo-600"
            />
            <span className="text-sm font-black text-indigo-600">Rs. {maxPrice}</span>
          </div>

          {/* Available Toggle */}
          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`px-4 py-2 rounded-xl text-sm font-black border transition-all ${
              availableOnly
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-green-400'
            }`}
          >
            🟢 Available Now
          </button>

          {/* Results Count */}
          <span className="ml-auto text-sm font-bold text-slate-400">
            {filtered.length} tutor{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Tutor Grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-slate-700 mb-2">No Tutors Found</h3>
            <p className="text-slate-400 font-medium">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(tutor => (
              <div
                key={tutor.id}
                onClick={() => router.push(`/tutor-booking/${tutor.id}`)}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                      {tutor.avatar}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base leading-tight">{tutor.name}</h3>
                      <p className="text-xs text-indigo-500 font-bold">{tutor.experience}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    tutor.available
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {tutor.available ? '● Online' : '○ Busy'}
                  </span>
                </div>

                {/* Subject */}
                <p className="text-sm font-bold text-slate-700 mb-2">{tutor.subject}</p>
                <p className="text-xs text-slate-400 font-medium mb-4 leading-relaxed">{tutor.bio}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tutor.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-5 py-3 border-t border-slate-50">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-sm font-black text-slate-800">{tutor.rating}</span>
                    <span className="text-xs text-slate-400 font-medium">({tutor.reviews})</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    🎓 {tutor.sessions} sessions
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Per Hour</span>
                    <p className="text-lg font-black text-indigo-600">Rs. {tutor.hourlyRate.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); router.push(`/tutor-booking/${tutor.id}`); }}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all group-hover:shadow-lg group-hover:shadow-indigo-100 active:scale-95"
                  >
                    View Profile →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}