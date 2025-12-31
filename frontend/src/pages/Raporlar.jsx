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

// --- SABİTLER ---
const ALL_CATEGORIES = [
  "Giyim", "Bağış", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık",
  "Ulaşım", "Eğlence", "Elektronik", "İletisim", "Market", "Hediye",
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

const marketColors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF", "#8AFF33", "#FF33F6", "#33FFF3", "#FF8A33", "#338AFF", "#FF3333", "#33FF8A", "#AAAAAA"];
const giyimColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"];
const aileColors = ["#FF7043", "#00ACC1", "#FFD54F"];

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

  const barData = useMemo(() => {
    const totals = {};
    ALL_CATEGORIES.forEach(cat => totals[cat] = 0);

    filteredHarcamalar.forEach(h => {
      let key = h.kategori;
      if (key === "Restoran / Kafe") key = "Restoran";
      else if (!ALL_CATEGORIES.includes(key)) key = "Diğer";
      
      totals[key] = (totals[key] || 0) + Number(h.miktar || 0);
    });

    const chartDataItems = Object.keys(totals)
      .filter(k => totals[k] > 0)
      .map(label => ({ label, data: totals[label], color: categoryColors[label] || "#AAAAAA" }))
      .sort((a, b) => a.data - b.data);

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

  const marketBarData = useMemo(() => {
    const marketTotals = {};
    const marketHarcamalar = filteredHarcamalar.filter(h => h.kategori === "Market");
    marketHarcamalar.forEach(h => {
      const altKategori = h.altKategori || "Diğer";
      const key = MARKETLER.includes(altKategori) ? altKategori : "Diğer";
      marketTotals[key] = (marketTotals[key] || 0) + Number(h.miktar || 0);
    });
    const items = Object.keys(marketTotals).filter(k => marketTotals[k] > 0).map((label, idx) => ({ label, data: marketTotals[label], color: marketColors[idx % marketColors.length] })).sort((a, b) => a.data - b.data);
    return { labels: items.map(i => i.label), datasets: [{ label: "Market (€)", data: items.map(i => i.data), backgroundColor: items.map(i => i.color) }] };
  }, [filteredHarcamalar]);

  const giyimBarData = useMemo(() => {
    const giyimTotals = {};
    const giyimHarcamalar = filteredHarcamalar.filter(h => h.kategori === "Giyim");
    GIYIM_KISILERI.forEach(kisi => giyimTotals[kisi] = 0);
    giyimHarcamalar.forEach(h => {
      const key = GIYIM_KISILERI.includes(h.altKategori) ? h.altKategori : "Hediye";
      giyimTotals[key] = (giyimTotals[key] || 0) + Number(h.miktar || 0);
    });
    const items = Object.keys(giyimTotals).filter(k => giyimTotals[k] > 0).map((label, idx) => ({ label, data: giyimTotals[label], color: giyimColors[idx % giyimColors.length] })).sort((a, b) => a.data - b.data);
    return { labels: items.map(i => i.label), datasets: [{ label: "Giyim (€)", data: items.map(i => i.data), backgroundColor: items.map(i => i.color) }] };
  }, [filteredHarcamalar]);

  const aileBarData = useMemo(() => {
    const aileTotals = {};
    AILE_UYELERI.forEach(uye => aileTotals[uye] = 0);
    
    const aileHarcamalar = filteredHarcamalar.filter(h => h.kategori === "Aile");
    aileHarcamalar.forEach(h => {
      const key = h.altKategori;
      // Sadece listedeki 3 kişi için veri varsa toplama ekle
      if (AILE_UYELERI.includes(key)) {
        aileTotals[key] = (aileTotals[key] || 0) + Number(h.miktar || 0);
      }
    });

    const items = Object.keys(aileTotals)
      .filter(k => aileTotals[k] > 0)
      .map((label, idx) => ({ 
        label, 
        data: aileTotals[label], 
        color: aileColors[idx % aileColors.length] 
      }))
      .sort((a, b) => a.data - b.data);

    return { 
      labels: items.map(i => i.label), 
      datasets: [{ 
        label: "Aile (€)", 
        data: items.map(i => i.data), 
        backgroundColor: items.map(i => i.color) 
      }] 
    };
  }, [filteredHarcamalar]);

  const barOptions = {
    responsive: true, indexAxis: 'y', maintainAspectRatio: false,
    scales: { x: { beginAtZero: true, grid: { display: false } }, y: { grid: { display: false } } },
    plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', formatter: (val) => `${val.toFixed(2)}€`, font: { weight: 'bold' } } }
  };

  const hasData = barData.datasets[0]?.data.length > 0;
  const hasMarketData = marketBarData.datasets[0]?.data.length > 0;
  const hasGiyimData = giyimBarData.datasets[0]?.data.length > 0; 
  const hasAileData = aileBarData.datasets[0]?.data.length > 0;

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
      
      <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
        <Title level={4} className="text-center text-gray-700 mb-4">Kategorilere Göre Harcama Dağılımı</Title>
        {hasData ? (
          <div className="p-2" style={{ height: `${(barData.labels.length * 35) + 100}px`, minHeight: '300px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        ) : <Empty description="Harcama verisi yok." />}
      </Card>
      
      {hasGiyimData && (
        <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
          <Title level={4} className="text-center text-gray-700 mb-4">Giyim Harcamaları 👕</Title>
          <div className="p-2" style={{ height: '250px' }}><Bar data={giyimBarData} options={barOptions} /></div>
        </Card>
      )}

      {hasAileData && (
        <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
          <Title level={4} className="text-center text-gray-700 mb-4">Aile Harcamaları 👨‍👩‍👧‍👦</Title>
          <div className="p-2" style={{ height: '250px' }}><Bar data={aileBarData} options={barOptions} /></div>
        </Card>
      )}

      {hasMarketData && (
        <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
          <Title level={4} className="text-center text-gray-700 mb-4">Market Harcamaları Detayı</Title>
          <div className="p-2" style={{ height: `${(marketBarData.labels.length * 30) + 100}px`, minHeight: '300px' }}>
            <Bar data={marketBarData} options={barOptions} />
          </div>
        </Card>
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