// pages/Raporlar.jsx
import React, { useEffect, useMemo } from "react";
import { Card, Typography, Empty } from "antd"; // Empty ekledik
import { TotalsProvider, useTotalsContext } from "../context/TotalsContext";
import { Bar } from "react-chartjs-2"; // Doughnut yerine Bar
import {
  Chart as ChartJS,
  CategoryScale, // X ekseni için (kategoriler)
  LinearScale,   // Y ekseni için (miktarlar)
  BarElement,    // Sütunlar
  Tooltip,
  Legend
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import Header from "../components/Home/Header.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";

// Gerekli Chart.js bileşenlerini kaydediyoruz
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const { Title } = Typography;

const ALL_CATEGORIES = [
  "Giyim", "Gıda", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık", 
  "Ulaşım", "Eğlence", "Elektronik", "Spor", "Market", "Kırtasiye", 
  "Restoran / Kafe", "Diğer",
];

// Sütun rengi için tek bir ana renk kullanabiliriz ya da kategori bazlı renklerimizi koruyabiliriz.
// Bar grafiğinde genelde tek renk tercih edilir, ancak kategorik renkleri koruyalım.
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

  // Harcama verilerini sütun grafiği formatına dönüştürüyoruz
  const barData = useMemo(() => {
    const totals = {};
    ALL_CATEGORIES.forEach(cat => totals[cat] = 0);

    harcamalar.forEach(h => {
      let key = h.kategori.startsWith("Market") ? "Market" : h.kategori;
      if (!ALL_CATEGORIES.includes(key)) key = "Diğer";
      totals[key] += Number(h.miktar || 0);
    });

    // Sadece harcama yapılan kategorileri alıyoruz (sadece veri varsa)
    const filteredLabels = Object.keys(totals).filter(k => totals[k] > 0);
    const filteredData = filteredLabels.map(l => totals[l]);
    // Her sütunun rengini kategoriye göre belirliyoruz
    const backgroundColors = filteredLabels.map(l => categoryColors[l]);

    return {
      labels: filteredLabels,
      datasets: [
        {
          label: "Toplam Harcama (₺)",
          data: filteredData,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(c => c + 'AA'), // Biraz saydam border
          borderWidth: 1,
        }
      ]
    };
  }, [harcamalar]);

  const barOptions = useMemo(() => ({
    responsive: true,
    indexAxis: 'y', // Grafiği yatay sütun yapmak için (mobil için daha iyi)
    maintainAspectRatio: false, // Yüksekliği kontrol etmemize izin verir
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Miktar (₺)',
          color: '#4A5568'
        },
        ticks: { color: '#4A5568' },
        grid: { display: false }
      },
      y: {
        title: {
          display: true,
          text: 'Kategori',
          color: '#4A5568'
        },
        ticks: { color: '#4A5568' }
      }
    },
    plugins: {
      legend: {
        display: false, // Bar grafiğinde legend genelde gereksiz
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)}₺`
        }
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        offset: 4,
        color: "#4A5568",
        font: { weight: "bold", size: 12 },
        formatter: (value) => `${value.toFixed(2)}₺`
      }
    }
  }), []);

  // Harcama verisi yoksa grafiği gösterme
  const hasData = barData.datasets[0]?.data.length > 0;
  const chartHeight = hasData ? (barData.labels.length * 30) + 100 : 300; // Veri sayısına göre dinamik yükseklik

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={3} className="text-center text-gray-700 mb-6">Harcamalar Raporu</Title>
      <Card className="shadow-lg rounded-xl p-4 bg-white">
        {hasData ? (
          // Sütun grafiğini göster
          <div style={{ height: `${chartHeight}px`, minHeight: '300px', width: '100%' }}>
             {/* Grafiğin boyutu için bir div içine sardık */}
            <Bar data={barData} options={barOptions} />
          </div>
        ) : (
          // Veri yoksa Ant Design'in Empty bileşenini göster
          <Empty
            description="Henüz görüntüleyecek bir harcama verisi yok."
            className="p-10"
          />
        )}
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