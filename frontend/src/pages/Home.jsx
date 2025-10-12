import React from "react";
import MainContent from "../components/Home/MainContent.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider } from "../context/TotalsContext";

const Home = () => {
  return (
    <TotalsProvider>
      <div
        className="fixed inset-0 flex flex-col bg-gray-100 overflow-hidden touch-none select-none"
        style={{
          WebkitOverflowScrolling: "none",
          overscrollBehavior: "none",
        }}
      >
        {/* Üst sabit header */}
        <header
          className="fixed top-0 left-0 right-0 z-[999] bg-gray-100 shadow-md"
          style={{
            touchAction: "none",
            overscrollBehavior: "none",
          }}
        >

        </header>

        {/* Orta içerik — header ve nav arasında kalan alan */}
        <main
          className="flex-1 flex justify-center items-center relative z-[1]"
          style={{
            marginTop: "80px", // Header yüksekliği kadar
            marginBottom: "70px", // BottomNav yüksekliği kadar
            overflow: "hidden",
            touchAction: "none",
          }}
        >
          <MainContent />
        </main>

        {/* Alt sabit navigasyon */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-[998] bg-gray-100 shadow-inner"
          style={{
            touchAction: "none",
            overscrollBehavior: "none",
          }}
        >
          <BottomNav />
        </nav>
      </div>
    </TotalsProvider>
  );
};

export default Home;
