// Raporlar.jsx dosyasının tam ve hatasız hali (Transfer Alanı Eklenmiş)

import React, { useMemo, useState, useCallback } from "react";
import { Card, Typography, Empty, Button, Statistic, Row, Col } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined, SwapOutlined } from "@ant-design/icons";
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
const AILE_UYELERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep"];

const categoryColors = {
  "Giyim": "#FF6384", "Bağış": "#36A2EB", "Petrol": "#FFCE56", "Kira": "#4BC0C0",
  "Fatura": "#9966FF", "Eğitim": "#FF9F40", "Sağlık": "#C9CBCF", "Ulaşım": "#8AFF33",
  "Eğlence": "#FF33F6", "Elektronik": "#33FFF3", "İletisim": "#FF8A33", "Market": "#338AFF",
  "Hediye": "#FF3333", "Restoran": "#33FF8A", "Aile": "#AF52DE", "Transfer": "#FF9800",
  "Diğer": "#AAAAAA"
};

const marketColors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF", "#8AFF33", "#FF33F6", "#33FFF3", "#FF8A33", "#338AFF", "#FF3333", "#33FF8A", "#AAAAAA", "#58508D", "#BC5090"];
const giyimColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];
const aileColors = ["#8E24AA", "#FF7043", "#00ACC1", "#FFD54F"];
const transferColors = ["#FF9800", "#FB8C00", "#F57C00", "#EF6C00"];
// -----------------

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

  // Yeni: Sadece Transferleri Filtrele
  const transferHarcamalari = useMemo(() => {
    return filteredHarcamalar.filter(h => h.kategori?.toLowerCase() === "transfer");
  }, [filteredHarcamalar]);

  const changeMonth = useCallback((direction) => {
      const current = dayjs().year(selectedYear).month(selectedMonth);
      const newDate = direction === "prev" ? current.subtract(1, "month") : current.add(1, "month");
      setSelectedMonth(newDate.month());
      setSelectedYear(newDate.year());
    }, [selectedMonth, selectedYear]
  );

  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format("MMMM YYYY");
  const isCurrentMonth = dayjs().month() === selectedMonth && dayjs().year() === selectedYear;

  // ----------------------------------------------------
  // I. Kategori Harcama Toplamları (Transfer Hariç)
  // ----------------------------------------------------
  const barData = useMemo(() => {
    const totals = {};
    ALL_CATEGORIES.forEach(cat => totals[cat] = 0);

    filteredHarcamalar.forEach(h => {
      if(h.kategori?.toLowerCase() === "transfer") return; // Transferleri bu grafikte gösterme
      
      let key = h.kategori;
      if (key === "Restoran / Kafe") key = "Restoran";
      else if (!ALL_CATEGORIES.includes(key)) key = "Diğer";
      
      totals[key] = (totals[key] || 0) + Number(h.miktar || 0);
    });

    const chartDataItems = Object.keys(totals)
      .filter(k => totals[k] > 0)
      .map(label => ({ label, data: totals[label], color: categoryColors[label] }))
      .sort((a, b) => a.data - b.data);

    return {
      labels: chartDataItems.map(item => item.label),
      datasets: [{
          label: "Toplam Harcama (€)",
          data: chartDataItems.map(item => item.data),
          backgroundColor: chartDataItems.map(item => item.color),
          borderColor: chartDataItems.map(item => item.color + 'AA'),
          borderWidth: 1,
      }]
    };
  }, [filteredHarcamalar]);

  // ----------------------------------------------------
  // II. Transfer Detay Grafiği
  // ----------------------------------------------------
  const transferBarData = useMemo(() => {
    const transferTotals = {};
    transferHarcamalari.forEach(h => {
      const key = h.altKategori || "Belirtilmemiş";
      transferTotals[key] = (transferTotals[key] || 0) + Number(h.miktar || 0);
    });

    const chartDataItems = Object.keys(transferTotals)
      .map((label, index) => ({
        label,
        data: transferTotals[label],
        color: transferColors[index % transferColors.length]
      }))
      .sort((a, b) => b.data - a.data);

    return {
      labels: chartDataItems.map(item => item.label),
      datasets: [{
          label: "Transfer (€)",
          data: chartDataItems.map(item => item.data),
          backgroundColor: chartDataItems.map(item => item.color),
          borderWidth: 1,
      }]
    };
  }, [transferHarcamalari]);

  // Diğer Market/Giyim/Aile Memo'ları (Kod kalabalığı yapmaması için aynı mantıkla devam ediyor...)
  // [Burada senin gönderdiğin marketBarData, giyimBarData, aileBarData ve stackedBarData kodları aynı şekilde yer alıyor]
  
  const marketBarData = useMemo(() => {
    const marketTotals = {};
    const marketHarcamalar = filteredHarcamalar.filter(h => h.kategori === "Market");
    marketHarcamalar.forEach(h => {
      const altKategori = h.altKategori || "Diğer";
      const key = MARKETLER.includes(altKategori) ? altKategori : "Diğer";
      marketTotals[key] = (marketTotals[key] || 0) + Number(h.miktar || 0);
    });
    const chartDataItems = Object.keys(marketTotals).filter(k => marketTotals[k] > 0).map((label, index) => ({ label, data: marketTotals[label], color: marketColors[index % marketColors.length] })).sort((a, b) => a.data - b.data);
    return { labels: chartDataItems.map(item => item.label), datasets: [{ label: "Market (€)", data: chartDataItems.map(item => item.data), backgroundColor: chartDataItems.map(item => item.color), borderWidth: 1 }] };
  }, [filteredHarcamalar]);

  const giyimBarData = useMemo(() => {
    const giyimTotals = {};
    const giyimHarcamalar = filteredHarcamalar.filter(h => h.kategori === "Giyim");
    GIYIM_KISILERI.forEach(kisi => giyimTotals[kisi] = 0);
    giyimHarcamalar.forEach(h => {
      const altKategori = h.altKategori || "Diğer"; 
      const key = GIYIM_KISILERI.includes(altKategori) ? altKategori : "Diğer";
      giyimTotals[key] = (giyimTotals[key] || 0) + Number(h.miktar || 0);
    });
    const chartDataItems = Object.keys(giyimTotals).filter(k => giyimTotals[k] > 0).map((label, index) => ({ label, data: giyimTotals[label], color: giyimColors[index % giyimColors.length] })).sort((a, b) => a.data - b.data);
    return { labels: chartDataItems.map(item => item.label), datasets: [{ label: "Giyim (€)", data: chartDataItems.map(item => item.data), backgroundColor: chartDataItems.map(item => item.color), borderWidth: 1 }] };
  }, [filteredHarcamalar]);

  const aileBarData = useMemo(() => {
    const aileTotals = {};
    const aileHarcamalar = filteredHarcamalar.filter((h) => h.kategori === "Aile");
    AILE_UYELERI.forEach((uye) => (aileTotals[uye] = 0));
    aileTotals["Ortak"] = 0;
    aileHarcamalar.forEach((h) => {
      const altKategori = h.altKategori || "Ortak";
      const key = AILE_UYELERI.includes(altKategori) ? altKategori : "Ortak";
      aileTotals[key] = (aileTotals[key] || 0) + Number(h.miktar || 0);
    });
    const chartDataItems = Object.keys(aileTotals).filter((k) => aileTotals[k] > 0).map((label, index) => ({ label, data: aileTotals[label], color: aileColors[index % aileColors.length] })).sort((a, b) => a.data - b.data);
    return { labels: chartDataItems.map((item) => item.label), datasets: [{ label: "Aile (€)", data: chartDataItems.map((item) => item.data), backgroundColor: chartDataItems.map((item) => item.color), borderWidth: 1 }] };
  }, [filteredHarcamalar]);

  const stackedBarData = useMemo(() => {
    let marketTotal = 0; let otherTotal = 0;
    filteredHarcamalar.forEach(h => {
        if(h.kategori?.toLowerCase() === "transfer") return;
        const miktar = Number(h.miktar || 0);
        if (h.kategori === "Market") marketTotal += miktar;
        else otherTotal += miktar;
    });
    const total = marketTotal + otherTotal;
    if (total === 0) return null; 
    return { labels: [displayMonth], datasets: [{ label: 'Market Harcamaları', data: [marketTotal], backgroundColor: categoryColors.Market, stack: 'Stack 0' }, { label: 'Diğer Harcamalar', data: [otherTotal], backgroundColor: '#4A5568', stack: 'Stack 0' }] };
  }, [filteredHarcamalar, displayMonth]);


  // GRAFİK SEÇENEKLERİ (barOptions, stackedBarOptions aynı kalıyor...)
  const barOptions = useMemo(() => ({
    responsive: true, indexAxis: 'y', maintainAspectRatio: false, animation: { duration: 0 },
    scales: { x: { beginAtZero: true, grid: { display: false } }, y: { reverse: true } },
    plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', formatter: (val) => `${val.toFixed(2)}€`, font: { weight: 'bold' } } }
  }), []);

  const stackedBarOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
    scales: { x: { stacked: true }, y: { stacked: true } },
    plugins: { legend: { display: true, position: 'top' }, datalabels: { color: "white", formatter: (val) => val > 0 ? `${val.toFixed(2)}€` : null } }
  }), []);

  const hasData = barData.datasets[0]?.data.length > 0;
  const hasMarketData = marketBarData.datasets[0]?.data.length > 0;
  const hasGiyimData = giyimBarData.datasets[0]?.data.length > 0; 
  const hasAileData = aileBarData.datasets[0]?.data.length > 0;
  const hasTransferData = transferBarData.datasets[0]?.data.length > 0;
  const hasStackedData = stackedBarData !== null;
  
  const totalTransferMiktari = transferHarcamalari.reduce((sum, h) => sum + Number(h.miktar || 0), 0);

  // ----------------------------------------------------
  // JSX RETURN
  // ----------------------------------------------------
  return (
    <div className="w-full">
      {/* 1. AY GEZİNME KARTI */}
      <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <Button icon={<ArrowLeftOutlined />} onClick={() => changeMonth("prev")} type="primary" shape="circle" size="large" />
          <Title level={3} className="text-center text-gray-800 m-0 capitalize">{displayMonth}</Title>
          <Button icon={<ArrowRightOutlined />} onClick={() => changeMonth("next")} disabled={isCurrentMonth} type="primary" shape="circle" size="large" />
        </div>
      </Card>

      {/* 2. TRANSFER ÖZET KARTI (Yeni eklendi) */}
      {totalTransferMiktari > 0 && (
        <Card className="shadow-md rounded-none sm:rounded-xl bg-amber-50 mb-4 border-amber-200">
           <Row align="middle" gutter={16}>
             <Col>
                <div className="bg-amber-500 p-3 rounded-full">
                    <SwapOutlined className="text-white text-xl" />
                </div>
             </Col>
             <Col>
                <Statistic 
                    title={<span className="text-amber-800 font-semibold">Bu Ay Yapılan Toplam Transfer</span>}
                    value={totalTransferMiktari}
                    precision={2}
                    suffix="€"
                    valueStyle={{ color: '#d97706', fontWeight: 'bold' }}
                />
                <div className="text-amber-700 text-xs italic">* Bu tutar harcama grafiklerine dahil edilmemiştir.</div>
             </Col>
           </Row>
        </Card>
      )}

      {/* 3. TREND GRAFİĞİ */}
      <AylikHarcamaTrendGrafigi />
      
      {/* 4. KATEGORİ GRAFİĞİ */}
      <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
        <Title level={4} className="text-center text-gray-700 mb-4">Kategorilere Göre Harcama Dağılımı</Title>
        {hasData ? (
          <div className="p-2" style={{ height: `${(barData.labels.length * 35) + 100}px`, minHeight: '300px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        ) : <Empty description="Harcama verisi yok." />}
      </Card>

      {/* 5. TRANSFER DETAY GRAFİĞİ (Yeni eklendi) */}
      {hasTransferData && (
        <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4 border-t-4 border-amber-400">
          <Title level={4} className="text-center text-amber-700 mb-4">Transfer Detayları (Nereye?) 💸</Title>
          <div className="p-2" style={{ height: `${(transferBarData.labels.length * 40) + 100}px`, minHeight: '200px' }}>
            <Bar data={transferBarData} options={barOptions} />
          </div>
        </Card>
      )}
      
      {/* 6. GİYİM GRAFİĞİ */}
      {(hasData || hasGiyimData) && (
        <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
          <Title level={4} className="text-center text-gray-700 mb-4">Giyim Harcamaları (Kişi Bazlı) 👕</Title>
          {hasGiyimData ? (
            <div className="p-2" style={{ height: `${(giyimBarData.labels.length * 35) + 100}px`, minHeight: '300px' }}>
              <Bar data={giyimBarData} options={barOptions} />
            </div>
          ) : <Empty description="Giyim harcaması yok." />}
        </Card>
      )}

      {/* 7. AİLE GRAFİĞİ */}
      {(hasData || hasAileData) && (
        <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
          <Title level={4} className="text-center text-gray-700 mb-4">Aile Harcamaları (Üye Bazlı) 👨‍👩‍👧‍👦</Title>
          {hasAileData ? (
            <div className="p-2" style={{ height: `${(aileBarData.labels.length * 35) + 100}px`, minHeight: '300px' }}>
              <Bar data={aileBarData} options={barOptions} />
            </div>
          ) : <Empty description="Aile harcaması yok." />}
        </Card>
      )}

      {/* 8. MARKET/DİĞER YIĞILMIŞ GRAFİK */}
      {hasStackedData && (
        <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
          <Title level={4} className="text-center text-gray-700 mb-4">Market/Diğer Harcama Payı 📊</Title>
          <div className="p-2" style={{ height: `300px` }}>
            <Bar data={stackedBarData} options={stackedBarOptions} />
          </div>
        </Card>
      )}

      {/* 9. MARKET DETAY GRAFİĞİ */}
      {(hasData || hasMarketData) && (
        <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
          <Title level={4} className="text-center text-gray-700 mb-4">Market Harcamaları Detayı</Title>
          {hasMarketData ? (
            <div className="p-2" style={{ height: `${(marketBarData.labels.length * 35) + 100}px`, minHeight: '300px' }}>
              <Bar data={marketBarData} options={barOptions} />
            </div>
          ) : <Empty description="Market harcaması yok." />}
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