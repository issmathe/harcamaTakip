import React, { useState, useMemo } from "react";
import { Typography, Progress, Button } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  BankOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  HistoryOutlined,
  CalendarOutlined,
  SaveOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
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
  
  const [activeState, setActiveState] = useState({ id: null, mode: 1 });
  const [isHidden, setIsHidden] = useState(false); // Gizleme durumu

  const totalSavings = useMemo(() => {
    const harcamaTasarruf = (harcamalar || [])
      .filter(h => h.kategori?.toLowerCase() === "tasarruf")
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);
    
    const gelirTasarruf = (gelirler || [])
      .filter(g => g.kategori?.toLowerCase() === "tasarruf")
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    return harcamaTasarruf + gelirTasarruf;
  }, [harcamalar, gelirler]);

  const totalAssets = (cumulativeIncome || 0) - (cumulativeExpense || 0);
  const monthlyBalance = (totalIncome || 0) - (totalExpense || 0);
  
  const lastMonthData = useMemo(() => {
    const lastMonth = dayjs().subtract(1, "month");
    const todayNum = dayjs().date(); 
    
    const filterByDate = (list, isExpense, untilToday = false) => {
      return (list || []).filter(item => {
        const d = dayjs(item.createdAt);
        const isCorrectMonth = d.isSame(lastMonth, "month") && d.isSame(lastMonth, "year");
        const isNotTasarruf = isExpense ? item.kategori?.toLowerCase() !== "tasarruf" : true;
        const isGelir = !isExpense ? item.kategori?.toLowerCase() === "gelir" : true;
        const isWithinDay = untilToday ? d.date() <= todayNum : true;

        return isCorrectMonth && isNotTasarruf && isGelir && isWithinDay;
      }).reduce((sum, i) => sum + Number(i.miktar || 0), 0);
    };

    return {
      income: filterByDate(gelirler, false),
      expenseMTD: filterByDate(harcamalar, true, true),
      balance: filterByDate(gelirler, false) - filterByDate(harcamalar, true)
    };
  }, [harcamalar, gelirler]);

  const spendingPercentage = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0;
  const remainingFuel = 100 - spendingPercentage;
  const fuelColor = remainingFuel > 50 ? "#10b981" : remainingFuel > 20 ? "#f59e0b" : "#ef4444";

  const formatCurrency = (val) => {
    if (isHidden) return "****"; // Gizleme aktifse yıldız göster
    return (val || 0).toLocaleString("tr-TR", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const handleBoxClick = (id) => {
    setActiveState(prev => {
      if (prev.id !== id) return { id, mode: 2 }; 
      return { id: null, mode: 1 };
    });
  };

  const StatBox = ({ id, label, currentVal, prevVal, mtdVal, colorClass, borderClass, icon: Icon }) => {
    const isActive = activeState.id === id;
    let displayVal = currentVal;
    let displayLabel = label;
    let bgColor = colorClass + ' shadow-sm';

    if (isActive) {
      if (id === "gider") {
        displayVal = mtdVal;
        displayLabel = `1-${dayjs().format("DD")} ${dayjs().subtract(1, "month").format("MMM")}`;
        bgColor = "bg-indigo-900 border-indigo-950 scale-95 shadow-inner text-white";
      } else {
        displayVal = prevVal;
        displayLabel = "Geçen Ay";
        bgColor = "bg-gray-800 border-gray-900 scale-95 shadow-inner text-white";
      }
    }

    return (
      <div 
        onClick={() => handleBoxClick(id)}
        className={`flex-1 ${bgColor} border-l-4 ${borderClass} rounded-xl p-2 flex flex-col justify-between transition-all duration-300 cursor-pointer select-none`}
      >
        <div className="flex justify-between items-start">
          <Text className={`${isActive ? '!text-gray-300' : ''} text-[10px] font-bold uppercase`}>
            {displayLabel}
          </Text>
          {isActive && id === "gider" && <CalendarOutlined className="text-[10px] text-indigo-300" />}
        </div>
        <div className={`flex items-center ${isActive ? 'text-white' : ''}`}>
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
              <div className="flex items-center gap-2 mb-1">
                <Text className="!text-indigo-200 text-[10px] uppercase font-bold tracking-widest">Toplam Varlık</Text>
                <Button 
                  type="text" 
                  size="small" 
                  icon={isHidden ? <EyeOutlined className="text-white/50" /> : <EyeInvisibleOutlined className="text-white/50" />} 
                  onClick={() => setIsHidden(!isHidden)}
                  className="h-4 w-4 flex items-center justify-center hover:bg-white/10"
                />
              </div>
              <Title level={2} className="!text-white !m-0 !text-3xl font-black italic">
                €{formatCurrency(totalAssets)}
              </Title>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 flex items-center gap-2">
                <BankOutlined className="text-emerald-400 text-xs" />
                <span className="font-bold text-[11px]">banka €{formatCurrency(bankBalance)}</span>
              </div>
              <div className="bg-blue-500/20 backdrop-blur-md px-3 py-1 rounded-xl border border-blue-400/30 flex items-center gap-2">
                <SaveOutlined className="text-blue-300 text-xs" />
                <span className="font-bold text-[11px] text-blue-100">birikim €{formatCurrency(totalSavings)}</span>
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
              size={{ strokeWidth: 10 }} 
            />
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
          currentVal={totalExpense} mtdVal={lastMonthData.expenseMTD}
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