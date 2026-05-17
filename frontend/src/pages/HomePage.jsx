// src/pages/HomePage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFetchOriginalData } from '../hooks/useFetchOriginalData';
import { useTheme } from '../context/DynamicThemeContext';
import GlobalStars from '../components/ui/GlobalStars';
import MyReviewInput from '../components/forms/MyReviewInput';
import { getStreamingUrl } from '../utils/streamingLinks';

const HomePage = () => {
  const projectId = localStorage.getItem('project_id');
  const platform = localStorage.getItem('streaming_platform');
  const { data, isLoading } = useFetchOriginalData(projectId);
  const { themeConfig, updateTheme } = useTheme();

  const [wikiSnippet, setWikiSnippet] = useState('');
  const [globalRating, setGlobalRating] = useState(null);
  const [voteCount, setVoteCount] = useState(0);
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
          if (match) { 
            setGlobalRating(match.averageRating); 
            setVoteCount(match.votes); 
          }
        }
        if (!data.currentAlbumNotes && album.wikipediaUrl) {
          const slug = album.wikipediaUrl.split('/').pop();
          const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`);
          const wiki = await res.json();
          setWikiSnippet(wiki.extract || '');
        }
      } catch (err) { 
        console.error(err); 
      }
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
      const atBottom = scrollTop + clientHeight >= scrollHeight - 2;
      const atTop = scrollTop === 0;
      if (e.deltaY > 0 && !atBottom) return;
      if (e.deltaY < 0 && !atTop) return;
    }

    if (e.deltaY > 0 && activeSection === 0) {
      isAnimating.current = true;
      setActiveSection(1);
      setTimeout(() => { isAnimating.current = false; }, 800);
    } else if (e.deltaY < 0 && activeSection === 1) {
      isAnimating.current = true;
      setActiveSection(0);
      setTimeout(() => { isAnimating.current = false; }, 800);
    }
  };

  const handleCoverClick = () => {
    if (!album.name) return;
    const url = getStreamingUrl(album, platform);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading || !data) return null;

  return (
    <div className="flex w-full h-screen bg-[#0e0e10] overflow-hidden">

      {/* LEFT: 53% — Cinematic Scroll Area */}
      <div
        className="w-[53%] h-screen overflow-hidden z-10 bg-[#0e0e10] relative"
        onWheel={handleWheel}
      >
        <motion.div
          className="w-full"
          animate={{ y: activeSection === 0 ? '0vh' : '-100vh' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* PAGE 1: Title Card + Wiki */}
          <div className="h-screen w-full flex flex-col relative pb-16">

            {/* TITLE CARD */}
            <div
              className="h-[40vh] w-full p-12 flex flex-col items-center justify-center text-center transition-all duration-1000 relative shrink-0 overflow-hidden"
              style={{ backgroundColor: themeConfig.mainColor, color: themeConfig.mainTextColor }}
            >
              {/* SUBTLE TRANSITION: Drifts up and fades slightly when leaving */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: activeSection === 0 ? 1 : 0.15, 
                  y: activeSection === 0 ? 0 : -25 
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center relative z-10"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.8em] mb-4 opacity-50">{album.artist}</p>
                <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-[0.85] mb-6 uppercase drop-shadow-xl">{album.name}</h1>
                <div className="flex flex-col items-center gap-3">
                  <GlobalStars rating={globalRating || 0} />
                  <div className="flex flex-col items-center opacity-60">
                    <p className="text-[8px] font-bold uppercase tracking-widest mt-1">{voteCount.toLocaleString()} VOTES</p>
                  </div>
                </div>
                {album.genres && album.genres.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 opacity-70 mt-5">
                    {album.genres.slice(0, 3).map((genre, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border border-white/30 hover:border-white/80 transition-colors cursor-default bg-black/10"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Internal Eased Smooth Blend into Base Dark Canvas */}
              <div
                className="absolute inset-y-0 right-0 w-[7%] pointer-events-none z-20"
                style={{
                  background: 'linear-gradient(to right, transparent 0%, rgba(14, 14, 16, 0.15) 35%, rgba(14, 14, 16, 0.6) 70%, #0e0e10 100%)',
                }}
              />
              
<div
    className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none z-20"
    style={{
      background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.15))',
    }}
  />
              
            </div>

            

            {/* WIKI CARD */}
            {/* Internal Eased Smooth Blend into Base Dark Canvas */}
            <div
              className="absolute inset-y-0 left-0 w-[7%] pointer-events-none z-20"
              style={{
                background: 'linear-gradient(to left, transparent 0%, rgba(14, 14, 16, 0.15) 35%, rgba(14, 14, 16, 0.6) 70%, #0e0e10 100%)',
              }}
            />
            <div
              className="h-[60vh] w-full flex flex-col transition-all duration-1000 shrink-0 relative overflow-hidden"
              style={{ backgroundColor: themeConfig.secondaryColor, color: themeConfig.secondaryTextColor }}
            >
              <div className="px-16 pt-12 pb-4 shrink-0">
                <div className="flex items-center justify-center gap-4 opacity-30">
                  <div className="h-px w-12 bg-current" />
                  <h4 className="text-[9px] uppercase tracking-[1em] font-black">WIKI SUMMARY</h4>
                  <div className="h-px w-12 bg-current" />
                </div>
              </div>

              <div
                id="wiki-scroll-area"
                className="flex-1 overflow-y-auto px-16 pb-12"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style>{`#wiki-scroll-area::-webkit-scrollbar { display: none; }`}</style>
                {/* SUBTLE TRANSITION: Paragraph fades out softly when scrolling down */}
                <motion.p 
                  className="text-lg leading-relaxed text-justify font-medium opacity-90 italic max-w-xl mx-auto"
                  animate={{ 
                    opacity: activeSection === 0 ? 0.9 : 0.1,
                    y: activeSection === 0 ? 0 : -15
                  }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  {wikiSnippet || 'Retrieving backstory...'}
                </motion.p>
              </div>

              {/* Internal Eased Smooth Blend into Base Dark Canvas */}
              <div
                className="absolute inset-y-0 right-0 w-[7%] pointer-events-none z-20"
                style={{
                  background: 'linear-gradient(to right, transparent 0%, rgba(14, 14, 16, 0.15) 35%, rgba(14, 14, 16, 0.6) 70%, #0e0e10 100%)',
                }}
              />
            </div>
          </div>

          {/* PAGE 2: Review Section */}
          <div
            className="h-screen w-full flex flex-col items-center justify-center px-12 border-t border-white/5 relative overflow-hidden pb-16"
            style={{ background: `linear-gradient(to bottom, ${themeConfig.secondaryColor}15, transparent)` }}
          >
            <div
              className="absolute inset-x-0 top-0 h-125 opacity-10 blur-[150px] z-0 rounded-full mx-auto max-w-2xl pointer-events-none"
              style={{ backgroundColor: themeConfig.mainColor }}
            />
            
            {/* SUBTLE TRANSITION: Drifts up dynamically into view with a staggered entry */}
            <motion.div 
              className="w-full max-w-xl relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: activeSection === 1 ? 1 : 0, 
                y: activeSection === 1 ? 0 : 30 
              }}
              transition={{ 
                duration: 0.6, 
                delay: activeSection === 1 ? 0.2 : 0, 
                ease: [0.16, 1, 0.3, 1] 
              }}
            >
              <div className="flex flex-col items-center mb-12 text-center">
                <div className="h-px w-16 mb-6 opacity-30" style={{ backgroundColor: themeConfig.mainTextColor }} />
                <h2 className="text-sm font-black uppercase tracking-[0.5em] mb-3 text-white/60">Album Log</h2>
                <p className="text-4xl font-black tracking-tighter uppercase text-white">My Review</p>
              </div>
              <div className="w-full">
                <MyReviewInput album={{ spotifyId: album.spotifyId, name: album.name }} />
              </div>
              <p className="mt-8 text-[9px] font-medium opacity-20 uppercase tracking-[0.3em] text-white">
                Rating {album.name} by {album.artist}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Navigation Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
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
      <div className="w-[47%] h-screen relative flex items-center justify-center bg-[#0e0e10] overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={album.images?.[0]?.url}
            alt="Backdrop"
            className="w-full h-full object-cover opacity-25 grayscale-[20%] transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        </div>

        {/* Left-edge Deep Eased Fade — Stretches far into the panel so artwork emerges organically */}
        <div
          className="absolute inset-y-0 left-0 w-[5%] pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to right, #0e0e10 0%, rgba(14, 14, 16, 0.85) 25%, rgba(14, 14, 16, 0.4) 55%, rgba(14, 14, 16, 0.08) 85%, transparent 100%)',
          }}
        />

        {/* Cover — clickable */}
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

              {/* Play / open overlay */}
              <div
                className="absolute inset-0 rounded-md flex flex-col items-center justify-center gap-2 transition-opacity duration-300"
                style={{ opacity: coverHovered ? 1 : 0 }}
              >
                <svg className="w-12 h-12 text-white drop-shadow-xl" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/80">
                  Open on {platform === 'apple' ? 'Apple Music' : platform === 'youtube' ? 'YouTube Music' : platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Spotify'}
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