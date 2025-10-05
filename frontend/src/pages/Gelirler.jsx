import React, { useEffect } from "react";
import Header from "../components/Home/Header.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider, useTotalsContext } from "../context/TotalsContext";

const GelirlerContent = () => {
  const { totalIncome, fetchTotals } = useTotalsContext();

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <h2 className="text-xl font-bold mb-2">Toplam Gelir</h2>
      <p className="text-lg">{totalIncome} ₺</p>
    </div>
  );
};

const Gelirler = () => {
  return (
    <TotalsProvider>
      <div className="relative min-h-screen bg-gray-100">
        <Header />

        <main className="pb-20 p-4">
          <GelirlerContent />
        </main>

        <BottomNav />
      </div>
    </TotalsProvider>
  );
};

export default Gelirler;
