import React from "react";
import { Card, Typography, Statistic } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
  FireOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useTotalsContext } from "../../context/TotalsContext";

const { Title, Text } = Typography;

const Header = () => {
  const { 
    totalIncome, totalExpense, totalToday, 
    cumulativeIncome, cumulativeExpense, bankBalance, monthlyTransfers 
  } = useTotalsContext();
  
  // Hesaplamalar
  const cumulativeBalance = (cumulativeIncome || 0) - (cumulativeExpense || 0);
  const monthlyBalance = (totalIncome || 0) - ((totalExpense || 0) + (monthlyTransfers || 0));

  const monthlyBalanceColor = monthlyBalance >= 0 ? "#38a169" : "#e53e3e";
  const monthlyBalanceIcon = monthlyBalance >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  const bankBalanceColor = bankBalance >= 0 ? '!text-green-300' : '!text-red-300';

  return (
    <header className="px-4 pt-4 pb-1 bg-white sticky top-0 z-10 shadow-lg">
      <Card
        className="rounded-xl shadow-xl border-none p-3"
        styles={{ body: { padding: "12px" } }}
        style={{
          background: cumulativeBalance >= 0
              ? "linear-gradient(to right, #4c51bf, #667eea)"
              : "linear-gradient(to right, #f56565, #fc8181)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <WalletOutlined className="!text-white text-xl mr-2" />
            <Title level={5} className="!text-white !mb-0 !mt-0 !py-0 font-bold">Genel Bakış</Title>
          </div>
        </div>
        
        <div className="flex justify-between items-end mt-2">
          <div className="flex flex-col text-white">
            <Text className="!text-white/90 text-xs mb-1">Toplam Bakiye</Text>
            <Title level={2} className="!text-white !mb-0 !mt-0 !py-0 font-extrabold !text-3xl">
              €{cumulativeBalance.toFixed(2).replace(".", ",")}
            </Title>
          </div>
          
          <div className="text-right bg-white/10 p-1 rounded-md mr-2"> 
            <Text className="!text-white/80 text-xs">Banka Bakiyesi</Text>
            <div className={`text-lg font-bold flex items-center justify-end ${bankBalanceColor}`}>
              <BankOutlined className="mr-1 text-sm" />
              €{bankBalance.toFixed(2).replace(".", ",")} 
            </div>
          </div>

          <div className="text-right bg-white/10 p-1 rounded-md">
            <Text className="!text-white/80 text-xs">Bugünkü Harcama</Text>
            <div className="text-sm font-bold !text-white flex items-center justify-end">
              <FireOutlined className="mr-1 text-sm text-amber-300" />
              €{totalToday.toFixed(2).replace(".", ",")}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Card size="small" className="rounded-xl shadow-md border-t-4 border-green-500">
          <Statistic
            title="Aylık Gelir"
            value={totalIncome} 
            precision={2}
            valueStyle={{ color: "#38a169", fontWeight: "bold", fontSize: "14px" }}
            prefix={<ArrowUpOutlined />}
            suffix="€"
          />
        </Card>
        
        <Card size="small" className={`rounded-xl shadow-md border-t-4 ${monthlyBalance >= 0 ? 'border-blue-500' : 'border-red-500'}`}>
          <Statistic
            title="Aylık Kalan"
            value={monthlyBalance} 
            precision={2}
            valueStyle={{ color: monthlyBalanceColor, fontWeight: "bold", fontSize: "14px" }}
            prefix={monthlyBalanceIcon}
            suffix="€"
          />
        </Card>
        
        <Card size="small" className="rounded-xl shadow-md border-t-4 border-red-500">
          <Statistic
            title="Aylık Harcama"
            value={totalExpense} 
            precision={2}
            valueStyle={{ color: "#e53e3e", fontWeight: "bold", fontSize: "14px" }}
            prefix={<ArrowDownOutlined />}
            suffix="€"
          />
        </Card>
      </div>
    </header>
  );
};

export default Header;