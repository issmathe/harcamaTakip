import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import CategorySelect from "../components/Home/CategorySelect.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import Harcama from "../components/kaynak/Harcama.jsx";
import Gelir from "../components/kaynak/Gelir.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
  return (
    <TotalsProvider>
      <div className="relative min-h-screen bg-gray-100">
        <Header />

        <main className="pb-20">
          <CategorySelect />
          <MainContent />
          <Harcama />
          <Gelir />
        </main>

        <BottomNav />
      </div>
    </TotalsProvider>
  );
};

export default Home;
