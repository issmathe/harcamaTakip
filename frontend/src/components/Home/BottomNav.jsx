import React, { useState } from "react";
import {
  HomeOutlined,
  PieChartOutlined,
  PlusCircleOutlined, // Merkezi ekle butonu için kalacak
  MenuOutlined,
} from "@ant-design/icons";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";

const BottomNav = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  // Silinen fonksiyon: goToKayitEkleme

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

  // Yeni butona atanacak olan, doğrudan kaydı ekleme sayfasına gitme fonksiyonu
  const goToEkle = () => {
    navigate("/kayitekleme");
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md">
        <div className="flex justify-around items-center py-6">
          {/* Ana Sayfa */}
          <button
            className="flex flex-col items-center text-gray-600 hover:text-indigo-600"
            onClick={() => navigate("/")}
          >
            <HomeOutlined className="text-xl" />
            <span className="text-xs">Ana Sayfa</span>
          </button>

          {/* Raporlar */}
          <button
            className="flex flex-col items-center text-gray-600 hover:text-indigo-600"
            onClick={goToRaporlar}
          >
            <PieChartOutlined className="text-xl" />
            <span className="text-xs">Raporlar</span>
          </button>

          {/* Ekle (Merkezi Kayıt Ekleme butonu olarak yeniden konumlandırıldı) */}
          <button
            className="flex flex-col items-center text-gray-600 hover:text-indigo-600"
            onClick={goToEkle} // Merkezi butonu direkt sayfaya yönlendiriyoruz.
          >
            <PlusCircleOutlined className="text-2xl" />
            <span className="text-xs">Ekle</span> 
          </button>

          {/* Dosya (Modal Açan Buton) */}
          <button
            className="flex flex-col items-center text-gray-600 hover:text-indigo-600"
            onClick={showModal}
          >
            <MenuOutlined className="text-xl" />
            <span className="text-xs">Dosya</span>
          </button>
        </div>
      </nav>

      {/* Modal */}
      <Modal
        title="Dosya"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Button block className="mb-2" onClick={goToGelirler}>
          Gelirleri Göster
        </Button>
        <Button block className="mb-2" onClick={goToHarcamalar}>
          Harcamaları Göster
        </Button>
        {/* Silinen buton: Kayıt Ekle butonu modal içinden kaldırıldı */}
      </Modal>
    </>
  );
};

export default BottomNav;