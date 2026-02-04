import React, { useState, useMemo, useCallback, useRef } from "react"; 
import { Typography, Button, Modal, Input, Select, message, Spin, Empty, ConfigProvider, Row, Col } from "antd";
import { 
  EditOutlined, DeleteOutlined, 
  LeftOutlined, RightOutlined, BankOutlined, SaveOutlined, EuroCircleOutlined,
  SearchOutlined
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
  if (cat === 'gelir') return { icon: <BankOutlined />, color: 'bg-emerald-50 text-emerald-500' };
  if (cat === 'tasarruf') return { icon: <SaveOutlined />, color: 'bg-blue-50 text-blue-500' };
  return { icon: <EuroCircleOutlined />, color: 'bg-gray-50 text-gray-500' };
};

const GelirlerContent = () => {
  const { gelirler = [], refetch, isLoading: isContextLoading } = useTotalsContext();
  const deleteTimerRef = useRef(null); 

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingGelir, setEditingGelir] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
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
        const isSearching = searchTerm.trim().length > 0;
        const monthMatch = isSearching ? true : (t.month() === selectedMonth && t.year() === selectedYear);
        const searchMatch = g.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           g.not?.toLowerCase().includes(searchTerm.toLowerCase());
        return monthMatch && searchMatch;
      })
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [gelirler, selectedMonth, selectedYear, searchTerm]); 

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
      message.success("Güncellendi!");
      setEditModalVisible(false);
      refetch(); 
    } catch (err) {
      message.error("Güncelleme başarısız!");
    }
  };

  const startDeleteProcess = (id) => {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    message.success({ 
      content: (
        <span className="flex items-center space-x-2">
          <Text strong>🗑️ Kayıt silindi</Text>
          <Button type="link" size="small" onClick={() => { 
              clearTimeout(deleteTimerRef.current); 
              message.destroy(MESSAGE_KEY); 
            }}>Geri Al</Button>
        </span>
      ), 
      key: MESSAGE_KEY, 
      duration: 3 
    });
    deleteTimerRef.current = setTimeout(async () => {
      await axios.delete(`${API_URL}/gelir/${id}`);
      refetch();
    }, 3000);
  };

  const leadingActions = (gelir) => (
    <LeadingActions>
      <SwipeAction onClick={() => openEditModal(gelir)}>
        <div className="bg-blue-500 text-white flex justify-center items-center h-full w-20 rounded-l-3xl">
          <EditOutlined className="text-xl" />
        </div>
      </SwipeAction>
    </LeadingActions>
  );

  const trailingActions = (gelir) => (
    <TrailingActions>
      <SwipeAction destructive onClick={() => startDeleteProcess(gelir._id)}>
        <div className="bg-red-500 text-white flex justify-center items-center h-full w-20 rounded-r-3xl">
          <DeleteOutlined className="text-xl" />
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  if (isContextLoading) return <div className="flex justify-center items-center h-screen bg-gray-50"><Spin size="large" /></div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">
          <Button icon={<LeftOutlined />} onClick={() => changeMonth("prev")} type="text" />
          <div className="text-center">
            <Text className="block text-[10px] uppercase tracking-tighter text-gray-400 font-bold">Gelirler</Text>
            <Title level={5} className="m-0 capitalize" style={{ margin: 0 }}>{displayMonth}</Title>
          </div>
          <Button icon={<RightOutlined />} onClick={() => changeMonth("next")} disabled={isFutureMonth} type="text" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* STATS */}
        <Row gutter={12}>
          <Col span={12}>
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-emerald-50 rounded-lg"><BankOutlined className="text-emerald-500 text-xs" /></div>
                <Text type="secondary" className="text-[10px] font-bold uppercase">Net Gelir</Text>
              </div>
              <Title level={4} className="m-0 text-emerald-600">+{categoryTotals.gelir.toFixed(0)}€</Title>
            </div>
          </Col>
          <Col span={12}>
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-blue-50 rounded-lg"><SaveOutlined className="text-blue-500 text-xs" /></div>
                <Text type="secondary" className="text-[10px] font-bold uppercase">Tasarruf</Text>
              </div>
              <Title level={4} className="m-0 text-blue-600">+{categoryTotals.tasarruf.toFixed(0)}€</Title>
            </div>
          </Col>
        </Row>

        {/* SEARCH */}
        <Input 
          placeholder="İşlem veya not ara..." 
          variant="filled"
          className="rounded-2xl h-12 border-none bg-white shadow-sm"
          prefix={<SearchOutlined className="text-gray-400" />} 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          allowClear
        />

        {/* LIST */}
        {filteredGelirler.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <Empty description="Kayıt bulunamadı" />
          </div>
        ) : (
          <div className="space-y-3 transition-all">
            <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.IOS}>
              {filteredGelirler.map((gelir) => {
                const { icon, color } = getCategoryDetails(gelir.kategori);
                return (
                  <SwipeableListItem 
                    key={gelir._id} 
                    leadingActions={leadingActions(gelir)} 
                    trailingActions={trailingActions(gelir)}
                  >
                    <div className="flex items-center w-full p-4 mb-3 bg-white rounded-3xl shadow-sm border border-gray-50 active:scale-[0.98] transition-transform">
                      <div className={`p-3 rounded-2xl mr-4 ${color} flex items-center justify-center text-lg`}>
                        {icon}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center">
                          <Text strong className="text-xs uppercase tracking-wide text-gray-500">{gelir.kategori}</Text>
                          <Text className="text-base font-black text-emerald-600">+{gelir.miktar}€</Text>
                        </div>
                        <div className="flex justify-between items-end mt-1">
                          <div className="flex flex-col">
                            <Text className="text-[10px] text-gray-400 font-medium">
                                {dayjs(gelir.createdAt).format('DD MMMM, HH:mm')}
                            </Text>
                            {gelir.not && (
                                <Text className="text-[11px] text-gray-400 italic truncate max-w-[150px] mt-0.5">
                                    {gelir.not}
                                </Text>
                            )}
                          </div>
                          <div className="bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                             <Text className="text-[9px] text-gray-400 uppercase font-bold">İşlem</Text>
                          </div>
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
        title={<Title level={5} className="text-center m-0">Düzenle</Title>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSave}
        okText="Güncelle"
        centered
        closeIcon={null}
        width={320}
        okButtonProps={{ className: "bg-emerald-600 rounded-xl w-full h-10 shadow-none border-none" }}
        cancelButtonProps={{ className: "hidden" }}
      >
        <div className="space-y-4 pt-4">
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <Text strong className="text-[10px] text-gray-400 uppercase block mb-1">Tarih</Text>
            <CustomDayPicker value={formData.tarih} onChange={d => setFormData({...formData, tarih: d})} isIncome={true} />
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <Text strong className="text-[10px] text-gray-400 uppercase block mb-1">Tutar (€)</Text>
            <Input variant="borderless" type="number" inputMode="decimal" className="p-0 text-xl font-black text-emerald-600" value={formData.miktar} onChange={e => setFormData({...formData, miktar: e.target.value})} />
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <Text strong className="text-[10px] text-gray-400 uppercase block mb-1">Kategori</Text>
            <Select variant="borderless" className="w-full p-0 font-bold" value={formData.kategori} onChange={v => setFormData({...formData, kategori: v})}>
              {ALL_GELIR_CATEGORIES.map(cat => <Option key={cat} value={cat.toLowerCase()}>{cat}</Option>)}
            </Select>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <Text strong className="text-[10px] text-gray-400 uppercase block mb-1">Not</Text>
            <Input.TextArea variant="borderless" rows={2} className="p-0 text-sm" value={formData.not} onChange={e => setFormData({...formData, not: e.target.value})} placeholder="Açıklama..." />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Gelirler = () => (
    <ConfigProvider theme={{ token: { borderRadius: 16, colorPrimary: '#10b981' } }}>
        <div className="relative min-h-screen bg-gray-50">
            <main><GelirlerContent /></main>
            <BottomNav />
        </div>
    </ConfigProvider>
);

export default Gelirler;