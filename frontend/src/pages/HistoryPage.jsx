// src/pages/HistoryPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/DynamicThemeContext';

// ─── Light Beige Theme ────────────────────────────────────────────────────────

const BG      = '#f7f2ea';
const BG2     = '#efe9de';
const CARD    = '#ffffff';
const TEXT    = '#1a1614';
const TEXTSUB = '#7a6f69';
const TEXTMT  = '#b0a499';
const BORDER  = 'rgba(0,0,0,0.09)';

// ─── Stars ────────────────────────────────────────────────────────────────────

const Stars = ({ rating, size = 12 }) => {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) - full >= 0.5;
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map((i) => {
        const isFull = i <= full;
        const isHalf = !isFull && i === full + 1 && half;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none">
            {isFull ? (
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FACC15" />
            ) : isHalf ? (
              <>
                <defs>
                  <linearGradient id={`hg${i}`}>
                    <stop offset="50%" stopColor="#FACC15" />
                    <stop offset="50%" stopColor="rgba(0,0,0,0.12)" />
                  </linearGradient>
                </defs>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={`url(#hg${i})`} />
              </>
            ) : (
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="rgba(0,0,0,0.12)" />
            )}
          </svg>
        );
      })}
    </div>
  );
};

// ─── Album Card (grid) ────────────────────────────────────────────────────────

const AlbumCard = ({ item, index, onClick }) => {
  const { album, rating, globalRating, _num } = item;
  const year     = album?.releaseDate ? String(album.releaseDate).slice(0, 4) : '';
  const coverUrl = album?.images?.[0]?.url;

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{ aspectRatio: '3/4', boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.5), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={() => onClick(item)}
    >
      {coverUrl ? (
        <img src={coverUrl} alt={album?.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0" style={{ background: BG2 }} />
      )}

      {/* Number badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/80 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full">
          #{_num}
        </span>
      </div>

      {/* Unrated badge */}
      {rating == null && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[8px] font-black uppercase tracking-widest text-white/50 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
            Unrated
          </span>
        </div>
      )}

      {/* Bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pt-12 pb-4 flex flex-col gap-1"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.75) 45%, transparent 100%)' }}>
        <div className="flex items-center justify-between mb-0.5">
          <Stars rating={Number(rating)} size={11} />
          {globalRating != null && (
            <span className="text-[9px] font-bold text-white/35">avg {Number(globalRating).toFixed(1)}</span>
          )}
        </div>
        <p className="text-white font-black text-sm leading-tight line-clamp-2 tracking-tight">{album?.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-white/50 text-[10px] font-bold truncate">{album?.artist}</p>
          {year && <span className="text-white/25 text-[10px]">· {year}</span>}
        </div>
        {album?.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {album.genres.slice(0, 2).map((g) => (
              <span key={g} className="text-[8px] font-black uppercase tracking-wider text-white/45 bg-white/10 px-2 py-0.5 rounded-full">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover ring */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/0 group-hover:ring-white/20 transition-all duration-300 z-20 pointer-events-none" />
    </motion.div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────

const MODAL_BG = '#f7f2ea';

const AlbumModal = ({ item, onClose }) => {
  const { album, rating, globalRating, review, generatedAt } = item;
  const date = generatedAt
    ? new Date(generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.35)' }} />

      <motion.div
        className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.45 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover hero — fixed, does not scroll */}
        <div className="relative h-64 shrink-0">
          {album?.images?.[0]?.url && (
            <img src={album.images[0].url} alt={album?.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0"
            style={{ background: `linear-gradient(to top, ${MODAL_BG} 5%, transparent 65%)` }} />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
            style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.7)' }}>
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div
          className="px-6 pb-8 -mt-1 overflow-y-auto"
          style={{
            background: MODAL_BG,
            flex: 1,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.12) transparent',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="font-black text-xl tracking-tight leading-tight" style={{ color: TEXT }}>
                {album?.name}
              </h2>
              <p className="text-xs font-bold mt-0.5" style={{ color: TEXTMT }}>
                {album?.artist}
                {album?.releaseDate ? ` · ${String(album.releaseDate).slice(0, 4)}` : ''}
              </p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <Stars rating={Number(rating)} size={14} />
              {globalRating != null && (
                <p className="text-[9px] mt-1" style={{ color: TEXTMT }}>
                  global avg {Number(globalRating).toFixed(2)}
                </p>
              )}
              {rating == null && (
                <p className="text-[9px] mt-1 italic" style={{ color: TEXTMT }}>Not rated</p>
              )}
            </div>
          </div>

          {date && (
            <p className="text-[9px] font-black uppercase tracking-widest mb-4" style={{ color: TEXTMT }}>
              Listened {date}
            </p>
          )}

          {review ? (
            <div className="border-l-2 pl-4" style={{ borderColor: BORDER }}>
              <p className="text-sm leading-relaxed italic" style={{ color: TEXTSUB }}>
                "{review}"
              </p>
            </div>
          ) : (
            <p className="text-sm italic" style={{ color: TEXTMT }}>No review written.</p>
          )}

          {album?.styles?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {album.styles.map((s) => (
                <span key={s}
                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ color: TEXTSUB, background: BG2, border: `1px solid ${BORDER}` }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          {album?.spotifyId && (
            <a href={`https://open.spotify.com/album/${album.spotifyId}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-black text-sm text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: '#1DB954' }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black">
                <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm5.508 17.293c-.198.324-.62.433-.944.235-2.585-1.58-5.844-1.933-9.69-1.053-.37.085-.745-.15-.83-.518-.086-.368.148-.74.516-.825 4.22-.964 7.81-.55 10.716 1.222.322.197.432.62.232.939zm1.48-3.262c-.248.403-.78.532-1.182.285-2.955-1.816-7.464-2.34-10.965-1.28-.456.14-.94-.112-1.08-.567-.14-.455.113-.938.567-1.08 3.99-1.21 9.006-.605 12.378 1.463.404.247.533.78.282 1.18zm.13-3.3c-3.54-2.102-9.405-2.3-12.783-1.275-.543.165-1.114-.145-1.28-.686-.164-.543.146-1.113.687-1.278 3.893-1.182 10.384-.94 14.47 1.492.488.29.646.92.357 1.408-.29.488-.92.646-1.408.36z" />
              </svg>
              Open in Spotify
            </a>
          )}

          <div className="h-4" />
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Filter + Sort bar ────────────────────────────────────────────────────────

const SORT_OPTIONS    = ['Recent First', 'Oldest First', 'Highest Rated', 'Lowest Rated'];
const RATING_FILTERS  = ['All', '5★', '4★', '3★', '2★', '1★', 'Unrated'];

const FilterBar = ({ sort, setSort, ratingFilter, setRatingFilter, search, setSearch, genres, genreFilter, setGenreFilter }) => (
  <div className="flex flex-col gap-3 mb-6">
    {/* Search */}
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: TEXTMT }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by album or artist…"
        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
        style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          color: TEXT,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      />
      {search && (
        <button onClick={() => setSearch('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold"
          style={{ color: TEXTMT }}>
          ✕
        </button>
      )}
    </div>

    {/* Rating filter + sort */}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {RATING_FILTERS.map((f) => (
          <button key={f} onClick={() => setRatingFilter(f)}
            className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-200"
            style={
              ratingFilter === f
                ? { background: TEXT, borderColor: TEXT, color: '#fff' }
                : { background: CARD, borderColor: BORDER, color: TEXTMT }
            }>{f}</button>
        ))}
      </div>
      <select value={sort} onChange={(e) => setSort(e.target.value)}
        className="text-[10px] font-black uppercase tracking-widest rounded-xl px-3 py-2 outline-none cursor-pointer"
        style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXTSUB }}>
        {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>

    {/* Genre filter */}
    {genres.length > 1 && (
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-[9px] font-black uppercase tracking-widest shrink-0" style={{ color: TEXTMT }}>Genre:</p>
        {genres.map((g) => (
          <button key={g} onClick={() => setGenreFilter(g)}
            className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-200"
            style={
              genreFilter === g
                ? { background: TEXT, borderColor: TEXT, color: '#fff' }
                : { background: CARD, borderColor: BORDER, color: TEXTMT }
            }>{g}</button>
        ))}
      </div>
    )}
  </div>
);

// ─── Warm background decoration ───────────────────────────────────────────────

const PageBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.04 }}>
      <defs>
        <pattern id="vp" x="0" y="0" width="220" height="220" patternUnits="userSpaceOnUse">
          <circle cx="110" cy="110" r="100" stroke="#5a4a3a" strokeWidth="0.8" fill="none" />
          <circle cx="110" cy="110" r="80"  stroke="#5a4a3a" strokeWidth="0.4" fill="none" />
          <circle cx="110" cy="110" r="60"  stroke="#5a4a3a" strokeWidth="0.8" fill="none" />
          <circle cx="110" cy="110" r="40"  stroke="#5a4a3a" strokeWidth="0.4" fill="none" />
          <circle cx="110" cy="110" r="20"  stroke="#5a4a3a" strokeWidth="0.8" fill="none" />
          <circle cx="110" cy="110" r="7"   stroke="#5a4a3a" strokeWidth="1.5" fill="none" />
          <circle cx="110" cy="110" r="2.5" fill="#5a4a3a" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#vp)" />
    </svg>
    <div className="absolute inset-0" style={{
      background: `radial-gradient(ellipse 70% 50% at 15% 25%, rgba(180,140,80,0.10) 0%, transparent 60%),
                   radial-gradient(ellipse 50% 40% at 85% 75%, rgba(160,120,80,0.08) 0%, transparent 60%)`,
    }} />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const HistoryPage = () => {
  const projectId = localStorage.getItem('project_id');
  const { themeConfig } = useTheme();
  const mainColor = themeConfig.mainColor || '#6366f1';

  const [history,     setHistory]     = useState(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState(null);
  const [sort,        setSort]        = useState('Recent First');
  const [ratingFilter,setRatingFilter]= useState('All');
  const [genreFilter, setGenreFilter] = useState('All');
  const [search,      setSearch]      = useState('');
  const [selected,    setSelected]    = useState(null);
  const [totalAlbums, setTotalAlbums] = useState(null);

  // Fetch total album count dynamically
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const r = await fetch('http://localhost:8080/api/albums');
        if (r.ok) {
          const data = await r.json();
          const arr = Array.isArray(data) ? data : data.albums;
          if (arr?.length) { setTotalAlbums(arr.length); return; }
        }
      } catch {}
      try {
        const r = await fetch('https://1001albumsgenerator.com/api/v1/albums');
        if (r.ok) {
          const data = await r.json();
          const arr = Array.isArray(data) ? data : data.albums;
          if (arr?.length) { setTotalAlbums(arr.length); return; }
        }
      } catch {}
      setTotalAlbums(1089);
    };
    fetchTotal();
  }, []);

  useEffect(() => {
    if (!projectId) { setError('No project ID found. Please log in first.'); setIsLoading(false); return; }
    fetch(`http://localhost:8080/api/my-project/${projectId}`)
      .then((r) => { if (!r.ok) throw new Error(`Server responded with ${r.status}`); return r.json(); })
      .then((data) => setHistory(data.history || []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  // All unique genres from history
  const allGenres = useMemo(() => {
    if (!history) return ['All'];
    const set = new Set();
    history.forEach((h) => (h.album?.genres || []).forEach((g) => set.add(g)));
    return ['All', ...Array.from(set).sort()];
  }, [history]);

  const processed = useMemo(() => {
    if (!history) return [];
    const withNums = [...history].reverse().map((item, i) => ({ ...item, _num: i + 1 })).reverse();

    let filtered = withNums;

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((h) =>
        h.album?.name?.toLowerCase().includes(q) ||
        h.album?.artist?.toLowerCase().includes(q)
      );
    }

    // Rating filter
    if (ratingFilter !== 'All') {
      if (ratingFilter === 'Unrated') {
        filtered = filtered.filter((h) => h.rating == null);
      } else {
        const star = parseInt(ratingFilter);
        filtered = filtered.filter((h) => h.rating != null && Math.round(Number(h.rating)) === star);
      }
    }

    // Genre filter
    if (genreFilter !== 'All') {
      filtered = filtered.filter((h) => h.album?.genres?.includes(genreFilter));
    }

    // Sort
    const sorted = [...filtered];
    switch (sort) {
      case 'Recent First':  sorted.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)); break;
      case 'Oldest First':  sorted.sort((a, b) => new Date(a.generatedAt) - new Date(b.generatedAt)); break;
      case 'Highest Rated': sorted.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)); break;
      case 'Lowest Rated':  sorted.sort((a, b) => (Number(a.rating) || 0) - (Number(b.rating) || 0)); break;
    }
    return sorted;
  }, [history, sort, ratingFilter, genreFilter, search]);

  const rated = history?.filter((h) => h.rating != null) || [];
  const avgRating = rated.length > 0
    ? (rated.reduce((s, h) => s + Number(h.rating), 0) / rated.length).toFixed(2)
    : '—';
  const albumTotal = totalAlbums ?? 1089;

  // ── Loading ──
  if (isLoading) return (
    <div className="flex items-center justify-center h-full w-full" style={{ background: BG }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: mainColor, borderTopColor: 'transparent' }} />
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: TEXTMT }}>Loading History</p>
      </div>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div className="flex items-center justify-center h-full w-full" style={{ background: BG }}>
      <p className="text-red-600 text-sm font-mono bg-red-50 border border-red-200 px-6 py-4 rounded-xl">{error}</p>
    </div>
  );

  // ── Render ──
  return (
    <div
      className="h-screen w-full overflow-y-auto relative"
      style={{ background: BG, scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.12) transparent' }}
    >
      <PageBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-14">

        {/* Header */}
        <motion.div className="mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <p className="text-[9px] font-black uppercase tracking-[1em] mb-2" style={{ color: TEXTMT }}>Your Collection</p>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="text-6xl font-black uppercase tracking-tight leading-none" style={{ color: TEXT }}>
              {history?.length || 0}
              <span className="ml-3 text-5xl" style={{ color: TEXTMT }}>Albums</span>
            </h1>
            <div className="flex items-center gap-8 mb-1">
              {[
                { label: 'Rated',     value: rated.length },
                { label: 'Avg Score', value: avgRating },
                { label: 'Remaining', value: albumTotal - (history?.length || 0) },
              ].map(({ label, value }) => (
                <div key={label} className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: TEXTMT }}>{label}</p>
                  <p className="text-2xl font-black" style={{ color: TEXT }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
          <motion.div className="h-px mt-6 rounded-full" style={{ backgroundColor: mainColor, opacity: 0.4 }}
            initial={{ width: 0 }} animate={{ width: '100%' }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} />
        </motion.div>

        {/* Filters */}
        <FilterBar
          sort={sort} setSort={setSort}
          ratingFilter={ratingFilter} setRatingFilter={setRatingFilter}
          search={search} setSearch={setSearch}
          genres={allGenres} genreFilter={genreFilter} setGenreFilter={setGenreFilter}
        />

        {/* Count */}
        <p className="text-[9px] font-black uppercase tracking-widest mb-6" style={{ color: TEXTMT }}>
          {processed.length} {processed.length === 1 ? 'album' : 'albums'} shown
        </p>

        {/* Grid */}
        {processed.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <p className="text-sm italic" style={{ color: TEXTMT }}>No albums match this filter.</p>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
            {processed.map((item, i) => (
              <AlbumCard key={item.generatedAlbumId} item={item} index={i} onClick={setSelected} />
            ))}
          </div>
        )}

        <div className="h-16" />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && <AlbumModal item={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default HistoryPage;