import React from "react";
import {
  HomeOutlined,
  BarChartOutlined,
  DollarCircleOutlined,
  SwapOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();

  const goToHome = () => navigate("/");
  const goToRaporlar = () => navigate("/raporlar");
  const goToGelirler = () => navigate("/gelirler");
  const goToHarcamalar = () => navigate("/harcamalar");
  const goToDonustur = () => navigate("/transfer"); // artık transfer route

  const currentPath = window.location.pathname;
  const activeColor = "text-indigo-400";
  const defaultColor = "text-gray-400";

  const getButtonClass = (path, customActiveColor = activeColor) =>
    `flex flex-col items-center justify-center h-full transition-colors duration-200 flex-grow 
    ${currentPath === path ? customActiveColor : defaultColor} 
    hover:${customActiveColor}`;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-gray-700 shadow-xl z-20 h-20">
      <div className="flex items-center h-full px-2 sm:px-4">
        <button className={getButtonClass("/")} onClick={goToHome}>
          <HomeOutlined className="text-3xl" />
          <span className="text-xs font-medium mt-1">Ana Sayfa</span>
        </button>
        <button className={getButtonClass("/raporlar")} onClick={goToRaporlar}>
          <BarChartOutlined className="text-3xl" />
          <span className="text-xs font-medium mt-1">Raporlar</span>
        </button>

        <div className="flex justify-center items-center h-full w-20 transform -translate-y-4 mx-2">
          <button
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-xl 
                          ${
                            currentPath === "/transfer"
                              ? "bg-indigo-600"
                              : "bg-indigo-500"
                          } 
                          text-white transition-all duration-300 hover:bg-indigo-700`}
            onClick={goToDonustur}
          >
            <SwapOutlined className="text-3xl" />
            <span className="text-xs font-bold -mt-1">Transfer</span>
          </button>
        </div>
        <button
          className={getButtonClass("/gelirler", "text-emerald-300")}
          onClick={goToGelirler}
        >
          <DollarCircleOutlined className="text-3xl" />
          <span className="text-xs font-medium mt-1">Gelirler</span>
        </button>
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
