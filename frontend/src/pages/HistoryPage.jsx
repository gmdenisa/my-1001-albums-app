// src/pages/HistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarRatingInput from '../components/forms/StarRatingInput';

// ─── Review Modal ──────────────────────────────────────────────────────────────
const ReviewModal = ({ album, onClose }) => {
  if (!album) return null;

  const rating = album.rating || 0;
  const reviewText = album.review || album.notes || album.reviewText || '';
  const imageUrl =
    album.images?.[0]?.url ||
    album.album?.images?.[0]?.url ||
    null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex overflow-hidden rounded-2xl"
        style={{
          width: 'min(780px, 92vw)',
          maxHeight: '85vh',
          boxShadow: '0 40px 120px rgba(0,0,0,0.9)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Left — cover */}
        <div className="shrink-0 relative bg-[#111]" style={{ width: '260px' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={album.name}
              className="w-full h-full object-cover"
              style={{ minHeight: '320px', display: 'block' }}
            />
          ) : (
            <div className="flex items-center justify-center text-white/10" style={{ width: '260px', minHeight: '320px' }}>
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.4))' }} />
          <div className="absolute top-4 left-4 text-white text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            #{album.rank}
          </div>
        </div>

        {/* Right — info */}
        <div className="flex-1 flex flex-col bg-[#f0ebe0] text-[#1a1a1a] overflow-y-auto">
          <div className="px-8 pt-8 pb-6 border-b border-black/10">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-1.5" style={{ color: 'rgba(26,26,26,0.4)' }}>
              {album.artist}
            </p>
            <h2 className="text-2xl font-black tracking-tight leading-tight mb-4">
              {album.name}
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-bold mb-4" style={{ color: 'rgba(26,26,26,0.4)' }}>
              {(album.releaseYear || album.year) && <span>{album.releaseYear ?? album.year}</span>}
              {album.genres?.length > 0 && (
                <>
                  <span className="w-px h-3 bg-current" style={{ opacity: 0.4 }} />
                  <span className="truncate">{album.genres.slice(0, 2).join(', ')}</span>
                </>
              )}
            </div>
            <StarRatingInput rating={rating} setRating={() => {}} />
          </div>

          <div className="px-8 py-6 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-3" style={{ color: 'rgba(26,26,26,0.3)' }}>
              My Review
            </p>
            {reviewText ? (
              <p className="leading-relaxed font-medium italic" style={{ fontSize: '15px', color: 'rgba(26,26,26,0.8)' }}>
                {reviewText}
              </p>
            ) : (
              <p className="font-medium italic" style={{ fontSize: '13px', color: 'rgba(26,26,26,0.25)' }}>
                No review written yet.
              </p>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.25)'}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── Album Card ────────────────────────────────────────────────────────────────
const AlbumCard = ({ album, index, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const rating = album.rating || 0;

  const imageUrl =
    album.images?.[0]?.url ||
    album.album?.images?.[0]?.url ||
    null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.035, 0.6), ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        width: '200px',
        flexShrink: 0,
        flexGrow: 0,
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: hovered ? '0 24px 64px rgba(0,0,0,0.8)' : '0 8px 32px rgba(0,0,0,0.5)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'box-shadow 0.35s ease, transform 0.35s ease',
      }}
    >
      {/* Square cover */}
      <div style={{ width: '200px', height: '200px', position: 'relative', overflow: 'hidden', backgroundColor: '#1c1c1e' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={album.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.5s ease',
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
            </svg>
          </div>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}>
          <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>
            View Review
          </span>
        </div>
      </div>

      {/* Info strip */}
      <div style={{ backgroundColor: '#f0ebe0', color: '#1a1a1a', padding: '12px 16px 16px' }}>
        <p style={{ fontWeight: 900, fontSize: '13px', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {album.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 700, color: 'rgba(26,26,26,0.5)', marginBottom: '10px' }}>
          <span style={{ fontWeight: 900, color: 'rgba(26,26,26,0.7)' }}>#{album.rank}</span>
          <span style={{ width: '1px', height: '12px', backgroundColor: 'currentColor', opacity: 0.3 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{album.artist}</span>
          <span style={{ flexShrink: 0 }}>{album.releaseYear ?? album.year ?? ''}</span>
        </div>
        <StarRatingInput rating={rating} setRating={() => {}} />
      </div>
    </motion.div>
  );
};

// ─── History Page ──────────────────────────────────────────────────────────────
const HistoryPage = () => {
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('recent');
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const projectId = localStorage.getItem('project_id');
      if (!projectId) return;
      try {
        setIsLoading(true);
        const res = await fetch(`https://1001albumsgenerator.com/api/v1/projects/${projectId}`);
        if (!res.ok) throw new Error('Failed to fetch project');
        const data = await res.json();

        const history = (data.history || []).map((entry, i) => {
          const nested = entry.album || {};
          return {
            ...nested,
            ...entry,
            name: entry.name || nested.name,
            artist: entry.artist || nested.artist,
            images: entry.images?.length ? entry.images : nested.images,
            genres: entry.genres || nested.genres,
            releaseYear: entry.releaseYear || nested.releaseYear || entry.year || nested.year,
            rating: entry.rating,
            review: entry.review || entry.notes || entry.reviewText,
            rank: i + 1,
          };
        });

        setAlbums(history);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') setSelectedAlbum(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const processed = [...albums]
    .filter(a => {
      if (ratingFilter === 'rated') return (a.rating || 0) > 0;
      if (ratingFilter === 'unrated') return !a.rating || a.rating === 0;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'oldest') return a.rank - b.rank;
      if (sortOrder === 'rating') return (b.rating || 0) - (a.rating || 0);
      return b.rank - a.rank;
    });

  const ratingCycle = ['all', 'rated', 'unrated'];
  const ratingLabel = { all: 'ALL RATINGS', rated: 'RATED ONLY', unrated: 'UNRATED' };
  const sortCycle = ['recent', 'oldest', 'rating'];
  const sortLabel = { recent: 'RECENT FIRST', oldest: 'OLDEST FIRST', rating: 'BY RATING' };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0e0e10',
      color: 'white',
      overflow: 'hidden',
    }}>

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        <div style={{ width: '8rem' }} />
        <button
          onClick={() => setRatingFilter(f => ratingCycle[(ratingCycle.indexOf(f) + 1) % ratingCycle.length])}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em' }}>
            {ratingLabel[ratingFilter]}
          </span>
        </button>
        <button
          onClick={() => setSortOrder(s => sortCycle[(sortCycle.indexOf(s) + 1) % sortCycle.length])}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s', width: '8rem', justifyContent: 'flex-end' }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 6h18M6 12h12M9 18h6"/>
          </svg>
          <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em' }}>
            {sortLabel[sortOrder]}
          </span>
        </button>
      </div>

      {/* Count heading */}
      <div style={{ padding: '2rem 2.5rem 1.5rem', flexShrink: 0 }}>
        <AnimatePresence mode="wait">
          <motion.h1
            key={processed.length}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            style={{ fontSize: 'clamp(3.5rem,7vw,6.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, textTransform: 'uppercase', margin: 0 }}
          >
            {isLoading ? (
              <span style={{ opacity: 0.2 }}>— albums</span>
            ) : (
              <>{processed.length} <span style={{ opacity: 0.3 }}>albums</span></>
            )}
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* ─── Vertical Grid Layout Strip ─── */}
      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      ) : processed.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            No albums yet
          </p>
        </div>
      ) : (
        /* Handles the structural Y scrolling box boundary properly */
        <div style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: '1 0 0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          <style>{`.grid-layout::-webkit-scrollbar{display:none}`}</style>
          <div
            className="grid-layout"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              gap: '24px',
              padding: '8px 40px 40px',
              minHeight: '100%',
            }}
          >
            {processed.map((album, i) => (
              <AlbumCard
                key={album.spotifyId || album.id || i}
                album={album}
                index={i}
                onClick={() => setSelectedAlbum(album)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {selectedAlbum && (
          <ReviewModal album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryPage;