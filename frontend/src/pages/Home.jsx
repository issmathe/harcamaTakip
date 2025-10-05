// src/pages/Home.jsx
import React from "react";
import Header from "../components/Home/Header.jsx";
import MainContent from "../components/Home/MainContent.jsx";
import CategorySelect from "../components/Home/CategorySelect.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import Harcama from "../components/kaynak/Harcama.jsx";
import Gelir from "../components/kaynak/Gelir.jsx";
import { TotalsProvider } from "../context/TotalsContext"; // Context sağlayıcısını ekliyoruz

const Home = () => {
  return (
    <TotalsProvider>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <MainContent />
        <CategorySelect />
        <BottomNav />
        <Harcama />
        <Gelir />
      </div>
    </TotalsProvider>
  );
};

export default Home;
