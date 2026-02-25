import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const timeoutRef = useRef(null);
  
  const [isVisible, setIsVisible] = useState(true);

  const triggerNav = useCallback(() => {
    setIsVisible(true);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    triggerNav();
    // Hata buradaydı: Fonksiyon gövdesi için süslü parantez ekledim
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [triggerNav]);

  const navItems = [
    { path: "/", label: "Ana Sayfa", icon: <HomeOutlined />, activeColor: "text-blue-400" },
    { path: "/raporlar", label: "Raporlar", icon: <BarChartOutlined />, activeColor: "text-purple-400" },
    { path: "/gelirler", label: "Gelirler", icon: <DollarCircleOutlined />, activeColor: "text-emerald-400" },
    { path: "/harcamalar", label: "Harcamalar", icon: <MinusCircleOutlined />, activeColor: "text-red-400" },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-10"
      onMouseEnter={triggerNav}
      onTouchStart={triggerNav}
    >
      <div className="max-w-md mx-auto relative">
        
        {/* Navigasyon Barı */}
        <div 
          className={`relative transition-all duration-700 ease-in-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20 pointer-events-none"
          }`}
        >
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.8)]" />
          
          <nav className="relative flex items-center justify-around h-16 px-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                    triggerNav();
                  }}
                  className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 h-full relative active:scale-90 ${
                    isActive ? item.activeColor : "text-white/40"
                  }`}
                >
                  <span className={`text-xl sm:text-2xl transition-all duration-300 ${
                    isActive ? "-translate-y-1 scale-110 drop-shadow-[0_0_12px_currentColor]" : "scale-100"
                  }`}>
                    {item.icon}
                  </span>
                  <span className={`text-[8px] sm:text-[9px] mt-1 font-black tracking-tighter uppercase transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-40"
                  }`}>
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <div className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full blur-[1px] shadow-[0_0_15px_3px_currentColor] ${item.activeColor.replace('text', 'bg')}`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Görünmez Tetikleyici Alan */}
        {!isVisible && (
          <div 
            className="absolute inset-x-0 bottom-0 h-16 bg-transparent pointer-events-auto cursor-pointer"
            onTouchStart={(e) => {
              e.preventDefault();
              triggerNav();
            }}
            onClick={triggerNav}
          />
        )}
      </div>
    </div>
  );
};

export default BottomNav;