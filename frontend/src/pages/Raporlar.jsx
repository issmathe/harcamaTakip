import React, { useMemo, useState, useCallback } from "react";
import { Card, Typography, Empty, Button, Segmented, ConfigProvider } from "antd";
import { 
  ArrowLeftOutlined, 
  ArrowRightOutlined, 
  BarChartOutlined,
  ShopOutlined,
  UserOutlined
} from "@ant-design/icons";
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
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const { Title, Text } = Typography;

const ALL_CATEGORIES = ["Market", "Giyim", "Tasarruf", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık", "Ulaşım", "Eğlence", "Elektronik", "İletisim", "Hediye", "Restoran", "Aile", "Diğer"];
const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", "Biomarkt", "Penny", "Diğer"];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ayşe", "Yusuf", "Zeynep"];

const categoryColors = {
  "Giyim": "#FF6384", "Tasarruf": "#36A2EB", "Petrol": "#FFCE56", "Kira": "#4BC0C0",
  "Fatura": "#9966FF", "Eğitim": "#FF9F40", "Sağlık": "#C9CBCF", "Ulaşım": "#8AFF33",
  "Eğlence": "#FF33F6", "Elektronik": "#33FFF3", "İletisim": "#FF8A33", "Market": "#338AFF",
  "Hediye": "#FF3333", "Restoran": "#33FF8A", "Aile": "#AF52DE", "Diğer": "#AAAAAA"
};

const RaporlarContent = () => {
  const { harcamalar = [] } = useTotalsContext();
  const now = dayjs();
  
  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());
  const [activeTab, setActiveTab] = useState("Genel");

  // ÖLÇEK TUTARLILIĞI: Tüm zamanların en yüksek kategori harcamasını bul
  const globalMax = useMemo(() => {
    if (harcamalar.length === 0) return 500;
    
    // Her ayı ve kategoriyi grupla
    const totals = {};
    harcamalar.forEach(h => {
      const monthKey = dayjs(h.createdAt).format("YYYY-MM");
      const catKey = h.kategori;
      const key = `${monthKey}-${catKey}`;
      totals[key] = (totals[key] || 0) + Number(h.miktar);
    });
    
    const max = Math.max(...Object.values(totals), 100);
    return max * 1.2; // Sağda %20 boşluk bırak
  }, [harcamalar]);

  // MARKET ÖLÇEĞİ: Market alt kategorileri için kendi içinde global max
  const globalMarketMax = useMemo(() => {
    if (harcamalar.length === 0) return 200;
    const totals = {};
    harcamalar.filter(h => h.kategori === "Market").forEach(h => {
      const monthKey = dayjs(h.createdAt).format("YYYY-MM");
      const subKey = h.altKategori || "Diğer";
      const key = `${monthKey}-${subKey}`;
      totals[key] = (totals[key] || 0) + Number(h.miktar);
    });
    const max = Math.max(...Object.values(totals), 50);
    return max * 1.2;
  }, [harcamalar]);

  const filteredHarcamalar = useMemo(() => {
    return harcamalar.filter((h) => {
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

  const getBarOptions = useCallback((fixedMax) => ({
    responsive: true, 
    indexAxis: 'y', 
    maintainAspectRatio: false,
    layout: { padding: { right: 50 } }, 
    scales: { 
      x: { 
        display: false, 
        max: fixedMax // Her ay için aynı tavan fiyat kullanılır
      }, 
      y: { 
        grid: { display: false }, 
        ticks: { font: { size: 11, weight: '500' }, color: '#4b5563' } 
      } 
    },
    plugins: { 
      legend: { display: false }, 
      datalabels: { 
        anchor: 'end', 
        align: 'end', 
        offset: 4,
        formatter: (val) => val > 0 ? `${val.toFixed(0)}€` : '', 
        font: { weight: 'bold', size: 10 },
        color: '#374151'
      } 
    }
  }), []);

  const barData = useMemo(() => {
    const data = ALL_CATEGORIES.map(cat => filteredHarcamalar.filter(h => h.kategori === cat).reduce((s, h) => s + Number(h.miktar), 0));
    return {
      labels: ALL_CATEGORIES,
      datasets: [{
        data,
        backgroundColor: ALL_CATEGORIES.map(cat => categoryColors[cat]),
        borderRadius: 4,
        barThickness: 10, 
        categoryPercentage: 0.8,
        barPercentage: 0.9
      }]
    }
  }, [filteredHarcamalar]);

  const marketBarData = useMemo(() => {
    const data = MARKETLER.map(m => filteredHarcamalar.filter(h => h.kategori === "Market" && h.altKategori === m).reduce((s, h) => s + Number(h.miktar), 0));
    return {
      labels: MARKETLER,
      datasets: [{
        data,
        backgroundColor: "#3b82f6",
        borderRadius: 4,
        barThickness: 10,
        categoryPercentage: 0.8,
        barPercentage: 0.9
      }]
    }
  }, [filteredHarcamalar]);

  const hasData = filteredHarcamalar.length > 0;

  const renderTabContent = () => {
    if (!hasData) return <div className="bg-white rounded-3xl p-12 text-center shadow-sm"><Empty description="Veri Yok" /></div>;

    switch(activeTab) {
      case "Genel":
        return (
          <>
            <AylikHarcamaTrendGrafigi />
            <Card className="rounded-3xl border-none shadow-sm mt-4" bodyStyle={{ padding: '12px' }}>
              <div style={{ height: '380px' }}>
                <Bar data={barData} options={getBarOptions(globalMax)} />
              </div>
            </Card>
          </>
        );
      case "Market":
        return (
          <Card className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '12px' }}>
            <div style={{ height: '420px' }}>
              <Bar data={marketBarData} options={getBarOptions(globalMarketMax)} />
            </div>
          </Card>
        );
      case "Detay":
        const giyimData = GIYIM_KISILERI.map(k => filteredHarcamalar.filter(h => h.kategori === "Giyim" && h.altKategori === k).reduce((s, h) => s + Number(h.miktar), 0));
        const aileData = AILE_UYELERI.map(u => filteredHarcamalar.filter(h => h.kategori === "Aile" && h.altKategori === u).reduce((s, h) => s + Number(h.miktar), 0));
        
        return (
          <div className="space-y-4">
            <Card title={<Text strong className="text-[11px] uppercase text-gray-400">Giyim Detay</Text>} className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '12px' }}>
              <div style={{ height: '160px' }}>
                <Bar data={{
                  labels: GIYIM_KISILERI,
                  datasets: [{ data: giyimData, backgroundColor: "#FF6384", borderRadius: 4, barThickness: 12 }]
                }} options={getBarOptions(globalMax)} />
              </div>
            </Card>
            <Card title={<Text strong className="text-[11px] uppercase text-gray-400">Aile Detay</Text>} className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '12px' }}>
              <div style={{ height: '130px' }}>
                <Bar data={{
                  labels: AILE_UYELERI,
                  datasets: [{ data: aileData, backgroundColor: "#AF52DE", borderRadius: 4, barThickness: 12 }]
                }} options={getBarOptions(globalMax)} />
              </div>
            </Card>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">
          <Button icon={<ArrowLeftOutlined />} onClick={() => changeMonth("prev")} type="text" />
          <div className="text-center">
            <Text className="block text-[10px] text-gray-400 font-bold uppercase">Rapor Dönemi</Text>
            <Title level={5} className="m-0" style={{ margin: 0 }}>{displayMonth}</Title>
          </div>
          <Button icon={<ArrowRightOutlined />} onClick={() => changeMonth("next")} disabled={isCurrentMonth} type="text" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-gray-200/50 p-1 rounded-xl">
            <Segmented
              block
              value={activeTab}
              onChange={setActiveTab}
              options={[
                  { label: 'Genel', value: 'Genel', icon: <BarChartOutlined /> },
                  { label: 'Market', value: 'Market', icon: <ShopOutlined /> },
                  { label: 'Kişisel', value: 'Detay', icon: <UserOutlined /> },
              ]}
            />
        </div>
        
        <div className="transition-opacity duration-300">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

const Raporlar = () => (
    <ConfigProvider theme={{ token: { borderRadius: 16, colorPrimary: '#3b82f6' } }}>
        <RaporlarContent />
    </ConfigProvider>
);

export default Raporlar;