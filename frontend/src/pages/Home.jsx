import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
  return (
    <TotalsProvider>
      {/* Ana konteyner: Tüm ekranı kaplar ve içerideki elemanları dikey sütun (flex-col) olarak düzenler.
        overflow-hidden ve touch-none mobil cihazlarda scroll'u tamamen engeller.
      */}
      <div className="fixed inset-0 flex flex-col bg-gray-100 overflow-hidden touch-none select-none">
        
        {/* Header: Ekranın en üstünde sabit (fixed) kalır. */}
        <div className="fixed top-0 left-0 right-0 z-[999] bg-gray-100">
          <Header />
        </div>

        {/* MainContent Konteyneri: 
          - flex-1 ile header ve bottom-nav'den kalan tüm dikey alanı kaplar.
          - pt-20 ve pb-20 (veya header/nav yüksekliğine göre ayarlanacak değerler) 
            ile içerideki MainContent'in sabit bileşenlerin altına kaymasını sağlar.
          - justify-center ve items-center ile içeriği (MainContent'i) dikey ve yatay olarak 
            konumlandırarak tam simetriyi sağlar.
        */}
        <main className="flex-1 flex justify-center items-center relative z-[1] pt-20 pb-20">
          <MainContent />
        </main>

        {/* BottomNav: Ekranın en altında sabit (fixed) kalır. */}
        <div className="fixed bottom-0 left-0 right-0 z-[998] bg-white shadow-lg">
          <BottomNav />
        </div>
      </div>
    </TotalsProvider>
  );
};

export default Home;