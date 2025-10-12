import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
  return (
    <TotalsProvider>
      {/* Sabit ekran düzeni */}
      <div className="relative h-screen w-screen bg-gray-100 overflow-hidden touch-none select-none">

        {/* Üst sabit header */}
        <div className="fixed top-0 left-0 w-full z-[999]">
          <Header />
        </div>

        {/* Orta alan — scroll veya kaydırma yok */}
        <main className="absolute top-[80px] bottom-[80px] left-0 right-0 flex justify-center items-center overflow-hidden z-[1]">
          <MainContent />
        </main>

        {/* Alt sabit navigasyon */}
        <div className="fixed bottom-0 left-0 w-full z-[998]">
          <BottomNav />
        </div>
      </div>
    </TotalsProvider>
  );
};

export default Home;
