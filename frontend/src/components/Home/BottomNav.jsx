import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  BarChartOutlined,
  DollarCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/", label: "Ana Sayfa", icon: <HomeOutlined />, activeColor: "text-blue-400" },
    { path: "/raporlar", label: "Raporlar", icon: <BarChartOutlined />, activeColor: "text-purple-400" },
    { path: "/gelirler", label: "Gelirler", icon: <DollarCircleOutlined />, activeColor: "text-emerald-400" },
    { path: "/harcamalar", label: "Harcamalar", icon: <MinusCircleOutlined />, activeColor: "text-red-400" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900/95 backdrop-blur-md border-t border-white/10 pb-safe">
      <nav className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 h-full relative active:scale-95 ${
                isActive ? item.activeColor : "text-white/30"
              }`}
            >
              <span className={`text-xl transition-all duration-300 ${
                isActive ? "-translate-y-1 scale-110" : "scale-100"
              }`}>
                {item.icon}
              </span>

              <span className={`text-[10px] mt-1 font-medium tracking-tight transition-all duration-300 ${
                isActive ? "opacity-100 scale-100" : "opacity-60 scale-90"
              }`}>
                {item.label}
              </span>
              
              {/* Aktif Belirteci */}
              {isActive && (
                <div className={`absolute top-0 w-12 h-1 rounded-b-full blur-sm opacity-50 ${item.activeColor.replace('text', 'bg')}`} />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;