import React from "react";
import {
  HomeOutlined,
  BarChartOutlined,
  DollarCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();

  const goToHome = () => navigate("/");
  const goToRaporlar = () => navigate("/raporlar");
  const goToGelirler = () => navigate("/gelirler");
  const goToHarcamalar = () => navigate("/harcamalar");
  
  // goToDonustur (Transfer) fonksiyonu kaldırıldı

  const currentPath = window.location.pathname;
  const activeColor = "text-indigo-400";
  const defaultColor = "text-gray-400";

  const getButtonClass = (path, customActiveColor = activeColor) =>
    `flex flex-col items-center justify-center h-full transition-colors duration-200 flex-grow 
    ${currentPath === path ? customActiveColor : defaultColor} 
    hover:${customActiveColor}`;

  return (
    // Navigasyon çubuğu sabit kaldı
    <nav className="fixed bottom-0 left-0 w-full bg-gray-700 shadow-xl z-20 h-20">
      {/* 5 yerine 4 eşit butona ayarlandı */}
      <div className="flex items-center h-full px-2 sm:px-4">
        
        {/* 1. Ana Sayfa */}
        <button className={getButtonClass("/")} onClick={goToHome}>
          <HomeOutlined className="text-3xl" />
          <span className="text-xs font-medium mt-1">Ana Sayfa</span>
        </button>
        
        {/* 2. Raporlar */}
        <button className={getButtonClass("/raporlar")} onClick={goToRaporlar}>
          <BarChartOutlined className="text-3xl" />
          <span className="text-xs font-medium mt-1">Raporlar</span>
        </button>

        {/* ORTADAKİ TRANSFER BUTONU KALDIRILDI */}

        {/* 3. Gelirler (eskiden 4.) */}
        <button
          className={getButtonClass("/gelirler", "text-emerald-300")}
          onClick={goToGelirler}
        >
          <DollarCircleOutlined className="text-3xl" />
          <span className="text-xs font-medium mt-1">Gelirler</span>
        </button>
        
        {/* 4. Harcamalar (eskiden 5.) */}
        <button
          className={getButtonClass("/harcamalar", "text-red-300")}
          onClick={goToHarcamalar}
        >
          <MinusCircleOutlined className="text-3xl" />
          <span className="text-xs font-medium mt-1">Harcamalar</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;