// src/components/forms/MyReviewInput.jsx
import React, { useState, useRef } from 'react';

const MOOD_TAGS = ['Timeless', 'Late Night', 'Formative', 'Overrated', 'Underrated', 'Haunting', 'Euphoric', 'Dense'];

const StarRatingInput = ({ rating, setRating }) => {
  const [hovered, setHovered] = useState(0);
  const labels = ['', 'Weak', 'Decent', 'Solid', 'Great', 'Masterpiece'];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(i => {
          const isActive = i <= (hovered || rating);
          return (
            <button
              key={i}
              onClick={() => setRating(i === rating ? 0 : i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              className={`transition-all duration-200 focus:outline-none ${
                isActive 
                  ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
                  : 'text-white/20 hover:text-white/60 scale-100'
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
      {(hovered || rating) > 0 && (
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 w-24">
          {labels[hovered || rating]}
        </span>
      )}
    </div>
  );
};

const MyReviewInput = () => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [activeTags, setActiveTags] = useState([]);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef(null);

  const toggleTag = (tag) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full flex flex-col bg-[#0a0a0a] border border-white/20 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 focus-within:border-white/50 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
      
      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-[#111]">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
          My Entry
        </span>
        <StarRatingInput rating={rating} setRating={setRating} />
      </div>

      {/* TEXTAREA - Solid dark background, bright white text */}
      <textarea
        ref={textareaRef}
        value={reviewText}
        onChange={e => setReviewText(e.target.value)}
        className="w-full bg-[#0a0a0a] text-white placeholder-white/30 p-6 text-sm md:text-base leading-relaxed resize-none outline-none min-h-[160px]"
        placeholder="What makes this record stand out?"
      />

      {/* TAGS */}
      <div className="px-6 pb-6 flex flex-wrap gap-2 bg-[#0a0a0a]">
        {MOOD_TAGS.map(tag => {
          const isActive = activeTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-200 border ${
                isActive 
                  ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
                  : 'bg-transparent text-white/60 border-white/20 hover:border-white/50 hover:text-white'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center px-6 py-4 border-t border-white/10 bg-[#111]">
        <span className={`text-[11px] font-medium tracking-wide ${reviewText.length > 0 ? 'text-white/60' : 'text-white/30'}`}>
          {reviewText.length > 0 ? `${reviewText.length} characters` : 'Private · Local only'}
        </span>
        
        <button
          onClick={handleSave}
          className={`px-6 py-2 rounded text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${
            saved 
              ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
              : 'bg-white text-black hover:bg-gray-200 hover:scale-105'
          }`}
        >
          {saved && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          )}
          {saved ? 'Saved' : 'Save Draft'}
        </button>
      </div>

    </div>
  );
};

export default MyReviewInput;