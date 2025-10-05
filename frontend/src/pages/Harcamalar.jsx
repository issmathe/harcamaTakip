import React, { useEffect } from "react";
import Header from "../components/Home/Header.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider, useTotalsContext } from "../context/TotalsContext";

const HarcamalarContent = () => {
  const { totalExpense, fetchTotals } = useTotalsContext();

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <h2 className="text-xl font-bold mb-2">Toplam Harcama</h2>
      <p className="text-lg">{totalExpense} ₺</p>
    </div>
  );
};

const Harcamalar = () => {
  return (
    <TotalsProvider>
      <div className="relative min-h-screen bg-gray-100">
        <Header />

        <main className="pb-20 p-4">
          <HarcamalarContent />
        </main>

        <BottomNav />
      </div>
    </TotalsProvider>
  );
};

export default Harcamalar;
