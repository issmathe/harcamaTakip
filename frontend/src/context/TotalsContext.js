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

    // 1. Bu Ayın Gelirleri (Sadece 'gelir' kategorisi)
    const totalIncome = (totals.gelirler || [])
      .filter(g => {
        const d = dayjs(g.createdAt);
        return d.isSame(now, "month") && d.isSame(now, "year") && g.kategori?.toLowerCase() === "gelir";
      })
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    // 2. Bu Ayın Giderleri (Tasarruf kategorisi HARİÇ - Gider kutusuna yansımaz)
    const totalExpense = (totals.harcamalar || [])
      .filter(h => {
        const d = dayjs(h.createdAt);
        const isNotSavings = h.kategori?.toLowerCase() !== "tasarruf";
        return d.isSame(now, "month") && d.isSame(now, "year") && isNotSavings;
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
    
    // Sadece gerçek harcamalar (Gider kutusu için)
    const cumulativeExpense = (totals.harcamalar || [])
      .filter(h => h.kategori?.toLowerCase() !== "tasarruf")
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    // Bankadan çıkan her şey (Normal Harcamalar + Tasarruflar)
    const totalExitFromBank = (totals.harcamalar || [])
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    // Bankaya giren sadece gerçek gelirler (Tasarruflar gelir olarak eklenmişse onları burada saymıyoruz)
    const cumulativeOnlyIncome = (totals.gelirler || [])
      .filter(g => g.kategori?.toLowerCase() === "gelir")
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    // Tüm zamanların tüm gelirleri (Portföy için: Gelir + Tasarruf Gelirleri)
    const cumulativeTotalIncome = (totals.gelirler || [])
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    // Banka Bakiyesi: Sadece 'Gelir' kalemleri - (Harcamalar + Tasarruflar)
    // Bu sayede tasarruf eklediğinde bankadaki paran azalır.
    const bankBalance = cumulativeOnlyIncome - totalExitFromBank;
    
    // Kümülatif Bakiye (Portföy): Tüm Gelirler - Sadece Gerçek Giderler
    // Tasarruflar "harcama" olmadığı için portföyü azaltmaz, sadece bankadan cüzdana/fona geçmiş olur.
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