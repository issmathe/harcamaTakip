import React from "react";
// Mevcut bileşenler
import MainContent from "../components/Home/MainContent.jsx"; 
import AylikHarcamaTrendGrafigi from "../components/grafik/AylikHarcamaTrendGrafigi.jsx";
// ✅ YENİ İSİMLE İMPORT EDİLDİ

const Home = () => {
  return (
    <div className="h-full p-4 sm:p-6 md:p-8">
      
      {/* 1. Main Content: Güncel Bakiye vs. */}
      <MainContent /> 
      
      {/* 2. Yeni Eklenen Grafik Bileşeni - YENİ İSİMLE KULLANILDI */}
      <AylikHarcamaTrendGrafigi />
      
    </div>
  );
};

export default Home;