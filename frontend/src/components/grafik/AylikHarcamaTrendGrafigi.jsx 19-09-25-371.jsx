// components/grafik/AylikHarcamaTrendGrafigi.jsx

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

const { Text } = Typography;

const AylikHarcamaTrendGrafigi = () => {
  const { harcamalar = [] } =
    useTotalsContext();

  /*
   * SON 6 AY
   */
  const trendCalculation = useMemo(() => {
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      last6Months.push(
        dayjs().subtract(i, "month")
      );
    }

    const labels = last6Months.map((m) =>
      m.format("MMM")
    );

    const data = last6Months.map(
      (month) => {
        const monthTotal =
          harcamalar
            .filter((h) => {
              const t = dayjs(
                h.createdAt
              );

              return (
                t.month() ===
                  month.month() &&
                t.year() ===
                  month.year()
              );
            })
            .reduce(
              (sum, h) =>
                sum +
                Number(
                  h.miktar || 0
                ),
              0
            );

        return Math.round(
          monthTotal
        );
      }
    );

    return {
      labels,
      data
    };
  }, [harcamalar]);

  /*
   * KISA PARA FORMAT
   */
const formatShortMoney = (value) => {
  return `${Math.round(Number(value || 0)).toLocaleString("tr-TR")}€`;
};

  /*
   * TAM PARA
   */
  const formatFullMoney = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString(
      "tr-TR"
    );
  };

  /*
   * GRAFİK VERİSİ
   */
  const data = {
    labels:
      trendCalculation.labels,

    datasets: [
      {
        label: "Harcama",

        data:
          trendCalculation.data,

        fill: true,

        backgroundColor: (
          context
        ) => {
          const chart =
            context.chart;

          const { ctx, chartArea } =
            chart;

          if (!chartArea) {
            return "rgba(59, 130, 246, 0.15)";
          }

          const gradient =
            ctx.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom
            );

          gradient.addColorStop(
            0,
            "rgba(59, 130, 246, 0.32)"
          );

          gradient.addColorStop(
            0.6,
            "rgba(59, 130, 246, 0.10)"
          );

          gradient.addColorStop(
            1,
            "rgba(59, 130, 246, 0.01)"
          );

          return gradient;
        },

        borderColor:
          "#3b82f6",

        borderWidth: 3,

        pointBackgroundColor:
          "#ffffff",

        pointBorderColor:
          "#3b82f6",

        pointBorderWidth: 2,

        pointRadius: 4,

        pointHoverRadius: 6,

        pointHoverBorderWidth: 3,

        tension: 0.4,

        spanGaps: true
      }
    ]
  };

  /*
   * GRAFİK AYARLARI
   */
  const options = {
    responsive: true,

    maintainAspectRatio: false,

    animation: {
      duration: 700,
      easing: "easeOutQuart"
    },

    interaction: {
      intersect: false,
      mode: "index"
    },

    plugins: {
      legend: {
        display: false
      },

      /*
       * SAYI ETİKETLERİ
       */
      datalabels: {
        display: (
          context
        ) => {
          const value =
            context.dataset.data[
              context.dataIndex
            ];

          return value > 0;
        },

        anchor: "end",

        align: "top",

        offset: 6,

        clamp: true,

        clip: false,

        formatter: (
          value
        ) => {
          return formatShortMoney(
            value
          );
        },

        font: {
          weight: "700",
          size: 9,
          family:
            "Inter, Arial, sans-serif"
        },

        color:
          "#1e40af",

        textStrokeColor:
          "#ffffff",

        textStrokeWidth: 2
      },

      /*
       * TOOLTIP
       */
      tooltip: {
        backgroundColor:
          "#1e293b",

        titleColor:
          "#ffffff",

        bodyColor:
          "#e2e8f0",

        padding: 10,

        cornerRadius: 8,

        displayColors: false,

        titleFont: {
          size: 11,
          weight: "600"
        },

        bodyFont: {
          size: 11,
          weight: "500"
        },

        callbacks: {
          title: (
            items
          ) => {
            if (!items.length) {
              return "";
            }

            return items[0]
              .label;
          },

          label: (
            context
          ) => {
            return ` Toplam: ${formatFullMoney(
              context.parsed.y
            )} €`;
          }
        }
      }
    },

    scales: {
      /*
       * DİKEY EKSEN
       */
      y: {
        display: true,

        beginAtZero: true,

        border: {
          display: true,

          color:
            "#e2e8f0",

          width: 1
        },

        ticks: {
          color:
            "#94a3b8",

          font: {
            size: 9,
            weight: "500"
          },

          padding: 5,

          /*
           * 0, 1K, 2K gibi
           */
          callback: (
            value
          ) => {
            if (value === 0) {
              return "0€";
            }

            if (
              value >= 1000000
            ) {
              return (
                value /
                  1000000 +
                "M"
              );
            }

            if (
              value >= 1000
            ) {
              return (
                value /
                  1000 +
                "K"
              );
            }

            return value;
          }
        },

        grid: {
          drawTicks: false,

          color: (
            context
          ) => {
            /*
             * 0 çizgisini daha belirgin
             */
            if (
              context.tick.value ===
              0
            ) {
              return "#cbd5e1";
            }

            return "#f1f5f9";
          },

          lineWidth: (
            context
          ) => {
            if (
              context.tick.value ===
              0
            ) {
              return 1.5;
            }

            return 1;
          }
        }
      },

      /*
       * YATAY EKSEN
       */
      x: {
        grid: {
          display: false
        },

        border: {
          display: true,

          color:
            "#e2e8f0",

          width: 1
        },

        ticks: {
          font: {
            size: 11,
            weight: "500"
          },

          color:
            "#94a3b8",

          padding: 5
        }
      }
    },

    /*
     * Grafik iç boşlukları
     */
    layout: {
      padding: {
        top: 25,
        left: 2,
        right: 8,
        bottom: 0
      }
    }
  };

  const hasData =
    trendCalculation.data.some(
      (val) => val > 0
    );

  return (
    <Card className="rounded-2xl shadow-sm border-none bg-white overflow-hidden">

      <div className="mb-6">

        <Text
          strong
          className="text-gray-400 text-[10px] uppercase tracking-[0.15em]"
        >
          6 Aylık Harcama Trendi
        </Text>

      </div>

      {hasData ? (

        <div
          style={{
            height: "180px"
          }}
        >
          <Line
            data={data}
            options={options}
          />
        </div>

      ) : (

        <Empty
          image={
            Empty.PRESENTED_IMAGE_SIMPLE
          }
          description="Veri henüz yok"
        />

      )}

    </Card>
  );
};

export default AylikHarcamaTrendGrafigi;