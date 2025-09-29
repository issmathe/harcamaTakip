import React from "react";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

const Header = ({ totalToday = 0, totalIncome = 0, totalExpense = 0 }) => {
  const balance = totalIncome - totalExpense;

  return (
    <header className="px-4 pt-6 pb-4 bg-gradient-to-r from-indigo-600 to-indigo-400 text-white">
      <div className="flex items-center justify-between">
        <div>
          <Title level={4} className="!text-white !mb-0">Harcama Takip</Title>
          <Text className="!text-white/90">Bugün toplam</Text>
        </div>
        <div className="text-right">
          <Text className="!text-white !text-lg font-bold">
            €{totalToday.toFixed(2)}
          </Text>
          <div>
            <Text className="!text-white/90" type="secondary">Güncel bakiye</Text>
            <div className="!text-white font-semibold">
              €{balance.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card size="small" className="rounded-xl">
          <Text className="text-xs">Gelir (ay)</Text>
          <div className="mt-1">
            <Text strong>€{totalIncome.toFixed(2)}</Text>
          </div>
        </Card>

        <Card size="small" className="rounded-xl">
          <Text className="text-xs">Gider (ay)</Text>
          <div className="mt-1">
            <Text strong>€{totalExpense.toFixed(2)}</Text>
          </div>
        </Card>
      </div>
    </header>
  );
};

export default Header;
