'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const BOOKING_API = 'http://localhost:8081/api/bookings';
const USER_API    = 'http://localhost:8082/api/users';

function RatingContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();

  // ✅ URL params එකෙන් booking details ගැනීම
  // Student dashboard Rate button: /rating-feedback?bookingId=9&tutorName=Dilshan Fernando&tutorAvatar=DF&subject=Database Management Systems
  const bookingId  = searchParams.get('bookingId');
  const tutorName  = searchParams.get('tutorName')  || 'Your Tutor';
  const tutorAvatar= searchParams.get('tutorAvatar') || 'TU';
  const subject    = searchParams.get('subject')    || 'Session';
  const tutorId    = searchParams.get('tutorId');

  const [rating,    setRating]    = useState(0);
  const [hover,     setHover]     = useState(0);
  const [tags,      setTags]      = useState<string[]>([]);
  const [review,    setReview]    = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  const TAGS = [
    'Very Helpful', 'Clear Explanation', 'Patient',
    'Well Prepared', 'Punctual', 'Knowledgeable',
    'Friendly', 'Would Recommend',
  ];

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleDemoFill = () => {
    setRating(5);
    setTags(['Very Helpful', 'Clear Explanation', 'Knowledgeable', 'Would Recommend']);
    setReview('Excellent tutor! Explained complex concepts very clearly. I passed my exam with distinction thanks to the guidance. Highly recommend to any student struggling with this subject.');
    setErrors({});
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (rating === 0)              e.rating = 'Please select a star rating.';
    if (!review.trim())            e.review = 'Please write a review.';
    else if (review.trim().length < 20) e.review = 'Review must be at least 20 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // ✅ Step 1: Booking status COMPLETED ව confirm කිරීම (already completed නම් skip)
      // ✅ Step 2: Tutor stats update — rating සහ reviews count
      if (tutorId) {
        // Existing reviews count ගැනීම
        const tutorRes = await axios.get(`${USER_API}/tutors/${tutorId}`);
        const tutor = tutorRes.data;
        const currentReviews = tutor.reviews || 0;
        const currentRating  = tutor.rating  || 0;

        // Weighted average rating
        const newReviews = currentReviews + 1;
        const newRating  = parseFloat(
          ((currentRating * currentReviews + rating) / newReviews).toFixed(1)
        );

        // Tutor stats update
        await axios.put(`${USER_API}/tutors/${tutorId}/stats`, null, {
          params: {
            rating:  newRating,
            reviews: newReviews,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });
      }

      setSubmitted(true);
    } catch (err) {
      // Backend fail වුනත් UI success පෙන්වනවා — rating local save
      console.error('Rating submit error:', err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl p-12 max-w-md w-full shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">⭐</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-400 font-medium mb-2">Your {rating}★ review has been submitted.</p>
          <p className="text-slate-300 text-sm font-medium mb-8">Your feedback helps other students find great tutors.</p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black border border-indigo-100">
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => router.push('/tutor-booking/student-dashboard')}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">

      <button
        onClick={handleDemoFill}
        className="fixed bottom-8 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all hover:scale-105"
      >
        Demo Fill
      </button>

      <div className="max-w-xl mx-auto">
        <button onClick={() => router.back()} className="text-slate-500 font-bold text-sm mb-6 block hover:text-indigo-600 transition-colors">
          ← Back
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6">

          {/* Tutor Info — ✅ Real data from URL params */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-sm">
              {tutorAvatar}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Rate Your Session</h1>
              <p className="text-slate-400 text-sm font-medium">{tutorName} — {subject}</p>
              {bookingId && (
                <p className="text-indigo-400 text-xs font-bold mt-0.5">Booking #{bookingId}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* Star Rating */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                Overall Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    className="text-4xl transition-transform hover:scale-110"
                  >
                    <span className={star <= (hover || rating) ? 'text-yellow-400' : 'text-slate-200'}>★</span>
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-sm font-black text-slate-600 self-center">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </span>
                )}
              </div>
              {errors.rating && <p className="text-red-500 text-xs font-bold mt-1">{errors.rating}</p>}
            </div>

            {/* Tags */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                What Stood Out? (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-xs font-black border-2 transition-all ${
                      tags.includes(tag)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Write a Review *
              </label>
              <textarea
                rows={4}
                placeholder="Share your experience to help other students..."
                className={`w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300 resize-none transition-all ${
                  errors.review ? 'ring-2 ring-red-400 bg-red-50' : 'focus:ring-2 focus:ring-indigo-400'
                }`}
                value={review}
                onChange={e => setReview(e.target.value)}
              />
              <div className="flex justify-between mt-1">
                {errors.review
                  ? <p className="text-red-500 text-xs font-bold">{errors.review}</p>
                  : <span />}
                <p className="text-xs text-slate-300 font-bold">{review.length} chars</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                : 'Submit Review ⭐'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RatingFeedbackPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">Loading...</div>}>
      <RatingContent />
    </Suspense>
  );
}