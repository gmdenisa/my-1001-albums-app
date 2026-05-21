// src/components/forms/MyReviewInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getAlbumReviewUrl } from '../../api/draftApi';

const MOOD_TAGS = ['Timeless', 'Late Night', 'Formative', 'Overrated', 'Underrated', 'Haunting', 'Euphoric', 'Dense'];

// Converts any color string to rgba
const toRgba = (color, alpha) => {
  if (!color) return `rgba(201,169,110,${alpha})`;
  if (color.startsWith('rgba')) return color.replace(/[\d.]+\)$/, `${alpha})`);
  if (color.startsWith('rgb')) return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
  const hex = color.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const StarRatingInput = ({ rating, setRating, accentColor }) => {
  const [hovered, setHovered] = useState(0);
  const labels = ['', 'Weak', 'Decent', 'Solid', 'Great', 'Masterpiece'];
  const active = hovered || rating;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map(i => {
          const isActive = i <= active;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i === rating ? 0 : i)}
              onMouseEnter={() => setHovered(i)}
              className="transition-all duration-200 focus:outline-none"
              style={{
                color: isActive ? accentColor : '#d1c9bd',
                transform: isActive ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"
                fill={isActive ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        })}
      </div>
      {active > 0 && (
        <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: accentColor }}>
          {labels[active]}
        </span>
      )}
    </div>
  );
};

const MyReviewInput = ({ album, themeConfig = {} }) => {
  const accentColor = themeConfig.mainColor || '#c9a96e';
  const accentSoft  = toRgba(accentColor, 0.12);
  const accentBorder= toRgba(accentColor, 0.35);
  const accentGlow  = toRgba(accentColor, 0.18);

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [activeTags, setActiveTags] = useState([]);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef(null);

  // Key drafts by spotifyId so each album has its own slot.
  // When the album changes the effect re-runs: if there's a saved draft for
  // the new album it restores it; otherwise everything resets to blank.
  const storageKey = `album_review_draft_${album?.spotifyId || 'unknown'}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { reviewText: t, rating: r, activeTags: tags } = JSON.parse(stored);
        setReviewText(t  ?? '');
        setRating(r      ?? 0);
        setActiveTags(tags ?? []);
      } else {
        // New album — start completely fresh
        setReviewText('');
        setRating(0);
        setActiveTags([]);
      }
    } catch {
      setReviewText('');
      setRating(0);
      setActiveTags([]);
    }
  }, [storageKey]); // re-runs whenever the album changes

  const toggleTag = (tag) =>
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );

  const handleSave = () => {
    const tagLine = activeTags.length > 0 ? `[${activeTags.join(', ')}]\n` : '';
    const fullReview = tagLine + reviewText;
    localStorage.setItem(storageKey, JSON.stringify({ reviewText, rating, activeTags }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Always open the project homepage — the bookmarklet can pick up the hash from there
    const projectId = localStorage.getItem('project_id') ?? '';
    const baseUrl   = `https://1001albumsgenerator.com/${projectId}`;
    const hash      = reviewText.trim()
      ? `#review=${btoa(unescape(encodeURIComponent(fullReview.trim())))}`
      : '';
    window.open(baseUrl + hash, '_blank', 'noopener');
  };

  return (
    <div
      className="w-full flex flex-col rounded-2xl overflow-hidden transition-all duration-500"
      style={{
        background: '#fdfbf7',
        border: `1.5px solid ${accentBorder}`,
        boxShadow: `0 0 0 1px ${toRgba(accentColor, 0.08)}, 0 8px 40px ${toRgba(accentColor, 0.15)}, 0 2px 8px rgba(0,0,0,0.25)`,
      }}
    >
      {/* Accent top bar */}
      <div
        className="h-[3px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: 0.8,
        }}
      />

      {/* Header row */}
      <div className="flex justify-between items-center px-7 pt-5 pb-3">
        <span
          className="text-[9px] font-black uppercase tracking-[0.35em]"
          style={{ color: toRgba(accentColor, 0.7) }}
        >
          My Entry
        </span>
        <StarRatingInput rating={rating} setRating={setRating} accentColor={accentColor} />
      </div>

      {/* Divider */}
      <div className="mx-7 mb-3" style={{ height: '1px', background: `linear-gradient(90deg, ${accentBorder}, transparent)` }} />

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={reviewText}
        onChange={e => setReviewText(e.target.value)}
        className="w-full bg-transparent px-7 pb-3 text-sm leading-relaxed resize-none outline-none min-h-[130px] font-medium"
        placeholder="What makes this record stand out?"
        style={{ color: '#2c2825', caretColor: accentColor }}
      />

      {/* Mood tags */}
      <div className="px-7 pb-6 flex flex-wrap gap-2">
        {MOOD_TAGS.map(tag => {
          const isActive = activeTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="px-3 py-1.5 rounded-full text-[8.5px] font-black uppercase tracking-widest transition-all duration-200"
              style={
                isActive
                  ? {
                      background: accentSoft,
                      color: accentColor,
                      border: `1px solid ${accentBorder}`,
                      boxShadow: `0 0 8px ${accentGlow}`,
                    }
                  : {
                      background: 'rgba(44,40,37,0.05)',
                      color: '#9c948a',
                      border: '1px solid rgba(44,40,37,0.1)',
                    }
              }
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex justify-between items-center px-7 py-4"
        style={{ borderTop: `1px solid ${toRgba(accentColor, 0.12)}` }}
      >
        <span className="text-[9px] font-medium tracking-wide" style={{ color: reviewText.length > 0 ? '#9c948a' : '#c4bdb7' }}>
          {reviewText.length > 0 ? `${reviewText.length} chars` : 'Saved locally'}
        </span>

        <button
          onClick={handleSave}
          className="px-7 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-300 flex items-center gap-2"
          style={
            saved
              ? { background: '#22c55e', color: '#fff', boxShadow: '0 0 16px rgba(34,197,94,0.35)' }
              : {
                  background: accentColor,
                  color: '#fdfbf7',
                  boxShadow: `0 2px 16px ${toRgba(accentColor, 0.45)}`,
                }
          }
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