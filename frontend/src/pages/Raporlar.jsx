// pages/Raporlar.jsx
import React, { useEffect, useMemo } from "react";
import { Card, Typography } from "antd";
import { TotalsProvider, useTotalsContext } from "../context/TotalsContext";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import Header from "../components/Home/Header.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";

ChartJS.register(ArcElement, Tooltip, Legend);

const { Title } = Typography;

const ALL_CATEGORIES = [
  "Giyim", "Gıda", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık", 
  "Ulaşım", "Eğlence", "Elektronik", "Spor", "Market", "Kırtasiye", 
  "Restoran / Kafe", "Diğer",
];

const categoryColors = {
  "Giyim": "#FF6384",
  "Gıda": "#36A2EB",
  "Petrol": "#FFCE56",
  "Kira": "#4BC0C0",
  "Fatura": "#9966FF",
  "Eğitim": "#FF9F40",
  "Sağlık": "#C9CBCF",
  "Ulaşım": "#8AFF33",
  "Eğlence": "#FF33F6",
  "Elektronik": "#33FFF3",
  "Spor": "#FF8A33",
  "Market": "#338AFF",
  "Kırtasiye": "#FF3333",
  "Restoran / Kafe": "#33FF8A",
  "Diğer": "#AAAAAA"
};

const RaporlarContent = () => {
  const { harcamalar = [], fetchTotals } = useTotalsContext();

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  const pieData = useMemo(() => {
    // Kategori bazında toplam
    const totals = {};
    ALL_CATEGORIES.forEach(cat => totals[cat] = 0);

    harcamalar.forEach(h => {
      let key = h.kategori.startsWith("Market") ? "Market" : h.kategori;
      if (!ALL_CATEGORIES.includes(key)) key = "Diğer";
      totals[key] += Number(h.miktar || 0);
    });

    // Sıfır harcama olan kategorileri grafikten çıkar
    const labels = Object.keys(totals).filter(k => totals[k] > 0);
    const data = labels.map(l => totals[l]);
    const backgroundColor = labels.map(l => categoryColors[l]);

    return {
      labels,
      datasets: [
        {
          label: "Harcamalar",
          data,
          backgroundColor,
          borderWidth: 1,
        }
      ]
    };
  }, [harcamalar]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={3} className="text-center text-gray-700 mb-6">Harcamalar Raporu</Title>
      <Card className="shadow-lg rounded-xl p-6 bg-white">
        <Pie data={pieData} />
      </Card>
    </div>
  );
};


const Raporlar = () => (
  <TotalsProvider>
    <div className="relative min-h-screen bg-gray-50">
      <Header />
      <main className="pb-20">
        <RaporlarContent />
      </main>
      <BottomNav />
    </div>
  </TotalsProvider>
);

export default Raporlar;
