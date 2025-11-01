import React, { useState } from "react";
import {
  HomeOutlined,
  BarChartOutlined,
  PlusOutlined,
  FileTextOutlined,
  DollarCircleOutlined,
  WalletOutlined,
  ContainerOutlined, // Modal başlık ikonu
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

  const goToEkle = () => {
    navigate("/kayitekleme");
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-xl z-20 h-24 sm:h-24">
        {/* Navigasyon çubuğu h-24 olarak ayarlandı */}
        <div className="flex justify-around items-center h-full">
          {/* 1. Ana Sayfa */}
          <button
            className="flex flex-col items-center justify-center h-full w-1/5 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            onClick={() => navigate("/")}
          >
            <HomeOutlined className="text-2xl md:text-3xl" /> {/* İkon boyutu büyütüldü */}
            <span className="text-xs font-medium mt-1 hidden sm:block">Ana Sayfa</span>
          </button>

          {/* 2. Raporlar */}
          <button
            className="flex flex-col items-center justify-center h-full w-1/5 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            onClick={goToRaporlar}
          >
            <BarChartOutlined className="text-2xl md:text-3xl" /> {/* İkon boyutu büyütüldü */}
            <span className="text-xs font-medium mt-1 hidden sm:block">Raporlar</span>
          </button>

          {/* 3. Ekle (Merkezi Buton) */}
          <div className="relative bottom-0 w-1/5 flex justify-center">
            <button
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-blue-600 text-white shadow-lg transform hover:scale-110 transition-transform duration-300 flex items-center justify-center p-1"
              // Merkezi butonun boyutları da h-24'e uyumlu olarak büyütüldü (w-16 h-16)
              onClick={goToEkle} 
              aria-label="Kayıt Ekleme Sayfası"
            >
              <PlusOutlined className="text-3xl sm:text-4xl" /> {/* Ekle ikonu boyutu büyütüldü */}
            </button>
          </div>

          {/* Dengeleme Butonu (Gizli) */}
          <div className="w-1/5 hidden sm:block"></div> 

          {/* 4. Dosya (Modal Açan Buton) */}
          <button
            className="flex flex-col items-center justify-center h-full w-1/5 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            onClick={showModal}
          >
            <FileTextOutlined className="text-2xl md:text-3xl" /> {/* İkon boyutu büyütüldü */}
            <span className="text-xs font-medium mt-1 hidden sm:block">Dosya</span>
          </button>
        </div>
      </nav>

      {/* Modal - Estetik İyileştirmeler */}
      <Modal
        title={
            <div className='flex items-center text-xl font-bold text-blue-600'>
                <ContainerOutlined className="mr-2 text-2xl" /> 
                Muhasebe Dosyaları
            </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        className='p-4'
        width={350} 
      >
        <div className='pt-4 pb-2 flex flex-col items-center border-t border-gray-100'> 
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