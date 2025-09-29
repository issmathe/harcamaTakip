import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import CategorySelect from "../components/Home/CategorySelect.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import Harcama from "../components/Harcama.jsx";
import Gelir from "../components/Gelir.jsx";
import { useTotals } from "../hooks/useTotals";

const Home = () => {
  const { totalIncome, totalExpense, totalToday } = useTotals();

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
      <Harcama />
      <Gelir />
    </div>
  );
};

export default Home;
