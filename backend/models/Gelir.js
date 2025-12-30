import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTotalsFromAPI } from "../hooks/useTotals"; 

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
    const data = totals || defaultTotals;
    const { harcamalar = [], gelirler = [] } = data;

    // --- NAKİT HESAPLAMALARI ---
    // Backend enum: "nakit" olanlar
    const totalGelirNakit = gelirler
      .filter(g => g.kategori === "nakit")
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    const totalHarcamaNakit = harcamalar
      .filter(h => h.odemeYontemi === "nakit")
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    const nakitBakiye = totalGelirNakit - totalHarcamaNakit;

    // --- BANKA HESAPLAMALARI ---
    // Backend enum: "gelir", "tasarruf" ve "diğer" olanlar banka hesabına gider.
    // Sadece "nakit" OLMAYANLARI banka sayıyoruz.
    const totalGelirBanka = gelirler
      .filter(g => g.kategori !== "nakit")
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    // Harcamalarda odemeYontemi "nakit" değilse (banka ise veya eski boş veri ise) bankadır.
    const totalHarcamaBanka = harcamalar
      .filter(h => h.odemeYontemi !== "nakit")
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    const bankaBakiye = totalGelirBanka - totalHarcamaBanka;

    // Frontend'deki Toplam Gelir ve Gider kısımları (Header'daki alt kutular için)
    const computedTotalIncome = gelirler.reduce((sum, g) => sum + Number(g.miktar || 0), 0);
    const computedTotalExpense = harcamalar.reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    return {
      ...data,
      totalIncome: computedTotalIncome, // Header'daki Yeşil kutu için tüm gelirler
      totalExpense: computedTotalExpense, // Tüm giderler
      bankaBakiye,
      nakitBakiye,
      toplamVarlik: bankaBakiye + nakitBakiye,
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