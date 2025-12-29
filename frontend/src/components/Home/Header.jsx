import React from "react";
import { Typography, Progress } from "antd";
import {
  ArrowUpOutlined,
  BankOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  HistoryOutlined
} from "@ant-design/icons";
import { useTotalsContext } from "../../context/TotalsContext";

const { Title, Text } = Typography;

const Header = () => {
  const { 
    totalIncome, totalExpense, totalToday, 
    cumulativeIncome, cumulativeExpense, bankBalance 
  } = useTotalsContext();
  
  const cumulativeBalance = (cumulativeIncome || 0) - (cumulativeExpense || 0);
  // Transferler çıkarıldı: Sadece Gelir - Gider
  const monthlyBalance = (totalIncome || 0) - (totalExpense || 0);
  
  const spendingPercentage = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0;
  const remainingFuel = 100 - spendingPercentage;

  const fuelColor = remainingFuel > 50 ? "#10b981" : remainingFuel > 20 ? "#f59e0b" : "#ef4444";

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString("tr-TR", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  return (
    <header className="px-4 pt-4 pb-3 bg-white sticky top-0 z-10 shadow-sm">
      <div 
        className="rounded-3xl p-5 shadow-xl text-white relative overflow-hidden mb-4"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        }}
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <Text className="!text-indigo-200 text-[10px] uppercase font-bold tracking-widest">Kümülatif Portföy</Text>
              <Title level={2} className="!text-white !m-0 !text-3xl font-black italic">
                €{formatCurrency(cumulativeBalance)}
              </Title>
            </div>
            <div className="flex flex-col items-end">
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 flex items-center gap-2">
                <BankOutlined className="text-emerald-400" />
                <span className="font-bold text-sm">€{formatCurrency(bankBalance)}</span>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-indigo-200 flex items-center gap-1">
                <DashboardOutlined /> AYLIK BÜTÇE
              </span>
              <span className="text-xs font-black" style={{ color: fuelColor }}>
                %{remainingFuel.toFixed(0)} Kalan
              </span>
            </div>
            <Progress 
              percent={remainingFuel} 
              showInfo={false} 
              strokeColor={fuelColor}
              trailColor="rgba(255,255,255,0.1)"
              strokeWidth={10}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 h-20">
        <div className="flex-1 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl p-2 flex flex-col justify-between shadow-sm">
          <Text className="text-emerald-700 text-[10px] font-bold">GELİR</Text>
          <div className="flex items-center text-emerald-600">
            <ArrowUpOutlined className="text-xs mr-1" />
            <span className="text-sm font-black italic">€{formatCurrency(totalIncome)}</span>
          </div>
        </div>

        <div className={`flex-1 ${monthlyBalance >= 0 ? 'bg-blue-50 border-blue-500' : 'bg-red-50 border-red-500'} border-l-4 rounded-xl p-2 flex flex-col justify-between shadow-sm`}>
          <Text className={`${monthlyBalance >= 0 ? 'text-blue-700' : 'text-red-700'} text-[10px] font-bold`}>KALAN</Text>
          <div className={`flex items-center ${monthlyBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            <ThunderboltOutlined className="text-xs mr-1" />
            <span className="text-sm font-black italic">€{formatCurrency(monthlyBalance)}</span>
          </div>
        </div>

        <div className="flex-1 bg-orange-50 border-l-4 border-orange-500 rounded-xl p-2 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center">
            <Text className="text-orange-700 text-[10px] font-bold">BUGÜN</Text>
            <HistoryOutlined className="text-orange-400 text-[10px]" />
          </div>
          <div className="text-orange-600">
            <span className="text-sm font-black italic">€{formatCurrency(totalToday)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;