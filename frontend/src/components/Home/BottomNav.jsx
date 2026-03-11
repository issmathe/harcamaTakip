import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  BarChartOutlined,
  DollarCircleOutlined,
  MinusCircleOutlined,
  GoldOutlined,
} from "@ant-design/icons";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/", label: "Ana Sayfa", icon: <HomeOutlined />, activeColor: "text-blue-400" },
    { path: "/raporlar", label: "Raporlar", icon: <BarChartOutlined />, activeColor: "text-purple-400" },
    { path: "/birikim", label: "Birikim", icon: <GoldOutlined />, activeColor: "text-emerald-400" },
    { path: "/gelirler", label: "Gelirler", icon: <DollarCircleOutlined />, activeColor: "text-orange-400" },
    { path: "/harcamalar", label: "Harcamalar", icon: <MinusCircleOutlined />, activeColor: "text-red-400" },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[100] px-6">
      <div className="w-full relative">
        {/* Cam Efekti: bg-white/10 ve yüksek blur */}
        <div className="relative overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
          <nav className="relative flex items-center justify-between h-18 py-2 px-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 h-full relative active:scale-90 ${
                    isActive ? item.activeColor : "text-gray-500/60 hover:text-gray-600"
                  }`}
                >
                  <span className={`text-xl transition-all duration-300 ${isActive ? "-translate-y-1 scale-110" : "scale-100"}`}>
                    {item.icon}
                  </span>
                  
                  <span className={`text-[8px] mt-1 font-black uppercase tracking-tighter transition-all duration-300 ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 h-0 invisible"
                  }`}>
                    {item.label}
                  </span>

                  {/* Aktif Işık Efekti */}
                  {isActive && (
                    <div className={`absolute inset-x-2 top-2 bottom-2 -z-10 blur-2xl opacity-30 rounded-full ${item.activeColor.replace('text', 'bg')}`} />
                  )}
                  
                  {/* Alt Gösterge Çizgisi */}
                  <div className={`absolute bottom-1 w-5 h-0.5 rounded-full transition-all duration-500 ${
                    isActive ? `opacity-100 scale-x-100 ${item.activeColor.replace('text', 'bg')}` : "opacity-0 scale-x-0"
                  }`} />
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;