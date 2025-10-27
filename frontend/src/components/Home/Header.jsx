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
    // DEĞİŞİKLİK: 'sticky top-0 z-10' yerine 'fixed top-0 w-full z-50' kullanıldı.
    <header className="px-4 pt-4 pb-1 bg-white fixed top-0 w-full z-50 shadow-lg">
      {/* Güncel Bakiye Kartı - KOMPAKT DÜZEN */}
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
        {/* Başlık ve Genel Bakış */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <WalletOutlined className="!text-white text-xl mr-2" />
            <Title
              level={5}
              className="!text-white !mb-0 !mt-0 !py-0 font-bold"
            >
              Finans Takibi
            </Title>
          </div>
        </div>

        {/* Bakiye Değeri ve Bugün Harcama */}
        <div className="flex justify-between items-end mt-2">
          {/* Güncel Bakiye */}
          <div className="flex flex-col text-white">
            <Text className="!text-white/90 text-xs mb-1">Güncel Bakiye</Text>
            <Title
              level={2}
              className="!text-white !mb-0 !mt-0 !py-0 font-extrabold !text-3xl"
            >
              <EuroOutlined className="mr-1 text-2xl" />
              {balance.toFixed(2)}
            </Title>
          </div>

          {/* Bugün Harcama */}
          <div className="text-right bg-white/10 p-1 rounded-md">
            <Text className="!text-white/80 text-xs">Bugün Harcama</Text>
            <div className="text-lg font-bold !text-white flex items-center justify-end">
              <FireOutlined className="mr-1 text-sm text-amber-300" />
              €{totalToday.toFixed(2)}
            </div>
          </div>
        </div>
      </Card>

      {/* Aylık Gelir ve Gider Kartları */}
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