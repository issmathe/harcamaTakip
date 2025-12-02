import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TotalsProvider } from "./context/TotalsContext";
// Home.jsx'ten alınıp buraya taşınması gereken bileşenler
import Header from "./components/Home/Header.jsx"; 
import BottomNav from "./components/Home/BottomNav.jsx";

// Sayfa Bileşenleri
import Home from "./pages/Home";
import Gelirler from "./pages/Gelirler";
import Harcamalar from "./pages/Harcamalar";
import Raporlar from "./pages/Raporlar"; 

function App() {
  return (
    <TotalsProvider>
      <Router>
        <div className="fixed inset-0 flex flex-col bg-gray-100 overflow-hidden touch-none select-none">
          
          {/* Üst Sabit Header */}
          <div className="z-[999] flex-shrink-0"> 
            <Header />
          </div>

          {/* Orta Alan */}
          <main className="flex-1 overflow-y-auto relative z-[1]"> 
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gelirler" element={<Gelirler />} />
              <Route path="/harcamalar" element={<Harcamalar />} />
              <Route path="/raporlar" element={<Raporlar />} /> 
            </Routes>
          </main>
          
          {/* Alt Sabit Navigasyon */}
          <div className="z-[998] flex-shrink-0"> 
            <BottomNav />
          </div>
          
        </div>
      </Router>
    </TotalsProvider>
  );
}

export default App;
