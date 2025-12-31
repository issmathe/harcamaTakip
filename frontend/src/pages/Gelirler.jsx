// pages/Gelirler.jsx (Hatasız ve Sadeleştirilmiş Versiyon)

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
  switch (kategori?.toLowerCase()) {
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
    const ayFiltreli = (gelirler || []).filter((gelir) => {
      const gelirTarihi = dayjs(gelir.createdAt);
      return gelirTarihi.month() === selectedMonth && gelirTarihi.year() === selectedYear;
    });
    return ayFiltreli.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [gelirler, selectedMonth, selectedYear]); 

  // --- KATEGORİK TOPLAM HESAPLAMA ---
  const categoryTotals = useMemo(() => {
    const stats = { gelir: 0, tasarruf: 0, diger: 0 };
    filteredGelirler.forEach(item => {
      const m = Number(item.miktar || 0);
      const cat = item.kategori?.toLowerCase();
      if (cat === 'gelir') stats.gelir += m;
      else if (cat === 'tasarruf') stats.tasarruf += m;
      else stats.diger += m;
    });
    return stats;
  }, [filteredGelirler]);

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

  const definitiveDelete = useCallback(async (id) => {
    try {
      await axios.delete(`${API_URL}/gelir/${id}`);
      if (typeof refetch === 'function') refetch(); 
    } catch (err) {
      console.error("Kesin silme hatası:", err);
    }
  }, [refetch]);
  
  const handleUndo = useCallback((messageKey) => {
    clearTimeout(deleteTimerRef.current);
    message.destroy(messageKey);
    message.info("Silme işlemi iptal edildi.");
  }, []);

  const startDeleteProcess = useCallback((id) => {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    
    const content = (
      <span className="flex items-center space-x-3">
        <Text strong className="text-gray-900">🗑️ Silme başarılı!</Text>
        <Button type="link" icon={<UndoOutlined />} size="small" onClick={() => handleUndo(MESSAGE_KEY)}>Geri Al</Button>
      </span>
    );
    
    message.success({ content, key: MESSAGE_KEY, duration: 3 });
    deleteTimerRef.current = setTimeout(() => {
      definitiveDelete(id);
      message.destroy(MESSAGE_KEY); 
    }, 3000);
  }, [handleUndo, definitiveDelete]);

  const handleEditSave = useCallback(async () => {
    try {
      if (!formData.miktar) return message.error("Miktar alanı boş bırakılamaz!");
      const selectedDay = dayjs(formData.tarih);
      const updatedCreatedAt = selectedDay.hour(dayjs().hour()).minute(dayjs().minute()).second(dayjs().second()).toISOString();
      const payload = { miktar: parseFloat(formData.miktar), kategori: formData.kategori, not: formData.not, createdAt: updatedCreatedAt };
      await axios.put(`${API_URL}/gelir/${editingGelir._id}`, payload); 
      message.success("Gelir başarıyla güncellendi!");
      setEditModalVisible(false);
      if (typeof refetch === 'function') refetch(); 
    } catch (err) {
      message.error("Güncelleme başarısız!");
    }
  }, [formData, editingGelir, refetch]);
  
  const formatDate = (dateString) => dayjs(dateString).format('DD.MM.YYYY HH:mm');

  const trailingActions = useCallback((gelir) => (
    <TrailingActions>
      <SwipeAction destructive={true} onClick={() => startDeleteProcess(gelir._id)} onSwipeEnd={() => startDeleteProcess(gelir._id)}>
        <div className="bg-red-600 text-white flex justify-center items-center h-full w-full font-bold text-lg">
          <DeleteOutlined className="text-3xl" />
        </div>
      </SwipeAction>
    </TrailingActions>
  ), [startDeleteProcess]);

  const leadingActions = useCallback((gelir) => (
    <LeadingActions>
      <SwipeAction onClick={() => openEditModal(gelir)}>
        <div className="bg-blue-500 text-white flex justify-center items-center h-full w-full font-bold text-lg">
          <EditOutlined className="text-3xl" />
        </div>
      </SwipeAction>
    </LeadingActions>
  ), [openEditModal]);

  if (isContextLoading) return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;

  return (
    <div className="p-0">
      
      {/* 👇 AY NAVİGASYONU VE KATEGORİK ÖZET 👇 */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-4 pt-4"> 
        <Card className="shadow-xl rounded-2xl mx-4 md:mx-6 bg-white border-none" styles={{ body: { padding: '16px' } }}>
          <div className="flex flex-col space-y-4">
            {/* Ay Seçimi */}
            <div className="flex justify-between items-center border-b pb-3 border-gray-50">
              <Button type="text" size="small" icon={<LeftOutlined />} onClick={() => changeMonth('prev')} />
              <div className="text-center">
                <Text className="text-gray-700 font-bold text-sm uppercase">{displayMonth}</Text>
              </div>
              <Button type="text" size="small" icon={<RightOutlined />} onClick={() => changeMonth('next')} disabled={isFutureMonth} />
            </div>
            
            {/* Kategorik Toplamlar (Yan Yana) */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex-1 min-w-[80px] bg-green-50 border border-green-100 rounded-xl p-2 text-center">
                <Text className="block text-[9px] text-green-600 font-bold uppercase tracking-tight">Gelir</Text>
                <Text className="text-green-700 font-black text-xs">₺{categoryTotals.gelir.toLocaleString('tr-TR')}</Text>
              </div>

              <div className="flex-1 min-w-[80px] bg-blue-50 border border-blue-100 rounded-xl p-2 text-center">
                <Text className="block text-[9px] text-blue-600 font-bold uppercase tracking-tight">Tasarruf</Text>
                <Text className="text-blue-700 font-black text-xs">₺{categoryTotals.tasarruf.toLocaleString('tr-TR')}</Text>
              </div>

              <div className="flex-1 min-w-[80px] bg-gray-50 border border-gray-100 rounded-xl p-2 text-center">
                <Text className="block text-[9px] text-gray-500 font-bold uppercase tracking-tight">Diğer</Text>
                <Text className="text-gray-700 font-black text-xs">₺{categoryTotals.diger.toLocaleString('tr-TR')}</Text>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-4 md:px-6 mb-24">
        {filteredGelirler.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-2 border-gray-200 bg-transparent py-10 text-center">
            <Text className="text-gray-400 italic">Bu ay henüz kayıt girilmemiş.</Text>
          </Card>
        ) : (
          <Card className="shadow-lg rounded-2xl overflow-hidden border-none" styles={{ body: { padding: 0 } }}>
            <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.ANDROID}>
              {filteredGelirler.map((gelir) => {
                const { icon, color } = getCategoryDetails(gelir.kategori);
                return (
                  <SwipeableListItem key={gelir._id} leadingActions={leadingActions(gelir)} trailingActions={trailingActions(gelir)} className="bg-white">
                    <div className="flex items-center w-full bg-white p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className={`p-3 rounded-xl mr-4 flex-shrink-0 ${color} shadow-sm`}>{icon}</div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <Text strong className="text-sm text-gray-800 truncate uppercase tracking-tight">
                            {gelir.kategori}
                          </Text>
                          <Text className="text-base font-black text-green-600 ml-4 flex-shrink-0">
                            + ₺{Number(gelir.miktar).toLocaleString('tr-TR')}
                          </Text>
                        </div>
                        <div className="flex items-center text-[10px] text-gray-400 space-x-2">
                          <span><CalendarOutlined className="mr-1" />{formatDate(gelir.createdAt)}</span>
                          {gelir.not && <span className="truncate max-w-[120px]"><SolutionOutlined className="mr-1" />{gelir.not}</span>}
                        </div>
                      </div>
                    </div>
                  </SwipeableListItem>
                );
              })}
            </SwipeableList>
          </Card>
        )}
      </div>

      <Modal
        title={<Title level={4} className="text-center text-indigo-600 m-0">Kaydı Düzenle</Title>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSave}
        okText="Güncelle"
        cancelText="Vazgeç"
        centered
      >
        <div className="space-y-4 pt-4">
          <div>
            <Text strong className="block mb-1 text-xs text-gray-400 uppercase">İşlem Tarihi</Text>
            <CustomDayPicker value={formData.tarih} onChange={(date) => setFormData({ ...formData, tarih: date })} disabledDate={(current) => current && current.isAfter(dayjs(), 'day')} isIncome={true} />
          </div>
          <div>
            <Text strong className="block mb-1 text-xs text-gray-400 uppercase">Tutar (₺)</Text>
            <Input type="number" inputMode="decimal" className="rounded-xl h-12 text-lg font-bold" value={formData.miktar} onChange={e => setFormData({...formData, miktar:e.target.value})} />
          </div>
          <div>
            <Text strong className="block mb-1 text-xs text-gray-400 uppercase">Kategori</Text>
            <Select className="w-full h-12 rounded-xl" value={formData.kategori} onChange={v => setFormData({...formData, kategori:v})}>
              {ALL_GELIR_CATEGORIES.map(cat => <Option key={cat} value={cat.toLowerCase()}>{cat}</Option>)}
            </Select>
          </div>
          <div>
            <Text strong className="block mb-1 text-xs text-gray-400 uppercase">Açıklama</Text>
            <Input.TextArea className="rounded-xl" rows={3} value={formData.not} onChange={e => setFormData({...formData, not:e.target.value})} placeholder="İsteğe bağlı not..." />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Gelirler = () => {
  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow"><GelirlerContent /></main>
      <BottomNav />
    </div>
  );
};

export default Gelirler;