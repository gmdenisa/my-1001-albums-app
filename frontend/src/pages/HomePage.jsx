// src/pages/HomePage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFetchOriginalData } from '../hooks/useFetchOriginalData';
import { useTheme } from '../context/DynamicThemeContext';
import GlobalStars from '../components/ui/GlobalStars';
import MyReviewInput from '../components/forms/MyReviewInput';

const HomePage = () => {
  const projectId = localStorage.getItem('project_id');
  const { data, isLoading } = useFetchOriginalData(projectId);
  const { themeConfig, updateTheme } = useTheme();
  
  const [wikiSnippet, setWikiSnippet] = useState("");
  const [globalRating, setGlobalRating] = useState(null);
  const [voteCount, setVoteCount] = useState(0);

  // --- NEW: Custom Smooth Scroll State ---
  const [activeSection, setActiveSection] = useState(0); // 0 = Title Card, 1 = Review
  const isAnimating = useRef(false);

  const album = data?.currentAlbum || {};

  useEffect(() => {
    if (!data || !album.spotifyId) return;
    const enrichData = async () => {
      try {
        const statsRes = await fetch('http://localhost:8080/api/my-project/stats');
        if (statsRes.ok) {
          const stats = await statsRes.json();
          const match = (stats.albums || []).find(s => s.spotifyId === album.spotifyId);
          if (match) { setGlobalRating(match.averageRating); setVoteCount(match.votes); }
        }
        if (!data.currentAlbumNotes && album.wikipediaUrl) {
          const slug = album.wikipediaUrl.split('/').pop();
          const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`);
          const wiki = await res.json();
          setWikiSnippet(wiki.extract || "");
        }
      } catch (err) { console.error(err); }
    };
    enrichData();
    if (album.images?.[0]?.url) updateTheme(album.images[0].url);
  }, [data, album, updateTheme]);

  // --- NEW: Custom Wheel Handler ---
  const handleWheel = (e) => {
    if (isAnimating.current) return;
    
    // Ignore tiny trackpad jitters
    if (Math.abs(e.deltaY) < 15) return; 
    
    // Crucial: Allow natural scrolling inside the textarea if the user writes a long review
    if (e.target.tagName.toLowerCase() === 'textarea') return;

    if (e.deltaY > 0 && activeSection === 0) {
      // Scroll Down -> Go to Review
      isAnimating.current = true;
      setActiveSection(1);
      setTimeout(() => { isAnimating.current = false; }, 800); // Lock to prevent rapid firing
    } else if (e.deltaY < 0 && activeSection === 1) {
      // Scroll Up -> Go to Title
      isAnimating.current = true;
      setActiveSection(0);
      setTimeout(() => { isAnimating.current = false; }, 800);
    }
  };

  if (isLoading || !data) return null;

  return (
    <div className="flex w-full h-screen bg-black overflow-hidden">

      {/* LEFT: 40% — Cinematic Scroll Area */}
      <div 
        className="w-[40%] h-screen overflow-hidden z-10 border-r border-white/5 bg-black relative"
        onWheel={handleWheel}
      >
        
        {/* The Sliding Wrapper */}
        <motion.div
          className="w-full"
          // This creates the perfect slide effect between 0vh and -100vh
          animate={{ y: activeSection === 0 ? "0vh" : "-100vh" }}
          // Custom easing for a fast start and smooth, gliding stop
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          
          {/* PAGE 1: Title Card + Wiki */}
          <div className="h-screen w-full flex flex-col relative">
            {/* TITLE CARD */}
            <div
              className="h-[50vh] w-full p-12 flex flex-col items-center justify-center text-center transition-all duration-1000 relative flex-shrink-0"
              style={{ backgroundColor: themeConfig.mainColor, color: themeConfig.mainTextColor }}
            >
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: 'calc(10 * 1px) calc(10 * 1px)' }}
              />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="flex flex-col items-center relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.8em] mb-6 opacity-50">{album.artist}</p>
                <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-[0.85] mb-8 uppercase drop-shadow-xl">{album.name}</h1>
                <div className="flex flex-col items-center gap-4">
                  <GlobalStars rating={globalRating || 0} />
                  <div className="flex flex-col items-center opacity-60">
                    <p className="text-[8px] font-bold uppercase tracking-widest mt-1">{voteCount.toLocaleString()} VOTES</p>
                    {album.genres && album.genres.length > 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                        {album.genres.slice(0, 3).map((genre, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border border-current opacity-80">{genre}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* WIKI CARD */}
            <div
              className="h-[50vh] w-full px-16 py-12 flex flex-col justify-center transition-all duration-1000 flex-shrink-0"
              style={{ backgroundColor: themeConfig.secondaryColor, color: themeConfig.secondaryTextColor }}
            >
              <div className="max-w-xl mx-auto space-y-6">
                <div className="flex items-center justify-center gap-4 opacity-20">
                  <div className="h-[1px] w-12 bg-current"></div>
                  <h4 className="text-[8px] uppercase tracking-[1em] font-black">WIKI SUMMARY</h4>
                  <div className="h-[1px] w-12 bg-current"></div>
                </div>
                <p className="text-lg leading-relaxed text-justify font-medium opacity-80 italic">
                  {wikiSnippet || "Retrieving backstory..."}
                </p>
              </div>
            </div>
          </div>

          {/* PAGE 2: Review Section */}
          <div
            className="h-screen w-full flex flex-col items-center justify-center px-12 border-t border-white/5 relative overflow-hidden"
            style={{ background: `linear-gradient(to bottom, ${themeConfig.secondaryColor}15, #000 40%)` }}
          >
            <div className="absolute inset-x-0 top-0 h-[500px] opacity-10 blur-[150px] z-0 rounded-full mx-auto max-w-2xl pointer-events-none" style={{ backgroundColor: themeConfig.mainColor }} />
            <div className="w-full max-w-xl relative z-10 flex flex-col items-center">
              <div className="flex flex-col items-center mb-12 text-center">
                <div className="h-[1px] w-16 mb-6 opacity-30" style={{ backgroundColor: themeConfig.mainTextColor }} />
                <h2 className="text-sm font-black uppercase tracking-[0.5em] mb-3 text-white/60">Your Review</h2>
                <p className="text-4xl font-black tracking-tighter uppercase text-white">Final Verdict</p>
              </div>
              <div className="w-full bg-white/5 p-10 rounded-2xl border border-white/10 backdrop-blur-sm shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
                <MyReviewInput />
              </div>
              <p className="mt-10 text-[9px] font-medium opacity-20 uppercase tracking-[0.3em] text-white">Rating {album.name} by {album.artist}</p>
            </div>
          </div>

        </motion.div>

        {/* --- NEW: Interactive Navigation Indicators --- */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          {activeSection === 0 ? (
            <button 
              onClick={() => setActiveSection(1)} 
              className="flex flex-col items-center text-white/30 hover:text-white transition-colors duration-300"
            >
              <span className="text-[8px] font-black uppercase tracking-[0.3em] mb-2">Write Review</span>
              <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </button>
          ) : (
            <button 
              onClick={() => setActiveSection(0)} 
              className="flex flex-col items-center text-white/30 hover:text-white transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] mt-2">Back to Album</span>
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: 60% — fixed hero, never moves */}
      <div className="w-[60%] h-screen relative flex items-center justify-center bg-[#050505] overflow-hidden">
        
        {/* TILE BACKGROUND: 2x2 Grid of the album cover */}
        <div className="absolute inset-0 z-0 grid grid-cols-2 grid-rows-2">
          {[1, 2, 3, 4].map((tile) => (
            <img
              key={tile}
              src={album.images?.[0]?.url}
              alt="Backdrop Tile"
              className="w-full h-full object-cover opacity-25 grayscale-[20%] transition-all duration-1000"
            />
          ))}
          {/* Subtle overlay to blend the seams of the tiles slightly */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-2xl px-16 flex flex-col items-center">
          <div className="relative w-full">
            <div
              className="absolute -inset-24 opacity-60 blur-[100px] z-[-1] transition-colors duration-1000 pointer-events-none"
              style={{ backgroundColor: themeConfig.mainColor }}
            />
            <img
              src={album.images?.[0]?.url}
              alt="Cover"
              className="w-full aspect-square object-cover rounded-md shadow-[0_40px_80px_rgba(0,0,0,0.9)] border border-white/10 relative z-10"
            />
          </div>

          <button
            className="mt-16 bg-[#1DB954] text-black p-5 rounded-full hover:scale-110 transition-all shadow-2xl flex items-center justify-center relative z-10"
            onClick={() => window.open(album.spotifyUrl, "_blank")}
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-black">
              <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm5.508 17.293c-.198.324-.62.433-.944.235-2.585-1.58-5.844-1.933-9.69-1.053-.37.085-.745-.15-.83-.518-.086-.368.148-.74.516-.825 4.22-.964 7.81-.55 10.716 1.222.322.197.432.62.232.939zm1.48-3.262c-.248.403-.78.532-1.182.285-2.955-1.816-7.464-2.34-10.965-1.28-.456.14-.94-.112-1.08-.567-.14-.455.113-.938.567-1.08 3.99-1.21 9.006-.605 12.378 1.463.404.247.533.78.282 1.18zm.13-3.3c-3.54-2.102-9.405-2.3-12.783-1.275-.543.165-1.114-.145-1.28-.686-.164-.543.146-1.113.687-1.278 3.893-1.182 10.384-.94 14.47 1.492.488.29.646.92.357 1.408-.29.488-.92.646-1.408.36z"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
};

export default HomePage;