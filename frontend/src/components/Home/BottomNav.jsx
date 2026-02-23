import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  BarChartOutlined,
  DollarCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/", label: "Ana Sayfa", icon: <HomeOutlined />, activeColor: "text-blue-400" },
    { path: "/raporlar", label: "Raporlar", icon: <BarChartOutlined />, activeColor: "text-purple-400" },
    { path: "/gelirler", label: "Gelirler", icon: <DollarCircleOutlined />, activeColor: "text-emerald-400" },
    { path: "/harcamalar", label: "Harcamalar", icon: <MinusCircleOutlined />, activeColor: "text-red-400" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 pointer-events-none">
      <div className="max-w-md mx-auto relative pointer-events-auto">
        {/* Glassmorphism Arka Plan */}
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.6)]" />
        
        <nav className="relative flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center transition-all duration-300 w-16 relative ${
                  isActive ? item.activeColor : "text-slate-500"
                }`}
              >
                {/* İkon ve Parlama Efekti */}
                <span className={`text-2xl transition-transform duration-300 ${isActive ? "-translate-y-1 scale-110" : "scale-100"}`}>
                  {item.icon}
                </span>
                
                {/* Yazı */}
                <span className={`text-[10px] mt-1 font-bold tracking-tight uppercase ${isActive ? "opacity-100" : "opacity-60"}`}>
                  {item.label}
                </span>

                {/* Seçili Göstergesi (Alt Işık) */}
                {isActive && (
                  <div className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full blur-[1px] shadow-[0_0_8px_currentColor] ${item.activeColor.replace('text', 'bg')}`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default BottomNav;