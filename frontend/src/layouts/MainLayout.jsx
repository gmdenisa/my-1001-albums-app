// src/layouts/MainLayout.jsx
import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/DynamicThemeContext';
import { useFetchOriginalData } from '../hooks/useFetchOriginalData';
import { Disc, History, Settings, ExternalLink, LogOut, BarChart2 } from 'lucide-react';

const MainLayout = () => {
  const { themeConfig } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const projectId = localStorage.getItem('project_id');
  const { data } = useFetchOriginalData(projectId);

  const albumRank = data?.history ? data.history.length + 1 : '—';

  const handleLogout = () => {
    localStorage.removeItem('project_id');
    localStorage.removeItem('streaming_platform');
    navigate('/login');
  };

  const navItems = [
    { to: '/',         icon: <Disc size={22} />,      label: 'Today'    },
    { to: '/history',  icon: <History size={22} />,   label: 'History'  },
    { to: '/stats',    icon: <BarChart2 size={22} />, label: 'Stats'    },
    { to: '/settings', icon: <Settings size={22} />,  label: 'Settings' },
  ];

  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-[#0e0e10] font-sans">

      {/* FIXED LEFT SIDEBAR */}
      <nav
        className="w-20 shrink-0 h-full z-20 flex flex-col justify-between py-10 items-center transition-colors duration-1000"
        style={{
          backgroundColor: themeConfig.menuColor || '#0a0a0a',
          boxShadow: '4px 0 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Top: rank badge + nav */}
        <div className="flex flex-col items-center w-full">

          {/* Rank badge */}
          <div className="mb-14">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg transition-colors duration-1000 tabular-nums"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              {albumRank}
            </div>
          </div>

          {/* Nav items */}
          <ul className="flex flex-col gap-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <li key={item.to} title={item.label}>
                  <NavLink
                    to={item.to}
                    className="p-2.5 flex items-center justify-center rounded-xl transition-all duration-200"
                    style={{
                      // Active: bright white + pill bg. Inactive: 70% white — clearly visible
                      color: isActive ? '#ffffff' : 'rgba(255,255,255,0.70)',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.22)' : 'transparent',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      filter: isActive ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#ffffff'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.70)'; }}
                  >
                    {item.icon}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom: external link + logout */}
        <div className="flex flex-col items-center gap-5">
          <ExternalLink
            size={18}
            className="cursor-pointer transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.65)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
          />
          <button
            onClick={handleLogout}
            title="Log out"
            className="transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.65)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgb(248,113,113)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="flex-1 h-full z-10 overflow-hidden relative">
        <Outlet />
      </main>

    </div>
  );
};

export default MainLayout;