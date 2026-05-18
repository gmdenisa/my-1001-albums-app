// src/pages/StatsPage.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/DynamicThemeContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DECADE_ORDER = [
  '1920s','1930s','1940s','1950s','1960s',
  '1970s','1980s','1990s','2000s','2010s','2020s',
];

const toDecade = (releaseDate) => {
  if (!releaseDate) return 'Unknown';
  const year = parseInt(String(releaseDate).slice(0, 4), 10);
  if (isNaN(year)) return 'Unknown';
  return `${Math.floor(year / 10) * 10}s`;
};

const starLabel = (r) => {
  if (r >= 4.5) return 'Masterpiece';
  if (r >= 4)   return 'Excellent';
  if (r >= 3)   return 'Good';
  if (r >= 2)   return 'Mediocre';
  return 'Poor';
};

const ORIGIN_MAP = {
  us:'United States', gb:'United Kingdom', other:'Other',
  ca:'Canada', au:'Australia', de:'Germany', fr:'France',
  jp:'Japan', se:'Sweden', ie:'Ireland', nl:'Netherlands',
  it:'Italy', es:'Spain', br:'Brazil', nz:'New Zealand',
  no:'Norway', dk:'Denmark', fi:'Finland', be:'Belgium',
  at:'Austria', ch:'Switzerland', pt:'Portugal', pl:'Poland',
  ru:'Russia', za:'South Africa', ng:'Nigeria', gh:'Ghana',
  jm:'Jamaica', mx:'Mexico', ar:'Argentina', cl:'Chile',
  co:'Colombia', cu:'Cuba', kr:'South Korea',
};
const originLabel = (code) => ORIGIN_MAP[code] || (code ? code.toUpperCase() : 'Unknown');

const countBy = (arr, getFn) => {
  const map = {};
  arr.forEach((item) => {
    const keys = getFn(item);
    (Array.isArray(keys) ? keys : [keys]).forEach((k) => {
      if (k) map[k] = (map[k] || 0) + 1;
    });
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
};

const maxOf = (arr) => Math.max(...arr.map((x) => x[1]), 1);

// ─── Light Beige Theme ────────────────────────────────────────────────────────

const BG      = '#f7f2ea';
const BG2     = '#efe9de';
const CARD    = '#ffffff';
const TEXT    = '#1a1614';
const TEXTSUB = '#7a6f69';
const TEXTMT  = '#b0a499';
const BORDER  = 'rgba(0,0,0,0.09)';
const TRACK   = 'rgba(0,0,0,0.07)';

// ─── Background decoration ────────────────────────────────────────────────────

const PageBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse 80% 60% at 10% 10%, rgba(200,170,120,0.13) 0%, transparent 55%),
                   radial-gradient(ellipse 60% 50% at 90% 80%, rgba(180,140,100,0.10) 0%, transparent 55%),
                   radial-gradient(ellipse 50% 40% at 50% 50%, rgba(210,195,170,0.08) 0%, transparent 60%)`,
    }} />
    {/* Subtle grain dots */}
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.025 }}>
      <defs>
        <pattern id="grain" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="40" cy="40" r="35" stroke="#5a4a3a" strokeWidth="0.6" fill="none" />
          <circle cx="40" cy="40" r="22" stroke="#5a4a3a" strokeWidth="0.4" fill="none" />
          <circle cx="40" cy="40" r="10" stroke="#5a4a3a" strokeWidth="0.6" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grain)" />
    </svg>
  </div>
);

// ─── UI Primitives ─────────────────────────────────────────────────────────────

const SectionTitle = ({ label, sub }) => (
  <div className="flex flex-col gap-1 mb-8">
    <p style={{ color: TEXTMT }} className="text-[9px] font-black uppercase tracking-[0.7em]">{sub}</p>
    <h2 style={{ color: TEXT }} className="text-3xl font-black uppercase tracking-tight leading-none">{label}</h2>
  </div>
);

const Divider = () => <div className="h-px w-full my-14" style={{ backgroundColor: BORDER }} />;

const Bar = ({ value, max, color, label, count, delay = 0 }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <p className="text-[10px] font-black uppercase tracking-widest w-28 shrink-0 text-right truncate" style={{ color: TEXTMT }}>
        {label}
      </p>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: TRACK }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <p className="text-[10px] font-black w-6 shrink-0 text-right" style={{ color: TEXTMT }}>{count}</p>
    </div>
  );
};

const RatingDonut = ({ distribution, total }) => {
  const r = 70, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  const COLORS = ['#ef4444','#f97316','#eab308','#84cc16','#22c55e'];
  let offset = 0;
  const slices = [1,2,3,4,5].map((star, i) => {
    const count = distribution[star] || 0;
    const dash  = total > 0 ? (count / total) * circ : 0;
    const slice = { star, count, dash, gap: circ - dash, offset, color: COLORS[i] };
    offset += dash;
    return slice;
  });
  return (
    <svg viewBox="0 0 180 180" className="w-48 h-48 shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={TRACK} strokeWidth="16" />
      {slices.map((s) => (
        <motion.circle
          key={s.star} cx={cx} cy={cy} r={r}
          fill="none" stroke={s.color} strokeWidth="16"
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset + circ * 0.25}
          initial={{ strokeDasharray: `0 ${circ}` }}
          whileInView={{ strokeDasharray: `${s.dash} ${s.gap}` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={TEXT} fontSize="22" fontWeight="900" fontFamily="inherit">
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={TEXTMT} fontSize="9" fontWeight="700" fontFamily="inherit" letterSpacing="2">
        RATED
      </text>
    </svg>
  );
};

const AlbumCard = ({ item, isHigher }) => {
  const { album, rating, globalRating } = item;
  const diff = (Number(rating) - Number(globalRating)).toFixed(1);
  return (
    <motion.div
      className="flex items-center gap-4 p-4 rounded-xl transition-colors"
      style={{ background: CARD, border: `1px solid ${BORDER}` }}
      whileHover={{ background: BG2 }}
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      {album?.images?.[0]?.url && (
        <img src={album.images[0].url} alt={album.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm truncate" style={{ color: TEXT }}>{album?.name}</p>
        <p className="text-[10px] font-bold truncate" style={{ color: TEXTMT }}>{album?.artist}</p>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <p className="font-black text-base" style={{ color: TEXT }}>★ {rating}</p>
        <p className="text-[10px] font-bold" style={{ color: isHigher ? '#16a34a' : '#dc2626' }}>
          {isHigher ? '+' : ''}{diff} vs avg
        </p>
      </div>
    </motion.div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const OUTLIER_OPTIONS = [5, 10, 15, 'All'];

const StatsPage = () => {
  const projectId = localStorage.getItem('project_id');
  const { themeConfig } = useTheme();
  const mainColor   = themeConfig.mainColor || '#6366f1';
  const accentColor = themeConfig.secondaryColor && !themeConfig.secondaryColor.includes('252,252,252')
    ? themeConfig.secondaryColor : '#a78bfa';

  const [history,     setHistory]     = useState(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState(null);
  const [outlierCount,setOutlierCount]= useState(5);
  const [totalAlbums, setTotalAlbums] = useState(null);

  // Fetch total album count dynamically from the API
  useEffect(() => {
    const fetchTotal = async () => {
      // Try via local proxy first
      try {
        const r = await fetch('http://localhost:8080/api/albums');
        if (r.ok) {
          const data = await r.json();
          const arr = Array.isArray(data) ? data : data.albums;
          if (arr?.length) { setTotalAlbums(arr.length); return; }
        }
      } catch {}
      // Try direct public API (may be CORS-blocked depending on setup)
      try {
        const r = await fetch('https://1001albumsgenerator.com/api/v1/albums');
        if (r.ok) {
          const data = await r.json();
          const arr = Array.isArray(data) ? data : data.albums;
          if (arr?.length) { setTotalAlbums(arr.length); return; }
        }
      } catch {}
      setTotalAlbums(1089); // last-known fallback
    };
    fetchTotal();
  }, []);

  useEffect(() => {
    if (!projectId) {
      setError('No project ID found. Please log in first.');
      setIsLoading(false);
      return;
    }
    fetch(`http://localhost:8080/api/my-project/${projectId}`)
      .then((r) => { if (!r.ok) throw new Error(`Server responded with ${r.status}`); return r.json(); })
      .then((data) => setHistory(data.history || []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-full w-full" style={{ background: BG }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: mainColor, borderTopColor: 'transparent' }} />
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: TEXTMT }}>Loading Stats</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full w-full" style={{ background: BG }}>
      <p className="text-red-600 text-sm font-mono bg-red-50 border border-red-200 px-6 py-4 rounded-xl">{error}</p>
    </div>
  );

  // ── Derived stats ────────────────────────────────────────────────────────

  const rated         = history.filter((h) => h.rating != null);
  const totalListened = history.length;
  const albumTotal    = totalAlbums ?? 1089;
  const progressPct   = Math.round((totalListened / albumTotal) * 100);
  const avgRating     = rated.length > 0
    ? rated.reduce((s, h) => s + Number(h.rating), 0) / rated.length : 0;

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  rated.forEach((h) => {
    const k = Math.round(Number(h.rating));
    if (distribution[k] !== undefined) distribution[k]++;
  });

  const topGenres  = countBy(history, (h) => h.album?.genres  || []).slice(0, 12);
  const topStyles  = countBy(history, (h) => h.album?.styles  || []).slice(0, 12);
  const topOrigins = countBy(history, (h) => originLabel(h.album?.artistOrigin)).slice(0, 10);

  const decadeMap = {};
  history.forEach((h) => {
    const d = toDecade(h.album?.releaseDate);
    decadeMap[d] = (decadeMap[d] || 0) + 1;
  });
  const decades = DECADE_ORDER.filter((d) => decadeMap[d]).map((d) => [d, decadeMap[d]]);

  const ratedWithGlobal = rated.filter((h) => h.globalRating != null);
  const higherAll = ratedWithGlobal
    .filter((h) => Number(h.rating) - Number(h.globalRating) >= 1)
    .sort((a, b) => (Number(b.rating) - Number(b.globalRating)) - (Number(a.rating) - Number(a.globalRating)));
  const lowerAll = ratedWithGlobal
    .filter((h) => Number(h.globalRating) - Number(h.rating) >= 1)
    .sort((a, b) => (Number(b.globalRating) - Number(b.rating)) - (Number(a.globalRating) - Number(a.rating)));

  const applySlice = (arr) => outlierCount === 'All' ? arr : arr.slice(0, outlierCount);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="h-screen w-full overflow-y-auto relative"
      style={{ background: BG, scrollbarWidth: 'thin', scrollbarColor: `rgba(0,0,0,0.12) transparent` }}
    >
      <PageBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-12 py-20">

        {/* HERO */}
        <motion.div className="mb-20" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <p className="text-[9px] font-black uppercase tracking-[1em] mb-2" style={{ color: TEXTMT }}>
            1001 Albums Generator
          </p>
          <h1 className="text-6xl font-black uppercase tracking-tight leading-none mb-4" style={{ color: TEXT }}>
            Your Journey
          </h1>
          <p className="text-sm font-medium max-w-md" style={{ color: TEXTSUB }}>
            A deep dive into your listening history, ratings, and musical discoveries.
          </p>
        </motion.div>

        {/* OVERVIEW CARDS */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Albums Heard', value: totalListened,        sub: `of ${albumTotal}`    },
            { label: 'Albums Rated', value: rated.length,         sub: 'with a score'        },
            { label: 'Avg Rating',   value: avgRating.toFixed(2), sub: starLabel(avgRating)  },
            { label: 'Journey',      value: `${progressPct}%`,    sub: 'complete'            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              className="rounded-2xl p-6 flex flex-col gap-1 relative overflow-hidden"
              style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute top-0 left-0 w-full h-[2px] rounded-t-2xl"
                style={{ backgroundColor: mainColor, opacity: 0.8 }} />
              <p className="text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: TEXTMT }}>{card.label}</p>
              <p className="text-4xl font-black tracking-tight leading-none mt-1" style={{ color: TEXT }}>{card.value}</p>
              <p className="text-[10px] font-bold mt-1" style={{ color: TEXTMT }}>{card.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* PROGRESS BAR */}
        <motion.div className="mb-14" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex justify-between mb-2">
            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: TEXTMT }}>Progress to Completion</p>
            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: TEXTMT }}>{totalListened} / {albumTotal}</p>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: TRACK }}>
            <motion.div className="h-full rounded-full" style={{ backgroundColor: mainColor }}
              initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} />
          </div>
        </motion.div>

        <Divider />

        {/* RATING DISTRIBUTION */}
        <SectionTitle label="Rating Breakdown" sub="How you score" />
        <div className="flex items-center gap-16 mb-4">
          <RatingDonut distribution={distribution} total={rated.length} />
          <div className="flex-1 flex flex-col gap-3">
            {[5,4,3,2,1].map((star, i) => (
              <Bar key={star} label={`${star} ★`} value={distribution[star] || 0}
                max={Math.max(...Object.values(distribution), 1)} count={distribution[star] || 0}
                color={['#22c55e','#84cc16','#eab308','#f97316','#ef4444'][5 - star]} delay={i * 0.07} />
            ))}
          </div>
        </div>

        <Divider />

        {/* GENRE */}
        <SectionTitle label="By Genre" sub="Musical categories" />
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 mb-4">
          {topGenres.length > 0
            ? topGenres.map(([g, c], i) => (
                <Bar key={g} label={g} value={c} max={maxOf(topGenres)} count={c} color={mainColor} delay={i * 0.04} />
              ))
            : <p className="text-sm italic col-span-2" style={{ color: TEXTMT }}>No genre data yet.</p>
          }
        </div>

        <Divider />

        {/* STYLE */}
        <SectionTitle label="By Style" sub="Sub-genre flavors" />
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 mb-4">
          {topStyles.length > 0
            ? topStyles.map(([s, c], i) => (
                <Bar key={s} label={s} value={c} max={maxOf(topStyles)} count={c} color={accentColor} delay={i * 0.04} />
              ))
            : <p className="text-sm italic col-span-2" style={{ color: TEXTMT }}>No style data yet.</p>
          }
        </div>

        <Divider />

        {/* DECADE */}
        <SectionTitle label="By Decade" sub="Through the ages" />
        <div className="flex flex-col gap-3 mb-4">
          {decades.length > 0
            ? decades.map(([d, c], i) => (
                <Bar key={d} label={d} value={c} max={maxOf(decades)} count={c} color={mainColor} delay={i * 0.06} />
              ))
            : <p className="text-sm italic" style={{ color: TEXTMT }}>No decade data yet.</p>
          }
        </div>

        <Divider />

        {/* ORIGIN */}
        <SectionTitle label="By Origin" sub="Where the music comes from" />
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 mb-4">
          {topOrigins.length > 0
            ? topOrigins.map(([o, c], i) => (
                <Bar key={o} label={o} value={c} max={maxOf(topOrigins)} count={c} color={accentColor} delay={i * 0.05} />
              ))
            : <p className="text-sm italic col-span-2" style={{ color: TEXTMT }}>No origin data yet.</p>
          }
        </div>

        <Divider />

        {/* OUTLIERS */}
        <div className="flex items-start justify-between mb-8">
          <SectionTitle label="Rating Outliers" sub="vs. global consensus" />
          <div className="flex items-center gap-2 mt-1">
            {OUTLIER_OPTIONS.map((c) => (
              <button key={c} onClick={() => setOutlierCount(c)}
                className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-200"
                style={
                  outlierCount === c
                    ? { backgroundColor: mainColor, borderColor: mainColor, color: '#fff' }
                    : { borderColor: BORDER, color: TEXTMT, background: CARD }
                }
              >{c}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: TEXTSUB }}>You rated higher</p>
            </div>
            <div className="flex flex-col gap-3">
              {applySlice(higherAll).length === 0
                ? <p className="text-sm italic" style={{ color: TEXTMT }}>None yet — need ≥1 star difference.</p>
                : applySlice(higherAll).map((h) => <AlbumCard key={h.generatedAlbumId} item={h} isHigher={true} />)
              }
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <p className="text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: TEXTSUB }}>You rated lower</p>
            </div>
            <div className="flex flex-col gap-3">
              {applySlice(lowerAll).length === 0
                ? <p className="text-sm italic" style={{ color: TEXTMT }}>None yet — need ≥1 star difference.</p>
                : applySlice(lowerAll).map((h) => <AlbumCard key={h.generatedAlbumId} item={h} isHigher={false} />)
              }
            </div>
          </div>
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
};

export default StatsPage;