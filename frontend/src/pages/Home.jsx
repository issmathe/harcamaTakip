import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
    // TAHMİNİ HEADER YÜKSEKLİĞİ İÇİN DAHA BÜYÜK DEĞER KULLANDIK (192px)
    const headerOffset = "pt-48"; // Önceki pt-28 (112px) yerine pt-48 (192px)
    const footerOffset = "pb-20"; // BottomNav için (80px)

    return (
        <TotalsProvider>
            {/* 1. ALAN: Header (Header.jsx içinde fixed) */}
            <Header />

            {/* ORTA ALAN: Sadece MainContent'i tutan kaydırılabilir kapsayıcı (2. Alan) */}
            {/* w-full h-screen: Tüm ekranı kapla */}
            {/* overflow-y-auto: Kaydırmayı etkinleştir */}
            {/* pt-48: Header'ın yüksekliği kadar boşluk bırakıldı (ÖNEMLİ DEĞİŞİKLİK) */}
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