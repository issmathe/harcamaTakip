import React from "react";
import { Card, Typography, Statistic } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  EuroOutlined,
  WalletOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { useTotalsContext } from "../../context/TotalsContext";

const { Title, Text } = Typography;

const Header = () => {
  const { totalIncome, totalExpense, totalToday } = useTotalsContext();
  const balance = totalIncome - totalExpense;

  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-white shadow-md px-4 pt-4 pb-2">
      {/* Güncel Bakiye Kartı */}
      <Card
        className="rounded-xl shadow-xl border-none p-3"
        styles={{
          body: { padding: "12px" },
        }}
        style={{
          background:
            balance >= 0
              ? "linear-gradient(to right, #4c51bf, #667eea)"
              : "linear-gradient(to right, #f56565, #fc8181)",
        }}
      >
        {/* Başlık */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <WalletOutlined className="!text-white text-xl mr-2" />
            <Title
              level={5}
              className="!text-white !mb-0 !mt-0 !py-0 font-bold tracking-wide"
            >
              Finans Takibi
            </Title>
          </div>
        </div>

        {/* Güncel Bakiye ve Bugün Harcama */}
        <div className="flex justify-between items-end mt-2">
          <div className="flex flex-col text-white">
            <Text className="!text-white/90 text-xs mb-1">Güncel Bakiye</Text>
            <Title
              level={2}
              className="!text-white !mb-0 !mt-0 font-extrabold !text-3xl"
            >
              <EuroOutlined className="mr-1 text-2xl" />
              {balance.toFixed(2)}
            </Title>
          </div>

          <div className="text-right bg-white/10 px-2 py-1 rounded-md">
            <Text className="!text-white/80 text-xs">Bugün Harcama</Text>
            <div className="text-lg font-bold !text-white flex items-center justify-end">
              <FireOutlined className="mr-1 text-sm text-amber-300" />
              €{totalToday.toFixed(2)}
            </div>
          </div>
        </div>
      </Card>

      {/* Aylık Gelir / Gider Kartları */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Card
          size="small"
          className="rounded-xl shadow-md border-t-4 border-green-500"
        >
          <Statistic
            title="Aylık Gelir"
            value={totalIncome}
            precision={2}
            valueStyle={{ color: "#38a169", fontWeight: "bold" }}
            prefix={<ArrowUpOutlined />}
            suffix="€"
          />
        </Card>

        <Card
          size="small"
          className="rounded-xl shadow-md border-t-4 border-red-500"
        >
          <Statistic
            title="Aylık Gider"
            value={totalExpense}
            precision={2}
            valueStyle={{ color: "#e53e3e", fontWeight: "bold" }}
            prefix={<ArrowDownOutlined />}
            suffix="€"
          />
        </Card>
      </div>
    </header>
  );
};

export default Header;
