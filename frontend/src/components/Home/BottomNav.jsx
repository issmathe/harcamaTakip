import React, { useState } from "react";
import {
  HomeOutlined,
  BarChartOutlined,
  PlusOutlined, // <<< Yeni, daha küçük Ekle butonu ikonu
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

  const goToEkle = () => {
    navigate("/kayitekleme");
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-xl z-20 h-24 sm:h-20">
        <div className="flex justify-around items-center h-full">
          {/* 1. Ana Sayfa */}
          <button
            className="flex flex-col items-center justify-center h-full w-1/5 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            onClick={() => navigate("/")}
          >
            <HomeOutlined className="text-xl md:text-2xl" />
            <span className="text-xs font-medium mt-1 hidden sm:block">Ana Sayfa</span>
          </button>

          {/* 2. Raporlar */}
          <button
            className="flex flex-col items-center justify-center h-full w-1/5 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            onClick={goToRaporlar}
          >
            <BarChartOutlined className="text-xl md:text-2xl" />
            <span className="text-xs font-medium mt-1 hidden sm:block">Raporlar</span>
          </button>

          {/* 3. Ekle (Merkezi, Küçük ve Sade Buton) */}
          <div className="relative bottom-0 w-1/5 flex justify-center"> {/* bottom-4 kalktı, butonu nav hizasına çektik */}
            <button
              // Daha küçük ve sade buton boyutları
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-600 text-white shadow-lg transform hover:scale-110 transition-transform duration-300 flex items-center justify-center p-1"
              onClick={goToEkle} 
              aria-label="Kayıt Ekleme Sayfası"
            >
              {/* Daha sade Plus ikonu */}
              <PlusOutlined className="text-2xl sm:text-3xl" /> 
            </button>
          </div>

          {/* Dengeleme Butonu (Gizli) */}
          <div className="w-1/5 hidden sm:block"></div> 

          {/* 4. Dosya (Modal Açan Buton) */}
          <button
            className="flex flex-col items-center justify-center h-full w-1/5 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            onClick={showModal}
          >
            <FileTextOutlined className="text-xl md:text-2xl" />
            <span className="text-xs font-medium mt-1 hidden sm:block">Dosya</span>
          </button>
        </div>
      </nav>

      {/* Modal */}
      <Modal
        title={
            <div className='text-lg font-semibold text-gray-700'>
                Dosya Seçenekleri
            </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        className='p-4'
        // Modalın varsayılan genişliğini ayarlayalım
        width={350} 
      >
        <div className='py-2 flex flex-col items-center'>
            {/* Buton genişliğini %80 yapıyoruz */}
            <Button 
                style={{ width: '80%' }} // <<< Buton genişliği %80
                size="large"
                className="mb-3 h-12 rounded-lg font-semibold flex items-center justify-center" 
                onClick={goToGelirler}
                icon={<DollarCircleOutlined className="text-green-500 text-lg" />}
            >
                Gelirleri Görüntüle
            </Button>
            {/* Buton genişliğini %80 yapıyoruz */}
            <Button 
                style={{ width: '80%' }} // <<< Buton genişliği %80
                size="large"
                className="h-12 rounded-lg font-semibold flex items-center justify-center" 
                onClick={goToHarcamalar}
                icon={<WalletOutlined className="text-red-500 text-lg" />}
            >
                Harcamaları Görüntüle
            </Button>
        </div>
      </Modal>
    </>
  );
};

export default BottomNav;