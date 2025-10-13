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
  "Restoran": "#33FF8A",
  "Diğer": "#AAAAAA"
};

const RaporlarContent = () => {
  const { harcamalar = [] } = useTotalsContext();

  const barData = useMemo(() => {
    const totals = {};
    ALL_CATEGORIES.forEach(cat => totals[cat] = 0);

    harcamalar.forEach(h => {
      let key = h.kategori.startsWith("Market") ? "Market" : h.kategori;
      if (!ALL_CATEGORIES.includes(key)) key = "Diğer";
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
        ticks: { color: '#4A5568' }
      }
    },
    plugins: {
      legend: { display: false },
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
  const chartHeight = hasData ? (barData.labels.length * 35) + 100 : 300;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={3} className="text-center text-gray-700 mb-6">
        Harcamalar Raporu
      </Title>
      <Card className="shadow-lg rounded-xl p-4 bg-white">
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
    </div>
  );
};

const Raporlar = () => (
  <div className="relative min-h-screen bg-gray-50">
    <Header />
    <main className="pt-52 pb-20">
      <RaporlarContent />
    </main>
    <BottomNav />
  </div>
);

export default Raporlar;
