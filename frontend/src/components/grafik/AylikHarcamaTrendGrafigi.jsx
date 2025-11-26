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
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

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
  ChartDataLabels
);

const { Title } = Typography;

// ✅ BİLEŞEN ADI GÜNCELLENDİ
const AylikHarcamaTrendGrafigi = () => {
  const { harcamalar = [], isLoading } = useTotalsContext();
  
  // ----------------------------------------------------
  // Son 6 Aylık Harcama Trendi (Çizgi Grafiği)
  // ----------------------------------------------------
  const trendLineData = useMemo(() => {
    const monthsToShow = 6; // Son 6 ayı göster
    const trendDataMap = {};
    const labels = [];
    const now = dayjs();
    
    // Etiketleri (Son 6 ay) oluştur ve harcama haritasını ilkle
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const month = now.subtract(i, 'month');
      labels.push(month.format('MMM YY'));
      trendDataMap[month.format('YYYY-MM')] = 0;
    }

    // Harcamaları ilgili aylara dağıt
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
          label: "Toplam Aylık Harcama",
          data: Object.values(trendDataMap),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.4, // Çizgi eğimi
          fill: true,
        }
      ]
    };
  }, [harcamalar]);


  // Çizgi Grafiği Seçenekleri
  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
      x: {
        title: { display: true, text: 'Ay', color: '#4A5568' },
        ticks: { color: '#4A5568' },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Miktar (₺)', color: '#4A5568' },
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
        align: 'top', 
        offset: 4,
        color: "rgb(75, 192, 192)", 
        font: { weight: "bold", size: 12 },
        formatter: (value) => `${value.toFixed(0)}₺`,
      }
    }
  }), []);

  if (isLoading) {
    return (
      <Card className="shadow-lg rounded-xl bg-white mb-4" styles={{ body: { padding: '1rem' } }}>
        <div className="h-[300px] flex justify-center items-center">
            <Spin size="large" />
        </div>
      </Card>
    );
  }

  const hasTrendData = trendLineData.datasets[0]?.data.some(val => val > 0);

  return (
    <Card 
      className="shadow-lg rounded-xl bg-white mb-4"
      styles={{ body: { padding: '1rem' } }} 
    >
      <Title level={4} className="text-center text-gray-700 mb-4">
        Son 6 Aylık Harcama Trendi 📉
      </Title>
      
      {hasTrendData ? (
        <div className="p-2" style={{ height: `300px`, width: '100%' }}>
          <Line data={trendLineData} options={lineOptions} />
        </div>
      ) : (
        <div className="p-10 text-center text-gray-500">
            Görüntülenecek trend verisi yok.
        </div>
      )}
    </Card>
  );
};

// ✅ EXPORT ADI GÜNCELLENDİ
export default AylikHarcamaTrendGrafigi;