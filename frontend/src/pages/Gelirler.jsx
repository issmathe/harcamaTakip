// pages/Gelirler.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { List, Typography, Button, Modal, Input, Select, message, Card, Popconfirm } from "antd";
import { 
  EditOutlined, DeleteOutlined, EuroCircleOutlined, CalendarOutlined, SolutionOutlined, 
  FilterOutlined, LeftOutlined, RightOutlined, BankOutlined, SaveOutlined 
} from '@ant-design/icons';
import Header from "../components/Home/Header.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { TotalsProvider, useTotalsContext } from "../context/TotalsContext";
import axios from "axios";
import dayjs from 'dayjs';
import tr from 'dayjs/locale/tr'; // Türkçe dil desteği
dayjs.locale(tr); // dayjs için Türkçe lokalizasyonu ayarla

const { Text, Title } = Typography;
const { Option } = Select;
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

// Schema'dan gelen kategori listesi
const ALL_GELIR_CATEGORIES = ["maaş", "tasarruf", "diğer"];

// Kategori icon ve renk eşleşmeleri
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
  const { gelirler = [], fetchTotals } = useTotalsContext();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingGelir, setEditingGelir] = useState(null);
  const [formData, setFormData] = useState({ miktar: "", kategori: "", not: "" });
  
  // *** AY FİLTRELEME STATELERİ ***
  const now = dayjs();
  const [selectedMonth, setSelectedMonth] = useState(now.month()); 
  const [selectedYear, setSelectedYear] = useState(now.year());
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  // Harcamaları AY ve KATEGORİ'ye göre filtrelemek için useMemo kullanılıyor
  const filteredGelirler = useMemo(() => {
    // 1. AY ve YIL'a göre filtreleme
    const ayFiltreli = gelirler.filter((gelir) => {
      const gelirTarihi = dayjs(gelir.createdAt);
      return (
        gelirTarihi.month() === selectedMonth && 
        gelirTarihi.year() === selectedYear
      );
    });

    // 2. Kategoriye göre filtreleme
    if (selectedCategory === "Tümü") {
      return ayFiltreli;
    }
    return ayFiltreli.filter(
      (gelir) => gelir.kategori === selectedCategory
    );
  }, [gelirler, selectedMonth, selectedYear, selectedCategory]);


  // *** AY DEĞİŞTİRME FONKSİYONLARI ***
  const changeMonth = useCallback((direction) => {
    const current = dayjs().year(selectedYear).month(selectedMonth);
    let newDate;

    if (direction === 'prev') {
      newDate = current.subtract(1, 'month');
    } else if (direction === 'next') {
      newDate = current.add(1, 'month');
    }

    if (newDate) {
      setSelectedMonth(newDate.month());
      setSelectedYear(newDate.year());
      setSelectedCategory('Tümü'); // Ay değişince kategori filtresini sıfırla
    }
  }, [selectedMonth, selectedYear]);

  // Seçilen ayın mevcut aydan büyük olup olmadığını kontrol eder
  const isFutureMonth = useMemo(() => {
    const current = dayjs().year(selectedYear).month(selectedMonth);
    return current.isAfter(now, 'month');
  }, [selectedMonth, selectedYear, now]);

  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format('MMMM YYYY');
  // *** AY DEĞİŞTİRME FONKSİYONLARI SONU ***


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
      if (!formData.miktar) {
        message.error("Miktar alanı boş bırakılamaz!");
        return;
      }
      await axios.put(`${API_URL}/gelir/${editingGelir._id}`, formData);
      message.success("Gelir başarıyla güncellendi!");
      setEditModalVisible(false);
      fetchTotals();
    } catch (err) {
      message.error("Güncelleme başarısız! Lütfen geçerli bir miktar girin.");
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

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD.MM.YYYY HH:mm');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={3} className="text-center text-gray-700 mb-6">Gelir Kayıtlarınız</Title>
      
      {/* *** FİLTRELEME ALANI (Ay ve Kategori) *** */}
      <Card 
        className="shadow-lg rounded-xl mb-6 bg-white" 
        bodyStyle={{ padding: '16px' }}
      >
        {/* Ay Gezintisi */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <Button 
            icon={<LeftOutlined />}
            onClick={() => changeMonth('prev')}
            className="flex-shrink-0"
          >
            Önceki Ay
          </Button>

          <Title level={5} className="m-0 text-green-600">
            {displayMonth}
          </Title>

          <Button 
            icon={<RightOutlined />}
            onClick={() => changeMonth('next')}
            disabled={isFutureMonth} // Gelecek aya gitmeyi engeller
            className="flex-shrink-0"
          >
            Sonraki Ay
          </Button>
        </div>

        {/* Kategori Filtresi */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <FilterOutlined className="text-xl text-gray-600 flex-shrink-0" />
          <Text strong className="text-gray-600 flex-shrink-0">Kategori Filtresi:</Text>
          <Select
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value)}
            style={{ width: '100%' }}
            className="flex-grow"
          >
            <Option value="Tümü">Tümü</Option>
            {ALL_GELIR_CATEGORIES.map((cat) => (
              <Option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Option>
            ))}
          </Select>
        </div>
      </Card>
      {/* *** FİLTRELEME ALANI SONU *** */}

      <Card 
        className="shadow-lg rounded-xl overflow-hidden" 
        bodyStyle={{ padding: 0 }}
      >
        <List
          itemLayout="horizontal"
          dataSource={filteredGelirler} 
          locale={{ 
            emptyText: filteredGelirler.length === 0 
              ? `${displayMonth} ayında ${selectedCategory !== 'Tümü' ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) + ' kategorisinde ' : ''}gelir bulunmamaktadır.`
              : "Lütfen bekleyin..."
          }}
          className="bg-white"
          renderItem={(gelir) => {
            const { icon, color } = getCategoryDetails(gelir.kategori);
            return (
              <List.Item
                key={gelir._id}
                className="hover:bg-gray-50 transition duration-300 border-b p-4 sm:p-5"
              >
                <div className="flex items-center w-full">
                  
                  {/* Kategori Icon */}
                  <div className={`p-3 rounded-full mr-4 sm:mr-6 flex-shrink-0 ${color}`}>
                    {icon}
                  </div>

                  {/* Gelir Bilgileri */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <Text strong className="text-lg text-gray-800 truncate">
                            {gelir.kategori.charAt(0).toUpperCase() + gelir.kategori.slice(1)}
                        </Text>
                        <Text className="text-xl font-bold text-green-600 ml-4 flex-shrink-0">
                           +{gelir.miktar} ₺
                        </Text>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-1">
                        <CalendarOutlined className="mr-1" />
                        <span className="text-xs sm:text-sm">
                            {formatDate(gelir.createdAt)}
                        </span>
                    </div>

                    <div className="text-sm text-gray-600 italic truncate">
                        <SolutionOutlined className="mr-1" />
                        Not: {gelir.not || "Yok"}
                    </div>
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="flex space-x-2 ml-4 flex-shrink-0">
                    <Button 
                        type="default" 
                        icon={<EditOutlined />} 
                        onClick={() => openEditModal(gelir)}
                        className="text-blue-500 hover:text-blue-700 border-none shadow-none"
                    />
                    
                    <Popconfirm
                        title="Geliri Sil"
                        description="Bu geliri kalıcı olarak silmek istediğinizden emin misiniz?"
                        onConfirm={() => handleDelete(gelir._id)}
                        okText="Evet, Sil"
                        cancelText="Vazgeç"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                            type="default" 
                            icon={<DeleteOutlined />} 
                            danger
                            className="text-red-500 hover:text-red-700 border-none shadow-none"
                        />
                    </Popconfirm>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </Card>

      {/* Düzenleme Modalı */}
      <Modal
        title={<Title level={4} className="text-center text-blue-600">Geliri Düzenle</Title>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSave}
        okText="Kaydet"
        cancelText="İptal"
        destroyOnClose={true}
      >
        <div className="space-y-4 pt-4">
          <div>
            <Text strong className="block mb-1">Miktar (₺):</Text>
            <Input
              type="number"
              prefix={<EuroCircleOutlined className="site-form-item-icon" />}
              placeholder="Miktar"
              value={formData.miktar}
              onChange={(e) => setFormData({ ...formData, miktar: e.target.value })}
            />
          </div>
          <div>
            <Text strong className="block mb-1">Kategori:</Text>
            <Select
              value={formData.kategori}
              onChange={(value) => setFormData({ ...formData, kategori: value })}
              style={{ width: "100%" }}
              placeholder="Kategori Seçiniz"
            >
              {ALL_GELIR_CATEGORIES.map((cat) => (
                <Option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Option>
              ))}
            </Select>
          </div>
          <div>
            <Text strong className="block mb-1">Not:</Text>
            <Input.TextArea
              rows={2}
              value={formData.not}
              onChange={(e) => setFormData({ ...formData, not: e.target.value })}
              placeholder="Ek notunuz (isteğe bağlı)"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Gelirler = () => {
  return (
    <TotalsProvider>
      <div className="relative min-h-screen bg-gray-50">
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