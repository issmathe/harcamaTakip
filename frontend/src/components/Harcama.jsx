import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  List,
  message,
  Modal,
  Popconfirm,
} from "antd";
import axios from "axios";

const { Option } = Select;

const API_URL = process.env.REACT_APP_SERVER_URL; 
// Vite kullanıyorsan: const API_URL = import.meta.env.VITE_API_URL;

const Harcama = () => {
  const [harcamalar, setHarcamalar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editId, setEditId] = useState(null);

  // Harcamaları getir
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

  // Harcama sil
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/harcama/${id}`);
      message.success("Harcama silindi!");
      fetchHarcamalar();
    } catch (err) {
      message.error("Silme sırasında hata oluştu");
    }
  };

  // Düzenleme modalını aç
  const openEditModal = (item) => {
    setEditId(item._id);
    editForm.setFieldsValue(item);
    setEditModalOpen(true);
  };

  // Düzenlemeyi kaydet
  const handleEditSave = async () => {
    try {
      const values = await editForm.validateFields();
      await axios.put(`${API_URL}/harcama/${editId}`, values);
      message.success("Harcama güncellendi!");
      setEditModalOpen(false);
      fetchHarcamalar();
    } catch (err) {
      message.error("Güncelleme sırasında hata oluştu");
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
            <List.Item className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.kategori}</p>
                <p className="text-sm text-gray-500">{item.not}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-red-600 font-bold">-{item.miktar} €</div>
                <Button size="small" onClick={() => openEditModal(item)}>
                  Düzenle
                </Button>
                <Popconfirm
                  title="Bu harcamayı silmek istediğine emin misin?"
                  okText="Evet"
                  cancelText="Hayır"
                  onConfirm={() => handleDelete(item._id)}
                >
                  <Button danger size="small">Sil</Button>
                </Popconfirm>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* Düzenleme Modal */}
      <Modal
        title="Harcama Düzenle"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditSave}
        okText="Kaydet"
        cancelText="Vazgeç"
        centered
        className="ios-modal"
      >
        <Form layout="vertical" form={editForm}>
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
            <Select>
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
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* iOS tarzı modal için özel CSS */}
      <style>{`
        .ios-modal .ant-modal-content {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.7);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default Harcama;
