// context/TotalsContext.jsx (GÜNCELLENMİŞ VERSİYON: bankBalance Eklendi)
import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTotalsFromAPI } from "../hooks/useTotals";
import dayjs from "dayjs"; // dayjs import edildi
import isToday from 'dayjs/plugin/isToday'; // isToday eklentisi import edildi
dayjs.extend(isToday);
const TotalsContext = createContext();
export const TotalsProvider = ({ children }) => {
  // React Query ile toplamları çekiyoruz
  const { 
    data: totals = { 
      totalIncome: 0, 
      totalExpense: 0, 
      gelirler: [], 
      harcamalar: [],
      cumulativeIncome: 0, 
      cumulativeExpense: 0, 
      bankBalance: 0, // 🆕 Default bankBalance eklendi
    }, 
    refetch 
  } = useQuery({
    queryKey: ["totals"],
    queryFn: fetchTotalsFromAPI,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
  // ✅ DÜZELTME: totalToday değeri, harcamalar listesi değiştiğinde client'ta yeniden hesaplanır.
  const totalToday = useMemo(() => {
    // Toplam harcamalar içinden sadece bugün olanları filtrele
    const todayHarcamalar = totals.harcamalar.filter(harcama => 
      dayjs(harcama.createdAt).isToday()
    );
    // Miktarları topla
    const todayTotal = todayHarcamalar.reduce((sum, harcama) => {
      // Miktarın Number olduğundan emin ol
      return sum + Number(harcama.miktar || 0);
    }, 0);
    return todayTotal;
    // Harcamalar listesi değiştiğinde (yani bir harcama güncellendiğinde/silindiğinde) tekrar çalışır.
  }, [totals.harcamalar]); 
  // Context'e aktarılacak final değerler
  const contextValue = useMemo(() => ({
    ...totals,
    totalToday, // Yeniden hesaplanan değeri kullan
    refetch, 
  }), [totals, totalToday, refetch]);
  return (
    <TotalsContext.Provider value={contextValue}>
      {children}
    </TotalsContext.Provider>
  );
};
// Hook olarak context erişimi
export const useTotalsContext = () => useContext(TotalsContext); 