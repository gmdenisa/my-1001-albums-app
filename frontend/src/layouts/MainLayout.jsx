import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../context/DynamicThemeContext';
import { Disc, History, Settings, ExternalLink } from 'lucide-react';

const MainLayout = () => {
  const { themeConfig } = useTheme();

  const navItems = [
    { to: "/", icon: <Disc size={28} />, label: "Today" },
    { to: "/history", icon: <History size={28} />, label: "History" },
    { to: "/settings", icon: <Settings size={28} />, label: "Settings" },
  ];

  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-black font-sans">
      
      {/* FIXED SIDEBAR */}
      <nav className="w-20 bg-black text-white z-20 flex flex-col justify-between py-10 items-center border-r border-white/5 shadow-2xl">
        <div className="flex flex-col items-center w-full">
          <div className="mb-12">
             <div 
               className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl shadow-lg transition-colors duration-1000"
               style={{ backgroundColor: themeConfig.mainColor, color: themeConfig.mainTextColor }}
             >
               1
             </div>
          </div>
          
          <ul className="flex flex-col gap-10">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({isActive}) => `p-3 rounded-2xl transition-all ${isActive ? 'bg-white/10 scale-110' : 'text-gray-500 hover:text-white'}`}>
                   <div style={{ color: item.to === window.location.pathname ? themeConfig.mainColor : 'inherit' }}>
                    {item.icon}
                   </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex flex-col items-center gap-8">
          <ExternalLink size={20} className="text-gray-500 hover:text-white transition-colors" />
          <div className="w-8 h-8 rounded-full border border-white/10 transition-colors duration-1000" style={{ backgroundColor: themeConfig.mainColor }} />
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