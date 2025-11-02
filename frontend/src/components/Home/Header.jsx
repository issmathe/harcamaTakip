// Header.jsx (GÖRSEL SIRALAMA GÜNCELLENMİŞ VERSİYON)

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
  // 🆕 cumulativeIncome ve cumulativeExpense eklendi
  const { totalIncome, totalExpense, totalToday, cumulativeIncome, cumulativeExpense } = useTotalsContext();
  
  // ✅ Kümülatif Bakiye
  const cumulativeBalance = cumulativeIncome - cumulativeExpense; 

  // 🎯 Aylık Bakiyeyi Hesapla (Aylık Gelir - Aylık Gider)
  const monthlyBalance = totalIncome - totalExpense;

  // Yeni kartın stilini belirlemek için yardımcı değişken
  const monthlyBalanceColor = monthlyBalance >= 0 ? "#38a169" : "#e53e3e";
  const monthlyBalanceIcon = monthlyBalance >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;


  return (
    <header className="px-4 pt-4 pb-1 bg-white sticky top-0 z-10 shadow-lg">
      
      {/* Güncel Bakiye Kartı - KOMPAKT DÜZEN */}
      <Card
        className="rounded-xl shadow-xl border-none p-3"
        styles={{
          body: { padding: "12px" },
        }}
        style={{
          // ✅ Kümülatif bakiyeye göre renk değişimi
          background:
            cumulativeBalance >= 0
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
              Genel Bakış
            </Title>
          </div>
        </div>

        {/* Bakiye Değeri ve Bugün Harcama */}
        <div className="flex justify-between items-end mt-2">
          {/* Güncel Bakiye */}
          <div className="flex flex-col text-white">
            <Text className="!text-white/90 text-xs mb-1">Toplam Bakiye</Text>
            <Title
              level={2}
              className="!text-white !mb-0 !mt-0 !py-0 font-extrabold !text-3xl"
            >
              <EuroOutlined className="mr-1 text-2xl" />
              {/* Kümülatif bakiyeyi gösteriyoruz */}
              {cumulativeBalance.toFixed(2)} 
            </Title>
          </div>

          {/* Bugün Harcama (Aylık toplamdan geliyor) */}
          <div className="text-right bg-white/10 p-1 rounded-md">
            <Text className="!text-white/80 text-xs">Bugünkü Harcama</Text>
            <div className="text-lg font-bold !text-white flex items-center justify-end">
              <FireOutlined className="mr-1 text-sm text-amber-300" />
              €{totalToday.toFixed(2)}
            </div>
          </div>
        </div>
      </Card>

      {/* Aylık Gelir, Kalan ve Gider Kartları */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {/* 1. KART: Aylık Gelir (Yeşil) */}
        <Card
          size="small"
          className="rounded-xl shadow-md border-t-4 border-green-500"
        >
          <Statistic
            title="Aylık Gelir"
            value={totalIncome} 
            precision={2}
            valueStyle={{ color: "#38a169", fontWeight: "bold", fontSize: "14px" }}
            prefix={<ArrowUpOutlined />}
            suffix="€"
          />
        </Card>

        {/* 2. KART: Aylık Kalan (Mavi/Kırmızı - Bütçe Fazlası/Açığı) */}
        {/* 🎯 SIRALAMA DEĞİŞTİ: Artık ikinci sırada */}
        <Card
          size="small"
          className={`rounded-xl shadow-md border-t-4 ${monthlyBalance >= 0 ? 'border-blue-500' : 'border-red-500'}`}
        >
          <Statistic
            title="Aylık Kalan"
            value={monthlyBalance} 
            precision={2}
            // Fazla ise yeşil, açık ise kırmızı
            valueStyle={{ color: monthlyBalanceColor, fontWeight: "bold", fontSize: "14px" }}
            prefix={monthlyBalanceIcon}
            suffix="€"
          />
        </Card>
        
        {/* 3. KART: Aylık Gider (Kırmızı) */}
        <Card
          size="small"
          className="rounded-xl shadow-md border-t-4 border-red-500"
        >
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