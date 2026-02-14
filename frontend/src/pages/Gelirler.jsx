import React, { useState, useMemo, useCallback, useRef } from "react"; 
import { Typography, Button, Modal, Input, Select, message, Spin, Empty, ConfigProvider } from "antd";
import { 
  EditOutlined, DeleteOutlined, 
  LeftOutlined, RightOutlined, BankOutlined, SaveOutlined, EuroCircleOutlined
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
const MESSAGE_KEY = 'silmeIslemi'; 

const ALL_GELIR_CATEGORIES = ["Gelir", "Tasarruf", "Diğer"]; 

const getCategoryDetails = (kategori) => {
  const cat = kategori?.toLowerCase();
  if (cat === 'gelir') return { icon: <BankOutlined />, color: 'bg-emerald-500/10 text-emerald-400' };
  if (cat === 'tasarruf') return { icon: <SaveOutlined />, color: 'bg-blue-500/10 text-blue-400' };
  return { icon: <EuroCircleOutlined />, color: 'bg-gray-500/10 text-gray-400' };
};

const GelirlerContent = () => {
  const { gelirler = [], refetch, isLoading: isContextLoading } = useTotalsContext();
  const deleteTimerRef = useRef(null); 

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingGelir, setEditingGelir] = useState(null);
  
  const [formData, setFormData] = useState({ 
    miktar: "", kategori: "", not: "", tarih: dayjs().toDate()
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

  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format('MMMM YYYY');
  const isFutureMonth = dayjs().year(selectedYear).month(selectedMonth).isAfter(now, 'month');

  const filteredGelirler = useMemo(() => {
    return (gelirler || [])
      .filter((g) => {
        const t = dayjs(g.createdAt);
        return t.month() === selectedMonth && t.year() === selectedYear;
      })
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [gelirler, selectedMonth, selectedYear]); 

  const openEditModal = (gelir) => {
    setEditingGelir(gelir);
    setFormData({
      miktar: gelir.miktar,
      kategori: gelir.kategori,
      not: gelir.not || "",
      tarih: dayjs(gelir.createdAt).toDate(), 
    });
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    if (!formData.miktar) return message.error("Miktar boş olamaz!");
    try {
      const payload = { 
        miktar: parseFloat(formData.miktar), 
        kategori: formData.kategori, 
        not: formData.not, 
        createdAt: dayjs(formData.tarih).toISOString() 
      };
      await axios.put(`${API_URL}/gelir/${editingGelir._id}`, payload); 
      message.success("Kayıt güncellendi");
      setEditModalVisible(false);
      refetch(); 
    } catch (err) {
      message.error("Güncelleme başarısız!");
    }
  };

  const startDeleteProcess = (id) => {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    message.open({ 
      key: MESSAGE_KEY,
      content: (
        <div className="flex items-center gap-4">
          <span className="text-white font-bold">🗑️ Gelir silindi</span>
          <Button type="link" size="small" className="text-blue-400 p-0" onClick={() => { 
              clearTimeout(deleteTimerRef.current); 
              message.destroy(MESSAGE_KEY); 
            }}>GERİ AL</Button>
        </div>
      ), 
      style: { marginTop: '10vh' },
      duration: 3 
    });
    deleteTimerRef.current = setTimeout(async () => {
      await axios.delete(`${API_URL}/gelir/${id}`);
      refetch();
    }, 3000);
  };

  if (isContextLoading) return <div className="flex justify-center items-center h-screen bg-[#020617]"><Spin size="large" /></div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#020617] pb-32">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="flex justify-between items-center">
          <Button icon={<LeftOutlined className="text-white" />} onClick={() => changeMonth("prev")} type="text" className="hover:bg-white/5" />
          <div className="text-center">
            <Text className="block text-[9px] uppercase tracking-[0.2em] text-blue-400 font-black">Gelir Kayıtları</Text>
            <Title level={4} className="!text-white !m-0 italic font-black tracking-tighter uppercase">{displayMonth}</Title>
          </div>
          <Button icon={<RightOutlined className="text-white" />} onClick={() => changeMonth("next")} disabled={isFutureMonth} type="text" className="hover:bg-white/5 disabled:opacity-20" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredGelirler.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-12 text-center border border-white/10">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-gray-500">Bu dönemde gelir yok</span>} />
          </div>
        ) : (
          <div className="space-y-1">
            <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.IOS}>
              {filteredGelirler.map((gelir) => {
                const { icon, color } = getCategoryDetails(gelir.kategori);
                return (
                  <SwipeableListItem 
                    key={gelir._id} 
                    leadingActions={
                        <LeadingActions>
                          <SwipeAction onClick={() => openEditModal(gelir)}>
                            <div className="bg-blue-600 text-white flex justify-center items-center h-[76px] w-20 rounded-l-[24px] mb-3">
                              <EditOutlined className="text-xl" />
                            </div>
                          </SwipeAction>
                        </LeadingActions>
                    } 
                    trailingActions={
                        <TrailingActions>
                          <SwipeAction destructive onClick={() => startDeleteProcess(gelir._id)}>
                            <div className="bg-red-600 text-white flex justify-center items-center h-[76px] w-20 rounded-r-[24px] mb-3">
                              <DeleteOutlined className="text-xl" />
                            </div>
                          </SwipeAction>
                        </TrailingActions>
                    }
                  >
                    <div className="flex items-center w-full p-4 mb-3 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/5 active:scale-[0.98] transition-transform">
                      <div className={`w-12 h-12 rounded-2xl mr-4 ${color} flex items-center justify-center text-xl`}>
                        {icon}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center">
                          <Text className="text-[10px] uppercase font-black tracking-widest text-gray-500">{gelir.kategori}</Text>
                          <Text className="text-lg font-black italic text-emerald-400">€{gelir.miktar.toLocaleString('tr-TR')}</Text>
                        </div>
                        <div className="flex justify-between items-end">
                            <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                {dayjs(gelir.createdAt).format('DD MMMM')}
                            </Text>
                            {gelir.not && (
                                <Text className="text-[11px] text-blue-300/60 italic truncate max-w-[140px]">
                                    {gelir.not}
                                </Text>
                            )}
                        </div>
                      </div>
                    </div>
                  </SwipeableListItem>
                );
              })}
            </SwipeableList>
          </div>
        )}
      </div>

      <Modal
        title={<div className="text-center text-blue-400 font-black uppercase tracking-widest text-sm">Veriyi Güncelle</div>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSave}
        okText="KAYDET"
        centered
        closeIcon={null}
        width={340}
        className="space-modal"
        styles={{ body: { padding: '20px' } }}
        okButtonProps={{ className: "bg-blue-600 rounded-xl w-full h-12 font-black border-none shadow-lg shadow-blue-900/20" }}
        cancelButtonProps={{ className: "hidden" }}
      >
        <div className="space-y-4">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <Text className="text-[9px] text-gray-500 uppercase font-black block mb-1">Tarih</Text>
            <CustomDayPicker value={formData.tarih} onChange={d => setFormData({...formData, tarih: d})} isIncome={true} />
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <Text className="text-[9px] text-gray-500 uppercase font-black block mb-1">Miktar (€)</Text>
            <Input variant="borderless" type="number" className="p-0 text-2xl font-black text-emerald-400" value={formData.miktar} onChange={e => setFormData({...formData, miktar: e.target.value})} />
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <Text className="text-[9px] text-gray-500 uppercase font-black block mb-1">Kategori</Text>
            <Select variant="borderless" className="w-full p-0 font-bold text-white" value={formData.kategori} onChange={v => setFormData({...formData, kategori: v})}>
              {ALL_GELIR_CATEGORIES.map(cat => <Option key={cat} value={cat.toLowerCase()}>{cat}</Option>)}
            </Select>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <Text className="text-[9px] text-gray-500 uppercase font-black block mb-1">Not</Text>
            <Input.TextArea variant="borderless" rows={2} className="p-0 text-sm text-gray-300" value={formData.not} onChange={e => setFormData({...formData, not: e.target.value})} placeholder="..." />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Gelirler = () => (
    <ConfigProvider theme={{ 
        token: { borderRadius: 16, colorPrimary: '#10b981', colorBgBase: '#020617', colorText: '#f8fafc' },
        components: {
            Modal: { contentBg: '#0f172a', headerBg: '#0f172a' },
            Select: { selectorBg: 'transparent' }
        }
    }}>
        <div className="relative min-h-screen bg-[#020617]">
            <main><GelirlerContent /></main>
            <BottomNav />
        </div>
    </ConfigProvider>
);

export default Gelirler;