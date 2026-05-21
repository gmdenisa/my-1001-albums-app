// src/pages/HomePage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFetchOriginalData } from '../hooks/useFetchOriginalData';
import { useTheme } from '../context/DynamicThemeContext';
import GlobalStars from '../components/ui/GlobalStars';
import MyReviewInput from '../components/forms/MyReviewInput';
import { getStreamingUrl } from '../utils/streamingLinks';

const toRgba = (color, alpha) => {
  if (!color) return `rgba(0,0,0,${alpha})`;
  if (color.startsWith('rgba')) return color.replace(/[\d.]+\)$/, `${alpha})`);
  if (color.startsWith('rgb')) return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
  const hex = color.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// Fixed Creamy white
const WIKI_BG   = '#f5f0e8';
const WIKI_TEXT = '#2c2825';

const cardShadow = (color) => {
  const coreShadow = toRgba(color, 0.45);
  const softGlow   = toRgba(color, 0.15);
  return `inset 0px 0px 25px 2px ${coreShadow}, inset 0px 0px 70px 10px ${softGlow}`;
};

const HomePage = () => {
  const projectId = localStorage.getItem('project_id');
  const platform  = localStorage.getItem('streaming_platform');
  const { data, isLoading } = useFetchOriginalData(projectId);
  const { themeConfig, updateTheme } = useTheme();

  const [wikiSnippet,  setWikiSnippet]  = useState('');
  const [globalRating, setGlobalRating] = useState(null);
  const [voteCount,    setVoteCount]    = useState(0);
  const [coverHovered, setCoverHovered] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const isAnimating = useRef(false);

  const album = data?.currentAlbum || {};

  useEffect(() => {
    if (!data || !album.name) return;
    const enrichData = async () => {
      try {
        const statsRes = await fetch('/api/my-project/stats');
        if (statsRes.ok) {
          const stats = await statsRes.json();
          const match = (stats.albums || []).find(s => s.spotifyId === album.spotifyId);
          if (match) { setGlobalRating(match.averageRating); setVoteCount(match.votes); }
        }
        if (!data.currentAlbumNotes && album.wikipediaUrl) {
          const slug = album.wikipediaUrl.split('/').pop();
          const res  = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`);
          const wiki = await res.json();
          setWikiSnippet(wiki.extract || '');
        }
      } catch (err) { console.error(err); }
    };
    enrichData();
    if (album.images?.[0]?.url) updateTheme(album.images[0].url);
  }, [data, album, updateTheme]);

  const handleWheel = (e) => {
    if (isAnimating.current) return;
    if (Math.abs(e.deltaY) < 15) return;
    const targetTag = e.target.tagName.toLowerCase();
    if (targetTag === 'textarea') return;
    const wikiCard = document.getElementById('wiki-scroll-area');
    if (wikiCard && wikiCard.contains(e.target)) {
      const { scrollTop, scrollHeight, clientHeight } = wikiCard;
      if (e.deltaY > 0 && scrollTop + clientHeight < scrollHeight - 2) return;
      if (e.deltaY < 0 && scrollTop > 0) return;
    }
    if (e.deltaY > 0 && activeSection === 0) {
      isAnimating.current = true; setActiveSection(1);
      setTimeout(() => { isAnimating.current = false; }, 800);
    } else if (e.deltaY < 0 && activeSection === 1) {
      isAnimating.current = true; setActiveSection(0);
      setTimeout(() => { isAnimating.current = false; }, 800);
    }
  };

  const handleCoverClick = () => {
    if (!album.name) return;
    window.open(getStreamingUrl(album, platform), '_blank', 'noopener,noreferrer');
  };

  if (isLoading || !data) return null;

  // ─── Derived accent values used in the review section ───────────────────────
  const accent     = themeConfig.mainColor || '#8b4a4a';
  const accentSoft = toRgba(accent, 0.08);
  const accentMid  = toRgba(accent, 0.22);

  // Blend mainColor toward creamy white (#f5f0e8) — factor 0=original, 1=cream
  const lightenToward = (color, factor = 0.55) => {
    let r = 139, g = 74, b = 74;
    try {
      const m = (color || '').match(/[\d.]+/g);
      if (m?.length >= 3) { r = +m[0]; g = +m[1]; b = +m[2]; }
    } catch { /* keep defaults */ }
    return `rgb(${Math.round(r + (245-r)*factor)},${Math.round(g + (240-g)*factor)},${Math.round(b + (232-b)*factor)})`;
  };

  // Light-pastel base for the review section background
  const reviewBg = lightenToward(accent, 0.60);

  return (
    <div className="flex w-full h-screen bg-[#0e0e10] overflow-hidden">

      {/* LEFT: 53% — Cinematic Scroll Area */}
      <div
        className="w-[53%] h-screen overflow-visible z-20 bg-transparent relative"
        onWheel={handleWheel}
      >
        <motion.div
          className="w-full relative"
          animate={{ y: activeSection === 0 ? '0vh' : '-100vh' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >

          {/* ── PAGE 1: Title Card + Wiki ─────────────────────────────────── */}
          <div className="h-screen w-full flex flex-col relative pb-16">

            {/* TITLE CARD */}
            <div
              className="h-[40vh] w-full p-12 flex flex-col items-center justify-center text-center transition-all duration-1000 relative shrink-0 z-30"
              style={{
                backgroundColor: themeConfig.mainColor,
                color: WIKI_BG,
                boxShadow: cardShadow(themeConfig.menuColor),
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: activeSection === 0 ? 1 : 0.15, y: activeSection === 0 ? 0 : -25 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center relative z-10"
              >
                <p className="text-sm font-black uppercase tracking-[0.8em] mb-3 opacity-70">{album.artist}</p>
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.85] mb-5 uppercase drop-shadow-xl">{album.name}</h1>
                <div className="flex flex-col items-center gap-2" style={{ color: WIKI_BG }}>
                  <GlobalStars rating={globalRating || 0} />
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mt-0.5">{voteCount.toLocaleString()} VOTES</p>
                </div>
                {album.genres?.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 opacity-90 mt-5">
                    {album.genres.slice(0, 3).map((genre, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shadow-md cursor-default"
                        style={{ backgroundColor: WIKI_BG, color: WIKI_TEXT }}
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* WIKI CARD */}
            <div
              className="h-[60vh] w-full flex flex-col transition-all duration-1000 shrink-0 relative z-20"
              style={{
                backgroundColor: WIKI_BG,
                color: WIKI_TEXT,
                boxShadow: cardShadow(themeConfig.menuColor),
              }}
            >
              <div
                id="wiki-scroll-area"
                className="flex-1 overflow-y-auto px-16 pb-14 pt-8 relative z-10 flex flex-col items-center justify-center gap-5"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style>{`#wiki-scroll-area::-webkit-scrollbar { display: none; }`}</style>
                <div className="flex items-center justify-center gap-4" style={{ opacity: 0.35 }}>
                  <div className="h-px w-12 bg-current" />
                  <h4 className="text-[10px] uppercase tracking-[1em] font-black">Wiki Summary</h4>
                  <div className="h-px w-12 bg-current" />
                </div>
                <motion.p
                  className="text-base lg:text-lg leading-relaxed text-center font-medium max-w-xl mx-auto italic"
                  style={{ opacity: 0.85 }}
                  animate={{ opacity: activeSection === 0 ? 0.85 : 0.1, y: activeSection === 0 ? 0 : -15 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  {wikiSnippet || 'Retrieving backstory…'}
                </motion.p>
              </div>
            </div>
          </div>

          {/* ── PAGE 2: Review Section ────────────────────────────────────── */}
          <div
            className="h-screen w-full flex flex-col items-center justify-center px-12 relative overflow-hidden pb-16 z-10"
            style={{ backgroundColor: reviewBg }}
          >
            {/* Gradient glows layered on top of the solid album-tinted base */}
            <div
              className="absolute inset-0 z-0"
              style={{
                background: `
                  radial-gradient(ellipse 100% 55% at 50% 0%,   ${toRgba(accent, 0.5)} 0%, transparent 70%),
                  radial-gradient(ellipse 80%  50% at 50% 100%, ${toRgba(accent, 0.25)} 0%, transparent 65%)
                `,
              }}
            />

            {/* Fine grain texture overlay */}
            <div
              className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: '120px 120px',
              }}
            />

            {/* Decorative corner accent lines */}
            <div className="absolute top-10 left-12 z-10 pointer-events-none" style={{ opacity: 0.25 }}>
              <div className="w-8 h-px mb-1" style={{ background: accent }} />
              <div className="w-px h-8" style={{ background: accent }} />
            </div>
            <div className="absolute top-10 right-12 z-10 pointer-events-none" style={{ opacity: 0.25 }}>
              <div className="w-8 h-px mb-1 ml-auto" style={{ background: accent }} />
              <div className="w-px h-8 ml-auto" style={{ background: accent }} />
            </div>

            <motion.div
              className="w-full max-w-xl relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: activeSection === 1 ? 1 : 0,
                y: activeSection === 1 ? 0 : 30,
              }}
              transition={{
                duration: 0.6,
                delay: activeSection === 1 ? 0.2 : 0,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Section header */}
              <div className="flex flex-col items-center mb-10 text-center">
                {/* Accent pill */}
                <div
                  className="mb-5 px-5 py-1.5 rounded-full"
                  style={{
                    background: toRgba(accent, 0.15),
                    border: `1px solid ${toRgba(accent, 0.4)}`,
                  }}
                >
                  <span
                    className="text-[8.5px] font-black uppercase tracking-[0.4em]"
                    style={{ color: accent }}
                  >
                    Album Log
                  </span>
                </div>

                <h2
                  className="text-4xl font-black tracking-tighter uppercase"
                  style={{ color: '#ffffff' }}
                >
                  My Review
                </h2>

                {/* Accent underline */}
                <div
                  className="mt-3 rounded-full"
                  style={{
                    width: '40px',
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                  }}
                />
              </div>

              {/* The card — receives themeConfig so it can sync its accent */}
              <div className="w-full">
                <MyReviewInput
                  album={{ spotifyId: album.spotifyId, name: album.name }}
                  themeConfig={themeConfig}
                />
              </div>

              <p
                className="mt-7 text-[8.5px] font-medium uppercase tracking-[0.35em]"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                Rating {album.name} by {album.artist}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Navigation Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
          {activeSection === 0 ? (
            <button
              onClick={() => setActiveSection(1)}
              className="flex flex-col items-center text-white/30 hover:text-white transition-colors duration-300"
            >
              <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setActiveSection(0)}
              className="flex flex-col items-center text-white/30 hover:text-white transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] mt-2">Back to Album</span>
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: 47% — fixed hero */}
      <div className="w-[47%] h-screen relative flex items-center justify-center bg-[#0e0e10] overflow-hidden z-10">
        <div className="absolute inset-0 z-0">
          <img
            src={album.images?.[0]?.url}
            alt="Backdrop"
            className="w-full h-full object-cover opacity-25 grayscale-[20%] transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        </div>

        <div className="relative z-10 w-full flex flex-col items-center justify-center px-16">
          <div className="relative w-full max-w-[500px]">
            <div
              className="absolute -inset-24 opacity-60 blur-[100px] z-[-1] transition-colors duration-1000 pointer-events-none"
              style={{ backgroundColor: themeConfig.mainColor }}
            />
            <div
              className="relative z-10 cursor-pointer group"
              onClick={handleCoverClick}
              onMouseEnter={() => setCoverHovered(true)}
              onMouseLeave={() => setCoverHovered(false)}
              title={`Open on ${platform || 'Spotify'}`}
            >
              <img
                src={album.images?.[0]?.url}
                alt="Cover"
                className="w-full aspect-square object-cover rounded-md shadow-[0_40px_80px_rgba(0,0,0,0.9)] border border-white/10 transition-all duration-300"
                style={{
                  transform: coverHovered ? 'scale(1.02)' : 'scale(1)',
                  filter: coverHovered ? 'brightness(0.75)' : 'brightness(1)',
                }}
              />
              <div
                className="absolute inset-0 rounded-md flex flex-col items-center justify-center gap-2 transition-opacity duration-300"
                style={{ opacity: coverHovered ? 1 : 0 }}
              >
                <svg className="w-12 h-12 text-white drop-shadow-xl" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/80">
                  Open on {
                    platform === 'apple'   ? 'Apple Music' :
                    platform === 'youtube' ? 'YouTube Music' :
                    platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Spotify'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;