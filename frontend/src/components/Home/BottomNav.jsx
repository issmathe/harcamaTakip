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
    { path: "/", label: "Ana Sayfa", icon: <HomeOutlined />, activeColor: "text-blue-400", glow: "shadow-blue-500/50" },
    { path: "/raporlar", label: "Raporlar", icon: <BarChartOutlined />, activeColor: "text-purple-400", glow: "shadow-purple-500/50" },
    { path: "/gelirler", label: "Gelirler", icon: <DollarCircleOutlined />, activeColor: "text-emerald-400", glow: "shadow-emerald-500/50" },
    { path: "/harcamalar", label: "Harcamalar", icon: <MinusCircleOutlined />, activeColor: "text-red-400", glow: "shadow-red-500/50" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 pointer-events-none">
      <div className="max-w-md mx-auto relative pointer-events-auto">
        
        {/* Glassmorphism Arka Plan - Blur derinliği artırıldı */}
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.8)]" />
        
        <nav className="relative flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                // active:scale-90 mobil uygulama hissiyatı için kritik dokunuş
                className={`flex flex-col items-center justify-center transition-all duration-300 w-16 relative active:scale-90 ${
                  isActive ? item.activeColor : "text-slate-500"
                }`}
              >
                {/* İkon Kaplaması */}
                <span className={`text-2xl transition-all duration-300 ${
                  isActive ? "-translate-y-1.5 scale-110 drop-shadow-[0_0_8px_currentColor]" : "scale-100"
                }`}>
                  {item.icon}
                </span>
                
                {/* Yazı - Font ağırlığı ve spacing ayarlandı */}
                <span className={`text-[9px] mt-1 font-black tracking-widest uppercase transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-40"
                }`}>
                  {item.label}
                </span>

                {/* Seçili Göstergesi - Daha yumuşak bir parlama */}
                {isActive && (
                  <div className={`absolute -bottom-1 w-1 h-1 rounded-full blur-[0.5px] shadow-[0_0_10px_2px_currentColor] ${item.activeColor.replace('text', 'bg')}`} />
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