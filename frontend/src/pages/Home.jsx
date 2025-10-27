import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
  return (
    <TotalsProvider>
      {/* Tam ekran düzen */}
      <div className="relative min-h-screen bg-gray-100 overflow-hidden">
        {/* Sabit Header */}
        <div className="fixed top-0 left-0 w-full z-[999]">
          <Header />
        </div>

        {/* Kaydırılabilir içerik — Header altından başlar */}
        <main className="pt-[260px] pb-[90px] overflow-y-auto h-screen z-[1]">
          <MainContent />
        </main>

        {/* Sabit Alt Navigasyon */}
        <div className="fixed bottom-0 left-0 w-full z-[998]">
          <BottomNav />
        </div>
      </div>
    </TotalsProvider>
  );
};

export default Home;
