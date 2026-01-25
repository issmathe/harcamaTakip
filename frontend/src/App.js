import React, { useRef, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { TotalsProvider } from "./context/TotalsContext";

// Mevcut Bileşenlerin
import Header from "./components/Home/Header.jsx"; 
import BottomNav from "./components/Home/BottomNav.jsx";
import Home from "./pages/Home";
import Gelirler from "./pages/Gelirler";
import Harcamalar from "./pages/Harcamalar";
import Raporlar from "./pages/Raporlar"; 

// --- Scroll SIFIRLAMA MANTIĞI BURADA ---
const ScrollToTop = ({ containerRef }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, [pathname, containerRef]);

  return null;
};
// ---------------------------------------

function App() {
  const mainRef = useRef(null);

  return (
    <TotalsProvider>
      <Router>
        {/* İçeride tanımladığımız için hata vermez */}
        <ScrollToTop containerRef={mainRef} />
        
        <div className="fixed inset-0 flex flex-col bg-gray-100 overflow-hidden touch-none select-none">
          
          <div className="z-[999] flex-shrink-0"> 
            <Header />
          </div>

          <main 
            ref={mainRef} 
            className="flex-1 overflow-y-auto relative z-[1]"
          > 
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gelirler" element={<Gelirler />} />
              <Route path="/harcamalar" element={<Harcamalar />} />
              <Route path="/raporlar" element={<Raporlar />} /> 
            </Routes>
          </main>
          
          <div className="z-[998] flex-shrink-0"> 
            <BottomNav />
          </div>
          
        </div>
      </Router>
    </TotalsProvider>
  );
}

export default App;