// pages/Gelirler.jsx (KAYDIRARAK SİLME/DÜZENLEME VERSİYONU)

import React, { useState, useMemo, useCallback } from "react";
import { Typography, Button, Modal, Input, Select, message, Card, Spin } from "antd";
import { 
  EditOutlined, DeleteOutlined, CalendarOutlined, SolutionOutlined, 
  LeftOutlined, RightOutlined, BankOutlined, SaveOutlined, EuroCircleOutlined 
} from '@ant-design/icons'; // Gerekli ikonlar eklendi
import BottomNav from "../components/Home/BottomNav.jsx";
import { useTotalsContext } from "../context/TotalsContext"; 
import axios from "axios";
import dayjs from 'dayjs';
import tr from 'dayjs/locale/tr';

// Kaydırarak silme ve düzenleme için bileşenler
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions, // Sağdan kaydırma aksiyonu (Silme)
  LeadingActions,  // Soldan kaydırma aksiyonu (Düzenleme)
  Type as ListType,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";

dayjs.locale(tr);

const { Text, Title } = Typography;
const { Option } = Select;
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

const ALL_GELIR_CATEGORIES = ["Maaş", "Tasarruf", "Diğer"]; 

// Gelir kategorisi ikonları (Listede görsel zenginlik için geri eklendi)
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
  // useTotalsContext'ten gelen verinin isLoading durumunu varsayalım
  const { gelirler = [], refetch, isLoading: isContextLoading } = useTotalsContext();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingGelir, setEditingGelir] = useState(null);
  const [formData, setFormData] = useState({ miktar: "", kategori: "", not: "" });

  const now = dayjs();
  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());

  const filteredGelirler = useMemo(() => {
    const ayFiltreli = gelirler.filter((gelir) => {
      const gelirTarihi = dayjs(gelir.createdAt);
      return gelirTarihi.month() === selectedMonth && gelirTarihi.year() === selectedYear;
    });
    return ayFiltreli;
  }, [gelirler, selectedMonth, selectedYear]); 

  const changeMonth = useCallback((direction) => {
    const current = dayjs().year(selectedYear).month(selectedMonth);
    const newDate = direction === 'prev' ? current.subtract(1,'month') : current.add(1,'month');
    setSelectedMonth(newDate.month());
    setSelectedYear(newDate.year());
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
      if (typeof refetch === 'function') refetch(); 
    } catch (err) {
      console.error(err);
      message.error("Güncelleme başarısız!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/gelir/${id}`);
      message.success("🗑️ Gelir başarıyla silindi!");
      if (typeof refetch === 'function') refetch(); 
    } catch (err) {
      console.error("Silme işlemi sunucu hatası:", err);
      message.error("Silme işlemi başarısız oldu! Lütfen tekrar deneyin.");
    }
  };

  const formatDate = (dateString) => dayjs(dateString).format('DD.MM.YYYY HH:mm');

  
  // -----------------------------------------------------------------
  // ✨ KAYDIRMA AKSİYONLARI BAŞLANGIÇ
  // -----------------------------------------------------------------
  
  // 1. Trailing Actions (Sağdan kaydırma - Silme)
  const trailingActions = (gelir) => (
    <TrailingActions>
      <SwipeAction
        // destructive=true: Kırmızı arka planı sağlar
        destructive={true} 
        // onClick: Kullanıcı kaydırma sonrası kırmızı alana bastığında tetiklenir (Kaydır-Bas-Sil mantığı)
        onClick={() => handleDelete(gelir._id)}
      >
        <div className="bg-red-600 text-white flex justify-center items-center h-full w-full font-bold text-lg">
          <DeleteOutlined className="text-3xl" />
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  // 2. Leading Actions (Soldan kaydırma - Düzenleme)
  const leadingActions = (gelir) => (
    <LeadingActions>
      <SwipeAction
        // Varsayılan renk (mavi) kullanılacak
        onClick={() => openEditModal(gelir)}
      >
        <div className="bg-blue-500 text-white flex justify-center items-center h-full w-full font-bold text-lg">
          <EditOutlined className="text-3xl" />
        </div>
      </SwipeAction>
    </LeadingActions>
  );
  
  // -----------------------------------------------------------------
  // ✨ KAYDIRMA AKSİYONLARI SON
  // -----------------------------------------------------------------

  if (isContextLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-0">
      <Title level={3} className="text-center text-gray-700 mt-4 mb-4 md:mt-6 md:mb-6">Gelir Kayıtları</Title>

      {/* Tarih Filtreleme Card */}
      <Card 
        className="shadow-lg rounded-xl mx-4 md:mx-6 lg:mx-8 mb-6 bg-white" 
        styles={{ body: { padding: '16px' } }} 
      >
        <div className="flex justify-between items-center">
          <Button icon={<LeftOutlined />} onClick={() => changeMonth('prev')}>Önceki Ay</Button>
          <Title level={5} className="m-0 text-green-600">{displayMonth}</Title>
          <Button icon={<RightOutlined />} onClick={() => changeMonth('next')} disabled={isFutureMonth}>Sonraki Ay</Button>
        </div>
      </Card>

      {/* Gelir Listesi - List yerine SwipeableList kullanıldı */}
      <Card 
        className="shadow-lg rounded-xl mx-4 md:mx-6 lg:mx-8 overflow-hidden mb-4" 
        styles={{ body: { padding: 0 } }} 
      >
        {filteredGelirler.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {`${displayMonth} ayında gelir bulunmamaktadır.`}
          </div>
        ) : (
          <SwipeableList
            threshold={0.3}     // Aksiyonun görünmesi için kaydırma eşiği
            fullSwipe={false}   // Tam kaydırmada otomatik aksiyonu engeller (Basma zorunluluğunu korur)
            listType={ListType.IOS} // iOS stilinde kaydırma
          >
            {filteredGelirler.map((gelir) => {
              const { icon, color } = getCategoryDetails(gelir.kategori);
              
              return (
                <SwipeableListItem
                  key={gelir._id}
                  leadingActions={leadingActions(gelir)} // Soldan kaydırma (Düzenle)
                  trailingActions={trailingActions(gelir)} // Sağdan kaydırma (Sil)
                  className="bg-white"
                >
                  {/* Liste Öğesinin İçeriği */}
                  <div className="flex items-center w-full bg-white p-4 sm:p-5 border-b cursor-pointer">
                    {/* İkon Kutusu */}
                    <div className={`p-3 rounded-full mr-4 sm:mr-6 flex-shrink-0 ${color}`}>{icon}</div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        {/* Kategori bilgisi */}
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
                    {/* Eski Düzenle/Sil butonları kaldırıldı */}
                  </div>
                </SwipeableListItem>
              );
            })}
          </SwipeableList>
        )}
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
            <Input 
              type="number" 
              value={formData.miktar} 
              onChange={e => setFormData({...formData, miktar:e.target.value})} 
              placeholder="Miktar" 
            />
          </div>
          <div>
            <Text strong className="block mb-1">Kategori:</Text>
            <Select 
              value={formData.kategori} 
              onChange={v => setFormData({...formData, kategori:v})} 
              style={{ width:"100%" }}
            >
              {ALL_GELIR_CATEGORIES.map(cat => (
                <Option key={cat} value={cat.toLowerCase()}>{cat}</Option>
              ))}
            </Select>
          </div>
          <div>
            <Text strong className="block mb-1">Not:</Text>
            <Input.TextArea 
              rows={2} 
              value={formData.not} 
              onChange={e => setFormData({...formData, not:e.target.value})} 
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
    <div className="relative min-h-screen bg-gray-50 flex flex-col">

      <main className="flex-grow overflow-y-auto"> 
        <GelirlerContent />
      </main>
      <BottomNav />
    </div>
  );
};

export default Gelirler;