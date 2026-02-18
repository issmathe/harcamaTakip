import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Card, Typography, Empty, Button, ConfigProvider, Spin, Segmented } from "antd";
import { 
  LeftOutlined, 
  RightOutlined, 
  BarChartOutlined,
  ShopOutlined,
  UserOutlined,
  HistoryOutlined,
  TeamOutlined,
  CalendarOutlined
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

const ALL_CATEGORIES = ["Market", "Giyim", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık", "Ulaşım", "Eğlence", "Elektronik", "İletisim", "Hediye", "Restoran", "Aile", "Diğer"];
const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", "Biomarkt", "Penny", "Diğer"];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ayşe", "Yusuf", "Zeynep"];

const categoryColors = {
  "Giyim": "#FF6384", "Petrol": "#FFCE56", "Kira": "#4BC0C0", "Fatura": "#9966FF", "Eğitim": "#FF9F40", "Sağlık": "#C9CBCF", "Ulaşım": "#8AFF33", "Eğlence": "#FF33F6", "Elektronik": "#33FFF3", "İletisim": "#FF8A33", "Market": "#338AFF", "Hediye": "#FF3333", "Restoran": "#33FF8A", "Aile": "#AF52DE", "Diğer": "#AAAAAA"
};

const RaporlarContent = () => {
  const { harcamalar = [], isLoading } = useTotalsContext();
  const lineChartRef = useRef(null);
  const now = dayjs();
  
  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());
  const [activeTab, setActiveTab] = useState(null); 
  const [lineChartData, setLineChartData] = useState({ datasets: [] });

  const [yillikSubTab, setYillikSubTab] = useState("Market");
  const [timeRange, setTimeRange] = useState("YTD");

  // Trend verisindeki virgülleri Math.round ile kökten temizledim
  const trendCalculation = useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) last6Months.push(dayjs().subtract(i, "month"));
    return {
      labels: last6Months.map((m) => m.format("MMM")),
      data: last6Months.map((month) => {
        const total = harcamalar
          .filter((h) => dayjs(h.createdAt).month() === month.month() && dayjs(h.createdAt).year() === month.year() && h.kategori?.toLowerCase() !== "tasarruf")
          .reduce((sum, h) => sum + Number(h.miktar || 0), 0);
        return Math.round(total); 
      })
    };
  }, [harcamalar]);

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
      datasets: [{ data: trendCalculation.data, fill: true, backgroundColor: gradient, borderColor: "#3b82f6", borderWidth: 3, tension: 0.4 }],
    });
  }, [trendCalculation, activeTab]);

  const globalMax = useMemo(() => {
    const totals = {};
    harcamalar.forEach(h => { if (h.kategori?.toLowerCase() !== "tasarruf") { const key = `${dayjs(h.createdAt).format("YYYY-MM")}-${h.kategori}`; totals[key] = (totals[key] || 0) + Number(h.miktar); } });
    return Math.max(...Object.values(totals), 100) * 1.2;
  }, [harcamalar]);

  const globalMarketMax = useMemo(() => {
    const totals = {};
    harcamalar.filter(h => h.kategori === "Market").forEach(h => { const key = `${dayjs(h.createdAt).format("YYYY-MM")}-${h.altKategori || "Diğer"}`; totals[key] = (totals[key] || 0) + Number(h.miktar); });
    return Math.max(...Object.values(totals), 50) * 1.2;
  }, [harcamalar]);

  const filteredHarcamalar = useMemo(() => {
    return harcamalar.filter((h) => dayjs(h.createdAt).month() === selectedMonth && dayjs(h.createdAt).year() === selectedYear && h.kategori?.toLowerCase() !== "tasarruf");
  }, [harcamalar, selectedMonth, selectedYear]);

  const changeMonth = useCallback((direction) => {
    const current = dayjs().year(selectedYear).month(selectedMonth);
    const newDate = direction === "prev" ? current.subtract(1, "month") : current.add(1, "month");
    setSelectedMonth(newDate.month());
    setSelectedYear(newDate.year());
  }, [selectedMonth, selectedYear]);

  const getBarOptions = useCallback((fixedMax) => ({
    responsive: true, indexAxis: 'y', maintainAspectRatio: false,
    layout: { padding: { right: 50 } }, 
    scales: { x: { display: false, max: fixedMax }, y: { grid: { display: false }, ticks: { font: { size: 11, weight: '500' }, color: '#4b5563' } } },
    plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', offset: 4, formatter: (val) => val > 0 ? `${Math.round(val)}€` : '', font: { weight: 'bold', size: 10 }, color: '#374151' } }
  }), []);

 const yillikAnalizVeri = useMemo(() => {
    const baslangicTarihi = timeRange === "YTD" ? dayjs().startOf('year') : dayjs().subtract(12, 'month');
    const aralikHarcamalar = harcamalar.filter(h => dayjs(h.createdAt).isAfter(baslangicTarihi));

    // Kategoriye göre süzüp sonra alt kategori toplamlarını alan geliştirilmiş fonksiyon
    const calculateDetailed = (list, categoryName) => list.map(item => ({
        name: item,
        total: aralikHarcamalar
          .filter(h => h.kategori === categoryName && h.altKategori === item)
          .reduce((s, h) => s + Number(h.miktar), 0)
    })).filter(i => i.total > 0).sort((a, b) => b.total - a.total);

    return { 
      market: calculateDetailed(MARKETLER, 'Market'), 
      giyim: calculateDetailed(GIYIM_KISILERI, 'Giyim'), 
      aile: calculateDetailed(AILE_UYELERI, 'Aile') 
    };
  }, [harcamalar, timeRange]);

  const renderYillikContent = () => {
    let currentData = [];
    let color = "#3b82f6";
    if (yillikSubTab === "Market") { currentData = yillikAnalizVeri.market; color = "#3b82f6"; }
    else if (yillikSubTab === "Giyim") { currentData = yillikAnalizVeri.giyim; color = "#FF6384"; }
    else { currentData = yillikAnalizVeri.aile; color = "#AF52DE"; }

    if (currentData.length === 0) return <Empty description="Veri bulunamadı" />;

    return (
      <div className="space-y-6">
        <div className="flex justify-center">
            <Segmented
                value={timeRange}
                onChange={setTimeRange}
                options={[
                    { label: 'Yılbaşından Bu Yana', value: 'YTD', icon: <CalendarOutlined /> },
                    { label: 'Son 12 Ay', value: '12AY', icon: <HistoryOutlined /> }
                ]}
                className="bg-gray-100 p-1 rounded-xl"
            />
        </div>
        <div style={{ height: '300px' }}>
            <Bar 
              data={{
                  labels: currentData.map(d => d.name),
                  datasets: [{ data: currentData.map(d => d.total), backgroundColor: color, borderRadius: 6, barThickness: currentData.length > 5 ? 18 : 35 }]
              }}
              options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'top', formatter: (v) => `${Math.round(v)}€`, font: { size: 10, weight: 'bold' }, color: '#4b5563', offset: 5 } },
                  scales: { y: { display: false, beginAtZero: true }, x: { grid: { display: false }, ticks: { font: { size: 10 }, autoSkip: false, maxRotation: 45, minRotation: 45 } } },
                  layout: { padding: { top: 25 } }
              }}
            />
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-50"><Spin size="large" /></div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">
          <Button icon={<LeftOutlined />} onClick={() => changeMonth("prev")} type="text" />
          <div className="text-center">
            <Text className="block text-[10px] uppercase tracking-tighter text-gray-400 font-bold">Raporlar</Text>
            <Title level={5} className="m-0 capitalize" style={{ margin: 0 }}>{dayjs().year(selectedYear).month(selectedMonth).format("MMMM YYYY")}</Title>
          </div>
          <Button icon={<RightOutlined />} onClick={() => changeMonth("next")} disabled={dayjs().year(selectedYear).month(selectedMonth).isAfter(now, 'month')} type="text" />
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
            <button key={item.id} onClick={() => setActiveTab(prev => prev === item.id ? null : item.id)} className={`flex flex-1 items-center justify-center gap-2 py-2 text-[12px] font-bold rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>{item.icon} {item.label}</button>
          ))}
        </div>

        {activeTab === "Yillik" && (
          <div className="flex bg-blue-50/50 p-1 rounded-xl gap-2 border border-blue-100">
            {[{ id: 'Market', label: 'Market', icon: <ShopOutlined /> }, { id: 'Giyim', label: 'Giyim', icon: <UserOutlined /> }, { id: 'Aile', label: 'Aile', icon: <TeamOutlined /> }].map((sub) => (
              <button key={sub.id} onClick={() => setYillikSubTab(sub.id)} className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold rounded-lg transition-all ${yillikSubTab === sub.id ? 'bg-blue-500 text-white shadow-md' : 'text-blue-400'}`}>{sub.icon} {sub.label}</button>
            ))}
          </div>
        )}

        <div className="transition-all duration-300">
          {activeTab === null ? (
            <Card className="rounded-3xl shadow-sm border-none bg-white mb-4" bodyStyle={{ padding: '20px' }}>
              <div className="mb-4"><Text strong className="text-gray-400 text-[10px] uppercase tracking-wider">6 Aylık Harcama Trendi</Text></div>
              <div style={{ height: "200px" }}>
                <Line ref={lineChartRef} data={lineChartData} options={{ 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  plugins: { 
                    legend: { display: false }, 
                    datalabels: { align: "top", offset: 10, formatter: (v) => `${Math.round(v)}€`, font: { weight: "bold", size: 10 }, color: "#1e40af" } 
                  }, 
                  scales: { y: { display: false }, x: { grid: { display: false } } }, 
                  layout: { padding: { top: 25, left: 10, right: 10 } } 
                }} />
              </div>
            </Card>
          ) : activeTab === "Yillik" ? (
            <Card className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '16px' }}>{renderYillikContent()}</Card>
          ) : filteredHarcamalar.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-50"><Empty description="Kayıt yok" /></div>
          ) : activeTab === "Genel" ? (
            <Card className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '16px' }}><div style={{ height: '400px' }}><Bar data={{ labels: ALL_CATEGORIES, datasets: [{ data: ALL_CATEGORIES.map(cat => filteredHarcamalar.filter(h => h.kategori === cat).reduce((s, h) => s + Number(h.miktar), 0)), backgroundColor: ALL_CATEGORIES.map(cat => categoryColors[cat]), borderRadius: 4, barThickness: 10 }] }} options={getBarOptions(globalMax)} /></div></Card>
          ) : activeTab === "Market" ? (
            <Card className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '16px' }}><div style={{ height: '450px' }}><Bar data={{ labels: MARKETLER, datasets: [{ data: MARKETLER.map(m => filteredHarcamalar.filter(h => h.kategori === "Market" && h.altKategori === m).reduce((s, h) => s + Number(h.miktar), 0)), backgroundColor: "#3b82f6", borderRadius: 4, barThickness: 10 }] }} options={getBarOptions(globalMarketMax)} /></div></Card>
          ) : activeTab === "Detay" ? (
            <div className="space-y-4">
              <Card title={<Text strong className="text-[11px] uppercase text-gray-400 tracking-wider">Giyim Detay</Text>} className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '16px' }}><div style={{ height: '180px' }}><Bar data={{ labels: GIYIM_KISILERI, datasets: [{ data: GIYIM_KISILERI.map(k => filteredHarcamalar.filter(h => h.kategori === "Giyim" && h.altKategori === k).reduce((s, h) => s + Number(h.miktar), 0)), backgroundColor: "#FF6384", borderRadius: 4, barThickness: 12 }] }} options={getBarOptions(globalMax)} /></div></Card>
              <Card title={<Text strong className="text-[11px] uppercase text-gray-400 tracking-wider">Aile Detay</Text>} className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '16px' }}><div style={{ height: '150px' }}><Bar data={{ labels: AILE_UYELERI, datasets: [{ data: AILE_UYELERI.map(u => filteredHarcamalar.filter(h => h.kategori === "Aile" && h.altKategori === u).reduce((s, h) => s + Number(h.miktar), 0)), backgroundColor: "#AF52DE", borderRadius: 4, barThickness: 12 }] }} options={getBarOptions(globalMax)} /></div></Card>
            </div>
          ) : null}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

const Raporlar = () => (
    <ConfigProvider theme={{ token: { borderRadius: 16, colorPrimary: '#3b82f6' } }}>
        <div className="relative min-h-screen bg-gray-50"><RaporlarContent /></div>
    </ConfigProvider>
);

export default Raporlar;