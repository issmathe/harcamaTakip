// pages/Harcamalar.jsx
import React, { useEffect, useState } from "react";
import { List, Typography, Button, Modal, Input, Select, message, Card } from "antd";
import Header from "../components/Home/Header.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider, useTotalsContext } from "../context/TotalsContext";
import axios from "axios";

const { Text } = Typography;
const { Option } = Select;
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

const HarcamalarContent = () => {
  const { harcamalar = [], fetchTotals } = useTotalsContext();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingHarcama, setEditingHarcama] = useState(null);
  const [formData, setFormData] = useState({ miktar: "", kategori: "", not: "" });

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  const openEditModal = (harcama) => {
    setEditingHarcama(harcama);
    setFormData({
      miktar: harcama.miktar,
      kategori: harcama.kategori,
      not: harcama.not || "",
    });
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`${API_URL}/harcama/${editingHarcama._id}`, formData);
      message.success("Harcama başarıyla güncellendi!");
      setEditModalVisible(false);
      fetchTotals();
    } catch (err) {
      message.error("Güncelleme başarısız!");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/harcama/${id}`);
      message.success("Harcama silindi!");
      fetchTotals();
    } catch (err) {
      message.error("Silme işlemi başarısız!");
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <Card title="Harcamalar Listesi" variant="plain">
        <List
          itemLayout="vertical"
          dataSource={harcamalar}
          locale={{ emptyText: "Henüz harcama eklenmedi." }}
          renderItem={(harcama) => (
            <List.Item
              key={harcama._id}
              actions={[
                <Button type="link" onClick={() => openEditModal(harcama)}>Düzenle</Button>,
                <Button type="link" danger onClick={() => handleDelete(harcama._id)}>Sil</Button>,
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{harcama.kategori}</Text>}
                description={`Eklenme Tarihi: ${new Date(harcama.createdAt).toLocaleString()}`}
              />
              <div><Text strong>Miktar:</Text> {harcama.miktar} ₺</div>
              <div><Text strong>Not:</Text> {harcama.not || "-"}</div>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Harcama Düzenle"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSave}
        okText="Kaydet"
      >
        <div className="mb-2">
          <Text>Miktar:</Text>
          <Input
            type="number"
            value={formData.miktar}
            onChange={(e) => setFormData({ ...formData, miktar: e.target.value })}
          />
        </div>
        <div className="mb-2">
          <Text>Kategori:</Text>
          <Select
            value={formData.kategori}
            onChange={(value) => setFormData({ ...formData, kategori: value })}
            style={{ width: "100%" }}
          >
            <Option value="yemek">Yemek</Option>
            <Option value="ev">Ev</Option>
            <Option value="araç">Araç</Option>
            <Option value="diğer">Diğer</Option>
          </Select>
        </div>
        <div className="mb-2">
          <Text>Not:</Text>
          <Input
            value={formData.not}
            onChange={(e) => setFormData({ ...formData, not: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
};

const Harcamalar = () => {
  return (
    <TotalsProvider>
      <div className="relative min-h-screen bg-gray-100">
        <Header />
        <main className="pb-20">
          <HarcamalarContent />
        </main>
        <BottomNav />
      </div>
    </TotalsProvider>
  );
};

export default Harcamalar;
