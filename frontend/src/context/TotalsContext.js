// context/TotalsContext.jsx (GÜNCELLENMİŞ VERSİYON: Kaynak Bakiyeleri Eklendi)
import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
// fetchTotalsFromAPI'nin sunucudan artık salaryBalance ve savingsBalance 
// gibi alanları da getirdiğini varsayıyoruz.
import { fetchTotalsFromAPI } from "../hooks/useTotals"; 
import dayjs from "dayjs";
import isToday from 'dayjs/plugin/isToday';
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
      bankBalance: 0, 
      salaryBalance: 0, // 🆕 Maaş Bakiyesi
      savingsBalance: 0, // 🆕 Tasarruf Bakiyesi
    }, 
    refetch 
  } = useQuery({
    queryKey: ["totals"],
    queryFn: fetchTotalsFromAPI,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  // totalToday, harcamalar listesi değiştiğinde client'ta yeniden hesaplanır.
  const totalToday = useMemo(() => {
    // Toplam harcamalar içinden sadece bugün olanları filtrele
    const todayHarcamalar = totals.harcamalar.filter(harcama => 
      dayjs(harcama.createdAt).isToday()
    );
    // Miktarları topla
    const todayTotal = todayHarcamalar.reduce((sum, harcama) => {
      return sum + Number(harcama.miktar || 0);
    }, 0);
    return todayTotal;
  }, [totals.harcamalar]); 

  // Context'e aktarılacak final değerler
  const contextValue = useMemo(() => ({
    ...totals,
    totalToday, // Yeniden hesaplanan değeri kullan
    refetch,
    // Yeni bakiyeleri de context'e ekliyoruz
    salaryBalance: totals.salaryBalance,
    savingsBalance: totals.savingsBalance,
  }), [totals, totalToday, refetch]);

  return (
    <TotalsContext.Provider value={contextValue}>
      {children}
    </TotalsContext.Provider>
  );
};

// Hook olarak context erişimi
export const useTotalsContext = () => useContext(TotalsContext);