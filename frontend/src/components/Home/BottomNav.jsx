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
    { path: "/", label: "Ana Sayfa", icon: <HomeOutlined />, color: "#60a5fa" },
    { path: "/raporlar", label: "Analiz", icon: <BarChartOutlined />, color: "#c084fc" },
    { path: "/gelirler", label: "Gelir", icon: <DollarCircleOutlined />, color: "#34d399" },
    { path: "/harcamalar", label: "Gider", icon: <MinusCircleOutlined />, color: "#f87171" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100]">
      {/* Ana Gövde: Tabana sıfır, geniş kavisli üst köşeler */}
      <div className="relative bg-slate-900/80 backdrop-blur-2xl border-t border-white/10 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-4 pb-safe">
        
        <nav className="flex items-center justify-around h-20 max-w-md mx-auto relative">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 active:scale-90`}
              >
                {/* Aktif İndikatör (Üstte parlayan çizgi) */}
                <div 
                  className={`absolute top-0 w-12 h-1 rounded-full transition-all duration-500 blur-[1px] ${
                    isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
                  }`}
                  style={{ 
                    backgroundColor: item.color, 
                    boxShadow: `0 4px 12px ${item.color}` 
                  }}
                />

                {/* İkon Bölümü */}
                <span 
                  className={`text-2xl transition-all duration-500 ease-out ${
                    isActive ? "-translate-y-1 scale-110" : "scale-100 opacity-40"
                  }`}
                  style={{ color: isActive ? item.color : "white" }}
                >
                  {item.icon}
                </span>

                {/* Etiket Bölümü */}
                <span 
                  className={`text-[10px] font-black uppercase tracking-widest mt-1.5 transition-all duration-300 ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 h-0 overflow-hidden"
                  }`}
                  style={{ color: item.color }}
                >
                  {item.label}
                </span>

                {/* Arka Plan Işıltısı (Sadece aktifken ikon arkasında) */}
                {isActive && (
                  <div 
                    className="absolute inset-auto w-10 h-10 -z-10 blur-2xl opacity-20 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
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