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
} from "antd";
import axios from "axios";

const { Option } = Select;

const API_URL = process.env.REACT_APP_SERVER_URL; 

const Gelir = () => {
  const [gelirler, setGelirler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editId, setEditId] = useState(null);

  const fetchGelirler = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/gelir`);
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

  const onFinish = async (values) => {
    try {
      await axios.post(`${API_URL}/gelir`, values);
      message.success("Gelir eklendi!");
      fetchGelirler();
    } catch (err) {
      message.error("Gelir eklenirken hata oluştu");
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Silme Onayı",
      content: "Bu geliri silmek istediğinizden emin misiniz?",
      okText: "Evet",
      cancelText: "Vazgeç",
      centered: true,
      onOk: async () => {
        try {
          await axios.delete(`${API_URL}/gelir/${id}`);
          message.success("Gelir silindi!");
          fetchGelirler();
        } catch (err) {
          message.error("Silme sırasında hata oluştu");
        }
      },
    });
  };

  const openEditModal = (item) => {
    setEditId(item._id);
    editForm.setFieldsValue(item);
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    try {
      const values = await editForm.validateFields();
      await axios.put(`${API_URL}/gelir/${editId}`, values);
      message.success("Gelir güncellendi!");
      setEditModalOpen(false);
      fetchGelirler();
    } catch (err) {
      message.error("Güncelleme sırasında hata oluştu");
    }
  };

  const numberInputProps = {
    min: 1,
    stringMode: false,
    onKeyPress: (e) => {
      if (!/[0-9]/.test(e.key)) e.preventDefault();
    },
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
            <InputNumber className="w-full" {...numberInputProps} />
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
            <List.Item className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.kategori}</p>
                <p className="text-sm text-gray-500">{item.not}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-green-600 font-bold">+{item.miktar} €</div>
                <Button size="small" onClick={() => openEditModal(item)}>
                  Düzenle
                </Button>
                <Button danger size="small" onClick={() => handleDelete(item._id)}>
                  Sil
                </Button>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* Düzenleme Modal */}
      <Modal
        title="Gelir Düzenle"
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
            <InputNumber className="w-full" {...numberInputProps} />
          </Form.Item>

          <Form.Item
            name="kategori"
            label="Kategori"
            rules={[{ required: true, message: "Kategori seçiniz" }]}
          >
            <Select>
              <Option value="maaş">Maaş</Option>
              <Option value="tasarruf">Tasarruf</Option>
              <Option value="diğer">Diğer</Option>
            </Select>
          </Form.Item>

          <Form.Item name="not" label="Not">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* iOS tarzı modal */}
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

export default Gelir;
