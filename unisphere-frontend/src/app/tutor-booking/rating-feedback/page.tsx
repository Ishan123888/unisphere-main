'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RatingFeedbackPage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const TAGS = ['Very Helpful', 'Clear Explanation', 'Patient', 'Well Prepared', 'Punctual', 'Knowledgeable', 'Friendly', 'Would Recommend'];

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleDemoFill = () => {
    setRating(5);
    setTags(['Very Helpful', 'Clear Explanation', 'Knowledgeable', 'Would Recommend']);
    setReview('Amal explained binary trees in a way no lecturer could. His approach to teaching DSA is exceptional. I passed my exam with distinction thanks to his guidance. Highly recommend!');
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (rating === 0) newErrors.rating = 'Please select a star rating.';
    if (!review.trim()) newErrors.review = 'Please write a review.';
    else if (review.trim().length < 20) newErrors.review = 'Review must be at least 20 characters.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl p-12 max-w-md w-full shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">⭐</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-400 font-medium mb-8">Your review helps other students find great tutors.</p>
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
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600">AP</div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Rate Your Session</h1>
              <p className="text-slate-400 text-sm font-medium">Amal Perera — Data Structures & Algorithms</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* Star Rating */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Overall Rating *</label>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">What Stood Out? (Optional)</label>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Write a Review *</label>
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
                {errors.review ? <p className="text-red-500 text-xs font-bold">{errors.review}</p> : <span />}
                <p className="text-xs text-slate-300 font-bold">{review.length} chars</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}