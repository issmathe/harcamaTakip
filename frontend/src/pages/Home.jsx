import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
  return (
    <TotalsProvider>
      <div className="relative min-h-screen bg-gray-100 overflow-hidden">
        {/* Üstte sabit kalan header */}
        <div className="sticky top-0 z-[999]">
          <Header />
        </div>

        {/* Ana içerik */}
        <main className="flex-1 flex justify-center pt-16 pb-24 px-4 relative z-[1]">
          <MainContent />
        </main>

        {/* Altta sabit kalan navigasyon */}
        <div className="fixed bottom-0 left-0 w-full z-[998]">
          <BottomNav />
        </div>
      </div>
    </TotalsProvider>
  );
};

export default Home;
