import React, { useMemo } from "react";
import { Card, Typography, Empty } from "antd";
import { Line } from "react-chartjs-2";
import { useTotalsContext } from "../../context/TotalsContext";
import dayjs from "dayjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// ChartJS bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

const { Title } = Typography;

const AylikHarcamaTrendGrafigi = () => {
  const { harcamalar = [] } = useTotalsContext();

  const trendData = useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      last6Months.push(dayjs().subtract(i, "month"));
    }

    const labels = last6Months.map((m) => m.format("MMM"));
    const data = last6Months.map((month) => {
      const monthTotal = harcamalar
        .filter((h) => {
          const t = dayjs(h.createdAt);
          return t.month() === month.month() && t.year() === month.year();
        })
        .reduce((sum, h) => sum + Number(h.miktar || 0), 0);
      return Number(monthTotal.toFixed(2));
    });

    return {
      labels,
      datasets: [
        {
          label: "Aylık Toplam Harcama",
          data,
          fill: true,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          pointBackgroundColor: "rgba(54, 162, 235, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(54, 162, 235, 1)",
          tension: 0.4,
          pointRadius: 5,
        },
      ],
    };
  }, [harcamalar]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      // Veri etiketleri (datalabels) ayarları
      datalabels: {
        display: true,
        align: "top",
        offset: 8,
        formatter: (value) => {
          return value > 0 ? `${value}€` : "";
        },
        font: {
          weight: "bold",
          size: 11,
        },
        color: "#444",
      },
      tooltip: {
        callbacks: {
          label: (context) => `Toplam: ${context.parsed.y}€`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          display: false, // Grafik üzerinde kalabalık yapmaması için y ekseni sayılarını gizledik
        },
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    layout: {
      padding: {
        top: 25, // Etiketlerin en üstte kesilmemesi için pay bıraktık
      },
    },
  };

  const hasData = trendData.datasets[0].data.some((val) => val > 0);

  return (
    <Card className="shadow-lg rounded-none sm:rounded-xl bg-white mb-4">
      <Title level={4} className="text-center text-gray-700 mb-4">
        Son 6 Aylık Harcama Trendi
      </Title>
      {hasData ? (
        <div style={{ height: "250px" }}>
          <Line data={trendData} options={options} />
        </div>
      ) : (
        <Empty description="Trend verisi için yeterli harcama bulunamadı." />
      )}
    </Card>
  );
};

export default AylikHarcamaTrendGrafigi;