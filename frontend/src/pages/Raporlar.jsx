import React, { useMemo, useState, useCallback } from "react";
import { Card, Typography, Empty, Button, Row, Col, Segmented, ConfigProvider } from "antd";
import { 
  ArrowLeftOutlined, 
  ArrowRightOutlined, 
  RiseOutlined, 
  FallOutlined, 
  WalletOutlined,
  ShoppingOutlined,
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

// Sabitleri dışarıda tutmak render maliyetini düşürür
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

  // Tek seferde filtreleme yapıp cache'liyoruz
  const filteredHarcamalar = useMemo(() => {
    return harcamalar.filter((h) => {
      const t = dayjs(h.createdAt); 
      return t.month() === selectedMonth && t.year() === selectedYear;
    });
  }, [harcamalar, selectedMonth, selectedYear]);

  const stats = useMemo(() => {
    const currentTotal = filteredHarcamalar.reduce((sum, h) => sum + Number(h.miktar || 0), 0);
    const lastMonthDate = dayjs().year(selectedYear).month(selectedMonth).subtract(1, 'month');
    const lastMonthTotal = harcamalar
      .filter(h => dayjs(h.createdAt).month() === lastMonthDate.month() && dayjs(h.createdAt).year() === lastMonthDate.year())
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

    const catTotals = {};
    filteredHarcamalar.forEach(h => {
        const cat = h.kategori || "Diğer";
        catTotals[cat] = (catTotals[cat] || 0) + Number(h.miktar);
    });
    const topCategory = Object.entries(catTotals).sort((a,b) => b[1] - a[1])[0] || ["-", 0];

    return { currentTotal, lastMonthTotal, topCategory };
  }, [filteredHarcamalar, harcamalar, selectedMonth, selectedYear]);

  const changeMonth = useCallback((direction) => {
      const current = dayjs().year(selectedYear).month(selectedMonth);
      const newDate = direction === "prev" ? current.subtract(1, "month") : current.add(1, "month");
      setSelectedMonth(newDate.month());
      setSelectedYear(newDate.year());
    }, [selectedMonth, selectedYear]
  );

  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format("MMMM YYYY");
  const isCurrentMonth = dayjs().month() === selectedMonth && dayjs().year() === selectedYear;

  const getBarOptions = useCallback(() => ({
    responsive: true, 
    indexAxis: 'y', 
    maintainAspectRatio: false,
    animation: { duration: 400 }, // Animasyon süresini kısalttık (hızlandık)
    scales: { 
      x: { display: false }, 
      y: { grid: { display: false }, ticks: { font: { size: 12 }, color: '#4b5563' } } 
    },
    plugins: { 
      legend: { display: false }, 
      datalabels: { 
        anchor: 'end', align: 'end', 
        formatter: (val) => val > 0 ? `${val.toFixed(0)}€` : '', 
        font: { weight: 'bold', size: 10 } 
      } 
    }
  }), []);

  const barData = useMemo(() => ({
    labels: ALL_CATEGORIES,
    datasets: [{
      data: ALL_CATEGORIES.map(cat => filteredHarcamalar.filter(h => h.kategori === cat).reduce((s, h) => s + Number(h.miktar), 0)),
      backgroundColor: ALL_CATEGORIES.map(cat => categoryColors[cat]),
      borderRadius: 6, barThickness: 14
    }]
  }), [filteredHarcamalar]);

  const marketBarData = useMemo(() => ({
    labels: MARKETLER,
    datasets: [{
      data: MARKETLER.map(m => filteredHarcamalar.filter(h => h.kategori === "Market" && h.altKategori === m).reduce((s, h) => s + Number(h.miktar), 0)),
      backgroundColor: "#3b82f6", borderRadius: 6, barThickness: 12
    }]
  }), [filteredHarcamalar]);

  // Tab içeriğini fonksiyonla yönetmek gereksiz render'ı önler
  const renderTabContent = () => {
    if (!hasData) return <div className="bg-white rounded-3xl p-12 text-center"><Empty description="Veri Yok" /></div>;

    switch(activeTab) {
      case "Genel":
        return (
          <Card className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '15px' }}>
            <div style={{ height: '450px' }}><Bar data={barData} options={getBarOptions()} /></div>
          </Card>
        );
      case "Market":
        return (
          <Card className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '15px' }}>
            <div style={{ height: '520px' }}><Bar data={marketBarData} options={getBarOptions()} /></div>
          </Card>
        );
      case "Detay":
        return (
          <div className="space-y-4">
            <Card title="Giyim" className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '15px' }}>
              <div style={{ height: '200px' }}>
                <Bar data={{
                  labels: GIYIM_KISILERI,
                  datasets: [{ data: GIYIM_KISILERI.map(k => filteredHarcamalar.filter(h => h.kategori === "Giyim" && h.altKategori === k).reduce((s, h) => s + Number(h.miktar), 0)), backgroundColor: "#FF6384", borderRadius: 6, barThickness: 18 }]
                }} options={getBarOptions()} />
              </div>
            </Card>
            <Card title="Aile" className="rounded-3xl border-none shadow-sm" bodyStyle={{ padding: '15px' }}>
              <div style={{ height: '160px' }}>
                <Bar data={{
                  labels: AILE_UYELERI,
                  datasets: [{ data: AILE_UYELERI.map(u => filteredHarcamalar.filter(h => h.kategori === "Aile" && h.altKategori === u).reduce((s, h) => s + Number(h.miktar), 0)), backgroundColor: "#AF52DE", borderRadius: 6, barThickness: 18 }]
                }} options={getBarOptions()} />
              </div>
            </Card>
          </div>
        );
      default: return null;
    }
  };

  const hasData = filteredHarcamalar.length > 0;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      {/* HEADER: Blur yerine katı renk kullanımı performansı artırır */}
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
        <Row gutter={12}>
          <Col span={12}>
            <div className="bg-white p-4 rounded-3xl border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <WalletOutlined className="text-blue-500" />
                <Text type="secondary" className="text-xs">Toplam</Text>
              </div>
              <Title level={4} className="m-0">{stats.currentTotal.toFixed(0)}€</Title>
              <Text type={stats.currentTotal > stats.lastMonthTotal ? "danger" : "success"} className="text-[10px] font-bold">
                {stats.currentTotal > stats.lastMonthTotal ? <RiseOutlined /> : <FallOutlined />} 
                {stats.lastMonthTotal > 0 ? ` %${Math.abs(((stats.currentTotal-stats.lastMonthTotal)/stats.lastMonthTotal)*100).toFixed(0)}` : ' -'}
              </Text>
            </div>
          </Col>
          <Col span={12}>
            <div className="bg-white p-4 rounded-3xl border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingOutlined className="text-orange-500" />
                <Text type="secondary" className="text-xs">Zirve</Text>
              </div>
              <Title level={4} className="m-0 truncate" style={{fontSize: '15px'}}>{stats.topCategory[0]}</Title>
              <Text className="text-[10px] text-gray-400 font-bold">{stats.topCategory[1].toFixed(0)}€</Text>
            </div>
          </Col>
        </Row>

        <AylikHarcamaTrendGrafigi />

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
    <ConfigProvider theme={{ token: { borderRadius: 16 } }}>
        <RaporlarContent />
    </ConfigProvider>
);

export default Raporlar;