import React from "react";
import { Card, Button, List, Avatar, Tag, Typography, Row, Col, Select, Tooltip } from "antd";
import {
  PlusOutlined,
  PieChartOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  HomeOutlined,
  BookOutlined,
  SmileOutlined,
  ShoppingOutlined,
  FireOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const mockExpenses = [
  { id: 1, title: "Market", category: "Gıda", amount: 48.25, date: "2025-09-20" },
  { id: 2, title: "Otobüs", category: "Ulaşım", amount: 2.8, date: "2025-09-20" },
  { id: 3, title: "Kitap", category: "Eğitim", amount: 12.5, date: "2025-09-19" },
  { id: 4, title: "Elektrik", category: "Fatura", amount: 65.4, date: "2025-09-18" },
  { id: 5, title: "Kafe", category: "Restoran / Kafe", amount: 8.75, date: "2025-09-17" },
  { id: 6, title: "Kırtasiye", category: "Kırtasiye", amount: 23.0, date: "2025-09-16" },
];

const categories = [
  "Giyim",
  "Gıda",
  "Petrol",
  "Kira",
  "Fatura",
  "Eğitim",
  "Sağlık",
  "Ulaşım",
  "Eğlence",
  "Elektronik",
  "Spor",
  "Market",
  "Kırtasiye",
  "Restoran / Kafe",
  "Diğer",
];

const circularIcons = [
  { icon: <ShoppingCartOutlined className="text-indigo-600 text-xl" />, label: "Market" },
  { icon: <CarOutlined className="text-indigo-600 text-xl" />, label: "Ulaşım" },
  { icon: <HomeOutlined className="text-indigo-600 text-xl" />, label: "Kira" },
  { icon: <BookOutlined className="text-indigo-600 text-xl" />, label: "Eğitim" },
  { icon: <SmileOutlined className="text-indigo-600 text-xl" />, label: "Eğlence" },
  { icon: <ShoppingOutlined className="text-indigo-600 text-xl" />, label: "Giyim" },
  { icon: <FireOutlined className="text-indigo-600 text-xl" />, label: "Elektronik" },
  { icon: <MedicineBoxOutlined className="text-indigo-600 text-xl" />, label: "Sağlık" },
];

const Home = () => {
  const totalToday = mockExpenses
    .filter((e) => e.date === "2025-09-20")
    .reduce((s, e) => s + e.amount, 0);

  const radius = 60; // halkanın yakınında duracak
  const center = 50; // yüzde olarak merkez

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 bg-gradient-to-r from-indigo-600 to-indigo-400 text-white">
        <div className="flex items-center justify-between">
          <div>
            <Title level={4} className="!text-white !mb-0">Harcama Takip</Title>
            <Text className="!text-white/90">Bugün toplam</Text>
          </div>
          <div className="text-right">
            <Text className="!text-white !text-lg font-bold">€{totalToday.toFixed(2)}</Text>
            <div>
              <Text className="!text-white/90" type="secondary">Güncel bakiye</Text>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Card size="small" className="rounded-xl">
            <Text className="text-xs">Gelir (ay)</Text>
            <div className="mt-1">
              <Text strong>€1.250,00</Text>
            </div>
          </Card>

          <Card size="small" className="rounded-xl">
            <Text className="text-xs">Gider (ay)</Text>
            <div className="mt-1">
              <Text strong>€430,75</Text>
            </div>
          </Card>
        </div>
      </header>

      {/* Kategori Select */}
      <div className="px-4 mt-4">
        <Select placeholder="Kategori seçin" style={{ width: "100%" }}>
          {categories.map((cat) => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
        </Select>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 pt-4 pb-24">
        {/* Dairesel menü */}
        <div className="relative flex items-center justify-center h-64 w-64 mx-auto my-6">
          {/* Ana halka */}
          <div className="w-32 h-32 rounded-full bg-indigo-600 text-white flex flex-col items-center justify-center text-center z-10">
            <div className="border-b border-white/40 pb-2 w-full">
              <Text className="block !text-white font-semibold">Gelir</Text>
              <Text className="block !text-white font-bold">100 TL</Text>
            </div>
            <div className="pt-2">
              <Text className="block !text-white font-semibold">Gider</Text>
              <Text className="block !text-white font-bold">100 TL</Text>
            </div>
          </div>

          {/* Daire çevresinde simetrik ve yakın ikonlar */}
          {circularIcons.map((item, index) => {
            const angle = (360 / circularIcons.length) * index;
            const rad = (angle * Math.PI) / 180;
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad);
            return (
              <Tooltip key={index} title={item.label} placement="top">
                <button
                  className="absolute bg-white rounded-full shadow p-2 transition-transform duration-200 hover:scale-125"
                  style={{
                    top: `${center + y}%`,
                    left: `${center + x}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {item.icon}
                </button>
              </Tooltip>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-4">
          <Title level={5} className="!mb-0">Yakın zamandaki harcamalar</Title>
          <Button type="primary" icon={<PlusOutlined />} size="middle" className="rounded-lg">
            Yeni
          </Button>
        </div>

        <List
          itemLayout="horizontal"
          dataSource={mockExpenses}
          className="space-y-3"
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <Button type="link" key="edit">Düzenle</Button>,
                <Text key="amount" strong>€{item.amount.toFixed(2)}</Text>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar className="bg-gray-100 text-gray-700">{item.category[0]}</Avatar>}
                title={<Text strong>{item.title}</Text>}
                description={<Text type="secondary">{item.category} • {item.date}</Text>}
              />
            </List.Item>
          )}
        />

        <Row gutter={[12, 12]} className="mt-4">
          <Col span={24}>
            <Card className="rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <Text type="secondary">Haftalık harcama</Text>
                  <div className="mt-1">
                    <Text strong className="text-2xl">€512,30</Text>
                  </div>
                </div>
                <div>
                  <Tag color="green">%12 azalış</Tag>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[92%] max-w-md bg-white rounded-2xl shadow-lg p-2 flex justify-between items-center">
        <button className="flex-1 text-center py-2 rounded-lg hover:bg-gray-50">
          <div className="flex flex-col items-center text-xs">
            <HomeOutlined className="text-lg mb-1" />
            Anasayfa
          </div>
        </button>

        <button className="flex-1 text-center py-2 rounded-lg hover:bg-gray-50">
          <div className="flex flex-col items-center text-xs">
            <PieChartOutlined className="text-lg mb-1" />
            Grafikler
          </div>
        </button>

        <button className="flex-1 text-center py-2 rounded-lg bg-indigo-600 text-white font-semibold rounded-xl shadow">
          <div className="flex flex-col items-center text-sm">Ekle</div>
        </button>

        <button className="flex-1 text-center py-2 rounded-lg hover:bg-gray-50">
          <div className="flex flex-col items-center text-xs">
            <BookOutlined className="text-lg mb-1" />
            Kategoriler
          </div>
        </button>

        <button className="flex-1 text-center py-2 rounded-lg hover:bg-gray-50">
          <div className="flex flex-col items-center text-xs">
            <SettingOutlined className="text-lg mb-1" />
            Ayarlar
          </div>
        </button>
      </nav>
    </div>
  );
};

export default Home;
