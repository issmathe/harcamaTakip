import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
  return (
    <TotalsProvider>
      {/* DIŞ KAPSAYICI: fixed inset-0 ile ekranı kapla ve dikey flex yap. */}
      {/* 'touch-none select-none' kaldırıldı. */}
      <div className="fixed inset-0 flex flex-col bg-gray-100">
        
        {/* Üst sabit Header (Header.jsx içinde fixed yaptık, burada sadece bileşeni çağırıyoruz) */}
        {/* Z-index ve fixed tanımı Header bileşeninin içine taşındığı için bu div gereksizdir, ancak bırakmak sorun yaratmaz. */}
        <div>
          <Header />
        </div>

        {/* ORTA ALAN: Ana Kaydırılabilir Bölüm (2. Alan) */}
        {/* flex-1: Kalan dikey alanı kapla. */}
        {/* overflow-y-auto: Dikey kaydırmayı etkinleştir. */}
        {/* pt-28: Header'ın yüksekliği kadar boşluk bırak. */}
        {/* pb-20: BottomNav'ın yüksekliği kadar boşluk bırak. */}
        <main className="flex-1 relative z-[1] overflow-y-auto pt-28 pb-20">
          <MainContent />
        </main>

        {/* Alt sabit navigasyon (BottomNav.jsx zaten fixed top-0, w-full sınıflarını içeriyor) */}
        <div>
          <BottomNav />
        </div>
      </div>
    </TotalsProvider>
  );
};

export default Home;