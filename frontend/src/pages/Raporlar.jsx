import React, { useMemo } from "react";
import { Card, Typography, Empty } from "antd";
import { useTotalsContext } from "../context/TotalsContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import Header from "../components/Home/Header.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const { Title } = Typography;

const ALL_CATEGORIES = [
  "Giyim", "Gıda", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık",
  "Ulaşım", "Eğlence", "Elektronik", "Spor", "Market", "Kırtasiye",
  "Restoran", "Diğer",
];

// Market alt kategorileri (MainContent'ten alındı)
const MARKETLER = [
  "Lidl", "Rewe", "Aldi", "Netto", "DM", "Kaufland", "Norma", "Edeka",
  "Tegut", "Hit", "Famila", "Nahkauf", "Biomarkt", "Penny", "Rossmann",
  "Real", "Diğer",
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
  "Market": "#338AFF", // Market ana kategori rengi
  "Kırtasiye": "#FF3333",
  "Restoran": "#33FF8A",
  "Diğer": "#AAAAAA"
};

// Market grafiği için sabit bir renk paleti
const marketColors = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
  "#FF9F40", "#C9CBCF", "#8AFF33", "#FF33F6", "#33FFF3",
  "#FF8A33", "#338AFF", "#FF3333", "#33FF8A", "#AAAAAA",
  "#58508D", "#BC5090"
];

const RaporlarContent = () => {
  const { harcamalar = [] } = useTotalsContext();

  // Harcama toplamları grafiği için verilerin hesaplanması
  const barData = useMemo(() => {
    const totals = {};
    ALL_CATEGORIES.forEach(cat => totals[cat] = 0);

    harcamalar.forEach(h => {
      let key = h.kategori.startsWith("Market") ? "Market" : h.kategori;
      if (!ALL_CATEGORIES.includes(key)) key = "Diğer";
      // Restoran / Kafe harcamalarını Restoran olarak kabul et
      if (key === "Restoran / Kafe") key = "Restoran";
      
      totals[key] += Number(h.miktar || 0);
    });

    const chartDataItems = Object.keys(totals)
      .filter(k => totals[k] > 0)
      .map(label => ({
        label,
        data: totals[label],
        color: categoryColors[label]
      }))
      .sort((a, b) => a.data - b.data);

    return {
      labels: chartDataItems.map(item => item.label),
      datasets: [
        {
          label: "Toplam Harcama (₺)",
          data: chartDataItems.map(item => item.data),
          backgroundColor: chartDataItems.map(item => item.color),
          borderColor: chartDataItems.map(item => item.color + 'AA'),
          borderWidth: 1,
        }
      ]
    };
  }, [harcamalar]);

  // Market harcamaları grafiği için verilerin hesaplanması
  const marketBarData = useMemo(() => {
    const marketTotals = {};
    // Sadece Market kategorisindeki harcamaları filtrele
    const marketHarcamalar = harcamalar.filter(h => h.kategori === "Market");

    marketHarcamalar.forEach(h => {
      const altKategori = h.altKategori || "Diğer"; // altKategori yoksa "Diğer" kullan
      const key = MARKETLER.includes(altKategori) ? altKategori : "Diğer";
      marketTotals[key] = (marketTotals[key] || 0) + Number(h.miktar || 0);
    });

    const chartDataItems = Object.keys(marketTotals)
      .filter(k => marketTotals[k] > 0)
      .map((label, index) => ({
        label,
        data: marketTotals[label],
        color: marketColors[index % marketColors.length] // Renk paletinden renk seç
      }))
      .sort((a, b) => a.data - b.data);

    return {
      labels: chartDataItems.map(item => item.label),
      datasets: [
        {
          label: "Market Harcaması (₺)",
          data: chartDataItems.map(item => item.data),
          backgroundColor: chartDataItems.map(item => item.color),
          borderColor: chartDataItems.map(item => item.color + 'AA'),
          borderWidth: 1,
        }
      ]
    };
  }, [harcamalar]);

  // Genel Bar Grafiği Seçenekleri
  const barOptions = useMemo(() => ({
    responsive: true,
    indexAxis: 'y',
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Miktar (₺)', color: '#4A5568' },
        ticks: { color: '#4A5568' },
        grid: { display: false }
      },
      y: {
        reverse: true,
        title: { display: false },
        ticks: { color: '#4A5568' }
      }
    },
    plugins: {
      legend: { display: false },
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

  // Market Bar Grafiği Seçenekleri (Genel seçeneklerle benzer, başlık farklı)
  const marketBarOptions = useMemo(() => ({
    ...barOptions,
    scales: {
      ...barOptions.scales,
      x: {
        ...barOptions.scales.x,
        title: {
          display: true,
          text: 'Miktar (₺)',
          color: '#4A5568'
        }
      },
    },
    plugins: {
        ...barOptions.plugins,
        tooltip: {
            callbacks: {
                label: (ctx) => `Harcama: ${ctx.raw.toFixed(2)}₺`
            }
        },
    }
  }), [barOptions]);

  const hasData = barData.datasets[0]?.data.length > 0;
  const hasMarketData = marketBarData.datasets[0]?.data.length > 0;
  
  // Grafik yüksekliklerini dinamik olarak ayarla
  const chartHeight = hasData ? (barData.labels.length * 35) + 100 : 300;
  const marketChartHeight = hasMarketData ? (marketBarData.labels.length * 35) + 100 : 300;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={3} className="text-center text-gray-700 mb-6">
        Harcamalar Raporu
      </Title>

      {/* Ana Kategori Harcamaları Grafiği */}
      <Card className="shadow-lg rounded-xl p-4 bg-white mb-8">
        <Title level={4} className="text-center text-gray-700 mb-4">
          Kategorilere Göre Harcama Dağılımı
        </Title>
        {hasData ? (
          <div style={{ height: `${chartHeight}px`, minHeight: '300px', width: '100%' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        ) : (
          <Empty
            description="Henüz görüntüleyecek bir harcama verisi yok."
            className="p-10"
          />
        )}
      </Card>

      {/* --- */}

      {/* Market Alt Kategori Harcamaları Grafiği */}
      {hasMarketData && (
        <Card className="shadow-lg rounded-xl p-4 bg-white">
          <Title level={4} className="text-center text-gray-700 mb-4">
            Market Harcamaları Alt Kategori Dağılımı
          </Title>
          <div style={{ height: `${marketChartHeight}px`, minHeight: '300px', width: '100%' }}>
            <Bar data={marketBarData} options={marketBarOptions} />
          </div>
        </Card>
      )}
      
      {!hasData && !hasMarketData && (
        // Veri yoksa genel Empty mesajı gösterildiğinden bu kısım sadece Market datası yoksa görülür.
        // Ancak yukarıdaki ana Empty mesajı bunu kapsadığı için burada ek bir Empty göstermeye gerek yok.
        // Ana Empty mesajı zaten harcama verisi olmadığını kapsıyor.
        <></>
      )}
    </div>
  );
};

const Raporlar = () => (
  <div className="relative min-h-screen bg-gray-50">
    {/* Header bileşeni, MainContent'te görünmediği için buraya sabitlenmiş (fixed) durumda */}
    <Header className="fixed inset-0 flex flex-col bg-gray-100 overflow-hidden touch-none select-none"/>
    <main className="pt-20 pb-20"> {/* Header için boşluk bırakıldı */}
      <RaporlarContent />
    </main>
    <BottomNav />
  </div>
);

export default Raporlar;