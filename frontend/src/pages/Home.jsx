import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import CategorySelect from "../components/Home/CategorySelect.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import Harcama from "../components/Harcama.jsx";
import Gelir from "../components/Gelir.jsx";
import { useTotals } from "../hooks/useTotals"; // Hook'u buraya taşıdık

const Home = () => {
  // fetchTotals'ı hook'tan alıyoruz
  const { totalIncome, totalExpense, totalToday, fetchTotals } = useTotals(); 

  return (
    <div>
      <Header
        totalToday={totalToday}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />
      <MainContent />
      <CategorySelect />
      <BottomNav />
      {/* Harcama bileşenine fetchTotals'ı prop olarak iletiyoruz */}
      <Harcama onHarcamaChange={fetchTotals} /> 
      {/* Gelir bileşenine de iletiyoruz (ileride gerekebilir) */}
      <Gelir onGelirChange={fetchTotals} /> 
    </div>
  );
};

export default Home;