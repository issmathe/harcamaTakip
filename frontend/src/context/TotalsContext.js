import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTotalsFromAPI } from "../hooks/useTotals"; 
import dayjs from "dayjs";

const TotalsContext = createContext();

const defaultTotals = {
  totalIncome: 0, 
  totalExpense: 0, 
  cumulativeIncome: 0, 
  cumulativeExpense: 0, 
  bankBalance: 0, 
  totalToday: 0,
  gelirler: [],
  harcamalar: []
};

export const TotalsProvider = ({ children }) => {
  const { data: totals, refetch } = useQuery({
    queryKey: ["totals"],
    queryFn: fetchTotalsFromAPI,
    staleTime: 1000 * 60 * 5,
  });

  const contextValue = useMemo(() => {
    if (!totals) return { ...defaultTotals, refetch };

    const now = dayjs();
    const startOfToday = now.startOf("day");

    const isPastOrPresent = (date) => !dayjs(date).isAfter(now);

    // 1. Bu Ayın Gelirleri (Sadece gerçek 'gelir' kategorisi, 'transfer' hariç)
    const totalIncome = (totals.gelirler || [])
      .filter(g => {
        const d = dayjs(g.createdAt);
        return d.isSame(now, "month") && d.isSame(now, "year") && 
               g.kategori?.toLowerCase() === "gelir" && 
               isPastOrPresent(g.createdAt);
      })
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    // 2. Bu Ayın Giderleri (Tasarruf HARİÇ)
    const totalExpense = (totals.harcamalar || [])
      .filter(h => {
        const d = dayjs(h.createdAt);
        const isNotSavings = h.kategori?.toLowerCase() !== "tasarruf";
        return d.isSame(now, "month") && d.isSame(now, "year") && 
               isNotSavings && 
               isPastOrPresent(h.createdAt);
      })
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    // 3. Bugünün Toplam Harcaması (Tasarruf hariç)
    const totalToday = (totals.harcamalar || [])
      .filter(h => {
        const isToday = dayjs(h.createdAt).isSame(startOfToday, "day");
        const isNotSavings = h.kategori?.toLowerCase() !== "tasarruf";
        return isToday && isNotSavings;
      })
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    // 4. Kümülatif Hesaplamalar

    const cumulativeExpense = (totals.harcamalar || [])
      .filter(h => h.kategori?.toLowerCase() !== "tasarruf" && isPastOrPresent(h.createdAt))
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    const totalExitFromBank = (totals.harcamalar || [])
      .filter(h => isPastOrPresent(h.createdAt))
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    // Bankaya giren para sadece gerçek gelirlerdir ('transfer' veya 'tasarruf' girişleri banka bakiyesini yapay şişirmesin)
    const cumulativeOnlyIncome = (totals.gelirler || [])
      .filter(g => g.kategori?.toLowerCase() === "gelir" && isPastOrPresent(g.createdAt))
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    // Tüm zamanların tüm gelirleri (Gelir + Tasarruf + Transferlerin net etkisi sıfırdır)
    const cumulativeTotalIncome = (totals.gelirler || [])
      .filter(g => isPastOrPresent(g.createdAt))
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    const bankBalance = cumulativeOnlyIncome - totalExitFromBank;
    const cumulativeBalance = cumulativeTotalIncome - cumulativeExpense;

    return {
      ...totals,
      totalIncome,
      totalExpense,
      totalToday,
      cumulativeIncome: cumulativeTotalIncome, 
      cumulativeExpense,
      bankBalance,
      cumulativeBalance,
      refetch,
    };
  }, [totals, refetch]);

  return (
    <TotalsContext.Provider value={contextValue}>
      {children}
    </TotalsContext.Provider>
  );
};

export const useTotalsContext = () => {
  const context = useContext(TotalsContext);
  if (!context) {
    throw new Error("useTotalsContext bir TotalsProvider içinde kullanılmalıdır.");
  }
  return context;
};