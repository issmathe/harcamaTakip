// pages/Raporlar.jsx
import React, { useMemo, useState, useCallback } from "react";
import { Card, Typography, Empty, Button, Row, Col, Statistic, Divider } from "antd";
import { 
  ArrowLeftOutlined, 
  ArrowRightOutlined, 
  RiseOutlined, 
  FallOutlined, 
  WalletOutlined,
  ShoppingOutlined
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

const ALL_CATEGORIES = [
  "Market", "Giyim", "Tasarruf", "Petrol", "Kira", "Fatura", "Eğitim",
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

  const filteredHarcamalar = useMemo(() => {
    return (harcamalar || []).filter((h) => {
      const t = dayjs(h.createdAt); 
      return t.month() === selectedMonth && t.year() === selectedYear;
    });
  }, [harcamalar, selectedMonth, selectedYear]);

  // --- İstatistikler ---
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

  const globalMax = useMemo(() => {
    if (!harcamalar.length) return 500;
    const totalsPerMonth = {};
    harcamalar.forEach(h => {
      const monthKey = dayjs(h.createdAt).format("YYYY-MM");
      if (!totalsPerMonth[monthKey]) totalsPerMonth[monthKey] = {};
      const cat = h.kategori || "Diğer";
      totalsPerMonth[monthKey][cat] = (totalsPerMonth[monthKey][cat] || 0) + Number(h.miktar || 0);
    });
    let maxVal = 0;
    Object.values(totalsPerMonth).forEach(monthObj => {
      const monthMax = Math.max(...Object.values(monthObj));
      if (monthMax > maxVal) maxVal = monthMax;
    });
    return maxVal > 0 ? maxVal * 1.1 : 500;
  }, [harcamalar]);

  const changeMonth = useCallback((direction) => {
      const current = dayjs().year(selectedYear).month(selectedMonth);
      const newDate = direction === "prev" ? current.subtract(1, "month") : current.add(1, "month");
      setSelectedMonth(newDate.month());
      setSelectedYear(newDate.year());
    }, [selectedMonth, selectedYear]
  );

  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format("MMMM YYYY");
  const isCurrentMonth = dayjs().month() === selectedMonth && dayjs().year() === selectedYear;

  const getBarOptions = (customMax) => ({
    responsive: true, 
    indexAxis: 'y', 
    maintainAspectRatio: false,
    scales: { 
      x: { beginAtZero: true, grid: { display: false }, max: customMax, ticks: { display: false } }, 
      y: { grid: { display: false }, ticks: { font: { size: 11 } } } 
    },
    plugins: { 
      legend: { display: false }, 
      datalabels: { 
        anchor: 'end', align: 'end', 
        formatter: (val) => val > 0 ? `${val.toFixed(0)}€` : '', 
        font: { weight: 'bold', size: 10 } 
      } 
    }
  });

  // Veri Setleri
  const barData = useMemo(() => ({
    labels: ALL_CATEGORIES,
    datasets: [{
      data: ALL_CATEGORIES.map(cat => filteredHarcamalar.filter(h => h.kategori === cat).reduce((s, h) => s + Number(h.miktar), 0)),
      backgroundColor: ALL_CATEGORIES.map(cat => categoryColors[cat]),
      borderRadius: 4, barThickness: 12
    }]
  }), [filteredHarcamalar]);

  const marketBarData = useMemo(() => ({
    labels: MARKETLER,
    datasets: [{
      data: MARKETLER.map(m => filteredHarcamalar.filter(h => h.kategori === "Market" && h.altKategori === m).reduce((s, h) => s + Number(h.miktar), 0)),
      backgroundColor: "#338AFF", borderRadius: 4, barThickness: 10
    }]
  }), [filteredHarcamalar]);

  const giyimBarData = useMemo(() => ({
    labels: GIYIM_KISILERI,
    datasets: [{
      data: GIYIM_KISILERI.map(k => filteredHarcamalar.filter(h => h.kategori === "Giyim" && h.altKategori === k).reduce((s, h) => s + Number(h.miktar), 0)),
      backgroundColor: "#FF6384", borderRadius: 4, barThickness: 15
    }]
  }), [filteredHarcamalar]);

  const aileBarData = useMemo(() => ({
    labels: AILE_UYELERI,
    datasets: [{
      data: AILE_UYELERI.map(u => filteredHarcamalar.filter(h => h.kategori === "Aile" && h.altKategori === u).reduce((s, h) => s + Number(h.miktar), 0)),
      backgroundColor: "#AF52DE", borderRadius: 4, barThickness: 15
    }]
  }), [filteredHarcamalar]);

  const hasData = filteredHarcamalar.length > 0;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* SABİT (STICKY) AY SEÇİCİ */}
      <div className="sticky top-0 z-30 bg-gray-50 pt-2 pb-4">
        <Card className="shadow-md border-none bg-blue-600 rounded-2xl mx-1">
          <div className="flex justify-between items-center text-white">
            <Button icon={<ArrowLeftOutlined />} onClick={() => changeMonth("prev")} ghost shape="circle" />
            <div className="text-center">
              <Title level={4} className="m-0 text-white capitalize" style={{ color: 'white' }}>{displayMonth}</Title>
              <Text className="text-blue-100 text-[10px] uppercase tracking-widest">Finansal Rapor</Text>
            </div>
            <Button icon={<ArrowRightOutlined />} onClick={() => changeMonth("next")} disabled={isCurrentMonth} ghost shape="circle" />
          </div>
        </Card>
      </div>

      <div className="px-1">
        <Row gutter={[12, 12]} className="mb-4">
          <Col span={12}>
            <Card className="rounded-2xl shadow-sm border-none">
              <Statistic title={<Text type="secondary" size="small">Toplam</Text>} value={stats.currentTotal} precision={2} suffix="€" prefix={<WalletOutlined className="text-blue-500" />} valueStyle={{fontSize: '18px', fontWeight: 'bold'}} />
              <div className="mt-1">
                {stats.currentTotal > stats.lastMonthTotal ? <Text type="danger" className="text-[10px]"><RiseOutlined /> Artış</Text> : <Text type="success" className="text-[10px]"><FallOutlined /> Azalış</Text>}
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card className="rounded-2xl shadow-sm border-none">
              <Statistic title={<Text type="secondary" size="small">Zirve</Text>} value={stats.topCategory[0]} prefix={<ShoppingOutlined className="text-orange-500" />} valueStyle={{ fontSize: '14px', fontWeight: 'bold' }} />
              <Text type="secondary" className="text-[10px]">{stats.topCategory[1].toFixed(1)} €</Text>
            </Card>
          </Col>
        </Row>

        <AylikHarcamaTrendGrafigi />
        
        {!hasData ? (
          <Card className="rounded-2xl mt-4 shadow-sm p-10 text-center"><Empty description="Kayıt bulunamadı" /></Card>
        ) : (
          <div className="space-y-4 mt-4">
            <Card title="Genel Dağılım" className="rounded-2xl shadow-sm border-none">
              <div style={{ height: `${(ALL_CATEGORIES.length * 30) + 50}px` }}>
                <Bar data={barData} options={getBarOptions(globalMax)} />
              </div>
            </Card>

            <Row gutter={[12, 12]}>
              <Col xs={24} md={12}>
                <Card title="Giyim" className="rounded-2xl shadow-sm border-none">
                  <div style={{ height: '180px' }}><Bar data={giyimBarData} options={getBarOptions(globalMax)} /></div>
                  <Divider className="my-4" />
                  <Title level={5} className="mb-4">Aile</Title>
                  <div style={{ height: '150px' }}><Bar data={aileBarData} options={getBarOptions(globalMax)} /></div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Market Detayı" className="rounded-2xl shadow-sm border-none">
                  <div style={{ height: `${(MARKETLER.length * 28) + 50}px` }}>
                    <Bar data={marketBarData} options={getBarOptions(globalMax)} />
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </div>
    </div>
  );
};

const Raporlar = () => (
    <div className="bg-gray-50 min-h-screen"> 
        <RaporlarContent />
    </div>
);

export default Raporlar;