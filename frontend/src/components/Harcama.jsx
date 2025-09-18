import React, { useEffect, useState } from "react";
import { Card, Form, Input, InputNumber, Button, Select, List, message } from "antd";
import axios from "axios";

const { Option } = Select;

// Backend URL .env’den alınıyor
const API_URL = process.env.REACT_APP_SERVER_URL; 
// Vite ise: const API_URL = import.meta.env.VITE_API_URL;

const Harcama = () => {
  const [harcamalar, setHarcamalar] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tüm harcamaları çek
  const fetchHarcamalar = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/harcama`);
      setHarcamalar(res.data);
    } catch (err) {
      message.error("Harcamalar alınırken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarcamalar();
  }, []);

  // Yeni harcama ekle
  const onFinish = async (values) => {
    try {
      await axios.post(`${API_URL}/harcama`, values);
      message.success("Harcama eklendi!");
      fetchHarcamalar();
    } catch (err) {
      message.error("Harcama eklenirken hata oluştu");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Form */}
      <Card className="mb-4 rounded-2xl shadow-md">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="miktar"
            label="Miktar"
            rules={[{ required: true, message: "Miktar gerekli" }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>

          <Form.Item
            name="kategori"
            label="Kategori"
            rules={[{ required: true, message: "Kategori seçiniz" }]}
          >
            <Select placeholder="Kategori seçiniz">
              <Option value="Giyim">Giyim</Option>
              <Option value="Gıda">Gıda</Option>
              <Option value="Petrol">Petrol</Option>
              <Option value="Kira">Kira</Option>
              <Option value="Fatura">Fatura</Option>
              <Option value="Eğitim">Eğitim</Option>
              <Option value="Sağlık">Sağlık</Option>
              <Option value="Ulaşım">Ulaşım</Option>
              <Option value="Eğlence">Eğlence</Option>
              <Option value="Elektronik">Elektronik</Option>
              <Option value="Spor">Spor</Option>
              <Option value="Market">Market</Option>
              <Option value="Kırtasiye">Kırtasiye</Option>
              <Option value="Restoran / Kafe">Restoran / Kafe</Option>
              <Option value="Diğer">Diğer</Option>
            </Select>
          </Form.Item>

          <Form.Item name="not" label="Not">
            <Input placeholder="Opsiyonel not" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Kaydet
          </Button>
        </Form>
      </Card>

      {/* Liste */}
      <Card className="rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-2">Harcama Listesi</h2>
        <List
          loading={loading}
          dataSource={harcamalar}
          renderItem={(item) => (
            <List.Item className="flex justify-between">
              <div>
                <p className="font-medium">{item.kategori}</p>
                <p className="text-sm text-gray-500">{item.not}</p>
              </div>
              <div className="text-red-600 font-bold">-{item.miktar} €</div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Harcama;
