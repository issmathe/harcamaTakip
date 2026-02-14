import React from "react";
import {
  HomeOutlined,
  BarChartOutlined,
  DollarCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation(); // location.pathname kullanımı daha performanslıdır

  const currentPath = location.pathname;

  // Tasarımsal Renk Sabitleri
  const activeStyles = {
    "/": { color: "text-blue-400", glow: "shadow-[0_0_15px_rgba(96,165,250,0.5)]", bg: "bg-blue-500/10" },
    "/raporlar": { color: "text-purple-400", glow: "shadow-[0_0_15px_rgba(192,132,252,0.5)]", bg: "bg-purple-500/10" },
    "/gelirler": { color: "text-emerald-400", glow: "shadow-[0_0_15px_rgba(52,211,153,0.5)]", bg: "bg-emerald-500/10" },
    "/harcamalar": { color: "text-red-400", glow: "shadow-[0_0_15px_rgba(248,113,113,0.5)]", bg: "bg-red-500/10" }
  };

  const getButtonClass = (path) => {
    const isActive = currentPath === path;
    const style = activeStyles[path] || { color: "text-gray-500", glow: "", bg: "" };
    
    return `relative flex flex-col items-center justify-center h-14 w-14 rounded-2xl transition-all duration-300 ease-out flex-grow
      ${isActive ? `${style.color} ${style.bg} ${style.glow} scale-110` : "text-gray-500 hover:text-gray-300"}`;
  };

  return (
    <div className="fixed bottom-6 left-0 w-full px-6 z-50">
      <nav 
        className="max-w-md mx-auto h-20 rounded-[24px] border border-white/10 relative overflow-hidden"
        style={{ 
          background: "rgba(15, 23, 42, 0.7)", 
          backdropFilter: "blur(20px)",
          boxShadow: "0 -10px 25px -5px rgba(0, 0, 0, 0.3)" 
        }}
      >
        {/* Navigasyon İçeriği */}
        <div className="flex items-center justify-around h-full px-2">
          
          <button className="flex flex-col items-center" onClick={() => navigate("/")}>
            <div className={getButtonClass("/")}>
              <HomeOutlined className="text-2xl" />
            </div>
            <span className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${currentPath === "/" ? "text-blue-400" : "text-gray-500"}`}>Üs</span>
          </button>
          
          <button className="flex flex-col items-center" onClick={() => navigate("/raporlar")}>
            <div className={getButtonClass("/raporlar")}>
              <BarChartOutlined className="text-2xl" />
            </div>
            <span className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${currentPath === "/raporlar" ? "text-purple-400" : "text-gray-500"}`}>Analiz</span>
          </button>

          <button className="flex flex-col items-center" onClick={() => navigate("/gelirler")}>
            <div className={getButtonClass("/gelirler")}>
              <DollarCircleOutlined className="text-2xl" />
            </div>
            <span className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${currentPath === "/gelirler" ? "text-emerald-400" : "text-gray-500"}`}>Gelir</span>
          </button>
          
          <button className="flex flex-col items-center" onClick={() => navigate("/harcamalar")}>
            <div className={getButtonClass("/harcamalar")}>
              <MinusCircleOutlined className="text-2xl" />
            </div>
            <span className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${currentPath === "/harcamalar" ? "text-red-400" : "text-gray-500"}`}>Gider</span>
          </button>
        </div>

        {/* Alt Kısımda İnce Estetik Parlama hattı */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </nav>
    </div>
  );
};

export default BottomNav;