import React, { useMemo, useState, useRef, useEffect } from "react";
import { Card, Typography, Button, ConfigProvider, Spin, Select } from "antd";
import { 
  LeftOutlined, 
  RightOutlined, 
  BarChartOutlined,
  ShopOutlined,
  UserOutlined,
  HistoryOutlined
} from "@ant-design/icons";
import { useTotalsContext } from "../context/TotalsContext";
import BottomNav from "../components/Home/BottomNav";
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
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler, ChartDataLabels);

const { Title, Text } = Typography;
const { Option } = Select;

const ALL_CATEGORIES = ["Market", "Giyim", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık", "Ulaşım", "Eğlence", "Elektronik", "İletisim", "Hediye", "Restoran", "Aile", "Diğer"];
const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", "Biomarkt", "Penny", "Diğer"];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ayşe", "Yusuf", "Zeynep"];
const YILLIK_SECENEKLER = [...MARKETLER, ...GIYIM_KISILERI, ...AILE_UYELERI];

const categoryColors = {
  "Giyim": "#FF6384", "Petrol": "#FFCE56", "Kira": "#4BC0C0", "Fatura": "#9966FF", 
  "Eğitim": "#FF9F40", "Sağlık": "#C9CBCF", "Ulaşım": "#8AFF33", "Eğlence": "#FF33F6", 
  "Elektronik": "#33FFF3", "İletisim": "#FF8A33", "Market": "#338AFF", "Hediye": "#FF3333", 
  "Restoran": "#33FF8A", "Aile": "#AF52DE", "Diğer": "#AAAAAA"
};

const RaporlarContent = () => {
  const { harcamalar = [], isLoading } = useTotalsContext();
  const lineChartRef = useRef(null);
  const now = dayjs();
  
  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());
  const [activeTab, setActiveTab] = useState(null); 
  const [lineChartData, setLineChartData] = useState({ datasets: [] });
  const [selectedYillikTarget, setSelectedYillikTarget] = useState("Lidl");

  // Trend Hesaplama (6 Ay)
  const trendCalculation = useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) last6Months.push(dayjs().subtract(i, "month"));
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

  // Yıllık Analiz Hesaplama (12 Ay)
  const yillikAnalizData = useMemo(() => {
    const last12Months = [];
    for (let i = 11; i >= 0; i--) last12Months.push(dayjs().subtract(i, "month"));
    const labels = last12Months.map(m => m.format("MMM YY"));
    const data = last12Months.map(month => {
      return harcamalar
        .filter(h => {
          const t = dayjs(h.createdAt);
          return t.month() === month.month() && 
                 t.year() === month.year() && 
                 (h.altKategori === selectedYillikTarget);
        })
        .reduce((sum, h) => sum + Number(h.miktar || 0), 0);
    });
    return { labels, data };
  }, [harcamalar, selectedYillikTarget]);

  useEffect(() => {
    if (activeTab !== null) return;
    const chart = lineChartRef.current;
    if (!chart || trendCalculation.data.length === 0) return;
    const ctx = chart.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.5)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.01)");
    setLineChartData({
      labels: trendCalculation.labels,
      datasets: [{
        data: trendCalculation.data,
        fill: true,
        backgroundColor: gradient,
        borderColor: "#3b82f6",
        borderWidth: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#3b82f6",
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
      }],
    });
  }, [trendCalculation, activeTab]);

  const filteredHarcamalar = useMemo(() => {
    return harcamalar.filter((h) => {
      const t = dayjs(h.createdAt); 
      return t.month() === selectedMonth && t.year() === selectedYear && h.kategori?.toLowerCase() !== "tasarruf";
    });
  }, [harcamalar, selectedMonth, selectedYear]);

  const changeMonth = (direction) => {
    const current = dayjs().year(selectedYear).month(selectedMonth);
    const newDate = direction === "prev" ? current.subtract(1, "month") : current.add(1, "month");
    setSelectedMonth(newDate.month());
    setSelectedYear(newDate.year());
  };

  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format("MMMM YYYY");

  const getBarOptions = (fixedMax, horizontal = true) => ({
    responsive: true, 
    indexAxis: horizontal ? 'y' : 'x', 
    maintainAspectRatio: false,
    layout: { padding: { right: horizontal ? 40 : 10, top: horizontal ? 0 : 20 } }, 
    scales: { 
      x: { display: !horizontal, grid: { display: false } }, 
      y: { display: horizontal, grid: { display: false }, ticks: { font: { size: 10 } } } 
    },
    plugins: { 
      legend: { display: false }, 
      datalabels: { 
        anchor: 'end', align: horizontal ? 'end' : 'top',
        formatter: (val) => val > 0 ? `${val.toFixed(0)}€` : '', 
        font: { weight: 'bold', size: 9 }, color: '#374151'
      } 
    }
  });

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-50"><Spin size="large" /></div>;

  const renderTabContent = () => {
    if (activeTab === null) {
      return (
        <Card className="rounded-3xl shadow-sm border-none bg-white mb-4" bodyStyle={{ padding: '20px' }}>
          <Text strong className="text-gray-400 text-[10px] uppercase tracking-wider block mb-4">6 Aylık Harcama Trendi</Text>
          <div style={{ height: "200px" }}>
            <Line ref={lineChartRef} data={lineChartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, datalabels: { align: "top", formatter: (v) => `${v}€`, font: { size: 10 }, color: "#1e40af" } },
              scales: { y: { display: false }, x: { grid: { display: false }, ticks: { font: { size: 11 } } } }
            }} />
          </div>
        </Card>
      );
    }

    switch(activeTab) {
      case "Genel":
        return (
          <Card className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '16px' }}>
            <div style={{ height: '400px' }}>
              <Bar data={{
                labels: ALL_CATEGORIES,
                datasets: [{
                  data: ALL_CATEGORIES.map(cat => filteredHarcamalar.filter(h => h.kategori === cat).reduce((s, h) => s + Number(h.miktar), 0)),
                  backgroundColor: ALL_CATEGORIES.map(cat => categoryColors[cat]),
                  borderRadius: 4, barThickness: 10
                }]
              }} options={getBarOptions(null, true)} />
            </div>
          </Card>
        );
      case "Market":
        return (
          <Card className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '16px' }}>
            <div style={{ height: '450px' }}>
              <Bar data={{
                labels: MARKETLER,
                datasets: [{
                  data: MARKETLER.map(m => filteredHarcamalar.filter(h => h.kategori === "Market" && h.altKategori === m).reduce((s, h) => s + Number(h.miktar), 0)),
                  backgroundColor: "#3b82f6", borderRadius: 4, barThickness: 10
                }]
              }} options={getBarOptions(null, true)} />
            </div>
          </Card>
        );
      case "Detay":
        return (
          <div className="space-y-4">
            <Card title={<Text strong className="text-[11px] uppercase text-gray-400">Giyim Detay</Text>} className="rounded-3xl border-none shadow-sm">
              <div style={{ height: '180px' }}>
                <Bar data={{
                  labels: GIYIM_KISILERI,
                  datasets: [{ data: GIYIM_KISILERI.map(k => filteredHarcamalar.filter(h => h.kategori === "Giyim" && h.altKategori === k).reduce((s, h) => s + Number(h.miktar), 0)), backgroundColor: "#FF6384", borderRadius: 4, barThickness: 12 }]
                }} options={getBarOptions(null, true)} />
              </div>
            </Card>
          </div>
        );
      case "Yillik":
        return (
          <Card className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '16px' }}>
            <div className="flex justify-between items-center mb-4">
               <Text strong className="text-[11px] uppercase text-gray-400">Son 12 Ay Analizi</Text>
               <Select 
                 size="small" 
                 variant="filled" 
                 value={selectedYillikTarget} 
                 onChange={setSelectedYillikTarget}
                 className="w-32 rounded-lg"
               >
                 {YILLIK_SECENEKLER.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
               </Select>
            </div>
            <div style={{ height: '250px' }}>
              <Bar data={{
                labels: yillikAnalizData.labels,
                datasets: [{
                  data: yillikAnalizData.data,
                  backgroundColor: "#10b981",
                  borderRadius: 6,
                  barThickness: 15
                }]
              }} options={getBarOptions(null, false)} />
            </div>
          </Card>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">
          <Button icon={<LeftOutlined />} onClick={() => changeMonth("prev")} type="text" />
          <div className="text-center">
            <Text className="block text-[10px] uppercase tracking-tighter text-gray-400 font-bold">Raporlar</Text>
            <Title level={5} className="m-0 capitalize">{displayMonth}</Title>
          </div>
          <Button icon={<RightOutlined />} onClick={() => changeMonth("next")} type="text" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex bg-gray-200/50 p-1 rounded-2xl gap-1">
          {[
            { id: 'Genel', label: 'Genel', icon: <BarChartOutlined /> },
            { id: 'Market', label: 'Market', icon: <ShopOutlined /> },
            { id: 'Detay', label: 'Kişisel', icon: <UserOutlined /> },
            { id: 'Yillik', label: 'Yıllık', icon: <HistoryOutlined /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(prev => prev === item.id ? null : item.id)}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-bold rounded-xl transition-all ${
                activeTab === item.id ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="transition-all duration-300">{renderTabContent()}</div>
      </div>
    </div>
  );
};

const Raporlar = () => (
    <ConfigProvider theme={{ token: { borderRadius: 16, colorPrimary: '#3b82f6' } }}>
        <div className="relative min-h-screen bg-gray-50">
            <main><RaporlarContent /></main>
            <BottomNav />
        </div>
    </ConfigProvider>
);

export default Raporlar;