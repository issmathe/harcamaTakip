import React, { useMemo } from "react";
import { Card, Typography, Spin } from "antd";
import { Line } from "react-chartjs-2";
import { useTotalsContext } from "../../context/TotalsContext";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  // ChartDataLabels ARTIK SADECE İMPORT EDİLECEK, KULLANILMAYACAK
} from "chart.js";
// import ChartDataLabels from "chartjs-plugin-datalabels"; // Artık kullanılmadığı için yoruma alındı/silinebilir

import dayjs from "dayjs";
import tr from "dayjs/locale/tr";
dayjs.locale(tr);

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  // ChartDataLabels ARTIK REGISTER EDİLMEYECEK
);

const { Title } = Typography;

const AylikHarcamaTrendGrafigi = () => {
  const { harcamalar = [], isLoading } = useTotalsContext();
  
  // ----------------------------------------------------
  // Son 6 Aylık Harcama Trendi (Veri Mantığı AYNI KALDI)
  // ----------------------------------------------------
  const trendLineData = useMemo(() => {
    const monthsToShow = 6;
    const trendDataMap = {};
    const labels = [];
    const now = dayjs();
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const month = now.subtract(i, 'month');
      labels.push(month.format('MMM YY'));
      trendDataMap[month.format('YYYY-MM')] = 0;
    }

    harcamalar.forEach(h => {
      const t = dayjs(h.createdAt);
      const yearMonth = t.format('YYYY-MM');
      const miktar = Number(h.miktar || 0);

      if (trendDataMap.hasOwnProperty(yearMonth)) {
        trendDataMap[yearMonth] += miktar;
      }
    });

    return {
      labels: labels,
      datasets: [
        {
          label: "Toplam Harcama (₺)",
          data: Object.values(trendDataMap),
          // Daha sade görünüm için çizgiyi ve noktaları inceltelim/sadeleştirelim
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)', // Dolgu rengi daha şeffaf
          borderWidth: 2, // Çizgi kalınlığı azaltıldı
          pointRadius: 3, // Noktaları küçültüldü
          tension: 0.4, 
          fill: true,
        }
      ]
    };
  }, [harcamalar]);


  // ----------------------------------------------------
  // Sadeleştirilmiş Çizgi Grafiği Seçenekleri (OPTIONS)
  // ----------------------------------------------------
  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
      x: {
        // X ekseni başlığı kaldırıldı (SADELEŞTİRME)
        title: { display: false }, 
        ticks: { color: '#4A5568', font: { size: 10 } }, // Font küçültüldü
        grid: { display: false }
      },
      y: {
        // Y ekseni başlığı kaldırıldı (SADELEŞTİRME)
        title: { display: false }, 
        ticks: { display: false }, // Miktar tikleri kaldırıldı (SADELEŞTİRME)
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false }, // Legend kaldırıldı
      tooltip: {
        // Tooltip'i koruyoruz ki kullanıcı detayı görebilsin
        callbacks: {
          label: (ctx) => `Miktar: ${ctx.raw.toFixed(2)}₺`
        }
      },
      datalabels: {
        display: false, // Veri etiketleri kaldırıldı (SADELEŞTİRME)
      }
    },
    layout: {
        padding: {
            top: 10,
            bottom: 0,
            left: 5,
            right: 5,
        }
    }
  }), []);

  if (isLoading) {
    // Mobil uyumlu küçük yükseklik
    return (
      <Card title={<Title level={5} className="m-0 text-center">Trend 📉</Title>} className="shadow-lg rounded-xl bg-white mb-4" styles={{ body: { padding: '0.5rem' } }}>
        <div className="h-[150px] flex justify-center items-center">
            <Spin size="small" />
        </div>
      </Card>
    );
  }

  const hasTrendData = trendLineData.datasets[0]?.data.some(val => val > 0);

  return (
    <Card 
      // Grafik başlığını Card'ın kendi başlık alanına taşıdık ve küçülttük
      title={<Title level={5} className="m-0 text-center text-gray-700">6 Aylık Harcama Trendi 📈</Title>} 
      className="shadow-lg rounded-xl bg-white mb-4"
      styles={{ body: { padding: '0.5rem' } }} // İç padding'i küçültüldü
    >
      
      {/* Yükseklik 180px veya 150px'e çekildi (Telefon ekranında 1/6 kaplaması için) */}
      {hasTrendData ? (
        <div className="p-1" style={{ height: `150px`, width: '100%' }}>
          <Line data={trendLineData} options={lineOptions} />
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 text-sm h-[150px] flex items-center justify-center">
            Trend verisi yok.
        </div>
      )}
    </Card>
  );
};

export default AylikHarcamaTrendGrafigi;