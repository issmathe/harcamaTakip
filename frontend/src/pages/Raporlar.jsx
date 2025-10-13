import React, { useMemo, useCallback } from "react";
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

// Dosya yolu hatası çözüldü varsayılmıştır:
import Header from "../components/Home/Header.jsx";
import BottomNav from "../components/Home/BottomNav.jsx"; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const { Title } = Typography;

// Kategori ve Renk Sabitleri
const ALL_CATEGORIES = [
  "Giyim", "Gıda", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık",
  "Ulaşım", "Eğlence", "Elektronik", "Spor", "Market", "Kırtasiye",
  "Restoran", "Diğer",
];

const categoryColors = {
  "Giyim": "#FF6384", "Gıda": "#36A2EB", "Petrol": "#FFCE56", 
  "Kira": "#4BC0C0", "Fatura": "#9966FF", "Eğitim": "#FF9F40", 
  "Sağlık": "#C9CBCF", "Ulaşım": "#8AFF33", "Eğlence": "#FF33F6", 
  "Elektronik": "#33FFF3", "Spor": "#FF8A33", "Market": "#338AFF", 
  "Kırtasiye": "#FF3333", "Restoran": "#33FF8A", "Diğer": "#AAAAAA"
};

// Harcama verilerini işleyen ve grafik verisine dönüştüren bileşen
const RaporlarContent = () => {
  const { harcamalar = [] } = useTotalsContext();

  // Veri işleme ve grafik verisi oluşturma
  const barData = useMemo(() => {
    const totals = {};
    ALL_CATEGORIES.forEach(cat => totals[cat] = 0);

    harcamalar.forEach(h => {
      const amount = Number(h.miktar) || 0; // Güvenli miktar okuması
      if (amount <= 0) return; // Negatif veya sıfır harcamaları atla

      let key = h.kategori.startsWith("Market") ? "Market" : h.kategori;
      if (!ALL_CATEGORIES.includes(key)) key = "Diğer";
      
      totals[key] += amount;
    });

    const chartDataItems = Object.keys(totals)
      .filter(k => totals[k] > 0)
      .map(label => ({
        label,
        data: totals[label],
        color: categoryColors[label] || categoryColors["Diğer"]
      }))
      .sort((a, b) => a.data - b.data); // En az harcanandan en çok harcanana

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

  // Grafik seçeneklerini optimize etme
  const barOptions = useCallback(() => ({
    responsive: true,
    indexAxis: 'y', // Yatay çubuk grafik
    maintainAspectRatio: false,
    animation: { duration: 0 }, // Animasyon kapatma
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Miktar (₺)', color: '#4A5568' },
        ticks: { color: '#4A5568' },
        grid: { display: false }
      },
      y: {
        reverse: true, // Listeyi yukarıdan aşağıya sıralamak için
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

  const hasData = barData.datasets[0]?.data.length > 0;
  
  // Dinamik yükseklik ayarı (her kategori için 35px + 100px üst/alt boşluk)
  const chartHeight = hasData ? (barData.labels.length * 35) + 100 : 300;

  return (
    // İçerik boşlukları, ana bileşenin 'main' etiketi tarafından sağlanmıştır.
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={3} className="text-center text-gray-700 mb-6">
        Harcamalar Raporu
      </Title>
      <Card className="shadow-lg rounded-xl p-4 bg-white">
        {hasData ? (
          <div style={{ height: `${chartHeight}px`, minHeight: '300px', width: '100%' }}>
            <Bar data={barData} options={barOptions()} />
          </div>
        ) : (
          <Empty
            description="Henüz görüntüleyecek bir harcama verisi yok."
            className="p-10"
          />
        )}
      </Card>
    </div>
  );
};

// Ana bileşen: Sabit Header ve BottomNav'ı uygular
const Raporlar = () => (
  // `min-h-screen` kaldırıldı, kaydırmanın doğal akışına izin verildi
  <div className="relative bg-gray-50"> 
    
    {/* Sabit Başlık (Header) */}
    {/* Tahmini Header yüksekliği: 14/16 birim */}
    <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <Header />
    </div>

    {/* Ana İçerik (Kaydırılabilir Alan) */}
    {/* pt-16: Header'ın arkasına kaymaması için üst boşluk */}
    {/* pb-24: BottomNav'ın arkasına kaymaması için alt boşluk */}
    <main className="pt-16 pb-24 md:pt-20 md:pb-24 overflow-y-auto"> 
      <RaporlarContent />
    </main>
    
    {/* Sabit Alt Navigasyon (BottomNav) */}
    {/* Tahmini BottomNav yüksekliği: 20/24 birim */}
    <div className="fixed bottom-0 left-0 w-full z-50 bg-white shadow-md border-t">
      <BottomNav />
    </div>
  </div>
);

export default Raporlar;