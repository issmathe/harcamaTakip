import { Card, Typography, Statistic } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  EuroOutlined,
  WalletOutlined,
  FireOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useTotalsContext } from "../../context/TotalsContext";

const { Title, Text } = Typography;

const Header = () => {
  // Gerekli toplamlar ve yeni bankBalance hook'tan çekiliyor
  const { 
    totalIncome, 
    totalExpense, 
    totalToday, 
    cumulativeIncome, 
    cumulativeExpense,
    bankBalance // Sadece 'gelir' gelirlerini içeren bakiye
  } = useTotalsContext();
  
  // Tüm gelir kaynaklarını içeren kümülatif bakiye (Toplam Bakiye)
  const cumulativeBalance = cumulativeIncome - cumulativeExpense; 
  
  // Aylık Bütçe Fazlası/Açığı
  const monthlyBalance = totalIncome - totalExpense;

  // Stil belirleme yardımcıları
  const monthlyBalanceColor = monthlyBalance >= 0 ? "#38a169" : "#e53e3e";
  const monthlyBalanceIcon = monthlyBalance >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  const bankBalanceColor = bankBalance >= 0 ? '!text-green-300' : '!text-red-300';

  return (
    <header className="px-4 pt-4 pb-1 bg-white sticky top-0 z-10 shadow-lg">
      
      {/* Güncel Bakiye Kartı - Genel Bakış */}
      <Card
        className="rounded-xl shadow-xl border-none p-3"
        styles={{ body: { padding: "12px" } }}
        style={{
          // Kümülatif bakiyeye göre arka plan renk değişimi
          background:
            cumulativeBalance >= 0
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
              className="!text-white !mb-0 !mt-0 !py-0 font-bold"
            >
              Genel Bakış
            </Title>
          </div>
        </div>
        
        {/* Ana İstatistikler (Toplam Bakiye, Banka Bakiye, Bugün Harcama) */}
        <div className="flex justify-between items-end mt-2">
          
          {/* 1. TOPLAM BAKİYE (Ana Değer - Tüm Gelirler Dahil) */}
          <div className="flex flex-col text-white">
            <Text className="!text-white/90 text-xs mb-1">Toplam Bakiye</Text>
            <Title
              level={2}
              className="!text-white !mb-0 !mt-0 !py-0 font-extrabold !text-3xl"
            >
              <EuroOutlined className="mr-1 text-2xl" />
              {cumulativeBalance.toFixed(2)}
            </Title>
          </div>
          
          {/* 2. BANKA BAKİYESİ (Sadece gelir Geliri Dahil) */}
          <div className="text-right bg-white/10 p-1 rounded-md mr-2"> 
            <Text className="!text-white/80 text-xs">Banka Bakiyesi</Text>
            <div className={`text-lg font-bold flex items-center justify-end ${bankBalanceColor}`}>
              <BankOutlined className="mr-1 text-sm" />
              €{bankBalance.toFixed(2)} 
            </div>
          </div>

          {/* 3. BUGÜN HARCAMA - text-sm kullanılarak küçültülmüş stil */}
          <div className="text-right bg-white/10 p-1 rounded-md">
            {/* Başlık metin boyutu sabit kaldı */}
            <Text className="!text-white/80 text-xs">Bugünkü Harcama</Text>
            {/* Değer boyutu 'text-sm' (daha küçük) olarak ayarlandı */}
            <div className="text-sm font-bold !text-white flex items-center justify-end">
              <FireOutlined className="mr-1 text-sm text-amber-300" />
              €{totalToday.toFixed(2)}
            </div>
          </div>
        </div>
      </Card>

      {/* Aylık Detay Kartları */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        
        {/* 1. KART: Aylık Gelir */}
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
        
        {/* 2. KART: Aylık Kalan (Bütçe Fazlası/Açığı) */}
        <Card
          size="small"
          className={`rounded-xl shadow-md border-t-4 ${monthlyBalance >= 0 ? 'border-blue-500' : 'border-red-500'}`}
        >
          <Statistic
            title="Aylık Kalan"
            value={monthlyBalance} 
            precision={2}
            valueStyle={{ color: monthlyBalanceColor, fontWeight: "bold", fontSize: "14px" }}
            prefix={monthlyBalanceIcon}
            suffix="€"
          />
        </Card>
        
        {/* 3. KART: Aylık Gider */}
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