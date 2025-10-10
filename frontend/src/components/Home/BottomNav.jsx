import React, { useState } from "react";
import {
  HomeOutlined,
  PieChartOutlined,
  PlusCircleOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";

const BottomNav = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

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

  const goToKayitEkleme = () => {
    setIsModalVisible(false);
    navigate("/kayitekleme");
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md py-7">
        <div className="flex justify-around items-center">
          <button
            className="flex flex-col items-center text-gray-600 hover:text-indigo-600"
            onClick={() => navigate("/")}
          >
            <HomeOutlined className="text-3xl" />
            <span className="text-sm">Ana Sayfa</span>
          </button>

          <button
            className="flex flex-col items-center text-gray-600 hover:text-indigo-600"
            onClick={goToRaporlar}
          >
            <PieChartOutlined className="text-3xl" />
            <span className="text-sm">Raporlar</span>
          </button>

          <button
            className="flex flex-col items-center text-gray-600 hover:text-indigo-600"
            onClick={goToKayitEkleme}
          >
            <PlusCircleOutlined className="text-4xl" />
            <span className="text-sm">Kayıt Ekle</span>
          </button>

          <button
            className="flex flex-col items-center text-gray-600 hover:text-indigo-600"
            onClick={showModal}
          >
            <MenuOutlined className="text-3xl" />
            <span className="text-sm">Dosya</span>
          </button>
        </div>
      </nav>

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
        <Button block onClick={goToKayitEkleme}>
          Kayıt Ekle
        </Button>
      </Modal>
    </>
  );
};

export default BottomNav;
