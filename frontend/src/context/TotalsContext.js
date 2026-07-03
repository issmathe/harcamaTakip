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

    // 1. Bu Ayın Gelirleri
    const totalIncome = hamGelirler
      .filter(g => {
        const d = dayjs(g.createdAt);
        const kat = g.kategori?.toLowerCase();
        return d.isSame(now, "month") && d.isSame(now, "year") && 
               kat !== "tasarruf" && kat !== "birikim" && 
               isPastOrPresent(g.createdAt);
      })
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    // 2. Bu Ayın Giderleri
    const totalExpense = hamHarcamalar
      .filter(h => {
        const d = dayjs(h.createdAt);
        return d.isSame(now, "month") && d.isSame(now, "year") && 
               isPastOrPresent(h.createdAt);
      })
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    // 3. Bugünün Toplam Harcaması
    const totalToday = hamHarcamalar
      .filter(h => dayjs(h.createdAt).isSame(startOfToday, "day"))
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    // 4. Kümülatif Hesaplamalar
    const cumulativeExpense = hamHarcamalar
      .filter(h => isPastOrPresent(h.createdAt))
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    // BANKADAN ÇIKAN HARCAMALAR
    const totalExitFromBank = hamHarcamalar
      .filter(h => isPastOrPresent(h.createdAt) && (!h.harcamaKaynagi || h.harcamaKaynagi === "Gelir"))
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    // BANKAYA GİREN PARA (Saf gelirler ve transfer dışı ekstralar)
    const cumulativeOnlyIncome = hamGelirler
      .filter(g => {
        const kat = g.kategori?.toLowerCase();
        const isTransfer = g.not && g.not.includes("TRF_");
        return kat !== "tasarruf" && kat !== "birikim" && !isTransfer && isPastOrPresent(g.createdAt);
      })
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    // 🛠️ DÜZELTME: BANKADAN BAŞKA HAVUZLARA GİDEN TRANSFERLER (Banka bakiyesini azaltmalı)
    const bankadanGidenTransferler = hamGelirler
      .filter(g => {
        const kat = g.kategori?.toLowerCase();
        const isTransfer = g.not && g.not.includes("TRF_");
        return kat === "gelir" && isTransfer && g.miktar < 0 && isPastOrPresent(g.createdAt);
      })
      .reduce((sum, g) => sum + Math.abs(g.miktar), 0);

    // 🛠️ DÜZELTME: DİĞER HAVUZLARDAN BANKAYA GERİ GELEN TRANSFERLER (Banka bakiyesini artırmalı)
    const bankayaGelenTransferler = hamGelirler
      .filter(g => {
        const kat = g.kategori?.toLowerCase();
        const isTransfer = g.not && g.not.includes("TRF_");
        return kat === "gelir" && isTransfer && g.miktar > 0 && isPastOrPresent(g.createdAt);
      })
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    // Tüm zamanların tüm gelirleri
    const cumulativeTotalIncome = hamGelirler
      .filter(g => isPastOrPresent(g.createdAt))
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

    // 🛠️ YENİ BANKA FORMÜLÜ: (Giren Gelirler + Gelen Transferler) - Harcamalar - Giden Transferler
    const bankBalance = (cumulativeOnlyIncome + bankayaGelenTransferler) - totalExitFromBank - bankadanGidenTransferler;
    
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