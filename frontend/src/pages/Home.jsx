import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
  return (
    <TotalsProvider>
      {/* 1. DEĞİŞİKLİK: 'overflow-hidden touch-none select-none' kaldırıldı. */}
      <div className="fixed inset-0 flex flex-col bg-gray-100"> 
        
        {/* Üst sabit header (1. alan) */}
        <div className="z-[999] fixed top-0 left-0 right-0">
          <Header />
        </div>

        {/* 2. DEĞİŞİKLİK: 'overflow-y-auto' eklendi ve 'Header' ile 'BottomNav' yüksekliği kadar padding/margin verilmesi gerekiyor. */}
        {/* MainContent'in kaydırılabilir olmasını sağlayan kısımdır (2. alan) */}
        <main className="flex-1 relative z-[1] overflow-y-auto pt-[XXpx] pb-[YYpx]">
            {/* Not: pt-[XXpx] ve pb-[YYpx] yerlerine Header ve BottomNav'ın gerçek yükseklik değerlerini yazmalısınız.
                Bu padding'ler, içeriğin sabit Header ve Footer'ın altına kaymasını engeller. */}
            <MainContent />
        </main>

        {/* Alt sabit navigasyon (3. alan) */}
        <div className="z-[998] fixed bottom-0 left-0 right-0">
          <BottomNav />
        </div>
        
      </div>
    </TotalsProvider>
  );
};

export default Home;