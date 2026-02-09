// components/grafik/AylikHarcamaTrendGrafigi.jsx
import React, { useMemo, useRef, useEffect, useState } from "react";
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

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ChartTitle, Tooltip, Legend, Filler, ChartDataLabels
);

const { Text } = Typography;

const AylikHarcamaTrendGrafigi = () => {
  const { harcamalar = [] } = useTotalsContext();
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({ datasets: [] });

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
          return t.month() === month.month() && t.year() === month.year();
        })
        .reduce((sum, h) => sum + Number(h.miktar || 0), 0);
      return Number(monthTotal.toFixed(0));
    });

    return { labels, data };
  }, [harcamalar]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Gradyan oluşturma
    const ctx = chart.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.5)"); // Blue-500
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.01)");

    setChartData({
      labels: trendCalculation.labels,
      datasets: [
        {
          label: "Harcama",
          data: trendCalculation.data,
          fill: true,
          backgroundColor: gradient,
          borderColor: "#3b82f6",
          borderWidth: 3,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#3b82f6",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4, // Kavisli hatlar
        },
      ],
    });
  }, [trendCalculation]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: (context) => context.dataset.data[context.dataIndex] > 0,
        align: "top",
        offset: 10,
        formatter: (value) => `${value}€`,
        font: { weight: "bold", size: 10, family: 'Inter' },
        color: "#1e40af", // Blue-800
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => ` Toplam: ${context.parsed.y} €`,
        },
      },
    },
    scales: {
      y: {
        display: false, 
        beginAtZero: true,
        grid: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11, weight: '500' },
          color: "#94a3b8"
        }
      },
    },
    layout: { padding: { top: 30, left: 10, right: 10, bottom: 0 } },
  };

  const hasData = trendCalculation.data.some((val) => val > 0);

  return (
    <Card className="rounded-2xl shadow-sm border-none bg-white overflow-hidden">
      <div className="mb-6">
        <Text strong className="text-gray-400 text-[10px] uppercase tracking-[0.15em]">
          6 Aylık Harcama Trendi
        </Text>
      </div>

      {hasData ? (
        <div style={{ height: "180px" }}>
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Veri henüz yok" />
      )}
    </Card>
  );
};

export default AylikHarcamaTrendGrafigi;