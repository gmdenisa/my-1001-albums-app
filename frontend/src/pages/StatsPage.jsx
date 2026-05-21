// src/pages/StatsPage.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/DynamicThemeContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DECADE_ORDER = ['1920s','1930s','1940s','1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s'];

const toDecade = (releaseDate) => {
  if (!releaseDate) return 'Unknown';
  const year = parseInt(String(releaseDate).slice(0, 4), 10);
  return isNaN(year) ? 'Unknown' : `${Math.floor(year / 10) * 10}s`;
};

const starLabel = (r) => {
  if (r >= 4.5) return 'Masterpiece';
  if (r >= 4)   return 'Excellent';
  if (r >= 3)   return 'Good';
  if (r >= 2)   return 'Mediocre';
  return 'Poor';
};

const ORIGIN_MAP = {
  us:'United States', gb:'United Kingdom', ca:'Canada', au:'Australia',
  de:'Germany', fr:'France', jp:'Japan', se:'Sweden', ie:'Ireland',
  nl:'Netherlands', it:'Italy', es:'Spain', br:'Brazil', nz:'New Zealand',
  no:'Norway', dk:'Denmark', fi:'Finland', be:'Belgium', at:'Austria',
  ch:'Switzerland', pt:'Portugal', pl:'Poland', ru:'Russia', za:'South Africa',
  ng:'Nigeria', gh:'Ghana', jm:'Jamaica', mx:'Mexico', ar:'Argentina',
  cl:'Chile', co:'Colombia', cu:'Cuba', kr:'South Korea', other:'Other',
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

// ─── Tokens ───────────────────────────────────────────────────────────────────

const BG      = '#f4efe6';
const CARD    = '#ffffff';
const TEXT    = '#1a1614';
const TEXTSUB = '#7a6f69';
const TEXTMT  = '#a89f98';
const BORDER  = 'rgba(0,0,0,0.08)';
const TRACK   = 'rgba(0,0,0,0.07)';

// ─── Primitives ───────────────────────────────────────────────────────────────

const Card = ({ children, className = '', style = {} }) => (
  <div
    className={`rounded-2xl overflow-hidden ${className}`}
    style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: '0 1px 8px rgba(0,0,0,0.05)', ...style }}
  >
    {children}
  </div>
);

const CardHeader = ({ label, sub, accent }) => (
  <div className="px-5 pt-5 pb-3 flex items-baseline justify-between">
    <p className="text-base font-black uppercase tracking-tight" style={{ color: TEXT }}>{label}</p>
    {sub && <p className="text-[8px] font-black uppercase tracking-[0.35em]" style={{ color: TEXTMT }}>{sub}</p>}
    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ backgroundColor: accent, opacity: 0.9 }} />
  </div>
);

const CompactBar = ({ label, value, max, color, count, delay = 0 }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5">
      <p className="text-[9px] font-bold w-20 shrink-0 text-right truncate" style={{ color: TEXTSUB }}>{label}</p>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: TRACK }}>
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
          transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <p className="text-[9px] font-black w-5 shrink-0 text-right" style={{ color: TEXTMT }}>{count}</p>
    </div>
  );
};

const MiniDonut = ({ distribution, total, accent }) => {
  const r = 52, cx = 60, cy = 60;
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
    <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={TRACK} strokeWidth="12" />
      {slices.map((s) => (
        <motion.circle key={s.star} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth="12"
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset + circ * 0.25}
          initial={{ strokeDasharray: `0 ${circ}` }}
          whileInView={{ strokeDasharray: `${s.dash} ${s.gap}` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fill={TEXT} fontSize="16" fontWeight="900" fontFamily="inherit">{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={TEXTMT} fontSize="7" fontWeight="700" fontFamily="inherit" letterSpacing="1.5">RATED</text>
    </svg>
  );
};

const AlbumRow = ({ item, isHigher }) => {
  const { album, rating, globalRating } = item;
  const diff = (Number(rating) - Number(globalRating)).toFixed(1);
  return (
    <motion.div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
      style={{ border: `1px solid ${BORDER}` }}
      whileHover={{ backgroundColor: '#f4efe6' }}
      initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
    >
      {album?.images?.[0]?.url && (
        <img src={album.images[0].url} alt={album.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-black text-[11px] truncate" style={{ color: TEXT }}>{album?.name}</p>
        <p className="text-[9px] font-bold truncate" style={{ color: TEXTMT }}>{album?.artist}</p>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <p className="font-black text-xs" style={{ color: TEXT }}>★ {rating}</p>
        <p className="text-[9px] font-bold" style={{ color: isHigher ? '#16a34a' : '#dc2626' }}>
          {isHigher ? '+' : ''}{diff}
        </p>
      </div>
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const OUTLIER_OPTIONS = [5, 10, 'All'];

const StatsPage = () => {
  const projectId   = localStorage.getItem('project_id');
  const { themeConfig } = useTheme();
  const mainColor   = themeConfig.mainColor   || '#6366f1';
  const accentColor = themeConfig.secondaryColor && !themeConfig.secondaryColor.includes('252,252,252')
    ? themeConfig.secondaryColor : '#a78bfa';

  const [history,      setHistory]      = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState(null);
  const [outlierCount, setOutlierCount] = useState(5);
  const [totalAlbums,  setTotalAlbums]  = useState(null);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const r = await fetch('http://localhost:8080/api/albums');
        if (r.ok) { const d = await r.json(); const a = Array.isArray(d) ? d : d.albums; if (a?.length) { setTotalAlbums(a.length); return; } }
      } catch {}
      try {
        const r = await fetch('https://1001albumsgenerator.com/api/v1/albums');
        if (r.ok) { const d = await r.json(); const a = Array.isArray(d) ? d : d.albums; if (a?.length) { setTotalAlbums(a.length); return; } }
      } catch {}
      setTotalAlbums(1089);
    };
    fetchTotal();
  }, []);

  useEffect(() => {
    if (!projectId) { setError('No project ID found.'); setIsLoading(false); return; }
    fetch(`http://localhost:8080/api/my-project/${projectId}`)
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((d) => setHistory(d.history || []))
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-full w-full" style={{ background: BG }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: mainColor, borderTopColor: 'transparent' }} />
        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: TEXTMT }}>Loading</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full w-full" style={{ background: BG }}>
      <p className="text-red-600 text-xs font-mono bg-red-50 border border-red-200 px-5 py-3 rounded-xl">{error}</p>
    </div>
  );

  // ── Derived ──────────────────────────────────────────────────────────────

  const rated         = history.filter((h) => h.rating != null);
  const totalListened = history.length;
  const albumTotal    = totalAlbums ?? 1089;
  const progressPct   = Math.round((totalListened / albumTotal) * 100);
  const avgRating     = rated.length > 0
    ? rated.reduce((s, h) => s + Number(h.rating), 0) / rated.length : 0;

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  rated.forEach((h) => { const k = Math.round(Number(h.rating)); if (distribution[k] !== undefined) distribution[k]++; });

  const topGenres  = countBy(history, (h) => h.album?.genres  || []).slice(0, 10);
  const topStyles  = countBy(history, (h) => h.album?.styles  || []).slice(0, 10);
  const topOrigins = countBy(history, (h) => originLabel(h.album?.artistOrigin)).slice(0, 8);
  const decades    = DECADE_ORDER.filter((d) => {
    const decadeMap = {};
    history.forEach((h) => { const d2 = toDecade(h.album?.releaseDate); decadeMap[d2] = (decadeMap[d2] || 0) + 1; });
    return decadeMap[d];
  }).map((d) => {
    const decadeMap = {};
    history.forEach((h) => { const d2 = toDecade(h.album?.releaseDate); decadeMap[d2] = (decadeMap[d2] || 0) + 1; });
    return [d, decadeMap[d]];
  });

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
    <div className="h-screen w-full overflow-y-auto" style={{ background: BG, scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.1) transparent' }}>
      <div className="max-w-4xl mx-auto px-8 py-8 flex flex-col gap-4">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.div className="flex items-baseline justify-between"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.8em] mb-1" style={{ color: TEXTMT }}>1001 Albums Generator</p>
            <h1 className="text-3xl font-black uppercase tracking-tight leading-none" style={{ color: TEXT }}>Your Journey</h1>
          </div>
          <p className="text-[9px] font-bold" style={{ color: TEXTMT }}>{totalListened} of {albumTotal} albums</p>
        </motion.div>

        {/* ── Stat Cards Row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Heard',   value: totalListened,        sub: `of ${albumTotal}` },
            { label: 'Rated',   value: rated.length,         sub: 'with a score'     },
            { label: 'Avg',     value: avgRating.toFixed(2), sub: starLabel(avgRating) },
            { label: 'Done',    value: `${progressPct}%`,    sub: 'complete'         },
          ].map((c, i) => (
            <motion.div key={c.label} className="relative rounded-2xl p-4 overflow-hidden"
              style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ backgroundColor: mainColor }} />
              <p className="text-[8px] font-black uppercase tracking-[0.4em] mb-1" style={{ color: TEXTMT }}>{c.label}</p>
              <p className="text-3xl font-black tracking-tight leading-none" style={{ color: TEXT }}>{c.value}</p>
              <p className="text-[9px] font-bold mt-1" style={{ color: TEXTMT }}>{c.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Progress ─────────────────────────────────────────────────── */}
        <Card className="px-5 py-4">
          <div className="flex justify-between mb-2">
            <p className="text-[8px] font-black uppercase tracking-[0.4em]" style={{ color: TEXTMT }}>Progress to Completion</p>
            <p className="text-[8px] font-black uppercase tracking-[0.4em]" style={{ color: mainColor }}>{progressPct}%</p>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: TRACK }}>
            <motion.div className="h-full rounded-full" style={{ backgroundColor: mainColor }}
              initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </Card>

        {/* ── Row: Ratings + Decades ────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-4">

          {/* Ratings card — 3 cols */}
          <Card className="col-span-3 relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ backgroundColor: mainColor }} />
            <div className="px-5 pt-4 pb-1 flex items-baseline justify-between">
              <p className="text-sm font-black uppercase tracking-tight" style={{ color: TEXT }}>Ratings</p>
              <p className="text-[8px] font-black uppercase tracking-[0.35em]" style={{ color: TEXTMT }}>Distribution</p>
            </div>
            <div className="px-5 pb-5 flex items-center gap-5">
              <MiniDonut distribution={distribution} total={rated.length} accent={mainColor} />
              <div className="flex-1 flex flex-col gap-2">
                {[5,4,3,2,1].map((star, i) => (
                  <CompactBar key={star} label={`${star} ★`}
                    value={distribution[star] || 0}
                    max={Math.max(...Object.values(distribution), 1)}
                    count={distribution[star] || 0}
                    color={['#22c55e','#84cc16','#eab308','#f97316','#ef4444'][5-star]}
                    delay={i * 0.06}
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Decades card — 2 cols */}
          <Card className="col-span-2 relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ backgroundColor: accentColor }} />
            <div className="px-5 pt-4 pb-1 flex items-baseline justify-between">
              <p className="text-sm font-black uppercase tracking-tight" style={{ color: TEXT }}>Decades</p>
              <p className="text-[8px] font-black uppercase tracking-[0.35em]" style={{ color: TEXTMT }}>Through the ages</p>
            </div>
            <div className="px-5 pb-5 flex flex-col gap-2">
              {decades.length > 0
                ? decades.map(([d, c], i) => (
                    <CompactBar key={d} label={d} value={c} max={maxOf(decades)} count={c} color={accentColor} delay={i * 0.05} />
                  ))
                : <p className="text-[10px] italic" style={{ color: TEXTMT }}>No data yet.</p>
              }
            </div>
          </Card>
        </div>

        {/* ── Row: Genres + Styles ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ backgroundColor: mainColor }} />
            <div className="px-5 pt-4 pb-1 flex items-baseline justify-between">
              <p className="text-sm font-black uppercase tracking-tight" style={{ color: TEXT }}>Genres</p>
              <p className="text-[8px] font-black uppercase tracking-[0.35em]" style={{ color: TEXTMT }}>Top {topGenres.length}</p>
            </div>
            <div className="px-5 pb-5 flex flex-col gap-2">
              {topGenres.length > 0
                ? topGenres.map(([g, c], i) => <CompactBar key={g} label={g} value={c} max={maxOf(topGenres)} count={c} color={mainColor} delay={i * 0.04} />)
                : <p className="text-[10px] italic" style={{ color: TEXTMT }}>No genre data yet.</p>
              }
            </div>
          </Card>

          <Card className="relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ backgroundColor: accentColor }} />
            <div className="px-5 pt-4 pb-1 flex items-baseline justify-between">
              <p className="text-sm font-black uppercase tracking-tight" style={{ color: TEXT }}>Styles</p>
              <p className="text-[8px] font-black uppercase tracking-[0.35em]" style={{ color: TEXTMT }}>Sub-genre flavors</p>
            </div>
            <div className="px-5 pb-5 flex flex-col gap-2">
              {topStyles.length > 0
                ? topStyles.map(([s, c], i) => <CompactBar key={s} label={s} value={c} max={maxOf(topStyles)} count={c} color={accentColor} delay={i * 0.04} />)
                : <p className="text-[10px] italic" style={{ color: TEXTMT }}>No style data yet.</p>
              }
            </div>
          </Card>
        </div>

        {/* ── Row: Origins ─────────────────────────────────────────────── */}
        <Card className="relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ backgroundColor: mainColor }} />
          <div className="px-5 pt-4 pb-1 flex items-baseline justify-between">
            <p className="text-sm font-black uppercase tracking-tight" style={{ color: TEXT }}>Origins</p>
            <p className="text-[8px] font-black uppercase tracking-[0.35em]" style={{ color: TEXTMT }}>Where the music comes from</p>
          </div>
          <div className="px-5 pb-5 grid grid-cols-2 gap-x-8 gap-y-2">
            {topOrigins.length > 0
              ? topOrigins.map(([o, c], i) => <CompactBar key={o} label={o} value={c} max={maxOf(topOrigins)} count={c} color={mainColor} delay={i * 0.04} />)
              : <p className="text-[10px] italic col-span-2" style={{ color: TEXTMT }}>No origin data yet.</p>
            }
          </div>
        </Card>

        {/* ── Outliers ─────────────────────────────────────────────────── */}
        <Card className="relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ backgroundColor: mainColor }} />
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-tight" style={{ color: TEXT }}>Rating Outliers</p>
              <p className="text-[8px] font-black uppercase tracking-[0.35em] mt-0.5" style={{ color: TEXTMT }}>vs. global consensus</p>
            </div>
            <div className="flex items-center gap-1.5">
              {OUTLIER_OPTIONS.map((c) => (
                <button key={c} onClick={() => setOutlierCount(c)}
                  className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all duration-200"
                  style={outlierCount === c
                    ? { backgroundColor: mainColor, borderColor: mainColor, color: '#fff' }
                    : { borderColor: BORDER, color: TEXTMT, background: BG }
                  }
                >{c}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-5 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <p className="text-[8px] font-black uppercase tracking-[0.4em]" style={{ color: TEXTSUB }}>You rated higher</p>
              </div>
              <div className="flex flex-col gap-2">
                {applySlice(higherAll).length === 0
                  ? <p className="text-[10px] italic" style={{ color: TEXTMT }}>None yet — need ≥1 star diff.</p>
                  : applySlice(higherAll).map((h) => <AlbumRow key={h.generatedAlbumId} item={h} isHigher={true} />)
                }
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className="text-[8px] font-black uppercase tracking-[0.4em]" style={{ color: TEXTSUB }}>You rated lower</p>
              </div>
              <div className="flex flex-col gap-2">
                {applySlice(lowerAll).length === 0
                  ? <p className="text-[10px] italic" style={{ color: TEXTMT }}>None yet — need ≥1 star diff.</p>
                  : applySlice(lowerAll).map((h) => <AlbumRow key={h.generatedAlbumId} item={h} isHigher={false} />)
                }
              </div>
            </div>
          </div>
        </Card>

        <div className="h-6" />
      </div>
    </div>
  );
};

export default StatsPage;