import React, { useState, useEffect } from "react";
import { Typography } from "antd";
import {
  ClockCircleOutlined,
  ThunderboltFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BankFilled
} from "@ant-design/icons";
import { useTotalsContext } from "../../context/TotalsContext";

const { Text } = Typography;

const Header = () => {
  const { 
    totalIncome, totalExpense, totalToday, 
    cumulativeIncome, cumulativeExpense, bankBalance, monthlyTransfers 
  } = useTotalsContext();
  
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- HESAPLAMALAR ---
  const cumulativeBalance = (cumulativeIncome || 0) - (cumulativeExpense || 0);
  const monthlyBalance = (totalIncome || 0) - ((totalExpense || 0) + (monthlyTransfers || 0));
  
  const incomeVal = totalIncome || 1;
  const percentRemaining = Math.max(0, Math.min(100, (monthlyBalance / incomeVal) * 100));
  const percentSpent = 100 - percentRemaining;

  const format = (num) => (num || 0).toLocaleString("tr-TR", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  return (
    <header className="px-5 py-5 bg-[#1e293b] sticky top-0 z-10 rounded-b-[40px] shadow-[0_20px_50px_rgba(15,23,42,0.6)] border-b border-white/10 h-auto overflow-hidden">
      
      {/* Arka Plan Dekoratif Işıklar */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/15 blur-[60px] rounded-full" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/15 blur-[60px] rounded-full" />

      {/* Üst Panel */}
      <div className="relative flex justify-between items-center mb-5 text-slate-200">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/10 shadow-xl">
          <ClockCircleOutlined className="text-cyan-400 animate-pulse text-xs" />
          <Text className="!text-white font-mono text-[13px] font-black tracking-widest">
            {time.toLocaleTimeString('tr-TR')}
          </Text>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <BankFilled className="text-indigo-400 text-xs" />
            <Text className="!text-slate-400 text-[10px] uppercase font-black tracking-tighter">Banka Mevduat</Text>
          </div>
          <Text className={`font-mono text-[15px] font-black drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] ${bankBalance >= 0 ? '!text-emerald-400' : '!text-rose-400'}`}>
            €{format(bankBalance)}
          </Text>
        </div>
      </div>

      {/* İlerleme Tankı Alanı */}
      <div className="relative bg-white/5 p-4 rounded-[30px] border border-white/5 shadow-inner">
        <div className="grid grid-cols-12 gap-2 items-center">
          
          <div className="col-span-3">
            <div className="flex items-center gap-1 mb-0.5">
              <ArrowUpOutlined className="text-emerald-500 text-[10px]" />
              <Text className="text-[9px] text-slate-500 uppercase font-black">Gelir</Text>
            </div>
            <Text className="!text-white text-[12px] font-bold italic">€{format(totalIncome)}</Text>
          </div>

          {/* Dinamik Tank */}
          <div className="col-span-6 relative">
            <div className="relative w-full h-10 bg-slate-750/90 rounded-2xl border border-white/10 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] flex items-center">
              
              {/* Harcanan Yüzde (Sağdaki Boş Alanda) */}
              <div 
                className="absolute right-3 z-20 pointer-events-none transition-all duration-1000"
                style={{ opacity: percentSpent < 10 ? 0 : 1 }}
              >
                <Text className="!text-slate-500 text-[10px] font-black italic">%{percentSpent.toFixed(0)}</Text>
              </div>

              {/* Kalan Yüzde (Soldaki Renkli Sıvıda) */}
              <div 
                className={`absolute left-0 top-0 h-full transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1) flex items-center justify-end pr-3 ${
                  monthlyBalance < 0 
                  ? 'bg-gradient-to-r from-rose-600 to-red-500' 
                  : 'bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-600'
                }`}
                style={{ width: `${percentRemaining}%` }}
              >
                {/* Dalga Efekti */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] animate-wave-flow" />
                
                <Text className={`z-20 !text-white text-[10px] font-black drop-shadow-md italic ${percentRemaining < 10 ? 'opacity-0' : 'opacity-100'}`}>
                  %{percentRemaining.toFixed(0)}
                </Text>
              </div>
            </div>
            
            {/* Alt Değer */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full">
              <Text className={`font-black text-[14px] whitespace-nowrap drop-shadow-[0_0_10px_rgba(103,232,249,0.4)] ${monthlyBalance >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
                €{format(monthlyBalance)}
              </Text>
            </div>
          </div>

          <div className="col-span-3 text-right">
            <div className="flex items-center justify-end gap-1 mb-0.5">
              <Text className="text-[9px] text-slate-500 uppercase font-black">Gider</Text>
              <ArrowDownOutlined className="text-rose-500 text-[10px]" />
            </div>
            <Text className="!text-white text-[12px] font-bold block italic">€{format(totalExpense)}</Text>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center px-1">
        <div>
          <Text className="text-[10px] text-indigo-300 font-black uppercase tracking-[3px] block mb-1">Net Varlık</Text>
          <Text className="!text-white text-2xl font-black tracking-tighter leading-none">
            €{format(cumulativeBalance)}
          </Text>
        </div>
        
        <div className="flex items-center gap-2 bg-amber-400/10 px-4 py-2 rounded-2xl border border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
          <ThunderboltFilled className="text-amber-400 text-xs animate-bounce" />
          <div className="flex flex-col">
            <Text className="!text-amber-200 text-[11px] font-black leading-none uppercase">Bugün</Text>
            <Text className="!text-white text-[12px] font-mono font-bold leading-none mt-1">€{format(totalToday)}</Text>
          </div>
        </div>
      </div>

      <style jsx>{`
        header {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }
        @keyframes wave-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-wave-flow {
          width: 200%;
          animation: wave-flow 3s linear infinite;
        }
      `}</style>
    </header>
  );
};

export default Header;