import React, { useEffect, useState } from "react";
import { Card, Form, Input, InputNumber, Button, Select, List, message } from "antd";
import axios from "axios";

const { Option } = Select;

const Gelir = () => {
  const [gelirler, setGelirler] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tüm gelirleri backend’den çek
  const fetchGelirler = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5001/gelir");
      setGelirler(res.data);
    } catch (err) {
      message.error("Gelirler alınırken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGelirler();
  }, []);

  // Yeni gelir ekle
  const onFinish = async (values) => {
    try {
      await axios.post("http://localhost:5001/gelir", values);
      message.success("Gelir eklendi!");
      fetchGelirler();
    } catch (err) {
      message.error("Gelir eklenirken hata oluştu");
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
              <Option value="maaş">Maaş</Option>
              <Option value="tasarruf">Tasarruf</Option>
              <Option value="diğer">Diğer</Option>
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
        <h2 className="text-lg font-semibold mb-2">Gelir Listesi</h2>
        <List
          loading={loading}
          dataSource={gelirler}
          renderItem={(item) => (
            <List.Item className="flex justify-between">
              <div>
                <p className="font-medium">{item.kategori}</p>
                <p className="text-sm text-gray-500">{item.not}</p>
              </div>
              <div className="text-green-600 font-bold">{item.miktar} €</div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Gelir;
