import React from "react";
import { HomeOutlined, PieChartOutlined, PlusCircleOutlined, SettingOutlined } from "@ant-design/icons";

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md">
      <div className="flex justify-around items-center py-2">
        <button className="flex flex-col items-center text-gray-600 hover:text-indigo-600">
          <HomeOutlined className="text-xl" />
          <span className="text-xs">Ana Sayfa</span>
        </button>

        <button className="flex flex-col items-center text-gray-600 hover:text-indigo-600">
          <PieChartOutlined className="text-xl" />
          <span className="text-xs">Raporlar</span>
        </button>

        <button className="flex flex-col items-center text-indigo-600">
          <PlusCircleOutlined className="text-2xl" />
          <span className="text-xs">Düzenle</span>
        </button>

        <button className="flex flex-col items-center text-gray-600 hover:text-indigo-600">
          <SettingOutlined className="text-xl" />
          <span className="text-xs">Ayarlar</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
