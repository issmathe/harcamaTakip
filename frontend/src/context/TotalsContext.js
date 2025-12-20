// context/TotalsContext.jsx (SADELEŞTİRİLMİŞ VERSİYON)
import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTotalsFromAPI } from "../hooks/useTotals"; 
import dayjs from "dayjs";
import isToday from 'dayjs/plugin/isToday';
dayjs.extend(isToday);

const TotalsContext = createContext();

export const TotalsProvider = ({ children }) => {
  // React Query ile verileri çekiyoruz
  const { 
    data: totals = { 
      totalIncome: 0, 
      totalExpense: 0, 
      gelirler: [], 
      harcamalar: [],
      cumulativeIncome: 0, 
      cumulativeExpense: 0, 
      bankBalance: 0, 
    }, 
    refetch 
  } = useQuery({
    queryKey: ["totals"],
    queryFn: fetchTotalsFromAPI,
    staleTime: 1000 * 60 * 5,
  });

  // Günlük toplam harcama hesaplaması
  const totalToday = useMemo(() => {
    if (!totals.harcamalar) return 0;
    
    const todayTotal = totals.harcamalar
      .filter(harcama => dayjs(harcama.createdAt).isToday())
      .reduce((sum, harcama) => sum + Number(harcama.miktar || 0), 0);
      
    return todayTotal;
  }, [totals.harcamalar]); 

  // Context'e aktarılacak değerler
  const contextValue = useMemo(() => ({
    ...totals,
    totalToday,
    refetch,
  }), [totals, totalToday, refetch]);

  return (
    <TotalsContext.Provider value={contextValue}>
      {children}
    </TotalsContext.Provider>
  );
};

export const useTotalsContext = () => useContext(TotalsContext);