// pages/Harcamalar.jsx
import React, { useState, useMemo, useCallback } from "react";
import { List, Typography, Button, Modal, Input, Select, message, Card, Popconfirm } from "antd";
import { 
  EditOutlined, DeleteOutlined, DollarCircleOutlined, TagOutlined, CalendarOutlined, SolutionOutlined, 
  FilterOutlined, LeftOutlined, RightOutlined 
} from '@ant-design/icons';
import Header from "../components/Home/Header.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { useTotalsContext } from "../context/TotalsContext";
import axios from "axios";
import dayjs from 'dayjs';
import tr from 'dayjs/locale/tr';

dayjs.locale(tr);

const { Text, Title } = Typography;
const { Option } = Select;
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

const ALL_CATEGORIES = [
  "Giyim", "Gıda", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık", 
  "Ulaşım", "Eğlence", "Elektronik", "Spor", "Market", "Kırtasiye", 
  "Restoran", "Diğer",
];

const MARKETLER = [
  "Lidl", "Rewe", "Edeka", "Aldi", "Netto", "Penny",
  "Kaufland", "Real", "Norma", "Tegut", "Hit", "Famila",
  "Nahkauf", "Biomarkt", "DM", "Rossmann", "Diğer"
];

const getCategoryDetails = (kategori) => {
  switch (kategori.toLowerCase()) {
    case 'gıda': case 'market': case 'restoran':
      return { icon: <DollarCircleOutlined />, color: 'bg-red-100 text-red-600' };
    case 'kira': case 'fatura':
      return { icon: <TagOutlined />, color: 'bg-blue-100 text-blue-600' };
    case 'ulaşım': case 'petrol':
      return { icon: <CalendarOutlined />, color: 'bg-green-100 text-green-600' };
    default:
      return { icon: <SolutionOutlined />, color: 'bg-gray-100 text-gray-600' };
  }
};

const HarcamalarContent = () => {
  const { harcamalar = [], refetch } = useTotalsContext();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingHarcama, setEditingHarcama] = useState(null);
  const [formData, setFormData] = useState({ miktar: "", kategori: "", altKategori: "", not: "" });

  const now = dayjs();
  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  const filteredHarcamalar = useMemo(() => {
    const ayFiltreli = harcamalar.filter(h => {
      const t = dayjs(h.createdAt);
      return t.month() === selectedMonth && t.year() === selectedYear;
    });

    if (selectedCategory === "Tümü") return ayFiltreli;
    if (selectedCategory === "Market") return ayFiltreli.filter(h => h.kategori.startsWith("Market"));
    return ayFiltreli.filter(h => h.kategori === selectedCategory);
  }, [harcamalar, selectedMonth, selectedYear, selectedCategory]);

  const kategoriToplam = useMemo(() => filteredHarcamalar.reduce((sum,h) => sum + Number(h.miktar||0),0), [filteredHarcamalar]);

  const changeMonth = useCallback((direction) => {
    const current = dayjs().year(selectedYear).month(selectedMonth);
    const newDate = direction === 'prev' ? current.subtract(1,'month') : current.add(1,'month');
    setSelectedMonth(newDate.month());
    setSelectedYear(newDate.year());
    setSelectedCategory('Tümü');
  }, [selectedMonth, selectedYear]);

  const isFutureMonth = useMemo(() => {
    const current = dayjs().year(selectedYear).month(selectedMonth);
    return current.isAfter(now, 'month');
  }, [selectedMonth, selectedYear, now]);

  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format('MMMM YYYY');

  const openEditModal = (harcama) => {
    setEditingHarcama(harcama);
    setFormData({
      miktar: harcama.miktar,
      kategori: harcama.kategori.startsWith("Market") ? "Market" : harcama.kategori,
      altKategori: harcama.kategori.startsWith("Market") ? harcama.altKategori : "",
      not: harcama.not || "",
    });
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    try {
      if (!formData.miktar) return message.error("Miktar boş olamaz!");
      const payload = { ...formData };
      if (formData.kategori === "Market") payload.kategori = `Market - ${formData.altKategori}`;
      await axios.put(`${API_URL}/harcama/${editingHarcama._id}`, payload);
      message.success("Harcama güncellendi!");
      setEditModalVisible(false);
      refetch();
    } catch (err) {
      console.error(err);
      message.error("Güncelleme başarısız!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/harcama/${id}`);
      message.success("Harcama silindi!");
      refetch();
    } catch (err) {
      console.error(err);
      message.error("Silme başarısız!");
    }
  };

  const formatDate = (dateString) => dayjs(dateString).format('DD.MM.YYYY HH:mm');

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={3} className="text-center text-gray-700 mb-6">Harcamalarınız</Title>

      <Card className="shadow-lg rounded-xl mb-6 bg-white" bodyStyle={{ padding:'16px' }}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <Button icon={<LeftOutlined />} onClick={() => changeMonth('prev')}>Önceki Ay</Button>
          <Title level={5} className="m-0 text-blue-600">{displayMonth}</Title>
          <Button icon={<RightOutlined />} onClick={() => changeMonth('next')} disabled={isFutureMonth}>Sonraki Ay</Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <FilterOutlined className="text-xl text-gray-600 flex-shrink-0" />
          <Text strong className="text-gray-600 flex-shrink-0">Kategori Filtresi:</Text>
          <Select value={selectedCategory} onChange={setSelectedCategory} style={{ width:'100%' }} className="flex-grow">
            <Option value="Tümü">Tümü</Option>
            {ALL_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
          </Select>
        </div>

        {selectedCategory !== "Tümü" && (
          <div className="flex items-center justify-center mt-4 bg-gray-50 p-3 rounded-lg border">
            {getCategoryDetails(selectedCategory).icon}
            <span className="ml-2 text-gray-700 font-medium">
              {selectedCategory} Toplamı: <span className="text-blue-600 font-bold">{kategoriToplam.toFixed(2)} ₺</span>
            </span>
          </div>
        )}
      </Card>

      <Card className="shadow-lg rounded-xl overflow-hidden" bodyStyle={{ padding:0 }}>
        <List
          itemLayout="horizontal"
          dataSource={filteredHarcamalar}
          locale={{ emptyText: filteredHarcamalar.length === 0 ? `${displayMonth} ayında harcama bulunmamaktadır.` : "Lütfen bekleyin..." }}
          renderItem={(harcama) => {
            const { icon, color } = getCategoryDetails(harcama.kategori);
            return (
              <List.Item key={harcama._id} className="hover:bg-gray-50 transition duration-300 border-b p-4 sm:p-5">
                <div className="flex items-center w-full">
                  <div className={`p-3 rounded-full mr-4 sm:mr-6 flex-shrink-0 ${color}`}>{icon}</div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <Text strong className="text-lg text-gray-800 truncate">
                        {harcama.kategori.startsWith("Market") && harcama.altKategori 
                          ? `Market - ${harcama.altKategori}` 
                          : harcama.kategori}
                      </Text>
                      <Text className="text-xl font-bold text-red-600 ml-4 flex-shrink-0">
                        {harcama.miktar} ₺
                      </Text>
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      <CalendarOutlined className="mr-1" />
                      <span className="text-xs sm:text-sm">{formatDate(harcama.createdAt)}</span>
                    </div>
                    <div className="text-sm text-gray-600 italic truncate">
                      <SolutionOutlined className="mr-1" />
                      Not: {harcama.not || "Yok"}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4 flex-shrink-0">
                    <Button type="default" icon={<EditOutlined />} onClick={() => openEditModal(harcama)} className="text-blue-500 hover:text-blue-700 border-none shadow-none" />
                    <Popconfirm
                      title="Harcamayı Sil"
                      description="Bu harcamayı kalıcı olarak silmek istediğinizden emin misiniz?"
                      onConfirm={() => handleDelete(harcama._id)}
                      okText="Evet, Sil"
                      cancelText="Vazgeç"
                      okButtonProps={{ danger:true }}
                    >
                      <Button type="default" icon={<DeleteOutlined />} danger className="text-red-500 hover:text-red-700 border-none shadow-none" />
                    </Popconfirm>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </Card>

      <Modal
        title={<Title level={4} className="text-center text-blue-600">Harcamayı Düzenle</Title>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSave}
        okText="Kaydet"
        cancelText="İptal"
        destroyOnClose
      >
        <div className="space-y-4 pt-4">
          <div>
            <Text strong className="block mb-1">Miktar (₺):</Text>
            <Input type="number" value={formData.miktar} onChange={e => setFormData({...formData, miktar:e.target.value})} placeholder="Miktar"/>
          </div>

          <div>
            <Text strong className="block mb-1">Kategori:</Text>
            <Select value={formData.kategori} onChange={v => setFormData({...formData, kategori:v, altKategori:""})} style={{ width:"100%" }}>
              {ALL_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
            </Select>

            {formData.kategori === "Market" && (
              <div className="mt-2">
                <Text strong className="block mb-1">Market Seç:</Text>
                <Select value={formData.altKategori} onChange={v => setFormData({...formData, altKategori:v})} style={{ width:"100%" }} placeholder="Market seçin">
                  {MARKETLER.map(m => <Option key={m} value={m}>{m}</Option>)}
                </Select>
              </div>
            )}
          </div>

          <div>
            <Text strong className="block mb-1">Not:</Text>
            <Input.TextArea rows={2} value={formData.not} onChange={e => setFormData({...formData, not:e.target.value})} placeholder="Ek notunuz (isteğe bağlı)" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Harcamalar = () => {
  return (
    <div className="relative min-h-screen bg-gray-50">
      <Header />
      <main className="pb-20">
        <HarcamalarContent />
      </main>
      <BottomNav />
    </div>
  );
};

export default Harcamalar;
