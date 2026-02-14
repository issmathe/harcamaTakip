import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Card, Typography, Empty, Button, Segmented, ConfigProvider } from "antd";
import { 
  ArrowLeftOutlined, 
  ArrowRightOutlined, 
  BarChartOutlined,
  ShopOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useTotalsContext } from "../context/TotalsContext";
import { Bar, Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import dayjs from "dayjs";
import tr from "dayjs/locale/tr";

dayjs.locale(tr);
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Legend, 
  Filler, 
  ChartDataLabels
);

const { Title, Text } = Typography;

const ALL_CATEGORIES = ["Market", "Giyim", "Tasarruf", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık", "Ulaşım", "Eğlence", "Elektronik", "İletisim", "Hediye", "Restoran", "Aile", "Diğer"];
const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", "Biomarkt", "Penny", "Diğer"];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ayşe", "Yusuf", "Zeynep"];

const categoryColors = {
  "Giyim": "#FF6384", "Tasarruf": "#36A2EB", "Petrol": "#FFCE56", "Kira": "#4BC0C0",
  "Fatura": "#9966FF", "Eğitim": "#FF9F40", "Sağlık": "#C9CBCF", "Ulaşım": "#8AFF33",
  "Eğlence": "#FF33F6", "Elektronik": "#33FFF3", "İletisim": "#FF8A33", "Market": "#338AFF",
  "Hediye": "#FF3333", "Restoran": "#33FF8A", "Aile": "#AF52DE", "Diğer": "#71717a"
};

const RaporlarContent = () => {
  const { harcamalar = [] } = useTotalsContext();
  const lineChartRef = useRef(null);
  const now = dayjs();
  
  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());
  const [activeTab, setActiveTab] = useState("Genel");
  const [lineChartData, setLineChartData] = useState({ datasets: [] });

  const trendCalculation = useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      last6Months.push(dayjs().subtract(i, "month"));
    }
    const labels = last6Months.map((m) => m.format("MMM"));
    const data = last6Months.map((month) => {
      const monthTotal = harcamalar
        .filter((h) => {
          const t = dayjs(h.createdAt);
          return t.month() === month.month() && t.year() === month.year() && h.kategori?.toLowerCase() !== "tasarruf";
        })
        .reduce((sum, h) => sum + Number(h.miktar || 0), 0);
      return Number(monthTotal.toFixed(0));
    });
    return { labels, data };
  }, [harcamalar]);

  useEffect(() => {
    const chart = lineChartRef.current;
    if (!chart || trendCalculation.data.length === 0) return;
    const ctx = chart.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
    setLineChartData({
      labels: trendCalculation.labels,
      datasets: [{
        data: trendCalculation.data,
        fill: true,
        backgroundColor: gradient,
        borderColor: "#60a5fa",
        borderWidth: 2,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#60a5fa",
        pointRadius: 3,
        tension: 0.4,
      }],
    });
  }, [trendCalculation]);

  const globalMax = useMemo(() => {
    if (harcamalar.length === 0) return 500;
    const totals = {};
    harcamalar.forEach(h => {
      const key = `${dayjs(h.createdAt).format("YYYY-MM")}-${h.kategori}`;
      totals[key] = (totals[key] || 0) + Number(h.miktar);
    });
    return Math.max(...Object.values(totals), 100) * 1.2;
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
  }, [selectedMonth, selectedYear]);

  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format("MMMM YYYY");
  const isCurrentMonth = dayjs().month() === selectedMonth && dayjs().year() === selectedYear;

  const getBarOptions = useCallback((fixedMax) => ({
    responsive: true, 
    indexAxis: 'y', 
    maintainAspectRatio: false,
    layout: { padding: { right: 50 } }, 
    scales: { 
      x: { display: false, max: fixedMax }, 
      y: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' } } 
    },
    plugins: { 
      legend: { display: false }, 
      datalabels: { 
        anchor: 'end', align: 'end', offset: 4,
        formatter: (val) => val > 0 ? `${val.toFixed(0)}€` : '', 
        font: { weight: 'bold', size: 10 }, color: '#e2e8f0'
      } 
    }
  }), []);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: (ctx) => ctx.dataset.data[ctx.dataIndex] > 0,
        align: "top", offset: 10, formatter: (v) => `${v}€`,
        font: { weight: "bold", size: 10 }, color: "#60a5fa",
      },
      tooltip: { enabled: true }
    },
    scales: {
      y: { display: false, beginAtZero: true },
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#64748b" } }
    }
  };

  const barData = useMemo(() => ({
    labels: ALL_CATEGORIES,
    datasets: [{
      data: ALL_CATEGORIES.map(cat => filteredHarcamalar.filter(h => h.kategori === cat).reduce((s, h) => s + Number(h.miktar), 0)),
      backgroundColor: ALL_CATEGORIES.map(cat => categoryColors[cat]),
      borderRadius: 4, barThickness: 10
    }]
  }), [filteredHarcamalar]);

  const hasData = filteredHarcamalar.length > 0;

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "24px"
  };

  const renderTabContent = () => {
    if (!hasData) return (
      <div style={cardStyle} className="p-12 text-center">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-gray-500">Bu ay veri kaydı bulunamadı</span>} />
      </div>
    );

    switch(activeTab) {
      case "Genel":
        return (
          <div className="space-y-4">
            <Card style={cardStyle} bodyStyle={{ padding: '16px' }}>
              <div className="mb-4">
                <Text className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Aylık Trend</Text>
              </div>
              <div style={{ height: "180px" }}>
                <Line ref={lineChartRef} data={lineChartData} options={lineOptions} />
              </div>
            </Card>
            <Card style={cardStyle} bodyStyle={{ padding: '16px' }}>
              <div style={{ height: '380px' }}>
                <Bar data={barData} options={getBarOptions(globalMax)} />
              </div>
            </Card>
          </div>
        );
      case "Market":
        const marketData = MARKETLER.map(m => filteredHarcamalar.filter(h => h.kategori === "Market" && h.altKategori === m).reduce((s, h) => s + Number(h.miktar), 0));
        return (
          <Card style={cardStyle} bodyStyle={{ padding: '16px' }}>
            <div style={{ height: '420px' }}>
              <Bar data={{
                labels: MARKETLER,
                datasets: [{ data: marketData, backgroundColor: "#3b82f6", borderRadius: 4, barThickness: 10 }]
              }} options={getBarOptions(Math.max(...marketData, 50) * 1.2)} />
            </div>
          </Card>
        );
      case "Detay":
        const giyimData = GIYIM_KISILERI.map(k => filteredHarcamalar.filter(h => h.kategori === "Giyim" && h.altKategori === k).reduce((s, h) => s + Number(h.miktar), 0));
        const aileData = AILE_UYELERI.map(u => filteredHarcamalar.filter(h => h.kategori === "Aile" && h.altKategori === u).reduce((s, h) => s + Number(h.miktar), 0));
        return (
          <div className="space-y-4">
            <Card title={<Text className="text-pink-400 text-[10px] font-bold uppercase">Giyim Detay</Text>} style={cardStyle} bodyStyle={{ padding: '16px' }}>
              <div style={{ height: '160px' }}>
                <Bar data={{ labels: GIYIM_KISILERI, datasets: [{ data: giyimData, backgroundColor: "#FF6384", borderRadius: 4, barThickness: 12 }] }} options={getBarOptions(Math.max(...giyimData, 50) * 1.2)} />
              </div>
            </Card>
            <Card title={<Text className="text-purple-400 text-[10px] font-bold uppercase">Aile Detay</Text>} style={cardStyle} bodyStyle={{ padding: '16px' }}>
              <div style={{ height: '130px' }}>
                <Bar data={{ labels: AILE_UYELERI, datasets: [{ data: aileData, backgroundColor: "#AF52DE", borderRadius: 4, barThickness: 12 }] }} options={getBarOptions(Math.max(...aileData, 50) * 1.2)} />
              </div>
            </Card>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#020617] pb-32">
      {/* Header Area */}
      <div className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="flex justify-between items-center">
          <Button 
            icon={<ArrowLeftOutlined className="text-white" />} 
            onClick={() => changeMonth("prev")} 
            type="text" 
            className="hover:bg-white/5"
          />
          <div className="text-center">
            <Text className="block text-[9px] text-blue-400 font-black uppercase tracking-[0.2em]">Rapor Dönemi</Text>
            <Title level={4} className="!text-white !m-0 font-black italic tracking-tighter uppercase">{displayMonth}</Title>
          </div>
          <Button 
            icon={<ArrowRightOutlined className="text-white" />} 
            onClick={() => changeMonth("next")} 
            disabled={isCurrentMonth} 
            type="text" 
            className="hover:bg-white/5 disabled:opacity-20"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Navigation Tabs */}
        <ConfigProvider theme={{
          components: {
            Segmented: {
              itemSelectedBg: "rgba(59, 130, 246, 0.2)",
              itemSelectedColor: "#60a5fa",
              itemColor: "#94a3b8",
              trackBg: "rgba(255, 255, 255, 0.03)"
            }
          }
        }}>
          <Segmented
            block
            value={activeTab}
            onChange={setActiveTab}
            options={[
                { label: 'Trend', value: 'Genel', icon: <BarChartOutlined /> },
                { label: 'Market', value: 'Market', icon: <ShopOutlined /> },
                { label: 'Kişi', value: 'Detay', icon: <UserOutlined /> },
            ]}
            className="p-1 rounded-2xl"
          />
        </ConfigProvider>
        
        <div className="animate-in fade-in duration-500">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

const Raporlar = () => (
    <ConfigProvider theme={{ 
        token: { borderRadius: 16, colorPrimary: '#3b82f6' },
        components: {
            Card: {
                headerBg: "transparent",
                colorTextHeading: "#f8fafc"
            }
        }
    }}>
        <RaporlarContent />
    </ConfigProvider>
);

export default Raporlar;