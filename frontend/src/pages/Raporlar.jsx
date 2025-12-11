import React, { useMemo, useState, useCallback } from "react";
import { Card, Typography, Empty, Button } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useTotalsContext } from "../context/TotalsContext";
import { Bar } from "react-chartjs-2";

// ✅ YENİ TREND GRAFİĞİ BİLEŞENİNİ İMPORT ET

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  // LineElement ve PointElement ARTIK SİLİNDİ
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import dayjs from "dayjs";
import tr from "dayjs/locale/tr";
import AylikHarcamaTrendGrafigi from "../components/grafik/AylikHarcamaTrendGrafigi";
dayjs.locale(tr);

// LineElement ve PointElement ARTIK SİLİNDİĞİ İÇİN KAYITLARI DA TEMİZLENDİ
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
  "Restoran", "Aile", 
  "Diğer",
];

const MARKETLER = [
  "Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk",
  "Kaufland", "bäckerei", "Rewe", "Netto",  "Tedi", "Fundgrube", "Rossmann",
  "Edeka", "Biomarkt", "Penny", "Diğer",
];

const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];

const AILE_UYELERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep"];

const categoryColors = {
  "Giyim": "#FF6384", "Bağış": "#36A2EB", "Petrol": "#FFCE56", "Kira": "#4BC0C0",
  "Fatura": "#9966FF", "Eğitim": "#FF9F40", "Sağlık": "#C9CBCF", "Ulaşım": "#8AFF33",
  "Eğlence": "#FF33F6", "Elektronik": "#33FFF3", "İletisim": "#FF8A33", "Market": "#338AFF",
  "Hediye": "#FF3333", "Restoran": "#33FF8A", "Aile": "#AF52DE", 
  "Diğer": "#AAAAAA"
};

const marketColors = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
  "#C9CBCF", "#8AFF33", "#FF33F6", "#33FFF3", "#FF8A33", "#338AFF",
  "#FF3333", "#33FF8A", "#AAAAAA", "#58508D", "#BC5090"
];

const giyimColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];

const aileColors = ["#8E24AA", "#FF7043", "#00ACC1", "#FFD54F"];
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

  const changeMonth = useCallback(
    (direction) => {
      const current = dayjs().year(selectedYear).month(selectedMonth);
      const newDate =
        direction === "prev"
          ? current.subtract(1, "month")
          : current.add(1, "month");
      
      setSelectedMonth(newDate.month());
      setSelectedYear(newDate.year());
    },
    [selectedMonth, selectedYear]
  );

  const displayMonth = dayjs()
    .year(selectedYear)
    .month(selectedMonth)
    .format("MMMM YYYY");

  const isCurrentMonth = dayjs().month() === selectedMonth && dayjs().year() === selectedYear;

  // ----------------------------------------------------
  // I. Kategori Harcama Toplamları
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // II. Market Harcamaları Alt Kategori
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // III. Giyim Harcamaları Alt Kategori (Kişi Bazlı)
  // ----------------------------------------------------
  const giyimBarData = useMemo(() => {
    const giyimTotals = {};
    const giyimHarcamalar = filteredHarcamalar.filter(h => h.kategori === "Giyim");

    GIYIM_KISILERI.forEach(kisi => giyimTotals[kisi] = 0);

    giyimHarcamalar.forEach(h => {
      const altKategori = h.altKategori || "Diğer"; 
      const key = GIYIM_KISILERI.includes(altKategori) ? altKategori : "Diğer";
      giyimTotals[key] = (giyimTotals[key] || 0) + Number(h.miktar || 0);
    });

    const chartDataItems = Object.keys(giyimTotals)
      .filter(k => giyimTotals[k] > 0)
      .map((label, index) => ({
        label,
        data: giyimTotals[label],
        color: giyimColors[index % giyimColors.length]
      }))
      .sort((a, b) => a.data - b.data);

    return {
      labels: chartDataItems.map(item => item.label),
      datasets: [
        {
          label: "Giyim Harcaması (₺)",
          data: chartDataItems.map(item => item.data),
          backgroundColor: chartDataItems.map(item => item.color),
          borderColor: chartDataItems.map(item => item.color + 'AA'),
          borderWidth: 1,
        }
      ]
    };
  }, [filteredHarcamalar]);

  // ----------------------------------------------------
  // IV. Aile Harcamaları Alt Kategori (Üye Bazlı)
  // ----------------------------------------------------
  const aileBarData = useMemo(() => {
    const aileTotals = {};
    const aileHarcamalar = filteredHarcamalar.filter(
      (h) => h.kategori === "Aile"
    );

    AILE_UYELERI.forEach((uye) => (aileTotals[uye] = 0));
    aileTotals["Ortak"] = 0;

    aileHarcamalar.forEach((h) => {
      const altKategori = h.altKategori || "Ortak";
      const key = AILE_UYELERI.includes(altKategori) ? altKategori : "Ortak";
      aileTotals[key] = (aileTotals[key] || 0) + Number(h.miktar || 0);
    });

    const chartDataItems = Object.keys(aileTotals)
      .filter((k) => aileTotals[k] > 0)
      .map((label, index) => ({
        label,
        data: aileTotals[label],
        color: aileColors[index % aileColors.length],
      }))
      .sort((a, b) => a.data - b.data);

    return {
      labels: chartDataItems.map((item) => item.label),
      datasets: [
        {
          label: "Aile Harcaması (₺)",
          data: chartDataItems.map((item) => item.data),
          backgroundColor: chartDataItems.map((item) => item.color),
          borderColor: chartDataItems.map((item) => item.color + "AA"),
          borderWidth: 1,
        },
      ],
    };
  }, [filteredHarcamalar]);


  // ----------------------------------------------------
  // V. Market / Diğer Yığılmış Sütun Grafiği
  // ----------------------------------------------------
  const stackedBarData = useMemo(() => {
    let marketTotal = 0;
    let otherTotal = 0;
    
    filteredHarcamalar.forEach(h => {
        const miktar = Number(h.miktar || 0);
        if (h.kategori === "Market") {
            marketTotal += miktar;
        } else {
            otherTotal += miktar;
        }
    });

    const total = marketTotal + otherTotal;
    if (total === 0) return null; 

    return {
      labels: [displayMonth],
      datasets: [
        {
          label: 'Market Harcamaları',
          data: [marketTotal],
          backgroundColor: categoryColors.Market,
          stack: 'Stack 0', 
        },
        {
          label: 'Diğer Harcamalar',
          data: [otherTotal],
          backgroundColor: '#4A5568', 
          stack: 'Stack 0',
        },
      ]
    };
  }, [filteredHarcamalar, displayMonth]);


  // ----------------------------------------------------
  // GRAFİK SEÇENEKLERİ (OPTIONS)
  // ----------------------------------------------------

  // Yatay Bar Grafiği Seçenekleri (I., II., III. ve IV. için)
  const barOptions = useMemo(() => ({
    responsive: true,
    indexAxis: 'y',
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Miktar (₺)', color: '#4A5568' },
        ticks: { color: '#4A5568' },
        grid: { display: false }
      },
      y: {
        reverse: true,
        title: { display: false },
        ticks: { color: '#4A5568' }
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
        anchor: 'end', 
        align: 'end', 
        offset: 8, 
        color: "#4A5568", 
        font: { weight: "bold", size: 12 },
        formatter: (value) => `${value.toFixed(2)}₺`,
      }
    }
  }), []);

  // Yığılmış Sütun Grafiği Seçenekleri (V. için)
  const stackedBarOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
      x: {
        stacked: true, 
        title: { display: true, text: 'Miktar (₺)', color: '#4A5568' },
        ticks: { color: '#4A5568' },
        grid: { display: false }
      },
      y: {
        stacked: true, 
        ticks: { color: '#4A5568' }
      }
    },
    plugins: {
      legend: { 
        display: true, 
        position: 'top',
        labels: { color: '#4A5568' }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)}₺`
        }
      },
      datalabels: {
        color: "white", 
        font: { weight: "bold", size: 12 },
        formatter: (value) => value > 0 ? `${value.toFixed(2)}₺` : null,
        textShadowBlur: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.7)' 
      }
    }
  }), []);


  const hasData = barData.datasets[0]?.data.length > 0;
  const hasMarketData = marketBarData.datasets[0]?.data.length > 0;
  const hasGiyimData = giyimBarData.datasets[0]?.data.length > 0; 
  const hasAileData = aileBarData.datasets[0]?.data.length > 0;
  const hasStackedData = stackedBarData !== null;
  
  const chartHeight = hasData ? (barData.labels.length * 35) + 100 : 300;
  const marketChartHeight = hasMarketData ? (marketBarData.labels.length * 35) + 100 : 300;
  const giyimChartHeight = hasGiyimData ? (giyimBarData.labels.length * 35) + 100 : 300;
  const aileChartHeight = hasAileData ? aileBarData.labels.length * 35 + 100 : 300;


  // ----------------------------------------------------
  // JSX RETURN
  // ----------------------------------------------------
  return (
    <div className="w-full">
      
      {/* 1. AY GEZİNME KARTI */}
      <Card 
        className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4" 
        styles={{ body: { padding: '1rem' } }} 
      >
        <div className="flex justify-between items-center">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => changeMonth("prev")} 
            type="primary" 
            shape="circle" 
            size="large"
          />
          <Title level={3} className="text-center text-gray-800 m-0 capitalize transition-all duration-300">
            {displayMonth}
          </Title>
          <Button 
            icon={<ArrowRightOutlined />} 
            onClick={() => changeMonth("next")} 
            disabled={isCurrentMonth}
            type="primary" 
            shape="circle" 
            size="large"
          />
        </div>
      </Card>

      {/* 2. TREND GRAFİĞİ KARTI - ARTIK BİLEŞEN OLARAK ÇAĞRILIYOR */}
      <AylikHarcamaTrendGrafigi />
      
      {/* 3. KATEGORİ GRAFİĞİ KARTI (Yatay Bar) */}
      <Card 
        className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4"
        styles={{ body: { padding: '1rem' } }} 
      >
        <Title level={4} className="text-center text-gray-700 mb-4">
          Kategorilere Göre Harcama Dağılımı
        </Title>
        
        {hasData ? (
          <div className="p-2" style={{ height: `${chartHeight}px`, minHeight: '300px', width: '100%' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        ) : (
          <Empty
            description={`Seçilen dönemde (${displayMonth}) görüntüleyecek bir harcama verisi yok.`}
            className="p-10"
          />
        )}
      </Card>
      
      {/* 4. GİYİM KİŞİ BAZLI GRAFİK KARTI (Yatay Bar) */}
      {(hasData || hasGiyimData) && (
        <Card 
          className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4"
          styles={{ body: { padding: '1rem' } }} 
        >
          <Title level={4} className="text-center text-gray-700 mb-4">
            Giyim Harcamaları (Kişi Bazlı) 👕
          </Title>
          {hasGiyimData ? (
            <div className="p-2" style={{ height: `${giyimChartHeight}px`, minHeight: '300px', width: '100%' }}>
              <Bar data={giyimBarData} options={barOptions} />
            </div>
          ) : (
            <Empty
              description={hasData 
                ? "Bu ayda Giyim kategorisinde harcama yapılmamış." 
                : `Seçilen dönemde (${displayMonth}) giyim harcaması verisi yok.`
              }
              className="p-10"
            />
          )}
        </Card>
      )}

      {/* 5. AİLE ÜYE BAZLI GRAFİK KARTI (Yatay Bar) */}
      {(hasData || hasAileData) && (
        <Card
          className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4"
          styles={{ body: { padding: "1rem" } }}
        >
          <Title level={4} className="text-center text-gray-700 mb-4">
            Aile Harcamaları (Üye Bazlı) 👨‍👩‍👧‍👦
          </Title>
          {hasAileData ? (
            <div
              className="p-2"
              style={{
                height: `${aileChartHeight}px`,
                minHeight: "300px",
                width: "100%",
              }}
            >
              <Bar data={aileBarData} options={barOptions} />
            </div>
          ) : (
            <Empty
              description={
                hasData
                  ? "Bu ayda Aile kategorisinde harcama yapılmamış."
                  : `Seçilen dönemde (${displayMonth}) aile harcaması verisi yok.`
              }
              className="p-10"
            />
          )}
        </Card>
      )}

      {/* 6. MARKET/DİĞER YIĞILMIŞ GRAFİK KARTI (Dikey Yığılmış Bar) */}
      {hasStackedData && (
        <Card 
          className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4"
          styles={{ body: { padding: '1rem' } }} 
        >
          <Title level={4} className="text-center text-gray-700 mb-4">
            Market/Diğer Harcama Payı 📊
          </Title>
          <div className="p-2" style={{ height: `300px`, width: '100%' }}>
            <Bar data={stackedBarData} options={stackedBarOptions} />
          </div>
        </Card>
      )}

      {/* 7. MARKET ALT KATEGORİ GRAFİĞİ KARTI (Yatay Bar) */}
      {(hasData || hasMarketData) && (
        <Card 
          className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4"
          styles={{ body: { padding: '1rem' } }} 
        >
          <Title level={4} className="text-center text-gray-700 mb-4">
            Market Harcamaları Alt Kategori Dağılımı
          </Title>
          {hasMarketData ? (
            <div className="p-2" style={{ height: `${marketChartHeight}px`, minHeight: '300px', width: '100%' }}>
              <Bar data={marketBarData} options={barOptions} />
            </div>
          ) : (
            <Empty
              description={hasData 
                ? "Bu ayda Market kategorisinde harcama yapılmamış." 
                : `Seçilen dönemde (${displayMonth}) market harcaması verisi yok.`
              }
              className="p-10"
            />
          )}
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