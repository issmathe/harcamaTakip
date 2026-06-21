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

    const hamGelirler = totals.gelirler || (totals.data && totals.data.gelirler) || [];
    const hamHarcamalar = totals.harcamalar || (totals.data && totals.data.harcamalar) || [];

    // 🚀 DÜZELTME 1: Kategori bağımsız, transfer olmayan TÜM bu ayın gelirlerini topla
    const totalIncome = hamGelirler
      .filter(g => {
        const d = dayjs(g.createdAt);
        const isTransfer = g.not && g.not.includes("| ID:TRF_");
        return d.isSame(now, "month") && d.isSame(now, "year") && 
               !isTransfer && 
               isPastOrPresent(g.createdAt);
      })
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    const totalExpense = hamHarcamalar
      .filter(h => {
        const d = dayjs(h.createdAt);
        return d.isSame(now, "month") && d.isSame(now, "year") && 
               isPastOrPresent(h.createdAt);
      })
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    const totalToday = hamHarcamalar
      .filter(h => dayjs(h.createdAt).isSame(startOfToday, "day"))
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    const cumulativeExpense = hamHarcamalar
      .filter(h => isPastOrPresent(h.createdAt))
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    const totalExitFromBank = hamHarcamalar
      .filter(h => isPastOrPresent(h.createdAt) && (!h.harcamaKaynagi || h.harcamaKaynagi === "Gelir"))
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    // 🚀 DÜZELTME 2: Bankaya giren para transfer dışındaki tüm ana gelir kategorileridir (Ekstra, Gelir vb.)
    const cumulativeOnlyIncome = hamGelirler
      .filter(g => {
        const isTransfer = g.not && g.not.includes("| ID:TRF_");
        return !isTransfer && isPastOrPresent(g.createdAt);
      })
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    const cumulativeTotalIncome = hamGelirler
      .filter(g => isPastOrPresent(g.createdAt))
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    const bankBalance = cumulativeOnlyIncome - totalExitFromBank;
    const cumulativeBalance = cumulativeTotalIncome - cumulativeExpense;

    return {
      ...totals,
      gelirler: hamGelirler,     
      harcamalar: hamHarcamalar, 
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