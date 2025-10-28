import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
  return (
    <TotalsProvider>
      {/* Sabit ekran, taş gibi layout */}
      <div className="fixed inset-0 flex flex-col bg-gray-100 overflow-hidden touch-none select-none">
        {/* Üst sabit header */}
        <div className="z-[999]">
          <Header />
        </div>

        {/* Orta alan — scroll olmasın */}
        <main className="flex-1 flex justify-center items-center relative z-[1]">
          <MainContent />
        </main>

        {/* Alt sabit navigasyon */}
        <div className="z-[998]">
          <BottomNav />
        </div>
      </div>
    </TotalsProvider>
  );
};

export default Home;
