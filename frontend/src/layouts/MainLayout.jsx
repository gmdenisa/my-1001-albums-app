// src/layouts/MainLayout.jsx
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../context/DynamicThemeContext';
import { Disc, History, Settings, ExternalLink, BarChart2 } from 'lucide-react';

const MainLayout = () => {
  const { themeConfig } = useTheme();
  const location = useLocation();

  const navItems = [
    { to: "/",        icon: <Disc size={24} />,      label: "Today"    },
    { to: "/history", icon: <History size={24} />,   label: "History"  },
    { to: "/stats",   icon: <BarChart2 size={24} />, label: "Stats"    },
    { to: "/settings",icon: <Settings size={24} />,  label: "Settings" },
  ];

  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-[#0e0e10] font-sans">

      {/* FIXED LEFT SIDEBAR */}
      <nav
        className="w-20 shrink-0 h-full z-20 flex flex-col justify-between py-10 items-center border-r border-white/5 shadow-2xl transition-colors duration-1000"
        style={{ backgroundColor: themeConfig.menuColor || '#0a0a0a' }}
      >

        {/* Top: Brand + Nav */}
        <div className="flex flex-col items-center w-full">
          <div className="mb-16">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl shadow-lg transition-colors duration-1000"
              style={{ backgroundColor: themeConfig.mainColor, color: themeConfig.mainTextColor }}
            >
              {themeConfig.albumNumber || 1}
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
                      isActive ? 'bg-white/10 scale-110 drop-shadow-md' : 'text-white/30 hover:text-white hover:scale-110'
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

        {/* Bottom */}
        <div className="flex flex-col items-center gap-8">
          <ExternalLink size={20} className="text-white/30 hover:text-white transition-colors cursor-pointer" />
          <div
            className="w-8 h-8 rounded-full border border-white/10 transition-colors duration-1000 shadow-md"
            style={{ backgroundColor: themeConfig.mainColor }}
          />
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