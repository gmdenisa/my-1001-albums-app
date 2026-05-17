// src/layouts/MainLayout.jsx
import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/DynamicThemeContext';
import { useFetchOriginalData } from '../hooks/useFetchOriginalData';
import { Disc, History, Settings, ExternalLink, LogOut } from 'lucide-react';

const MainLayout = () => {
  const { themeConfig } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const projectId = localStorage.getItem('project_id');
  const { data } = useFetchOriginalData(projectId);

  // Rank = number of already-listened albums + 1
  // The history array contains past albums; current is the next one
  const albumRank = data?.history ? data.history.length + 1 : '—';

  const handleLogout = () => {
    localStorage.removeItem('project_id');
    localStorage.removeItem('streaming_platform');
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: <Disc size={20} />, label: 'Today' },
    { to: '/history', icon: <History size={20} />, label: 'History' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-black font-sans">

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <nav
        className="w-20 shrink-0 h-full z-20 flex flex-col justify-between py-10 items-center border-r border-white/5 shadow-2xl transition-colors duration-1000"
        style={{ backgroundColor: themeConfig.menuColor || '#0a0a0a' }}
      >

        {/* Top: rank badge + nav */}
        <div className="flex flex-col items-center w-full">
          <div className="mb-16">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm shadow-lg transition-colors duration-1000 tabular-nums"
              style={{ backgroundColor: themeConfig.mainColor, color: themeConfig.mainTextColor }}
            >
              {albumRank}
            </div>
          </div>

          <ul className="flex flex-col gap-10">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <li key={item.to} title={item.label}>
                  <NavLink
                    to={item.to}
                    className={`p-3 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-white/10 scale-110 drop-shadow-md'
                        : 'text-white/30 hover:text-white hover:scale-110'
                    }`}
                  >
                    <div style={{ color: isActive ? themeConfig.mainColor : 'inherit' }}>
                      {item.icon}
                    </div>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom: external link + logout */}
        <div className="flex flex-col items-center gap-6">
          <ExternalLink
          
            size={18}
            className="text-white/30 hover:text-white transition-colors cursor-pointer"
          />
          <button
            onClick={handleLogout}
            title="Log out"
            className="text-white/30 hover:text-red-400 transition-colors duration-200"
          >
            <LogOut size={18} />
          </button>
        </div>

      </nav>

      {/* ── CONTENT ─────────────────────────────────────────────── */}
      <main className="flex-1 h-full z-10 overflow-hidden relative">
        <Outlet />
      </main>

    </div>
  );
};

export default MainLayout;