// Deneme.jsx
import React, { useState } from "react";

const categories = [
  { name: "Gıda", icon: "🍎" },
  { name: "Giyim", icon: "👕" },
  { name: "Petrol", icon: "⛽" },
  { name: "Kira", icon: "🏠" },
  { name: "Eğlence", icon: "🎬" },
];

const Deneme = () => {
  const [harcanan, setHarcanan] = useState(450);
  const [kalan, setKalan] = useState(550);

  const handleCategoryClick = (cat) => {
    alert(`${cat} kategorisine tıklanıldı!`);
    // Burada sayfa açma veya modal açma eklenebilir
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      {/* Daire */}
      <div
        className="flex flex-col items-center justify-center z-10"
        style={{
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #f9fafb, #e5e7eb)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        <p className="text-xl font-bold text-red-600">Harcanan: {harcanan} €</p>
        <p className="text-xl font-bold text-green-600">Kalan: {kalan} €</p>
      </div>

      {/* Kategori ikonları */}
      {categories.map((cat, index) => {
        const angle = (360 / categories.length) * index; // derece
        const radius = 180; // daireden ne kadar uzakta
        const x = radius * Math.cos((angle * Math.PI) / 180);
        const y = radius * Math.sin((angle * Math.PI) / 180);

        return (
          <button
            key={cat.name}
            onClick={() => handleCategoryClick(cat.name)}
            style={{
              position: "absolute",
              left: `calc(50% + ${x}px - 20px)`,
              top: `calc(50% + ${y}px - 20px)`,
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            {cat.icon}
          </button>
        );
      })}
    </div>
  );
};

export default Deneme;
