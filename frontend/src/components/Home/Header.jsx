import React from "react";
import { Card, Typography, Statistic } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, EuroOutlined } from '@ant-design/icons';
import { useTotalsContext } from "../../context/TotalsContext"; // Context'ten alıyoruz

const { Title, Text } = Typography;

const Header = () => {
  const { totalIncome, totalExpense, totalToday } = useTotalsContext();
  const balance = totalIncome - totalExpense;

  return (
    <header className="px-4 pt-6 pb-2 bg-white sticky top-0 z-10 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Title level={4} className="!text-gray-900 !mb-0 font-bold">Finans Takibi</Title>
          <Text className="!text-gray-500 text-sm">Genel Bakış</Text>
        </div>
        <div className="text-right">
          <Text className="!text-gray-500 text-xs">Bugün Harcama</Text>
          <div className="text-xl font-extrabold text-red-600">
            <ArrowDownOutlined className="mr-1" />
            €{totalToday.toFixed(2)}
          </div>
        </div>
      </div>

      <Card
        className="rounded-2xl shadow-xl border-none p-2 h-28 flex items-center justify-center"
        style={{
          background: balance >= 0
            ? 'linear-gradient(to right, #4c51bf, #667eea)'
            : 'linear-gradient(to right, #f56565, #fc8181)'
        }}
      >
        <div className="flex flex-col text-white h-full w-full items-center justify-center">
          <Text className="!text-white/90 text-sm mb-1">Güncel Bakiye</Text>
          <Title level={2} className="!text-white !mb-0 font-extrabold">
            <EuroOutlined className="mr-1 text-xl" />
            {balance.toFixed(2)}
          </Title>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card size="small" className="rounded-xl shadow-md border-t-4 border-green-500">
          <Statistic
            title="Aylık Gelir"
            value={totalIncome}
            precision={2}
            valueStyle={{ color: '#38a169', fontWeight: 'bold' }}
            prefix={<ArrowUpOutlined />}
            suffix="€"
          />
        </Card>

        <Card size="small" className="rounded-xl shadow-md border-t-4 border-red-500">
          <Statistic
            title="Aylık Gider"
            value={totalExpense}
            precision={2}
            valueStyle={{ color: '#e53e3e', fontWeight: 'bold' }}
            prefix={<ArrowDownOutlined />}
            suffix="€"
          />
        </Card>
      </div>
    </header>
  );
};

export default Header;
