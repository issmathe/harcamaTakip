import React from "react";
import {
  HomeOutlined,
  BarChartOutlined,
  FileTextOutlined, // Harcamalar için kullanıldı
  DollarCircleOutlined, // Gelirler için kullanıldı
} from "@ant-design/icons";
// Modal ve Button Antd importları artık gerekli değil.
import { useNavigate } from "react-router-dom";

const BottomNav = () => {
  // Modal state'i ve fonksiyonları artık kullanılmayacak
  // const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  // Yönlendirme Fonksiyonları (Artık modal açıp kapamaya gerek yok)
  const goToHome = () => navigate("/");
  const goToRaporlar = () => navigate("/raporlar");
  const // ✨ Yeni Fonksiyonlar
  goToGelirler = () => navigate("/gelirler");
  const // ✨ Yeni Fonksiyonlar
  goToHarcamalar = () => navigate("/harcamalar");

  return (
    // Modal kısmı tamamen kaldırıldı
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-xl z-20 h-20 sm:h-20">
        
        {/* ✅ Dört Eşit Parça: justify-around yerine justify-between ve tüm butonlar w-1/4 */}
        <div className="flex justify-between items-center h-full px-2 sm:px-4"> 
          
          {/* 1. Ana Sayfa (w-1/4) */}
          <button
            className="flex flex-col items-center justify-center h-full w-1/4 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            onClick={goToHome}
          >
            <HomeOutlined className="text-2xl md:text-3xl" />
            <span className="text-xs font-medium mt-1">Ana Sayfa</span>
          </button>

          {/* 2. Raporlar (w-1/4) */}
          <button
            className="flex flex-col items-center justify-center h-full w-1/4 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            onClick={goToRaporlar}
          >
            <BarChartOutlined className="text-2xl md:text-3xl" />
            <span className="text-xs font-medium mt-1">Raporlar</span>
          </button>
          
          {/* 3. Gelirler (w-1/4) - Yeni Eklendi */}
          <button
            className="flex flex-col items-center justify-center h-full w-1/4 text-green-600 hover:text-green-700 transition-colors duration-200"
            onClick={goToGelirler}
          >
            <DollarCircleOutlined className="text-2xl md:text-3xl" />
            <span className="text-xs font-medium mt-1">Gelirler</span>
          </button>

          {/* 4. Harcamalar (w-1/4) - Yeni Eklendi */}
          <button
            className="flex flex-col items-center justify-center h-full w-1/4 text-red-600 hover:text-red-700 transition-colors duration-200"
            onClick={goToHarcamalar}
          >
            <FileTextOutlined className="text-2xl md:text-3xl" />
            <span className="text-xs font-medium mt-1">Harcamalar</span>
          </button>

        </div>
      </nav>
    </>
  );
};

export default BottomNav;