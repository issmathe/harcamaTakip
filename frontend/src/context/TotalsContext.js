// context/TotalsContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { fetchTotalsFromAPI } from "../hooks/useTotals";

const TotalsContext = createContext();

export const TotalsProvider = ({ children }) => {
  const [totals, setTotals] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalToday: 0,
    gelirler: [],
    harcamalar: []
  });

  const fetchTotals = async () => {
    const data = await fetchTotalsFromAPI();
    setTotals(data);
  };

  useEffect(() => {
    fetchTotals();
  }, []);

  return (
    <TotalsContext.Provider value={{ ...totals, fetchTotals }}>
      {children}
    </TotalsContext.Provider>
  );
};

export const useTotalsContext = () => useContext(TotalsContext);
