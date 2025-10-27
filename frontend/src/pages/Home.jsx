import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
  /* NOT: Header ve BottomNav'ın tahmini yükseklikleri (örnek olarak h-20 ve h-16 varsayılmıştır).
     Bu değerleri, bileşenlerinizin gerçek yüksekliğine göre ayarlamalısınız!
     Örn: Eğer Header 80px ise, pt-20 (80px) kullanın. BottomNav 64px ise pb-16 (64px) kullanın.
  */
  const headerHeightClass = "pt-20"; // Header yüksekliği kadar boşluk bırak
  const footerHeightClass = "pb-16"; // BottomNav yüksekliği kadar boşluk bırak

  return (
    <TotalsProvider>
      {/* Kapsayıcı: Ekranı tamamen kaplar ve dikey Flex konteyneridir. */}
      {/* 'overflow-hidden' ve 'touch-none' kaldırıldı. */}
      <div className="fixed inset-0 flex flex-col bg-gray-100">

        {/* 1. ALAN: Üst Sabit Header */}
        {/* Header'ı sabitle ve üstte kalmasını sağla */}
        <div className="z-[999] fixed top-0 left-0 right-0">
          <Header />
        </div>

        {/* 2. ALAN: Orta Kaydırılabilir İçerik */}
        {/* flex-1 ile kalan tüm dikey alanı kaplar. */}
        {/* overflow-y-auto ile dikey kaydırmayı etkinleştirir. */}
        {/* pt-20 ve pb-16 ile sabit header ve footer'ın içeriği örtmesini engeller. */}
        <main className={`flex-1 relative z-[1] overflow-y-auto ${headerHeightClass} ${footerHeightClass}`}>
          {/* MainContent içeriği artık buradaki kaydırma çubuğunda hareket edecek. */}
          <MainContent />
        </main>

        {/* 3. ALAN: Alt Sabit Navigasyon */}
        {/* BottomNav'ı sabitle ve altta kalmasını sağla */}
        <div className="z-[998] fixed bottom-0 left-0 right-0">
          <BottomNav />
        </div>
      </div>
    </TotalsProvider>
  );
};

export default Home;