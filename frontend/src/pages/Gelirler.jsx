// pages/Gelirler.jsx
import React, { useEffect, useState } from "react";
import { List, Typography, Button, Modal, Input, Select, message, Card } from "antd";
import Header from "../components/Home/Header.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider, useTotalsContext } from "../context/TotalsContext";
import axios from "axios";

const { Text } = Typography;
const { Option } = Select;
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

const GelirlerContent = () => {
  const { gelirler, fetchTotals } = useTotalsContext();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingGelir, setEditingGelir] = useState(null);
  const [formData, setFormData] = useState({ miktar: "", kategori: "", not: "" });

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  const openEditModal = (gelir) => {
    setEditingGelir(gelir);
    setFormData({
      miktar: gelir.miktar,
      kategori: gelir.kategori,
      not: gelir.not || "",
    });
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`${API_URL}/gelir/${editingGelir._id}`, formData);
      message.success("Gelir başarıyla güncellendi!");
      setEditModalVisible(false);
      fetchTotals();
    } catch (err) {
      message.error("Güncelleme başarısız!");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/gelir/${id}`);
      message.success("Gelir silindi!");
      fetchTotals();
    } catch (err) {
      message.error("Silme işlemi başarısız!");
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <Card title="Gelirler Listesi" variant="plain">
        <List
          itemLayout="vertical"
          dataSource={gelirler}
          locale={{ emptyText: "Henüz gelir eklenmedi." }}
          renderItem={(gelir) => (
            <List.Item
              key={gelir._id}
              actions={[
                <Button type="link" onClick={() => openEditModal(gelir)}>Düzenle</Button>,
                <Button type="link" danger onClick={() => handleDelete(gelir._id)}>Sil</Button>,
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{gelir.kategori}</Text>}
                description={`Eklenme Tarihi: ${new Date(gelir.createdAt).toLocaleString()}`}
              />
              <div><Text strong>Miktar:</Text> {gelir.miktar} ₺</div>
              <div><Text strong>Not:</Text> {gelir.not || "-"}</div>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Gelir Düzenle"
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
            <Option value="maaş">Maaş</Option>
            <Option value="tasarruf">Tasarruf</Option>
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

const Gelirler = () => {
  return (
    <TotalsProvider>
      <div className="relative min-h-screen bg-gray-100">
        <Header />
        <main className="pb-20">
          <GelirlerContent />
        </main>
        <BottomNav />
      </div>
    </TotalsProvider>
  );
};

export default Gelirler;
