import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTotalsFromAPI } from "../hooks/useTotals"; 

const TotalsContext = createContext();

// UYARI ALMAMAK İÇİN: Sabit objeyi fonksiyonun TAMAMEN dışına yazıyoruz.
const defaultTotals = {
  totalIncome: 0, 
  totalExpense: 0, 
  monthlyTransfers: 0,
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

  // totals veya refetch değiştiğinde güncellenir.
  // defaultTotals dışarıda olduğu için bağımlılık dizisine eklemeye gerek kalmaz.
  const contextValue = useMemo(() => {
    return {
      ...(totals || defaultTotals),
      refetch,
    };
  }, [totals, refetch]);

  return (
    <TotalsContext.Provider value={contextValue}>
      {children}
    </TotalsContext.Provider>
  );
};

export const useTotalsContext = () => useContext(TotalsContext);