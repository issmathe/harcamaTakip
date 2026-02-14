import React, { useState, useMemo, useEffect, useRef } from "react";
import { Typography } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  BankOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  HistoryOutlined,
  SaveOutlined,
  RocketOutlined
} from "@ant-design/icons";
import { useTotalsContext } from "../../context/TotalsContext";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const HeaderSpaceBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 300;
    };

    window.addEventListener("resize", resize);
    resize();

    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
      o: Math.random(),
    }));

    const draw = () => {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.z -= 0.2;
        if (star.z <= 0) star.z = canvas.width;
        const x = (star.x - canvas.width / 2) * (canvas.width / star.z) + canvas.width / 2;
        const y = (star.y - canvas.height / 2) * (canvas.width / star.z) + canvas.height / 2;
        let s = (1 - star.z / canvas.width) * 2;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.o})`;
        ctx.arc(x, y, s > 0 ? s : 0.1, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 -z-10" />;
};

const Header = () => {
  const { 
    totalIncome, totalExpense, totalToday, 
    cumulativeIncome, cumulativeExpense, bankBalance,
    harcamalar = [], gelirler = [] 
  } = useTotalsContext();
  
  const [activeState, setActiveState] = useState({ id: null, mode: 1 });

  const totalSavings = useMemo(() => {
    const hT = (harcamalar || []).filter(h => h.kategori?.toLowerCase() === "tasarruf").reduce((s, h) => s + Number(h.miktar || 0), 0);
    const gT = (gelirler || []).filter(g => g.kategori?.toLowerCase() === "tasarruf").reduce((s, g) => s + Number(g.miktar || 0), 0);
    return hT + gT;
  }, [harcamalar, gelirler]);

  const totalAssets = (cumulativeIncome || 0) - (cumulativeExpense || 0);
  const monthlyBalance = (totalIncome || 0) - (totalExpense || 0);
  
  const lastMonthData = useMemo(() => {
    const lastMonth = dayjs().subtract(1, "month");
    const todayNum = dayjs().date(); 
    const filterByDate = (list, isExp, untilToday = false) => {
      return (list || []).filter(item => {
        const d = dayjs(item.createdAt);
        const isM = d.isSame(lastMonth, "month") && d.isSame(lastMonth, "year");
        const isNotT = isExp ? item.kategori?.toLowerCase() !== "tasarruf" : true;
        const isWithin = untilToday ? d.date() <= todayNum : true;
        return isM && isNotT && isWithin;
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
  const fuelColor = remainingFuel > 50 ? "#00f2fe" : remainingFuel > 20 ? "#f9d423" : "#ff0080";

  const formatCurrency = (val) => (val || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const StatBox = ({ id, label, currentVal, prevVal, mtdVal, icon: Icon, glowColor }) => {
    const isActive = activeState.id === id;
    let displayVal = currentVal;
    let displayLabel = label;
    let boxStyle = isActive 
      ? { background: 'rgba(255, 255, 255, 0.12)', boxShadow: `0 0 15px ${glowColor}`, border: `1px solid ${glowColor}`, transform: 'scale(0.96)' } 
      : { background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255,255,255,0.08)' };

    if (isActive) {
      if (id === "gider") {
        displayVal = mtdVal;
        displayLabel = `1-${dayjs().format("DD")} ${dayjs().subtract(1, "month").format("MMM")}`;
      } else {
        displayVal = prevVal;
        displayLabel = "Geçen Ay";
      }
    }

    return (
      <div 
        onClick={() => setActiveState(prev => prev.id !== id ? { id, mode: 2 } : { id: null, mode: 1 })}
        style={boxStyle}
        className="flex-1 rounded-2xl p-2 flex flex-col justify-between transition-all duration-300 cursor-pointer backdrop-blur-md"
      >
        <Text className="text-[9px] font-bold uppercase tracking-tighter text-gray-400">{displayLabel}</Text>
        <div className="flex items-center">
          <Icon className="text-[10px] mr-1" style={{ color: glowColor }} />
          <span className="text-xs font-black italic text-white">€{formatCurrency(displayVal)}</span>
        </div>
      </div>
    );
  };

  return (
    <header className="px-4 pt-4 pb-3 bg-[#020617] sticky top-0 z-50 overflow-hidden">
      <HeaderSpaceBackground />
      
      <div 
        className="rounded-[32px] p-6 relative overflow-hidden mb-5 border border-white/10 z-10"
        style={{ 
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(15px)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4)"
        }}
      >
        <div className="relative z-20">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <RocketOutlined className="text-cyan-400 text-xs" />
                <Text className="text-cyan-400/80 text-[10px] uppercase font-black tracking-[0.2em]">Toplam Varlık</Text>
              </div>
              <Title level={2} className="!text-white !m-0 !text-3xl font-black tracking-tighter italic">
                €{formatCurrency(totalAssets)}
              </Title>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 flex items-center gap-2">
                <BankOutlined className="text-cyan-400 text-xs" />
                <span className="font-bold text-[10px] text-white">BANKA €{formatCurrency(bankBalance)}</span>
              </div>
              <div className="bg-indigo-500/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-indigo-500/20 flex items-center gap-2">
                <SaveOutlined className="text-indigo-400 text-xs" />
                <span className="font-bold text-[10px] text-indigo-100">BİRİKİM €{formatCurrency(totalSavings)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-white/50 tracking-widest flex items-center gap-2 uppercase">
                <DashboardOutlined /> Aylık Bütçe
              </span>
              <span className="text-[11px] font-black italic" style={{ color: fuelColor, textShadow: `0 0 10px ${fuelColor}` }}>
                %{remainingFuel.toFixed(0)} KALAN
              </span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                        width: `${remainingFuel}%`, 
                        backgroundColor: fuelColor,
                        boxShadow: `0 0 15px ${fuelColor}`
                    }} 
                />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 h-16 relative z-10">
        <StatBox 
          id="gelir" label="Gelir" icon={ArrowUpOutlined} glowColor="#00f2fe"
          currentVal={totalIncome} prevVal={lastMonthData.income}
        />
        <StatBox 
          id="gider" label="Gider" icon={ArrowDownOutlined} glowColor="#ff0080"
          currentVal={totalExpense} mtdVal={lastMonthData.expenseMTD}
        />
        <StatBox 
          id="kalan" label="Kalan" icon={ThunderboltOutlined} glowColor="#f9d423"
          currentVal={monthlyBalance} prevVal={lastMonthData.balance}
        />
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-2 flex flex-col justify-between backdrop-blur-md">
          <Text className="text-orange-400 text-[9px] font-bold uppercase tracking-tighter">Bugün</Text>
          <div className="flex items-center">
            <HistoryOutlined className="text-orange-400 text-[10px] mr-1" />
            <span className="text-xs font-black italic text-white">€{formatCurrency(totalToday)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;