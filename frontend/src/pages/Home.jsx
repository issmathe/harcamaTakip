import React from "react";
import MainContent from "../components/Home/MainContent.jsx";
// Header, BottomNav ve TotalsProvider importları SİLİNDİ.
// Home.jsx orijinal halindeki sabit div yapıları SİLİNDİ.

const Home = () => {
  return (
    // Sayfanın içeriğini App.jsx'teki kaydırılabilir <main> etiketinin içine yerleştirir.
    // İçerik, taşma durumunda App.jsx sayesinde kayacaktır.
    <div className="h-full"> 
      <MainContent />
    </div>
  );
};

export default Home;