import React, { useState } from "react";
import { HomeOutlined, PieChartOutlined, PlusCircleOutlined, MenuOutlined } from "@ant-design/icons";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";

const BottomNav = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const goToGelirler = () => {
    setIsModalVisible(false);
    navigate("/gelirler");
  };

  const goToHarcamalar = () => {
    setIsModalVisible(false);
    navigate("/harcamalar");
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md">
        <div className="flex justify-around items-center py-2">
          <button className="flex flex-col items-center text-gray-600 hover:text-indigo-600" onClick={() => navigate("/")}>
            <HomeOutlined className="text-xl" />
            <span className="text-xs">Ana Sayfa</span>
          </button>

          <button className="flex flex-col items-center text-gray-600 hover:text-indigo-600" onClick={() => navigate("/raporlar")}>
            <PieChartOutlined className="text-xl" />
            <span className="text-xs">Raporlar</span>
          </button>

          <button className="flex flex-col items-center text-gray-600 hover:text-indigo-600">
            <PlusCircleOutlined className="text-2xl" />
            <span className="text-xs">Ekle</span>
          </button>

          <button
            className="flex flex-col items-center text-gray-600 hover:text-indigo-600"
            onClick={showModal}
          >
            <MenuOutlined className="text-xl" />
            <span className="text-xs">İşlemler</span>
          </button>
        </div>
      </nav>

      <Modal
        title="İşlemler"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Button block className="mb-2" onClick={goToGelirler}>
          Gelirleri Göster
        </Button>
        <Button block onClick={goToHarcamalar}>
          Harcamaları Göster
        </Button>
      </Modal>
    </>
  );
};

export default BottomNav;
