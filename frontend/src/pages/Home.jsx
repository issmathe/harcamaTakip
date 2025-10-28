import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
  return (
    <TotalsProvider>
      {/* Tüm ekranı kaplayan ana kapsayıcı */}
      <div className="fixed inset-0 flex flex-col bg-gray-100 select-none">
        
        {/* Üst sabit Header */}
        <div className="fixed top-0 left-0 right-0 z-[999]">
          <Header />
        </div>

        {/* Orta alan — yalnızca bu kısım kaydırılabilir */}
        <main
          className="
            flex-1
            overflow-y-auto
            relative
            z-[1]
            mt-[150px]   /* Header yüksekliği */
            mb-[80px]    /* BottomNav yüksekliği */
            px-2
            pb-4
            overscroll-contain
          "
        >
          <MainContent />
        </main>

        {/* Alt sabit BottomNav */}
        <div className="fixed bottom-0 left-0 right-0 z-[998]">
          <BottomNav />
        </div>
      </div>
    </TotalsProvider>
  );
};

export default Home;
