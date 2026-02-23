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

const { Title } = Typography;

const Header = () => {
  const { 
    totalIncome, totalExpense, totalToday, 
    cumulativeIncome, cumulativeExpense, bankBalance,
    harcamalar = [], gelirler = [] 
  } = useTotalsContext();
  
  const [activeState, setActiveState] = useState({ id: null, mode: 1 });
  const [isHidden, setIsHidden] = useState(false);

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
    if (isHidden) return "****";
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

  const StatBox = ({ id, label, currentVal, prevVal, mtdVal, colorHex, icon: Icon }) => {
    const isActive = activeState.id === id;
    let displayVal = currentVal;
    let displayLabel = label;
    
    // Aktif mod renkleri ve metinleri
    const dynamicStyle = isActive 
      ? { backgroundColor: '#1e293b', borderColor: colorHex, color: '#fff' }
      : { backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: 'rgba(255,255,255,0.1)', color: colorHex };

    if (isActive) {
      if (id === "gider") {
        displayVal = mtdVal;
        displayLabel = `${dayjs().subtract(1, "month").format("MMM")} MTD`;
      } else {
        displayVal = prevVal;
        displayLabel = "Geçen Ay";
      }
    }

    return (
      <div 
        onClick={() => handleBoxClick(id)}
        className="flex-1 rounded-2xl p-2.5 flex flex-col justify-between border transition-all duration-300 active:scale-95 cursor-pointer backdrop-blur-md"
        style={dynamicStyle}
      >
        <div className="flex justify-between items-start opacity-70">
          <span className="text-[9px] font-black uppercase tracking-tighter">{displayLabel}</span>
          {isActive ? <CalendarOutlined className="text-[10px]" /> : <Icon className="text-[10px]" />}
        </div>
        <div className="mt-1">
          <span className="text-[13px] font-black italic block leading-none">€{formatCurrency(displayVal)}</span>
        </div>
      </div>
    );
  };

  return (
    <header className="px-4 pt-4 pb-2 sticky top-0 z-[110] bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      {/* Ana Kart - Reactor Core Tasarımı */}
      <div 
        className="rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden mb-4 border border-white/10"
        style={{ background: "radial-gradient(circle at top right, #312e81, #020617)" }}
      >
        {/* Dekoratif Işıklar */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-blue-300 text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Sistem Varlığı</span>
                <Button 
                  type="text" 
                  size="small" 
                  icon={isHidden ? <EyeOutlined /> : <EyeInvisibleOutlined />} 
                  onClick={() => setIsHidden(!isHidden)}
                  className="text-white/30 hover:text-white h-5 w-5 p-0 flex items-center justify-center"
                />
              </div>
              <Title level={2} className="!text-white !m-0 !text-3xl font-black italic tracking-tighter drop-shadow-lg">
                €{formatCurrency(totalAssets)}
              </Title>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-2xl backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <BankOutlined className="text-emerald-400 text-[10px]" />
                <span className="font-bold text-[10px] text-emerald-100 italic">€{formatCurrency(bankBalance)}</span>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-2xl backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <SaveOutlined className="text-blue-300 text-[10px]" />
                <span className="font-bold text-[10px] text-blue-100 italic">€{formatCurrency(totalSavings)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black text-blue-300/60 flex items-center gap-1 uppercase tracking-widest">
                <DashboardOutlined className="text-[10px]" /> Yakıt Durumu
              </span>
              <span className="text-[11px] font-black" style={{ color: fuelColor, textShadow: `0 0 10px ${fuelColor}44` }}>
                %{remainingFuel.toFixed(0)} Enerji
              </span>
            </div>
            <Progress 
              percent={remainingFuel} 
              showInfo={false} 
              strokeColor={{ '0%': fuelColor, '100%': fuelColor + '88' }} 
              trailColor="rgba(255,255,255,0.05)" 
              strokeWidth={8}
              className="m-0 drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* Alt Stat Kutuları */}
      <div className="flex gap-2">
        <StatBox 
          id="gelir" label="Gelir" icon={ArrowUpOutlined}
          currentVal={totalIncome} prevVal={lastMonthData.income}
          colorHex="#10b981"
        />

        <StatBox 
          id="gider" label="Gider" icon={ArrowDownOutlined}
          currentVal={totalExpense} mtdVal={lastMonthData.expenseMTD}
          colorHex="#f43f5e"
        />

        <StatBox 
          id="kalan" label="Kalan" icon={ThunderboltOutlined}
          currentVal={monthlyBalance} prevVal={lastMonthData.balance}
          colorHex={monthlyBalance >= 0 ? "#3b82f6" : "#ef4444"}
        />

        {/* Bugün Kutusu - Sabit Tasarım */}
        <div className="flex-1 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-2.5 flex flex-col justify-between backdrop-blur-md">
          <div className="flex justify-between items-center opacity-70">
            <span className="text-orange-400 text-[9px] font-black uppercase tracking-tighter">Bugün</span>
            <HistoryOutlined className="text-orange-400 text-[10px]" />
          </div>
          <div className="mt-1">
            <span className="text-orange-300 text-[13px] font-black italic block leading-none">€{formatCurrency(totalToday)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;