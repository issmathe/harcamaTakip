import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TotalsProvider } from "./context/TotalsContext";
import Home from "./pages/Home";
import Gelirler from "./pages/Gelirler";
import Harcamalar from "./pages/Harcamalar";
import Raporlar from "./pages/Raporlar"; // ✅ yeni eklenen sayfa

function App() {
  return (
    <TotalsProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gelirler" element={<Gelirler />} />
            <Route path="/harcamalar" element={<Harcamalar />} />
            <Route path="/raporlar" element={<Raporlar />} /> {/* ✅ yeni rota */}
          </Routes>
        </div>
      </Router>
    </TotalsProvider>
  );
}

export default App;
