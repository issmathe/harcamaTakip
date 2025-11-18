import React from "react";
import {
  HomeOutlined,
  BarChartOutlined,
  FileTextOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();

  const goToHome = () => navigate("/");
  const goToRaporlar = () => navigate("/raporlar");
  const goToGelirler = () => navigate("/gelirler");
  const goToHarcamalar = () => navigate("/harcamalar");

  const currentPath = window.location.pathname; 

  // 🌟 GÜNCELLEME: Koyu Arkaplan için renkler yeniden ayarlandı.
  const activeColor = "text-indigo-400"; // Koyu üzerinde daha iyi duran açık indigo
  const defaultColor = "text-gray-400"; // Varsayılan ikon rengi
  
  const getButtonClass = (path) => (
    `flex flex-col items-center justify-center h-full w-1/4 transition-colors duration-200 
    ${currentPath === path ? activeColor : defaultColor} 
    hover:${activeColor}`
  );


  return (
    <>
      {/* 🌟 GÜNCELLEME: bg-gray-700 kullanıldı ve border kaldırıldı (isteğe bağlı). */}
      <nav className="fixed bottom-0 left-0 w-full bg-gray-700 shadow-xl z-20 h-20">
        
        <div className="flex justify-around items-center h-full px-2 sm:px-4"> 
          
          {/* 1. Ana Sayfa */}
          <button
            className={getButtonClass("/")}
            onClick={goToHome}
          >
            <HomeOutlined className="text-3xl" /> 
            <span className="text-xs font-medium mt-1">Ana Sayfa</span>
          </button>

          {/* 2. Raporlar */}
          <button
            className={getButtonClass("/raporlar")}
            onClick={goToRaporlar}
          >
            <BarChartOutlined className="text-3xl" />
            <span className="text-xs font-medium mt-1">Raporlar</span>
          </button>
          
          {/* 3. Gelirler (Koyu arkaplan için emerald-300) */}
          <button
            className={`flex flex-col items-center justify-center h-full w-1/4 transition-colors duration-200 
                        ${currentPath === '/gelirler' ? 'text-emerald-300' : defaultColor} 
                        hover:text-emerald-300`}
            onClick={goToGelirler}
          >
            <DollarCircleOutlined className="text-3xl" />
            <span className="text-xs font-medium mt-1">Gelirler</span>
          </button>

          {/* 4. Harcamalar (Koyu arkaplan için red-300) */}
          <button
            className={`flex flex-col items-center justify-center h-full w-1/4 transition-colors duration-200 
                        ${currentPath === '/harcamalar' ? 'text-red-300' : defaultColor} 
                        hover:text-red-300`}
            onClick={goToHarcamalar}
          >
            <FileTextOutlined className="text-3xl" />
            <span className="text-xs font-medium mt-1">Harcamalar</span>
          </button>

        </div>
      </nav>
    </>
  );
};

export default BottomNav;