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
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import dayjs from "dayjs";
import tr from "dayjs/locale/tr";
import AylikHarcamaTrendGrafigi from "../components/grafik/AylikHarcamaTrendGrafigi";

dayjs.locale(tr);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const { Title } = Typography;

// --- SABİT SIRALAMA LİSTELERİ ---
const ALL_CATEGORIES = [
  "Market", "Giyim", "Bağış", "Petrol", "Kira", "Fatura", "Eğitim",
  "Sağlık", "Ulaşım", "Eğlence", "Elektronik", "İletisim", "Hediye",
  "Restoran", "Aile", "Diğer",
];

const MARKETLER = [
  "Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk",
  "Kaufland", "bäckerei", "Rewe", "Netto",  "Tedi", "Kik", "Fundgrube", "Rossmann",
  "Edeka", "Biomarkt", "Penny", "Diğer",
];

const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ayşe", "Yusuf", "Zeynep"];

const categoryColors = {
  "Giyim": "#FF6384", "Bağış": "#36A2EB", "Petrol": "#FFCE56", "Kira": "#4BC0C0",
  "Fatura": "#9966FF", "Eğitim": "#FF9F40", "Sağlık": "#C9CBCF", "Ulaşım": "#8AFF33",
  "Eğlence": "#FF33F6", "Elektronik": "#33FFF3", "İletisim": "#FF8A33", "Market": "#338AFF",
  "Hediye": "#FF3333", "Restoran": "#33FF8A", "Aile": "#AF52DE", "Diğer": "#AAAAAA"
};

const RaporlarContent = () => {
  const { harcamalar = [] } = useTotalsContext();
  const now = dayjs();
  
  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());

  const filteredHarcamalar = useMemo(() => {
    return (harcamalar || []).filter((h) => {
      const t = dayjs(h.createdAt); 
      return t.month() === selectedMonth && t.year() === selectedYear;
    });
  }, [harcamalar, selectedMonth, selectedYear]);

  const changeMonth = useCallback((direction) => {
      const current = dayjs().year(selectedYear).month(selectedMonth);
      const newDate = direction === "prev" ? current.subtract(1, "month") : current.add(1, "month");
      setSelectedMonth(newDate.month());
      setSelectedYear(newDate.year());
    }, [selectedMonth, selectedYear]
  );

  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format("MMMM YYYY");
  const isCurrentMonth = dayjs().month() === selectedMonth && dayjs().year() === selectedYear;

  // --- KATEGORİ GRAFİĞİ (0'lar Dahil) ---
  const barData = useMemo(() => {
    const totals = {};
    filteredHarcamalar.forEach(h => {
      let key = h.kategori === "Restoran / Kafe" ? "Restoran" : h.kategori;
      if (!ALL_CATEGORIES.includes(key)) key = "Diğer";
      totals[key] = (totals[key] || 0) + Number(h.miktar || 0);
    });

    const chartDataItems = ALL_CATEGORIES.map(cat => ({
      label: cat,
      data: totals[cat] || 0,
      color: categoryColors[cat] || "#AAAAAA"
    }));

    return {
      labels: chartDataItems.map(item => item.label),
      datasets: [{
          label: "Toplam Harcama (€)",
          data: chartDataItems.map(item => item.data),
          backgroundColor: chartDataItems.map(item => item.color),
          borderWidth: 1,
      }]
    };
  }, [filteredHarcamalar]);

  // --- MARKET GRAFİĞİ (0'lar Dahil) ---
  const marketBarData = useMemo(() => {
    const marketTotals = {};
    filteredHarcamalar.filter(h => h.kategori === "Market").forEach(h => {
      const key = MARKETLER.includes(h.altKategori) ? h.altKategori : "Diğer";
      marketTotals[key] = (marketTotals[key] || 0) + Number(h.miktar || 0);
    });

    const items = MARKETLER.map((m, idx) => ({
      label: m,
      data: marketTotals[m] || 0,
      color: `hsl(${(idx * 360) / MARKETLER.length}, 70%, 60%)`
    }));

    return { labels: items.map(i => i.label), datasets: [{ label: "Market (€)", data: items.map(i => i.data), backgroundColor: items.map(i => i.color) }] };
  }, [filteredHarcamalar]);

  // --- GİYİM GRAFİĞİ (0'lar Dahil) ---
  const giyimBarData = useMemo(() => {
    const giyimTotals = {};
    filteredHarcamalar.filter(h => h.kategori === "Giyim").forEach(h => {
      const key = GIYIM_KISILERI.includes(h.altKategori) ? h.altKategori : "Hediye";
      giyimTotals[key] = (giyimTotals[key] || 0) + Number(h.miktar || 0);
    });

    const items = GIYIM_KISILERI.map((kisi, idx) => ({
      label: kisi,
      data: giyimTotals[kisi] || 0,
      color: `hsl(${(idx * 60) + 200}, 70%, 50%)`
    }));

    return { labels: items.map(i => i.label), datasets: [{ label: "Giyim (€)", data: items.map(i => i.data), backgroundColor: items.map(i => i.color) }] };
  }, [filteredHarcamalar]);

  // --- AİLE GRAFİĞİ (0'lar Dahil) ---
  const aileBarData = useMemo(() => {
    const aileTotals = {};
    filteredHarcamalar.filter(h => h.kategori === "Aile").forEach(h => {
      if (AILE_UYELERI.includes(h.altKategori)) {
        aileTotals[h.altKategori] = (aileTotals[h.altKategori] || 0) + Number(h.miktar || 0);
      }
    });

    const items = AILE_UYELERI.map((uye, idx) => ({
      label: uye,
      data: aileTotals[uye] || 0,
      color: `hsl(${(idx * 40) + 20}, 80%, 60%)`
    }));

    return { labels: items.map(i => i.label), datasets: [{ label: "Aile (€)", data: items.map(i => i.data), backgroundColor: items.map(i => i.color) }] };
  }, [filteredHarcamalar]);

  const barOptions = {
    responsive: true, indexAxis: 'y', maintainAspectRatio: false,
    scales: { 
      x: { beginAtZero: true, grid: { display: false } }, 
      y: { grid: { display: false }, ticks: { autoSkip: false } } 
    },
    plugins: { 
      legend: { display: false }, 
      datalabels: { 
        anchor: 'end', 
        align: 'end', 
        formatter: (val) => val > 0 ? `${val.toFixed(2)}€` : '0€', 
        font: { weight: 'bold', size: 10 } 
      } 
    }
  };

  const hasData = filteredHarcamalar.length > 0;

  return (
    <div className="w-full">
      <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <Button icon={<ArrowLeftOutlined />} onClick={() => changeMonth("prev")} type="primary" shape="circle" size="large" />
          <Title level={3} className="text-center text-gray-800 m-0 capitalize">{displayMonth}</Title>
          <Button icon={<ArrowRightOutlined />} onClick={() => changeMonth("next")} disabled={isCurrentMonth} type="primary" shape="circle" size="large" />
        </div>
      </Card>

      <AylikHarcamaTrendGrafigi />
      
      {!hasData ? (
        <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4 p-8 text-center">
          <Empty description={`${displayMonth} dönemi için harcama kaydı bulunamadı.`} />
        </Card>
      ) : (
        <>
          <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
            <Title level={4} className="text-center text-gray-700 mb-4 pt-4">Harcama Dağılımı</Title>
            <div className="p-2" style={{ height: `${(ALL_CATEGORIES.length * 35) + 100}px` }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </Card>
          
          <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
            <Title level={4} className="text-center text-gray-700 mb-4 pt-4">Giyim Harcamaları 👕</Title>
            <div className="p-2" style={{ height: '280px' }}><Bar data={giyimBarData} options={barOptions} /></div>
          </Card>

          <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
            <Title level={4} className="text-center text-gray-700 mb-4 pt-4">Aile Harcamaları 👨‍👩‍👧‍👦</Title>
            <div className="p-2" style={{ height: '220px' }}><Bar data={aileBarData} options={barOptions} /></div>
          </Card>

          <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
            <Title level={4} className="text-center text-gray-700 mb-4 pt-4">Market Detayı</Title>
            <div className="p-2" style={{ height: `${(MARKETLER.length * 32) + 100}px` }}>
              <Bar data={marketBarData} options={barOptions} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

const Raporlar = () => (
    <div className="p-4 pt-0"> 
        <RaporlarContent />
    </div>
);

export default Raporlar;