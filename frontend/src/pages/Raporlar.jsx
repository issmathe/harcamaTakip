import React, { useMemo, useState, useCallback } from "react";
import { Card, Typography, Empty, Button } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
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
import dayjs from "dayjs";
import tr from "dayjs/locale/tr";
import Header from "../components/Home/Header.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";

dayjs.locale(tr);
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);
const { Title } = Typography;

// Sabitler
const ALL_CATEGORIES = [
  "Giyim", "Bağış", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık",
  "Ulaşım", "Eğlence", "Elektronik", "Spor", "Market", "Kırtasiye",
  "Restoran", "Diğer",
];

const MARKETLER = [
  "Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk",
  "Kaufland", "Rewe", "Netto", "Edeka", "Biomarkt", "Penny", "Rossmann", "Diğer"
];

const categoryColors = {
  "Giyim": "#FF6384", "Bağış": "#36A2EB", "Petrol": "#FFCE56", "Kira": "#4BC0C0",
  "Fatura": "#9966FF", "Eğitim": "#FF9F40", "Sağlık": "#C9CBCF", "Ulaşım": "#8AFF33",
  "Eğlence": "#FF33F6", "Elektronik": "#33FFF3", "Spor": "#FF8A33", "Market": "#338AFF",
  "Kırtasiye": "#FF3333", "Restoran": "#33FF8A", "Diğer": "#AAAAAA"
};

const marketColors = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
  "#C9CBCF", "#8AFF33", "#FF33F6", "#33FFF3", "#FF8A33", "#338AFF",
  "#FF3333", "#33FF8A", "#AAAAAA", "#58508D", "#BC5090"
];

const RaporlarContent = () => {
  const { harcamalar = [] } = useTotalsContext();
  const now = dayjs();
  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());

  const filteredHarcamalar = useMemo(() => {
    return harcamalar.filter((h) => {
      const t = dayjs(h.createdAt);
      return t.month() === selectedMonth && t.year() === selectedYear;
    });
  }, [harcamalar, selectedMonth, selectedYear]);

  const changeMonth = useCallback(
    (direction) => {
      const current = dayjs().year(selectedYear).month(selectedMonth);
      const newDate = direction === "prev" ? current.subtract(1, "month") : current.add(1, "month");
      setSelectedMonth(newDate.month());
      setSelectedYear(newDate.year());
    },
    [selectedMonth, selectedYear]
  );

  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format("MMMM YYYY");
  const isCurrentMonth = dayjs().month() === selectedMonth && dayjs().year() === selectedYear;

  // === Kategori Grafiği ===
  const barData = useMemo(() => {
    const totals = {};
    ALL_CATEGORIES.forEach(cat => totals[cat] = 0);

    filteredHarcamalar.forEach(h => {
      let key = h.kategori;
      if (key === "Market") key = "Market";
      else if (key === "Restoran / Kafe") key = "Restoran";
      else if (!ALL_CATEGORIES.includes(key)) key = "Diğer";
      totals[key] = (totals[key] || 0) + Number(h.miktar || 0);
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
  }, [filteredHarcamalar]);

  // === Market Grafiği ===
  const marketBarData = useMemo(() => {
    const marketTotals = {};
    const marketHarcamalar = filteredHarcamalar.filter(h => h.kategori === "Market");

    marketHarcamalar.forEach(h => {
      const altKategori = h.altKategori || "Diğer";
      const key = MARKETLER.includes(altKategori) ? altKategori : "Diğer";
      marketTotals[key] = (marketTotals[key] || 0) + Number(h.miktar || 0);
    });

    const chartDataItems = Object.keys(marketTotals)
      .filter(k => marketTotals[k] > 0)
      .map((label, index) => ({
        label,
        data: marketTotals[label],
        color: marketColors[index % marketColors.length]
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
  }, [filteredHarcamalar]);

  // === Ortak grafik ayarları ===
  const barOptions = useMemo(() => ({
    responsive: true,
    indexAxis: "y",
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: "Miktar (₺)", color: "#4A5568" },
        ticks: { color: "#4A5568" },
        grid: { display: false }
      },
      y: {
        reverse: true,
        ticks: { color: "#4A5568" }
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
        anchor: "start",
        align: "end",
        offset: 8,
        color: "white",
        font: { weight: "bold", size: 12 },
        formatter: (value) => `${value.toFixed(2)}₺`,
        textShadowBlur: 4,
        textShadowColor: "rgba(0,0,0,0.7)"
      }
    }
  }), []);

  const marketBarOptions = useMemo(() => ({
    ...barOptions,
    plugins: {
      ...barOptions.plugins,
      tooltip: {
        callbacks: { label: (ctx) => `Harcama: ${ctx.raw.toFixed(2)}₺` }
      }
    }
  }), [barOptions]);

  const hasData = barData.datasets[0]?.data.length > 0;
  const hasMarketData = marketBarData.datasets[0]?.data.length > 0;
  const chartHeight = hasData ? barData.labels.length * 35 + 100 : 300;
  const marketChartHeight = hasMarketData ? marketBarData.labels.length * 35 + 100 : 300;

  return (
    <div className="w-full">
      {/* Ay seçici */}
      <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4" styles={{ body: { padding: "1rem" } }}>
        <div className="flex justify-between items-center">
          <Button icon={<ArrowLeftOutlined />} onClick={() => changeMonth("prev")} type="primary" shape="circle" size="large" />
          <Title level={3} className="text-center text-gray-800 m-0 capitalize">{displayMonth}</Title>
          <Button icon={<ArrowRightOutlined />} onClick={() => changeMonth("next")} disabled={isCurrentMonth} type="primary" shape="circle" size="large" />
        </div>
      </Card>

      {/* Kategori grafiği */}
      <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4" styles={{ body: { padding: "1rem" } }}>
        <Title level={4} className="text-center text-gray-700 mb-4">Kategorilere Göre Harcama Dağılımı</Title>
        {hasData ? (
          <div className="p-2" style={{ height: `${chartHeight}px`, minHeight: "300px" }}>
            <Bar data={barData} options={barOptions} />
          </div>
        ) : (
          <Empty description={`Seçilen dönemde (${displayMonth}) görüntüleyecek veri yok.`} className="p-10" />
        )}
      </Card>

      {/* Market grafiği */}
      {(hasData || hasMarketData) && (
        <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4" styles={{ body: { padding: "1rem" } }}>
          <Title level={4} className="text-center text-gray-700 mb-4">Market Harcamaları Alt Kategori Dağılımı</Title>
          {hasMarketData ? (
            <div className="p-2" style={{ height: `${marketChartHeight}px`, minHeight: "300px" }}>
              <Bar data={marketBarData} options={marketBarOptions} />
            </div>
          ) : (
            <Empty description={`Seçilen dönemde (${displayMonth}) market harcaması yok.`} className="p-10" />
          )}
        </Card>
      )}
    </div>
  );
};

// === Sayfa düzeni (Header sabit, BottomNav sabit) ===
const Raporlar = () => (
  <div className="relative min-h-screen bg-gray-50 flex flex-col">
    <Header />
    {/* 
      Header yüksekliği: yaklaşık 64px (pt-16 yeterli)
      BottomNav yüksekliği: yaklaşık 64px (pb-16 yeterli)
      Böylece içerik altta/üstte kaybolmaz.
    */}
    <main className="flex-grow pt-16 pb-16 overflow-y-auto">
      <RaporlarContent />
    </main>
    <BottomNav />
  </div>
);

export default Raporlar;
