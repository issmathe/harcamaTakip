import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
    // ÖNEMLİ DEĞİŞİKLİK: Header'ın tamamını geçmek için pt-48 yerine pt-56 (224px) kullanıldı.
    const headerOffset = "pt-56"; // pt-48'den (192px) daha büyük bir değer
    const footerOffset = "pb-20"; // BottomNav için (80px)

    return (
        <TotalsProvider>
            {/* 1. ALAN: Header (Header.jsx içinde fixed) */}
            <Header />

            {/* ORTA ALAN: Sadece MainContent'i tutan kaydırılabilir kapsayıcı (2. Alan) */}
            {/* w-full h-screen: Tüm ekranı kapla */}
            {/* overflow-y-auto: Kaydırmayı etkinleştir */}
            {/* pt-56: Header'ın yüksekliği kadar boşluk bırakıldı (EN SON VE EN BÜYÜK DEĞİŞİKLİK) */}
            {/* pb-20: BottomNav için boşluk bırakıldı */}
            <div 
                className={`w-full h-screen overflow-y-auto bg-gray-100 ${headerOffset} ${footerOffset}`}
            >
                {/* MainContent içeriği */}
                <MainContent />
            </div>

            {/* 3. ALAN: Footer (BottomNav.jsx içinde fixed) */}
            <BottomNav />
        </TotalsProvider>
    );
};

export default Home;