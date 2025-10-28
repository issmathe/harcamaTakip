// pages/Gelirler.jsx (KONTROL EDİLMİŞ VE KESİNLEŞTİRİLMİŞ)

import React, { useState, useMemo, useCallback } from "react";
import { List, Typography, Button, Modal, Input, Select, message, Card, Popconfirm } from "antd";
import { 
  EditOutlined, DeleteOutlined, EuroCircleOutlined, CalendarOutlined, SolutionOutlined, 
  FilterOutlined, LeftOutlined, RightOutlined, BankOutlined, SaveOutlined 
} from '@ant-design/icons';
import BottomNav from "../components/Home/BottomNav.jsx";
// Context'ten doğru fonksiyonu çekiyoruz (artık TotalsContext'te 'refetch' var)
import { useTotalsContext } from "../context/TotalsContext"; 
import axios from "axios";
import dayjs from 'dayjs';
import tr from 'dayjs/locale/tr';

dayjs.locale(tr);

const { Text, Title } = Typography;
const { Option } = Select;
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

const ALL_GELIR_CATEGORIES = ["maaş", "tasarruf", "diğer"];

const getCategoryDetails = (kategori) => {
  switch (kategori.toLowerCase()) {
    case 'maaş':
      return { icon: <BankOutlined />, color: 'bg-green-100 text-green-600' };
    case 'tasarruf':
      return { icon: <SaveOutlined />, color: 'bg-blue-100 text-blue-600' };
    case 'diğer':
    default:
      return { icon: <EuroCircleOutlined />, color: 'bg-gray-100 text-gray-600' };
  }
};

const GelirlerContent = () => {
  // Artık TotalsContext'ten çekilen 'refetch' bir fonksiyon olacak.
  const { gelirler = [], refetch } = useTotalsContext();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingGelir, setEditingGelir] = useState(null);
  const [formData, setFormData] = useState({ miktar: "", kategori: "", not: "" });

  const now = dayjs();
  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  const filteredGelirler = useMemo(() => {
    const ayFiltreli = gelirler.filter((gelir) => {
      const gelirTarihi = dayjs(gelir.createdAt);
      return gelirTarihi.month() === selectedMonth && gelirTarihi.year() === selectedYear;
    });
    if (selectedCategory === "Tümü") return ayFiltreli;
    return ayFiltreli.filter((gelir) => gelir.kategori === selectedCategory);
  }, [gelirler, selectedMonth, selectedYear, selectedCategory]);

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
      if (!formData.miktar) return message.error("Miktar alanı boş bırakılamaz!");
      await axios.put(`${API_URL}/gelir/${editingGelir._id}`, formData);
      message.success("Gelir başarıyla güncellendi!");
      setEditModalVisible(false);
      // refetch çağrısı başarılı olursa listedeki veriyi günceller
      if (typeof refetch === 'function') refetch(); 
    } catch (err) {
      console.error(err);
      message.error("Güncelleme başarısız!");
    }
  };

  // Düzeltme mantığı korundu, artık uyarı almamamız bekleniyor.
  const handleDelete = async (id) => {
    let success = false;
    try {
      // 1. Silme işlemini yap
      await axios.delete(`${API_URL}/gelir/${id}`);
      success = true;
      message.success("Gelir başarıyla silindi!");
      
    } catch (err) {
      console.error("Silme işlemi sunucu hatası:", err);
      // Silme işlemi başarısız olursa (örn: 4xx/5xx durum kodu)
      message.error("Silme işlemi başarısız oldu! Lütfen tekrar deneyin.");
      return; // Daha ileri gitme
    }

    // 2. Silme başarılıysa, listeyi yenile (refetch)
    // Artık 'refetch' bir fonksiyon olacağı için bu koşul sağlanacak ve liste yenilenecek.
    if (success && typeof refetch === 'function') {
      try {
         refetch();
      } catch (refetchErr) {
         console.warn("Silme başarılı, ancak liste yenileme (refetch) başarısız oldu:", refetchErr);
      }
    } else if (success) {
        // Bu console.warn satırı, Context düzeltilince artık çalışmayacak.
       console.warn("Silme başarılı ancak refetch fonksiyonu context'ten doğru gelmiyor.");
    }
  };

  const formatDate = (dateString) => dayjs(dateString).format('DD.MM.YYYY HH:mm');

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={3} className="text-center text-gray-700 mb-6">Gelir Kayıtlarınız</Title>

      {/* Filtreleme Card */}
      <Card 
        className="shadow-lg rounded-xl mb-6 bg-white" 
        styles={{ body: { padding: '16px' } }} 
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <Button icon={<LeftOutlined />} onClick={() => changeMonth('prev')}>Önceki Ay</Button>
          <Title level={5} className="m-0 text-green-600">{displayMonth}</Title>
          <Button icon={<RightOutlined />} onClick={() => changeMonth('next')} disabled={isFutureMonth}>Sonraki Ay</Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <FilterOutlined className="text-xl text-gray-600 flex-shrink-0" />
          <Text strong className="text-gray-600 flex-shrink-0">Kategori Filtresi:</Text>
          <Select value={selectedCategory} onChange={setSelectedCategory} style={{ width:'100%' }} className="flex-grow">
            <Option value="Tümü">Tümü</Option>
            {ALL_GELIR_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Option>)}
          </Select>
        </div>
      </Card>

      {/* Gelir Listesi */}
      <Card 
        className="shadow-lg rounded-xl overflow-hidden" 
        styles={{ body: { padding: 0 } }} 
      >
        <List
          itemLayout="horizontal"
          dataSource={filteredGelirler}
          locale={{ emptyText: filteredGelirler.length === 0 ? `${displayMonth} ayında gelir bulunmamaktadır.` : "Lütfen bekleyin..." }}
          renderItem={(gelir) => {
            const { icon, color } = getCategoryDetails(gelir.kategori);
            return (
              <List.Item key={gelir._id} className="hover:bg-gray-50 transition duration-300 border-b p-4 sm:p-5">
                <div className="flex items-center w-full">
                  <div className={`p-3 rounded-full mr-4 sm:mr-6 flex-shrink-0 ${color}`}>{icon}</div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <Text strong className="text-lg text-gray-800 truncate">{gelir.kategori.charAt(0).toUpperCase() + gelir.kategori.slice(1)}</Text>
                      <Text className="text-xl font-bold text-green-600 ml-4 flex-shrink-0">+{gelir.miktar} ₺</Text>
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      <CalendarOutlined className="mr-1" />
                      <span className="text-xs sm:text-sm">{formatDate(gelir.createdAt)}</span>
                    </div>
                    <div className="text-sm text-gray-600 italic truncate">
                      <SolutionOutlined className="mr-1" />Not: {gelir.not || "Yok"}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4 flex-shrink-0">
                    <Button type="default" icon={<EditOutlined />} onClick={() => openEditModal(gelir)} className="text-blue-500 hover:text-blue-700 border-none shadow-none" />
                    <Popconfirm
                      title="Geliri Sil"
                      description="Bu geliri kalıcı olarak silmek istediğinizden emin misiniz?"
                      onConfirm={() => handleDelete(gelir._id)}
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

      {/* Düzenleme Modal */}
      <Modal
        title={<Title level={4} className="text-center text-blue-600">Geliri Düzenle</Title>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSave}
        okText="Kaydet"
        cancelText="İptal"
        destroyOnHidden 
      >
        <div className="space-y-4 pt-4">
          <div>
            <Text strong className="block mb-1">Miktar (₺):</Text>
            <Input type="number" value={formData.miktar} onChange={e => setFormData({...formData, miktar:e.target.value})} placeholder="Miktar" />
          </div>
          <div>
            <Text strong className="block mb-1">Kategori:</Text>
            <Select value={formData.kategori} onChange={v => setFormData({...formData, kategori:v})} style={{ width:"100%" }}>
              {ALL_GELIR_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Option>)}
            </Select>
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

const Gelirler = () => {
  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col">

      <main className="flex-grow pt-20 pb-20 overflow-y-auto">
        <GelirlerContent />
      </main>
      <BottomNav />
    </div>
  );
};

export default Gelirler;