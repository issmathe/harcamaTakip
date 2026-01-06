import React, { useState, useMemo } from "react";
import { Typography, Progress } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  BankOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  HistoryOutlined
} from "@ant-design/icons";
import { useTotalsContext } from "../../context/TotalsContext";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const Header = () => {
  const { 
    totalIncome, totalExpense, totalToday, 
    cumulativeIncome, cumulativeExpense, bankBalance,
    harcamalar = [], gelirler = [] 
  } = useTotalsContext();
  
  const [activePrevMonthBox, setActivePrevMonthBox] = useState(null);

  const cumulativeBalance = (cumulativeIncome || 0) - (cumulativeExpense || 0);
  const monthlyBalance = (totalIncome || 0) - (totalExpense || 0);
  
// Header.jsx içindeki lastMonthData kısmını bu şekilde güncelle:

const lastMonthData = useMemo(() => {
  const now = dayjs();
  const lastMonth = now.subtract(1, "month");
  
  // Geçen ayın toplam geliri (Sadece 'gelir' kategorisi)
  const prevIncome = (gelirler || [])
    .filter(g => {
      const d = dayjs(g.createdAt);
      const isLastMonth = d.isSame(lastMonth, "month") && d.isSame(lastMonth, "year");
      const isPureIncome = g.kategori?.toLowerCase() === "gelir"; // Sadece gerçek gelirler
      return isLastMonth && isPureIncome;
    })
    .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

  // Geçen ayın toplam gideri (Tasarruf HARİÇ)
  const prevExpense = (harcamalar || [])
    .filter(h => {
      const d = dayjs(h.createdAt);
      const isLastMonth = d.isSame(lastMonth, "month") && d.isSame(lastMonth, "year");
      const isNotSavings = h.kategori?.toLowerCase() !== "tasarruf"; // Tasarrufları giderden çıkar
      return isLastMonth && isNotSavings;
    })
    .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

  return {
    income: prevIncome,
    expense: prevExpense,
    balance: prevIncome - prevExpense
  };
}, [harcamalar, gelirler]);

  const spendingPercentage = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0;
  const remainingFuel = 100 - spendingPercentage;
  const fuelColor = remainingFuel > 50 ? "#10b981" : remainingFuel > 20 ? "#f59e0b" : "#ef4444";

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString("tr-TR", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const handleBoxClick = (id) => {
    setActivePrevMonthBox(prev => prev === id ? null : id);
  };

  const StatBox = ({ id, label, currentVal, prevVal, colorClass, borderClass, icon: Icon }) => {
    const isShowingPrev = activePrevMonthBox === id;
    const displayVal = isShowingPrev ? prevVal : currentVal;

    return (
      <div 
        onClick={() => handleBoxClick(id)}
        className={`flex-1 ${isShowingPrev ? 'bg-gray-800 border-gray-900 scale-95 shadow-inner' : colorClass + ' shadow-sm'} border-l-4 ${borderClass} rounded-xl p-2 flex flex-col justify-between transition-all duration-300 cursor-pointer select-none`}
      >
        <Text className={`${isShowingPrev ? '!text-gray-400' : ''} text-[10px] font-bold uppercase`}>
          {isShowingPrev ? "Geçen Ay" : label}
        </Text>
        <div className={`flex items-center ${isShowingPrev ? 'text-white' : ''}`}>
          <Icon className="text-xs mr-1" />
          <span className="text-sm font-black italic">€{formatCurrency(displayVal)}</span>
        </div>
      </div>
    );
  };

  return (
    <header className="px-4 pt-4 pb-3 bg-white sticky top-0 z-10 shadow-sm">
      <div 
        className="rounded-3xl p-5 shadow-xl text-white relative overflow-hidden mb-4"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" }}
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
                <span className="font-bold text-sm">banka€{formatCurrency(bankBalance)}</span>
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
            <Progress percent={remainingFuel} showInfo={false} strokeColor={fuelColor} trailColor="rgba(255,255,255,0.1)" strokeWidth={10} />
          </div>
        </div>
      </div>

      <div className="flex gap-2 h-20">
        <StatBox 
          id="gelir" label="Gelir" icon={ArrowUpOutlined}
          currentVal={totalIncome} prevVal={lastMonthData.income}
          colorClass="bg-emerald-50 text-emerald-700" borderClass="border-emerald-500"
        />

        <StatBox 
          id="gider" label="Gider" icon={ArrowDownOutlined}
          currentVal={totalExpense} prevVal={lastMonthData.expense}
          colorClass="bg-rose-50 text-rose-700" borderClass="border-rose-500"
        />

        <StatBox 
          id="kalan" label="Kalan" icon={ThunderboltOutlined}
          currentVal={monthlyBalance} prevVal={lastMonthData.balance}
          colorClass={monthlyBalance >= 0 ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}
          borderClass={monthlyBalance >= 0 ? "border-blue-500" : "border-red-500"}
        />

        <div className="flex-1 bg-orange-50 border-l-4 border-orange-500 rounded-xl p-2 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center">
            <Text className="text-orange-700 text-[10px] font-bold uppercase">Bugün</Text>
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