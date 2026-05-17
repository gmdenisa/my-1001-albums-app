// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PLATFORMS = [
  {
    id: 'spotify',
    label: 'Spotify',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    ),
  },
  {
    id: 'apple',
    label: 'Apple Music',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.064-2.31-2.05-3.09a9.74 9.74 0 00-1.86-.98c-.62-.23-1.26-.38-1.91-.44C17.51-.625 17.09-.64 12-.64S6.49-.625 6.065-.58c-.65.06-1.29.21-1.91.44A9.88 9.88 0 002.3.84C1.31 1.62.56 2.62.245 3.93c-.16.67-.23 1.35-.245 2.02-.01.45-.01.87-.01 6.05 0 5.17 0 5.6.01 6.04.015.67.085 1.35.245 2.02.315 1.31 1.065 2.31 2.055 3.09.62.48 1.33.84 2.09 1.02.63.15 1.27.24 1.92.27C6.49 24.64 6.91 24.64 12 24.64s5.51 0 5.935-.05c.65-.03 1.29-.12 1.92-.27a9.67 9.67 0 002.09-1.02c.99-.78 1.735-1.78 2.05-3.09.16-.67.23-1.35.245-2.02.01-.44.01-.87.01-6.04 0-5.18 0-5.6-.01-6.05zM12 17.5a5.5 5.5 0 110-11 5.5 5.5 0 010 11zm5.715-9.93a1.285 1.285 0 110-2.57 1.285 1.285 0 010 2.57zM12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z"/>
      </svg>
    ),
  },
  {
    id: 'tidal',
    label: 'Tidal',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004 4.004-4.004 4.004 4.004 4.004-4.004zM8.008 16.004l4.004-4.004 4.004 4.004 4.004-4.004-4.004-4.004-4.004 4.004-4.004-4.004-4.004 4.004z"/>
      </svg>
    ),
  },
  {
    id: 'youtube',
    label: 'YouTube Music',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"/>
      </svg>
    ),
  },
  {
    id: 'deezer',
    label: 'Deezer',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.03h5.19V8.38H6.27zm6.27 0v3.03h5.19V8.38h-5.19zm6.27 0v3.03H24V8.38h-5.19zM6.27 12.6v3.04h5.19V12.6H6.27zm6.27 0v3.04h5.19V12.6h-5.19zm6.27 0v3.04H24V12.6h-5.19zM0 16.81v3.03h5.19v-3.03H0zm6.27 0v3.03h5.19v-3.03H6.27zm6.27 0v3.03h5.19v-3.03h-5.19zm6.27 0v3.03H24v-3.03h-5.19z"/>
      </svg>
    ),
  },
];

const LoginPage = () => {
  const [projectId, setProjectId] = useState('');
  const [platform, setPlatform] = useState('');
  const navigate = useNavigate();

  const handleConnect = (e) => {
    e.preventDefault();
    if (projectId.trim() && platform) {
      localStorage.setItem('project_id', projectId.trim());
      localStorage.setItem('streaming_platform', platform);
      navigate('/');
    }
  };

  const canSubmit = projectId.trim() && platform;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-xl w-full max-w-md shadow-2xl text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Connect Project</h1>
        <p className="text-gray-400 mb-8 text-sm">Enter your 1001 Albums project name to begin.</p>

        <form onSubmit={handleConnect} className="space-y-6">
          <input
            type="text"
            placeholder="your-project-name"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-yellow-600 transition"
          />

          {/* Streaming platform picker */}
          <div className="space-y-2 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">
              Your streaming platform
            </p>
            <div className="grid grid-cols-1 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold ${
                    platform === p.id
                      ? 'border-yellow-600 bg-yellow-600/10 text-white'
                      : 'border-white/10 bg-black/20 text-white/50 hover:text-white hover:border-white/30'
                  }`}
                >
                  {p.icon}
                  {p.label}
                  {platform === p.id && (
                    <svg className="w-4 h-4 ml-auto text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-yellow-600/20"
          >
            Enter Daily Journey
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;