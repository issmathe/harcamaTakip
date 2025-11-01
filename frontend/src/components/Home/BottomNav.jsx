import React, { useState } from "react";
import {
  HomeOutlined,
  BarChartOutlined,
  // PlusOutlined kaldırıldı
  FileTextOutlined,
  DollarCircleOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";

const BottomNav = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  // Yönlendirme Fonksiyonları
  const goToGelirler = () => {
    setIsModalVisible(false);
    navigate("/gelirler");
  };

  const goToHarcamalar = () => {
    setIsModalVisible(false);
    navigate("/harcamalar");
  };

  const goToRaporlar = () => {
    navigate("/raporlar");
  };

  // ❌ goToEkle fonksiyonu kaldırıldı

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-xl z-20 h-24 sm:h-24">
        
        {/* ✅ justify-around yerine justify-between kullanıldı ve her buton w-1/3 olarak ayarlandı */}
        <div className="flex justify-between items-center h-full px-4"> 
          
          {/* 1. Ana Sayfa (w-1/3) */}
          <button
            className="flex flex-col items-center justify-center h-full w-1/3 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            onClick={() => navigate("/")}
          >
            <HomeOutlined className="text-2xl md:text-3xl" />
            <span className="text-xs font-medium mt-1 hidden sm:block">Ana Sayfa</span>
          </button>

          {/* 2. Raporlar (w-1/3) */}
          <button
            className="flex flex-col items-center justify-center h-full w-1/3 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            onClick={goToRaporlar}
          >
            <BarChartOutlined className="text-2xl md:text-3xl" />
            <span className="text-xs font-medium mt-1 hidden sm:block">Raporlar</span>
          </button>

          {/* ❌ 3. Ekle (Merkezi Buton) kaldırıldı */}
          {/* ❌ Dengeleme Butonu (Gizli) kaldırıldı */}

          {/* 3. Dosya (Modal Açan Buton) - Artık son buton (w-1/3) */}
          <button
            className="flex flex-col items-center justify-center h-full w-1/3 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            onClick={showModal}
          >
            <FileTextOutlined className="text-2xl md:text-3xl" />
            <span className="text-xs font-medium mt-1 hidden sm:block">Dosya</span>
          </button>
        </div>
      </nav>

      {/* Modal - Başlık Kısmı Kaldırıldı */}
      <Modal
        title={null} 
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        className='p-4'
        width={350} 
        styles={{ body: { paddingTop: 0, paddingBottom: 8 } }}
      >
        <div className='pt-4 pb-2 flex flex-col items-center'> 
            {/* 1. Gelir Butonu - Genişlik %80 */}
            <Button 
                style={{ width: '80%' }}
                size="large"
                className="mb-4 h-14 rounded-xl font-bold flex items-center justify-start px-6 border-green-400 hover:border-green-600 bg-green-50 hover:bg-green-100 transition-colors duration-200" 
                onClick={goToGelirler}
                icon={<DollarCircleOutlined className="text-green-600 text-2xl mr-3" />}
            >
                Gelir Kayıtları
            </Button>
            
            {/* 2. Harcama Butonu - Genişlik %80 */}
            <Button 
                style={{ width: '80%' }}
                size="large"
                className="h-14 rounded-xl font-bold flex items-center justify-start px-6 border-red-400 hover:border-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-200" 
                onClick={goToHarcamalar}
                icon={<WalletOutlined className="text-red-600 text-2xl mr-3" />}
            >
                Harcama Kayıtları
            </Button>
        </div>
      </Modal>
    </>
  );
};

export default BottomNav;