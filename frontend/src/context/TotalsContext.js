// context/TotalsContext.jsx (DÜZELTİLMİŞ)

import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTotalsFromAPI } from "../hooks/useTotals";

const TotalsContext = createContext();

export const TotalsProvider = ({ children }) => {
  // React Query ile toplamları çekiyoruz
  const { data: totals = { totalIncome: 0, totalExpense: 0, totalToday: 0, gelirler: [], harcamalar: [] }, refetch } = useQuery({
    queryKey: ["totals"],
    queryFn: fetchTotalsFromAPI,
    staleTime: 1000 * 60 * 5, // 5 dakika boyunca cache’den gelir
    cacheTime: 1000 * 60 * 30, // 30 dakika boyunca cache saklanır
  });

  // 👇 DÜZELTME: Context'e aktarırken key adını 'refetch' olarak değiştiriyoruz
  return (
    <TotalsContext.Provider value={{ ...totals, refetch: refetch }}>
      {children}
    </TotalsContext.Provider>
  );
};

// Hook olarak context erişimi
export const useTotalsContext = () => useContext(TotalsContext);