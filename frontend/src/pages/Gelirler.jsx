// pages/Gelirler.jsx (NİHAİ VERSİYON – Hata Düzeltilmiş ve Optimize Edilmiş)

import React, { useState, useMemo, useCallback, useRef } from "react"; 
import { Typography, Button, Modal, Input, Select, message, Card, Spin } from "antd";
import { 
  EditOutlined, DeleteOutlined, CalendarOutlined, SolutionOutlined, 
  LeftOutlined, RightOutlined, BankOutlined, SaveOutlined, EuroCircleOutlined,
  UndoOutlined 
} from '@ant-design/icons';
import BottomNav from "../components/Home/BottomNav.jsx";
import { useTotalsContext } from "../context/TotalsContext"; 
import axios from "axios";
import dayjs from 'dayjs';
import tr from 'dayjs/locale/tr';

import CustomDayPicker from "../components/Forms/CustomDayPicker";

import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions, 
  LeadingActions,  
  Type as ListType,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";

dayjs.locale(tr);

const { Text, Title } = Typography;
const { Option } = Select;
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

const ALL_GELIR_CATEGORIES = ["gelir", "Tasarruf", "Diğer"]; 

const getCategoryDetails = (kategori) => {
  switch (kategori.toLowerCase()) {
    case 'gelir':
      return { icon: <BankOutlined />, color: 'bg-green-100 text-green-600' };
    case 'tasarruf':
      return { icon: <SaveOutlined />, color: 'bg-blue-100 text-blue-600' };
    default:
      return { icon: <EuroCircleOutlined />, color: 'bg-gray-100 text-gray-600' };
  }
};

const MESSAGE_KEY = 'silmeIslemi'; 

const GelirlerContent = () => {
  const { gelirler = [], refetch, isLoading: isContextLoading } = useTotalsContext();
  const deleteTimerRef = useRef(null); 

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingGelir, setEditingGelir] = useState(null);
  
  const [formData, setFormData] = useState({ 
    miktar: "", 
    kategori: "", 
    not: "", 
    tarih: dayjs().toDate()
  });

  const now = dayjs();
  const [selectedMonth, setSelectedMonth] = useState(now.month()); 
  const [selectedYear, setSelectedYear] = useState(now.year());

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

  const displayMonth = useMemo(() => {
      return dayjs().year(selectedYear).month(selectedMonth).format('MMMM YYYY');
  }, [selectedMonth, selectedYear]);

  const filteredGelirler = useMemo(() => {
    const ayFiltreli = gelirler.filter((gelir) => {
      const gelirTarihi = dayjs(gelir.createdAt);
      return gelirTarihi.month() === selectedMonth && gelirTarihi.year() === selectedYear;
    });
    return ayFiltreli.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [gelirler, selectedMonth, selectedYear]); 


  // Düzenleme modalini aç (useCallback ile sarıldı)
  const openEditModal = useCallback((gelir) => {
    setEditingGelir(gelir);
    setFormData({
      miktar: gelir.miktar,
      kategori: gelir.kategori,
      not: gelir.not || "",
      tarih: dayjs(gelir.createdAt).toDate(), 
    });
    setEditModalVisible(true);
  }, []);

  // Kesin silme fonksiyonu (useCallback ile sarıldı)
  const definitiveDelete = useCallback(async (id) => {
    try {
      await axios.delete(`${API_URL}/gelir/${id}`);
      if (typeof refetch === 'function') refetch(); 
    } catch (err) {
      console.error("Kesin silme hatası:", err);
    }
  }, [refetch]);
  
  // Undo fonksiyonu (useCallback ile sarıldı)
  const handleUndo = useCallback((messageKey) => {
    clearTimeout(deleteTimerRef.current);
    message.destroy(messageKey);
    message.info("Silme işlemi iptal edildi.");
  }, []);

  // Silme sürecini başlatan fonksiyon (useCallback ile sarıldı)
  const startDeleteProcess = useCallback((id) => {
    if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
    }
    
    const content = (
      <span className="flex items-center space-x-3">
        <Text strong className="text-gray-900">🗑️ Silme başarılı oldu!</Text>
        <Button 
          type="link" 
          icon={<UndoOutlined />} 
          size="small"
          onClick={() => handleUndo(MESSAGE_KEY)}
          className="text-blue-500 hover:text-blue-700" 
        >
          Geri Al
        </Button>
      </span>
    );
    
    message.success({ 
        content: content, 
        key: MESSAGE_KEY, 
        duration: 3,
    });

    deleteTimerRef.current = setTimeout(() => {
      definitiveDelete(id);
      message.destroy(MESSAGE_KEY); 
    }, 3000);
  }, [handleUndo, definitiveDelete]);


  // 🔥 Güncelleme fonksiyonu (useCallback ile sarıldı)
  const handleEditSave = useCallback(async () => {
    try {
      if (!formData.miktar) return message.error("Miktar alanı boş bırakılamaz!");

      const selectedDay = dayjs(formData.tarih);

      const updatedCreatedAt = selectedDay
        .hour(dayjs().hour())
        .minute(dayjs().minute())
        .second(dayjs().second())
        .toISOString();

      const payload = {
        miktar: parseFloat(formData.miktar), 
        kategori: formData.kategori,
        not: formData.not,
        createdAt: updatedCreatedAt,
      };
      
      await axios.put(`${API_URL}/gelir/${editingGelir._id}`, payload); 
      
      message.success("Gelir başarıyla güncellendi!");
      setEditModalVisible(false);
      if (typeof refetch === 'function') refetch(); 
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      message.error("Güncelleme başarısız!");
    }
  }, [formData, editingGelir, refetch]);
  
  const formatDate = (dateString) => dayjs(dateString).format('DD.MM.YYYY HH:mm');

  // Trailing Actions (useCallback ile sarıldı, bağımlılık eklendi)
  const trailingActions = useCallback((gelir) => (
    <TrailingActions>
      <SwipeAction
        destructive={true} 
        onClick={() => startDeleteProcess(gelir._id)} 
        onSwipeEnd={() => startDeleteProcess(gelir._id)}
      >
        <div className="bg-red-600 text-white flex justify-center items-center h-full w-full font-bold text-lg">
          <DeleteOutlined className="text-3xl" />
        </div>
      </SwipeAction>
    </TrailingActions>
  ), [startDeleteProcess]); // startDeleteProcess bağımlılığı eklendi

  // Leading Actions (useCallback ile sarıldı, bağımlılık eklendi)
  const leadingActions = useCallback((gelir) => (
    <LeadingActions>
      <SwipeAction onClick={() => openEditModal(gelir)}>
        <div className="bg-blue-500 text-white flex justify-center items-center h-full w-full font-bold text-lg">
          <EditOutlined className="text-3xl" />
        </div>
      </SwipeAction>
    </LeadingActions>
  ), [openEditModal]); // openEditModal bağımlılığı eklendi

  if (isContextLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-0">
      
      {/* BAŞLIK */}
      <Title level={3} className="text-center text-gray-700 mt-4 mb-4 md:mt-6 md:mb-6">Gelir Kayıtları</Title>

      {/* 👇 AY NAVİGASYONUNU SABİTLEYEN KISIM 👇 */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-4 pt-2"> 
        <Card 
          className="shadow-xl rounded-xl mx-4 md:mx-6 lg:mx-8 bg-white" 
          styles={{ body: { padding: '16px' } }} 
        >
          <div className="flex justify-between items-center">
            <Button icon={<LeftOutlined />} onClick={() => changeMonth('prev')}>Önceki Ay</Button>
            <Title level={5} className="m-0 text-green-600">{displayMonth}</Title>
            <Button icon={<RightOutlined />} onClick={() => changeMonth('next')} disabled={isFutureMonth}>Sonraki Ay</Button>
          </div>
        </Card>
      </div>

      <Card 
        className="shadow-lg rounded-xl mx-4 md:mx-6 lg:mx-8 overflow-hidden mb-4" 
        styles={{ body: { padding: 0 } }} 
      >
        {filteredGelirler.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {`${displayMonth} ayında gelir bulunmamaktadır.`}
          </div>
        ) : (
          /* OPTİMİZASYON: listType ANDROID olarak ayarlandı */
          <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.ANDROID}>
            {filteredGelirler.map((gelir) => {
              const { icon, color } = getCategoryDetails(gelir.kategori);
              
              return (
                <SwipeableListItem
                  key={gelir._id}
                  leadingActions={leadingActions(gelir)} 
                  trailingActions={trailingActions(gelir)} 
                  className="bg-white"
                >
                  <div className="flex items-center w-full bg-white p-4 sm:p-5 border-b cursor-pointer">
                    <div className={`p-3 rounded-full mr-4 sm:mr-6 flex-shrink-0 ${color}`}>{icon}</div>
                    
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
                        <span className="text-xs sm:text-sm">{formatDate(gelir.createdAt)}</span>
                      </div>

                      <div className="text-sm text-gray-600 italic truncate">
                        <SolutionOutlined className="mr-1" />
                        Not: {gelir.not || "Yok"}
                      </div>
                    </div>
                  </div>
                </SwipeableListItem>
              );
            })}
          </SwipeableList>
        )}
      </Card>

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
            <Text strong className="block mb-1">Tarih:</Text>
            <CustomDayPicker
                value={formData.tarih}
                onChange={(date) => setFormData({ ...formData, tarih: date })}
                disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                isIncome={true}
            />
          </div>

          <div>
            <Text strong className="block mb-1">Miktar (₺):</Text>
            <Input 
                type="number"
                inputMode="decimal"
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
      <main className="flex-grow"> 
        <GelirlerContent />
      </main>
      <BottomNav />
    </div>
  );
};

export default Gelirler;