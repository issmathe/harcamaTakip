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
    { path: "/", label: "Ana Sayfa", icon: <HomeOutlined />, activeColor: "text-blue-400", glow: "shadow-blue-500/20" },
    { path: "/raporlar", label: "Raporlar", icon: <BarChartOutlined />, activeColor: "text-purple-400", glow: "shadow-purple-500/20" },
    { path: "/gelirler", label: "Gelirler", icon: <DollarCircleOutlined />, activeColor: "text-emerald-400", glow: "shadow-emerald-500/20" },
    { path: "/harcamalar", label: "Harcamalar", icon: <MinusCircleOutlined />, activeColor: "text-red-400", glow: "shadow-red-500/20" },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[100] px-6">
      <div className="max-w-md mx-auto relative">
        {/* Ana Konteyner: Blur efekti içeriğin alttan görünmesini sağlar */}
        <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          <nav className="relative flex items-center justify-around h-16 px-2">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 h-full relative active:scale-95 ${
                    isActive ? item.activeColor : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {/* İkon Bölümü */}
                  <span className={`text-xl transition-all duration-500 ${
                    isActive ? "-translate-y-1 scale-110" : "scale-100"
                  }`}>
                    {item.icon}
                  </span>

                  {/* Etiket Bölümü */}
                  <span className={`text-[9px] mt-1 font-bold tracking-tight uppercase transition-all duration-300 ${
                    isActive ? "opacity-100 scale-100" : "opacity-0 scale-75 h-0 overflow-hidden"
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Aktif Işıltısı */}
                  {isActive && (
                    <div className={`absolute inset-x-4 top-2 bottom-2 -z-10 blur-xl opacity-30 rounded-full ${item.activeColor.replace('text', 'bg')}`} />
                  )}
                  
                  {/* Alt Çizgi/Nokta */}
                  <div className={`absolute bottom-2 w-1 h-1 rounded-full transition-all duration-300 ${
                    isActive ? `opacity-100 scale-100 ${item.activeColor.replace('text', 'bg')}` : "opacity-0 scale-0"
                  }`} />
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;