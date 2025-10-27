import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
  // ÖNEMLİ DEĞERLER: Header'ın yüksekliğini telafi etmek için
  // Header'ınız oldukça yüksek (yaklaşık 200-224px) olduğu için pt-56 kullanıldı.
  const headerOffset = "pt-56"; 
  const footerOffset = "pb-20"; // BottomNav için güvenilir boşluk

  return (
    <TotalsProvider>
      {/* DIŞ KAPSAYICI: fixed inset-0 ile ekranı kapla. flex-col kullanmaya gerek yok. */}
      {/* Eski 'fixed inset-0 flex flex-col bg-gray-100 overflow-hidden...' kaldırıldı. */}
      <div className="bg-gray-100 h-screen w-full">
        
        {/* 1. ALAN: Header (Artık Header.jsx içinde sabitlenmiştir) */}
        <Header />

        {/* 2. ALAN: Ana Kaydırılabilir İçerik (MainContent'i barındırır) */}
        {/* h-screen: Tam ekran yüksekliğini alır */}
        {/* overflow-y-auto: Kendi içinde kaydırmayı etkinleştirir */}
        {/* pt-56: Header'ın kapladığı alanı boş bırakır (MainContent'in başlangıcı) */}
        {/* pb-20: BottomNav'ın kapladığı alanı boş bırakır */}
        <div 
          className={`relative w-full h-screen overflow-y-auto ${headerOffset} ${footerOffset}`}
        >
          <MainContent />
        </div>

        {/* 3. ALAN: BottomNav (BottomNav.jsx içinde sabitlenmiştir) */}
        <BottomNav />
      </div>
    </TotalsProvider>
  );
};

export default Home;