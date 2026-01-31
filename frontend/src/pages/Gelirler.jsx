import React, { useState, useMemo, useCallback, useRef, memo } from "react"; 
import { Typography, Button, Modal, Input, Select, message, Card, Spin, Empty } from "antd";
import { 
  EditOutlined, DeleteOutlined, CalendarOutlined, SolutionOutlined, 
  LeftOutlined, RightOutlined, BankOutlined, SaveOutlined, EuroCircleOutlined,
  SearchOutlined, CloseOutlined
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
  if (cat === 'gelir') return { icon: <BankOutlined />, color: 'bg-green-100 text-green-600' };
  if (cat === 'tasarruf') return { icon: <SaveOutlined />, color: 'bg-blue-100 text-blue-600' };
  return { icon: <EuroCircleOutlined />, color: 'bg-gray-100 text-gray-600' };
};

// Alt bileşeni Memo ile sarmalayarak gereksiz renderları engelledik
const GelirRow = memo(({ gelir, onEdit, onDelete }) => {
  const { icon, color } = getCategoryDetails(gelir.kategori);
  
  const leadingActions = () => (
    <LeadingActions>
      <SwipeAction onClick={() => onEdit(gelir)}>
        <div className="bg-blue-500 text-white flex justify-center items-center h-full w-24">
          <EditOutlined className="text-2xl" />
        </div>
      </SwipeAction>
    </LeadingActions>
  );

  const trailingActions = () => (
    <TrailingActions>
      <SwipeAction destructive onClick={() => onDelete(gelir._id)}>
        <div className="bg-red-600 text-white flex justify-center items-center h-full w-24">
          <DeleteOutlined className="text-2xl" />
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  return (
    <SwipeableListItem leadingActions={leadingActions()} trailingActions={trailingActions()}>
      <div className="flex items-center w-full p-4 mb-2 bg-white rounded-2xl shadow-sm border-none mx-1">
        <div className={`p-3 rounded-xl mr-4 ${color}`}>{icon}</div>
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <Text strong className="text-sm uppercase tracking-tight text-gray-700">{gelir.kategori}</Text>
            <Text className="text-lg font-black text-green-600">+{gelir.miktar} €</Text>
          </div>
          <div className="flex justify-between mt-1">
            <Text className="text-[11px] text-gray-400">
               <CalendarOutlined className="mr-1" />
               {dayjs(gelir.createdAt).format('DD MMM, HH:mm')}
            </Text>
            {gelir.not && (
               <Text className="text-[11px] text-gray-500 italic truncate max-w-[120px]">
                   <SolutionOutlined className="mr-1" />
                   {gelir.not}
               </Text>
            )}
          </div>
        </div>
      </div>
    </SwipeableListItem>
  );
});

const GelirlerContent = () => {
  const { gelirler = [], refetch, isLoading: isContextLoading } = useTotalsContext();
  const deleteTimerRef = useRef(null); 

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingGelir, setEditingGelir] = useState(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
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

  // OPTİMİZASYON: Filtreleme, Arama ve İstatistikleri tek döngüde hallet
  const { filteredData, totals } = useMemo(() => {
    const stats = { gelir: 0, tasarruf: 0, diger: 0 };
    const isSearching = searchTerm.trim().length > 0;
    const lowerSearch = searchTerm.toLowerCase();

    const filtered = (gelirler || []).filter((g) => {
      const t = dayjs(g.createdAt);
      const searchMatch = !isSearching || 
                          g.kategori?.toLowerCase().includes(lowerSearch) || 
                          g.not?.toLowerCase().includes(lowerSearch);
      
      const monthMatch = isSearching ? true : (t.month() === selectedMonth && t.year() === selectedYear);
      
      const isMatch = monthMatch && searchMatch;

      if (isMatch) {
        const m = Number(g.miktar || 0);
        const cat = g.kategori?.toLowerCase();
        if (cat === 'gelir') stats.gelir += m;
        else if (cat === 'tasarruf') stats.tasarruf += m;
        else stats.diger += m;
      }
      return isMatch;
    }).sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());

    return { filteredData: filtered, totals: stats };
  }, [gelirler, selectedMonth, selectedYear, searchTerm]);

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

  const startDeleteProcess = useCallback((id) => {
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
      try {
        await axios.delete(`${API_URL}/gelir/${id}`);
        refetch();
      } catch (e) { message.error("Silme işlemi başarısız."); }
    }, 3000);
  }, [refetch]);

  if (isContextLoading) return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;

  return (
    <div className="max-w-4xl mx-auto min-h-screen">
      <div className="sticky top-0 z-30 bg-gray-50 pt-2 pb-4">
        <Card className="shadow-md border-none bg-green-600 rounded-2xl mx-1">
          <div className="flex justify-between items-center text-white mb-4">
            <Button icon={<LeftOutlined />} onClick={() => changeMonth("prev")} ghost shape="circle" />
            <div className="text-center">
              <Title level={4} className="m-0 text-white capitalize" style={{ color: 'white' }}>
                {dayjs().year(selectedYear).month(selectedMonth).format('MMMM YYYY')}
              </Title>
              <Text className="text-green-100 text-[10px] uppercase tracking-widest">Gelir Tablosu</Text>
            </div>
            <Button icon={<RightOutlined />} onClick={() => changeMonth("next")} disabled={dayjs().year(selectedYear).month(selectedMonth).isAfter(now, 'month')} ghost shape="circle" />
          </div>

          <div className="flex justify-between items-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-center flex-1">
              <Text className="block text-[9px] text-green-100 font-bold uppercase">Gelir</Text>
              <Text className="text-white font-black text-sm">{totals.gelir.toFixed(0)}€</Text>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center flex-1">
              <Text className="block text-[9px] text-green-100 font-bold uppercase">Tasarruf</Text>
              <Text className="text-white font-black text-sm">{totals.tasarruf.toFixed(0)}€</Text>
            </div>
            <div className="text-center flex-1 ml-2">
                 <Button 
                    icon={isSearchVisible ? <CloseOutlined /> : <SearchOutlined />} 
                    size="small" 
                    ghost 
                    onClick={() => setIsSearchVisible(!isSearchVisible)} 
                />
            </div>
          </div>
        </Card>
      </div>

      <div className="px-1">
        {isSearchVisible && (
            <div className="px-2 mb-4">
                <Input 
                    placeholder="Gelir veya not ara..." 
                    className="rounded-xl h-10 shadow-sm border-none"
                    prefix={<SearchOutlined className="text-gray-400" />} 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    allowClear
                />
            </div>
        )}

        {filteredData.length === 0 ? (
          <Empty description="Bu ay kayıt bulunamadı" className="mt-10" />
        ) : (
          <div className="space-y-3 pb-24">
            <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.IOS}>
              {filteredData.map((gelir) => (
                <GelirRow 
                  key={gelir._id} 
                  gelir={gelir} 
                  onEdit={openEditModal} 
                  onDelete={startDeleteProcess} 
                />
              ))}
            </SwipeableList>
          </div>
        )}
      </div>

      <Modal
        title={<Title level={4} className="text-center text-green-600 m-0">Kaydı Güncelle</Title>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSave}
        okText="Güncelle"
        centered
      >
        <div className="space-y-4 pt-4">
          <div>
            <Text strong className="text-[10px] text-gray-400 uppercase ml-1">İşlem Tarihi</Text>
            <CustomDayPicker value={formData.tarih} onChange={d => setFormData({...formData, tarih: d})} isIncome={true} />
          </div>
          <div>
            <Text strong className="text-[10px] text-gray-400 uppercase ml-1">Tutar (€)</Text>
            <Input size="large" type="number" inputMode="decimal" className="rounded-xl h-12 text-lg font-bold" value={formData.miktar} onChange={e => setFormData({...formData, miktar: e.target.value})} />
          </div>
          <div>
            <Text strong className="text-[10px] text-gray-400 uppercase ml-1">Kategori</Text>
            <Select size="large" className="w-full h-12 rounded-xl" value={formData.kategori} onChange={v => setFormData({...formData, kategori: v})}>
              {ALL_GELIR_CATEGORIES.map(cat => <Option key={cat} value={cat.toLowerCase()}>{cat}</Option>)}
            </Select>
          </div>
          <div>
            <Text strong className="text-[10px] text-gray-400 uppercase ml-1">Not</Text>
            <Input.TextArea rows={3} className="rounded-xl" value={formData.not} onChange={e => setFormData({...formData, not: e.target.value})} placeholder="Açıklama ekleyin..." />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Gelirler = () => (
  <div className="relative min-h-screen bg-gray-50">
    <main><GelirlerContent /></main>
    <BottomNav />
  </div>
);

export default Gelirler;