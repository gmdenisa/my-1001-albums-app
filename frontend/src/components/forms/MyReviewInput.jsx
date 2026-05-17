// src/components/forms/MyReviewInput.jsx
//
// The 1001albumsgenerator public API has no POST endpoint for ratings/reviews.
// So we:
//   1. Save the review locally (localStorage) so it persists in your app
//   2. On save, open the album's public review page on 1001albumsgenerator
//      with the review text in the URL hash — click the bookmarklet to auto-fill.
//
import React, { useState, useEffect, useRef } from 'react';
import { getAlbumReviewUrl } from '../../api/draftApi';

const STORAGE_KEY = 'album_review_draft';

const MOOD_TAGS = ['Timeless', 'Late Night', 'Formative', 'Overrated', 'Underrated', 'Haunting', 'Euphoric', 'Dense'];

const StarRatingInput = ({ rating, setRating }) => {
  const [hovered, setHovered] = useState(0);
  const labels = ['', 'Weak', 'Decent', 'Solid', 'Great', 'Masterpiece'];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map(i => {
          const isActive = i <= (hovered || rating);
          return (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i === rating ? 0 : i)}
              onMouseEnter={() => setHovered(i)}
              className={`transition-all duration-200 focus:outline-none ${
                isActive
                  ? 'text-[#c9a96e] scale-110 drop-shadow-sm'
                  : 'text-gray-300 hover:text-gray-400 scale-100'
              }`}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill={isActive ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        })}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 w-24">
        {labels[hovered || rating] || ''}
      </span>
    </div>
  );
};

const MyReviewInput = ({ album }) => {
  // album prop: { spotifyId, name } — passed from HomePage so we can build the review URL.
  // Falls back gracefully if not provided.
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [activeTags, setActiveTags] = useState([]);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef(null);

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { reviewText: t, rating: r, activeTags: tags } = JSON.parse(stored);
        if (t) setReviewText(t);
        if (r) setRating(r);
        if (tags) setActiveTags(tags);
      }
    } catch { /* ignore */ }
  }, []);

  const toggleTag = (tag) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    const tagLine = activeTags.length > 0 ? `[${activeTags.join(', ')}]\n` : '';
    const fullReview = tagLine + reviewText;

    // Persist locally
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ reviewText, rating, activeTags }));

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Open the album's public review page on 1001albumsgenerator.
    // If review text exists, encode it in the hash for the bookmarklet to pick up.
    const spotifyId = album?.spotifyId;
    const albumName = album?.name;
    const baseUrl = getAlbumReviewUrl(spotifyId, albumName)
      ?? `https://1001albumsgenerator.com/${localStorage.getItem('project_id') ?? ''}`;

    const hash = reviewText.trim()
      ? `#review=${btoa(unescape(encodeURIComponent(fullReview.trim())))}`
      : '';

    window.open(baseUrl + hash, '_blank', 'noopener');
  };

  return (
    <div className="w-full flex flex-col bg-[#fdfbf7] rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all duration-300 focus-within:shadow-[0_10px_50px_rgba(0,0,0,0.5)]">

      <div className="flex justify-between items-center px-8 py-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
          My Entry
        </span>
        <StarRatingInput rating={rating} setRating={setRating} />
      </div>

      <textarea
        ref={textareaRef}
        value={reviewText}
        onChange={e => setReviewText(e.target.value)}
        className="w-full bg-transparent text-gray-800 placeholder-gray-300 px-8 pb-2 text-sm md:text-base leading-relaxed resize-none outline-none min-h-[140px]"
        placeholder="What makes this record stand out?"
      />

      <div className="px-8 pb-8 flex flex-wrap gap-2">
        {MOOD_TAGS.map(tag => {
          const isActive = activeTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-200 ${
                isActive
                  ? 'bg-[#c9a96e] text-white shadow-md'
                  : 'bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-600 shadow-sm'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center px-8 py-5 border-t border-gray-100/50">
        <span className={`text-[10px] font-medium tracking-wide ${reviewText.length > 0 ? 'text-gray-500' : 'text-gray-300'}`}>
          {reviewText.length > 0 ? `${reviewText.length} characters` : 'Saved locally'}
        </span>

        <button
          onClick={handleSave}
          className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${
            saved
              ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
              : 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 shadow-md'
          }`}
        >
          {saved && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {saved ? 'Saved' : 'Save Draft'}
        </button>
      </div>

    </div>
  );
};

export default MyReviewInput;