import React, { useState, useEffect, useCallback } from "react";
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
  
  // Barın görünürlük durumu
  const [isVisible, setIsVisible] = useState(true);

  // Görünürlüğü yöneten fonksiyon
  const showNav = useCallback(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let timeoutId;

    const handleUserActivity = () => {
      showNav();
      // Her dokunuşta zamanlayıcıyı sıfırla
      clearTimeout(timeoutId);
      // 3 saniye sonra gizle
      timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 3000); 
    };

    // Tüm ekrandaki dokunuşları dinle
    window.addEventListener("touchstart", handleUserActivity);
    window.addEventListener("mousedown", handleUserActivity);

    // İlk açılışta 3 saniye sonra gizle
    timeoutId = setTimeout(() => setIsVisible(false), 3000);

    return () => {
      window.removeEventListener("touchstart", handleUserActivity);
      window.removeEventListener("mousedown", handleUserActivity);
      clearTimeout(timeoutId);
    };
  }, [showNav]);

  const navItems = [
    { path: "/", label: "Ana Sayfa", icon: <HomeOutlined />, activeColor: "text-blue-400" },
    { path: "/raporlar", label: "Raporlar", icon: <BarChartOutlined />, activeColor: "text-purple-400" },
    { path: "/gelirler", label: "Gelirler", icon: <DollarCircleOutlined />, activeColor: "text-emerald-400" },
    { path: "/harcamalar", label: "Harcamalar", icon: <MinusCircleOutlined />, activeColor: "text-red-400" },
  ];

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[100] px-6 pb-6 pt-2 transition-all duration-700 ease-in-out pointer-events-none ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-md mx-auto relative pointer-events-auto">
        {/* Transparan Cam Efekti */}
        <div className="absolute inset-0 bg-white/[0.05] backdrop-blur-lg border border-white/10 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
        
        <nav className="relative flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={(e) => {
                  e.stopPropagation(); // Dokunma event'ini burada durdur ki hemen gizlenmesin
                  showNav();
                  navigate(item.path);
                }}
                className={`flex flex-col items-center justify-center transition-all duration-300 w-16 relative active:scale-90 ${
                  isActive ? item.activeColor : "text-white/40"
                }`}
              >
                <span className={`text-2xl transition-all duration-300 ${
                  isActive ? "-translate-y-1 scale-110 drop-shadow-[0_0_12px_currentColor]" : "scale-100"
                }`}>
                  {item.icon}
                </span>
                <span className={`text-[9px] mt-1 font-black tracking-widest uppercase transition-opacity duration-300 ${
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
    </div>
  );
};

export default BottomNav;