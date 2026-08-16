import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Typography, Progress, Button } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  BankOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  HistoryOutlined,
  CalendarOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  FormOutlined,
  StockOutlined,
  RightOutlined
} from "@ant-design/icons";
import { useTotalsContext } from "../../context/TotalsContext";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    totalIncome,
    totalExpense,
    totalToday,
    bankBalance,
    harcamalar = [],
    gelirler = []
  } = useTotalsContext();

  const [activeState, setActiveState] = useState({
    id: null,
    mode: 1
  });

  const [isHidden, setIsHidden] = useState(false);

  // Birikim Kırılımları
  const { totalSavings, tradeRepublicBalance, wiseBalance, cashBalance } = useMemo(() => {
    let trAcc = 0;
    let wiseAcc = 0;
    let cashAcc = 0;

    const gTasarruf = (gelirler || [])
      .filter((g) => g && (g.kategori?.toLowerCase() === "tasarruf" || g.kategori?.toLowerCase() === "birikim"))
      .map((s) => ({ ...s, tip: "ARTIŞ" }));

    const hTasarruf = (harcamalar || [])
      .filter((h) => h && (h.harcamaKaynagi === "Birikim" || h.kategori?.toLowerCase() === "tasarruf"))
      .map((s) => ({ ...s, tip: "AZALIŞ" }));

    [...gTasarruf, ...hTasarruf].forEach((item) => {
      const miktarNum = Number(item.miktar || 0);
      const rawAlt = item.birikimHesabi || item.altKategori || item.hedefAltKategori || item.kaynakAltKategori || "";
      const hedef = rawAlt.toString().trim().toLowerCase();

      if (item.tip === "ARTIŞ") {
        if (hedef === "trade republic") trAcc += miktarNum;
        else if (hedef === "wise") wiseAcc += miktarNum;
        else if (hedef === "nakit" || hedef === "ev") cashAcc += miktarNum;
      } else {
        if (hedef === "trade republic") trAcc -= miktarNum;
        else if (hedef === "wise") wiseAcc -= miktarNum;
        else if (hedef === "nakit" || hedef === "ev") cashAcc -= miktarNum;
      }
    });

    const netSavings = trAcc + wiseAcc + cashAcc;

    return {
      totalSavings: netSavings,
      tradeRepublicBalance: trAcc,
      wiseBalance: wiseAcc,
      cashBalance: cashAcc
    };
  }, [harcamalar, gelirler]);

  // TOPLAM VARLIK DÜZELTMESİ: Banka + Bütün Birikimler
  const totalAssets = (Number(bankBalance) || 0) + (Number(totalSavings) || 0);
  const monthlyBalance = (totalIncome || 0) - (totalExpense || 0);

  const lastMonthData = useMemo(() => {
    const lastMonth = dayjs().subtract(1, "month");
    const todayNum = dayjs().date();

    const filterByDate = (list, isExpense, untilToday = false) => {
      return (list || [])
        .filter((item) => {
          const d = dayjs(item.createdAt);
          const isCorrectMonth = d.isSame(lastMonth, "month") && d.isSame(lastMonth, "year");
          const isNotTasarruf = isExpense ? item.kategori?.toLowerCase() !== "tasarruf" : true;
          const isGelir = !isExpense ? item.kategori?.toLowerCase() === "gelir" : true;
          const isWithinDay = untilToday ? d.date() <= todayNum : true;

          return isCorrectMonth && isNotTasarruf && isGelir && isWithinDay;
        })
        .reduce((sum, i) => sum + Number(i.miktar || 0), 0);
    };

    return {
      income: filterByDate(gelirler, false),
      expenseMTD: filterByDate(harcamalar, true, true),
      balance: filterByDate(gelirler, false) - filterByDate(harcamalar, true)
    };
  }, [harcamalar, gelirler]);

  const spendingPercentage = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0;
  const remainingFuel = Math.max(0, 100 - spendingPercentage);
  const remainingMoney = (totalIncome || 0) - (totalExpense || 0);

  const fuelColor = remainingFuel > 50 ? "#10b981" : remainingFuel > 20 ? "#f59e0b" : "#ef4444";

  const formatCurrency = (val) => {
    if (isHidden) return "****";
    return (val || 0).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatBarMoney = (val) => {
    if (isHidden) return "****";
    return Math.round(val || 0).toLocaleString("tr-TR");
  };

  const handleBoxClick = (id) => {
    setActiveState((prev) => {
      if (prev.id !== id) return { id, mode: 2 };
      return { id: null, mode: 1 };
    });
  };

  const StatBox = ({ id, label, currentVal, prevVal, mtdVal, colorClass, borderClass, icon: Icon }) => {
    const isActive = activeState.id === id;
    let displayVal = currentVal;
    let displayLabel = label;
    let bgColor = colorClass + " shadow-sm";

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
          <Text className={`${isActive ? "!text-gray-300" : ""} text-[10px] font-bold uppercase`}>
            {displayLabel}
          </Text>
          {isActive && id === "gider" && <CalendarOutlined className="text-[10px] text-indigo-300" />}
        </div>
        <div className={`flex items-center ${isActive ? "text-white" : ""}`}>
          <Icon className="text-xs mr-1" />
          <span className="text-sm font-black italic">€{formatCurrency(displayVal)}</span>
        </div>
      </div>
    );
  };

  return (
    <header className="px-4 pt-3 pb-3 bg-white sticky top-0 z-10 shadow-sm">
      {/* ANA VARLIK KARTI */}
      <div
        className="rounded-3xl p-3.5 shadow-xl text-white relative overflow-hidden mb-3"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" }}
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Text className="!text-indigo-200 text-[10px] uppercase font-bold tracking-widest">
                  Toplam Varlık
                </Text>
                <Button
                  type="text"
                  size="small"
                  icon={isHidden ? <EyeOutlined className="text-white/50 text-xs" /> : <EyeInvisibleOutlined className="text-white/50 text-xs" />}
                  onClick={() => setIsHidden(!isHidden)}
                  className="h-4 w-4 flex items-center justify-center hover:bg-white/10"
                />
                <Button
                  type="text"
                  size="small"
                  icon={<FormOutlined className="text-white/70 hover:text-white text-xs" />}
                  onClick={() => navigate("/notlar")}
                  className="h-4 w-4 flex items-center justify-center hover:bg-white/10"
                  title="Notlar"
                />
              </div>

              <Title level={2} className="!text-white !m-0 !text-2xl font-black italic">
                €{formatCurrency(totalAssets)}
              </Title>
            </div>

            {/* SAĞ ÜST: BANKA VE TRADE REPUBLIC */}
            <div className="flex flex-col items-end gap-1">
              <div className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/15 flex items-center gap-1">
                <BankOutlined className="text-emerald-400 text-[10px]" />
                <span className="font-bold text-[9px] tracking-tight">
                  banka €{formatCurrency(bankBalance)}
                </span>
              </div>

              <div className="bg-emerald-500/15 backdrop-blur-md px-2 py-0.5 rounded-lg border border-emerald-400/20 flex items-center gap-1">
                <StockOutlined className="text-emerald-300 text-[10px]" />
                <span className="font-bold text-[9px] text-emerald-100 tracking-tight">
                  trade rep. €{formatCurrency(tradeRepublicBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* DİĞER HESAPLAR VE DİNAMİK AYRINTI/GERİ BUTONU */}
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-medium text-indigo-100">
            <div className="flex items-center gap-2">
              <span>Wise: <strong className="text-white font-mono">€{formatCurrency(wiseBalance)}</strong></span>
              <span className="text-indigo-400">•</span>
              <span>Nakit: <strong className="text-white font-mono">€{formatCurrency(cashBalance)}</strong></span>
              <span className="text-indigo-400">•</span>
              <span>Birikim: <strong className="text-emerald-300 font-mono">€{formatCurrency(totalSavings)}</strong></span>
            </div>

            <button
              onClick={() => {
                if (location.pathname === "/birikim") {
                  navigate("/");
                } else {
                  navigate("/birikim");
                }
              }}
              className="bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white px-2 py-0.5 rounded-md flex items-center gap-0.5 font-bold text-[9px] whitespace-nowrap ml-1 border border-white/20"
            >
              <span>{location.pathname === "/birikim" ? "Geri" : "Ayrıntı"}</span>
              <RightOutlined className={`text-[7px] transition-transform ${location.pathname === "/birikim" ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* AYLIK BÜTÇE */}
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-indigo-200 flex items-center gap-1">
                <DashboardOutlined /> AYLIK BÜTÇE
              </span>
              <span className="text-xs font-black" style={{ color: fuelColor }}>
                %{remainingFuel.toFixed(0)} Kalan
              </span>
            </div>

            {/* BÜTÇE BAR */}
            <div className="relative">
              <Progress
                percent={remainingFuel}
                showInfo={false}
                strokeColor={fuelColor}
                trailColor="rgba(0,0,0,0.28)"
                size={{ strokeWidth: 8 }}
              />

              {/* KALAN PARA */}
              {remainingFuel > 8 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `${Math.min(Math.max(remainingFuel - 1, 12), 98)}%`,
                    top: "50%",
                    transform: "translate(-100%, -50%)",
                    lineHeight: "10px"
                  }}
                >
                  <span
                    className="text-[9px] font-black text-white whitespace-nowrap"
                    style={{
                      textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                      letterSpacing: "-0.2px"
                    }}
                  >
                    €{formatBarMoney(remainingMoney)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ALT İSTATİSTİKLER */}
      <div className="flex gap-2 h-16">
        <StatBox
          id="gelir"
          label="Gelir"
          icon={ArrowUpOutlined}
          currentVal={totalIncome}
          prevVal={lastMonthData.income}
          colorClass="bg-emerald-50 text-emerald-700"
          borderClass="border-emerald-500"
        />

        <StatBox
          id="gider"
          label="Gider"
          icon={ArrowDownOutlined}
          currentVal={totalExpense}
          mtdVal={lastMonthData.expenseMTD}
          colorClass="bg-rose-50 text-rose-700"
          borderClass="border-rose-500"
        />

        <StatBox
          id="kalan"
          label="Kalan"
          icon={ThunderboltOutlined}
          currentVal={monthlyBalance}
          prevVal={lastMonthData.balance}
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