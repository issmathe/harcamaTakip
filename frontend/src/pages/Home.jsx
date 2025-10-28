import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
  return (
    <TotalsProvider>
      {/* Ekranı tamamen kaplayan, mobil uyumlu sabit layout */}
      <div className="fixed inset-0 flex flex-col bg-gray-100 select-none overflow-hidden">
        
        {/* Üst sabit Header */}
        <header className="fixed top-0 left-0 right-0 z-[999]">
          <Header />
        </header>

        {/* Orta alan — yalnızca bu kısım kaydırılabilir */}
        <main
          className="
            flex-1 
            overflow-y-auto 
            relative 
            z-[1] 
            mt-[150px]   /* Header yüksekliği kadar boşluk */
            mb-[90px]    /* BottomNav yüksekliği kadar boşluk */
            px-2 
            pb-4
            overscroll-contain
          "
        >
          <MainContent />
        </main>

        {/* Alt sabit navigasyon */}
        <footer className="fixed bottom-0 left-0 right-0 z-[998]">
          <BottomNav />
        </footer>
      </div>
    </TotalsProvider>
  );
};

export default Home;
