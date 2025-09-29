import React from "react";
import { List, Avatar, Typography, Button, Card, Row, Col, Tag, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const MainContent = ({ circularIcons = [], radius = 30, center = 50, mockExpenses = [] }) => {
  return (
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

        {/* Çevredeki ikonlar */}
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
  );
};

export default MainContent;
