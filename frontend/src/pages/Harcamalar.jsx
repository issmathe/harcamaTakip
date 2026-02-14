import React, { useState, useMemo, useCallback, useRef } from "react";
import { Typography, Button, Modal, Input, Select, message, Spin, Empty, ConfigProvider } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  TagOutlined,
  CalendarOutlined,
  SolutionOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined
} from "@ant-design/icons";

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

import BottomNav from "../components/Home/BottomNav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import tr from "dayjs/locale/tr";

dayjs.locale(tr);

const { Text, Title } = Typography;
const { Option } = Select;

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api"; 
const MESSAGE_KEY = "harcamaSilmeIslemi";

const ALL_CATEGORIES = [
  "Market", "Giyim", "Tasarruf", "Petrol", "Kira", "Fatura", "Eğitim",
  "Sağlık", "Ulaşım", "Eğlence", "Elektronik", "İletisim", "Hediye",
  "Restoran", "Aile", "Diğer",
];

const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", "Biomarkt", "Penny", "Diğer"];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep"]; 

const getCategoryDetails = (kategori) => {
  const normalizedKategori = kategori?.toLowerCase();
  switch (normalizedKategori) {
    case "tasarruf": case "market": case "restoran": case "aile": 
      return { icon: <DollarCircleOutlined />, color: "bg-red-500/10 text-red-400" };
    case "kira": case "fatura":
      return { icon: <TagOutlined />, color: "bg-blue-500/10 text-blue-400" };
    case "ulaşım": case "petrol":
      return { icon: <CalendarOutlined />, color: "bg-emerald-500/10 text-emerald-400" };
    default:
      return { icon: <SolutionOutlined />, color: "bg-gray-500/10 text-gray-400" };
  }
};

const HarcamalarContent = () => {
  const queryClient = useQueryClient();
  const deleteTimerRef = useRef(null);
  const now = dayjs();

  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingHarcama, setEditingHarcama] = useState(null);

  const [formData, setFormData] = useState({
    miktar: "", kategori: "", altKategori: "", not: "", tarih: dayjs().toDate(),
  });

  const { data: harcamalar = [], isLoading } = useQuery({
    queryKey: ["harcamalar"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/harcama`);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => axios.put(`${API_URL}/harcama/${payload._id}`, payload),
    onSuccess: () => {
      message.success("İşlem güncellendi");
      queryClient.invalidateQueries(["harcamalar"]);
      queryClient.invalidateQueries(["totals"]);
      setEditModalVisible(false);
    },
  });

  const definitiveDelete = async (id) => {
    await axios.delete(`${API_URL}/harcama/${id}`);
    queryClient.invalidateQueries(["harcamalar"]);
    queryClient.invalidateQueries(["totals"]);
  };

  const startDeleteProcess = (id) => {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    message.open({ 
      key: MESSAGE_KEY,
      content: (
        <div className="flex items-center gap-4">
          <span className="text-white font-bold">🗑️ Harcama silindi</span>
          <Button type="link" size="small" className="text-blue-400 p-0" onClick={() => { 
              clearTimeout(deleteTimerRef.current); 
              message.destroy(MESSAGE_KEY); 
            }}>GERİ AL</Button>
        </div>
      ), 
      style: { marginTop: '10vh' },
      duration: 3 
    });
    deleteTimerRef.current = setTimeout(() => { definitiveDelete(id); }, 3000);
  };

  const filteredHarcamalar = useMemo(() => {
    return harcamalar
      .filter((h) => {
        const t = dayjs(h.createdAt);
        const isSearching = searchTerm.trim().length > 0;
        const monthMatch = isSearching ? true : (t.month() === selectedMonth && t.year() === selectedYear);
        const categoryMatch = selectedCategory === "Tümü" || h.kategori === selectedCategory;
        const searchMatch = h.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           h.altKategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           h.not?.toLowerCase().includes(searchTerm.toLowerCase());
        return monthMatch && categoryMatch && searchMatch;
      })
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [harcamalar, selectedMonth, selectedYear, selectedCategory, searchTerm]);

  const kategoriToplam = useMemo(
    () => filteredHarcamalar
      .filter(h => h.kategori?.toLowerCase() !== "tasarruf")
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0),
    [filteredHarcamalar]
  );

  const changeMonth = useCallback((direction) => {
      const current = dayjs().year(selectedYear).month(selectedMonth);
      const newDate = direction === "prev" ? current.subtract(1, "month") : current.add(1, "month");
      setSelectedMonth(newDate.month());
      setSelectedYear(newDate.year());
    }, [selectedMonth, selectedYear]
  );

  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format("MMMM YYYY");

  const openEditModal = (harcama) => {
    setEditingHarcama(harcama);
    setFormData({
      miktar: harcama.miktar,
      kategori: harcama.kategori,
      altKategori: harcama.altKategori || "",
      not: harcama.not || "",
      tarih: dayjs(harcama.createdAt).toDate(),
    });
    setEditModalVisible(true);
  };

  const handleEditSave = () => {
    if (!formData.miktar) return message.error("Miktar giriniz");
    updateMutation.mutate({
      ...formData,
      _id: editingHarcama._id,
      miktar: parseFloat(formData.miktar),
      createdAt: dayjs(formData.tarih).toISOString(),
    });
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-[#020617]"><Spin size="large" /></div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#020617] pb-32">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="flex justify-between items-center">
          <Button icon={<LeftOutlined className="text-white" />} onClick={() => changeMonth("prev")} type="text" className="hover:bg-white/5" />
          <div className="text-center">
            <Text className="block text-[9px] uppercase tracking-[0.2em] text-blue-400 font-black">Harcama Kayıtları</Text>
            <Title level={4} className="!text-white !m-0 italic font-black tracking-tighter uppercase">{displayMonth}</Title>
          </div>
          <Button icon={<RightOutlined className="text-white" />} onClick={() => changeMonth("next")} type="text" className="hover:bg-white/5" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* TOPLAM KARTI (GLASS) */}
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-[28px] border border-white/10 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-col">
              <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500">Dönem Toplamı</Text>
              <Text className="text-2xl font-black italic text-red-500">
                -€{kategoriToplam.toLocaleString('tr-TR')}
              </Text>
            </div>
            <div className="flex gap-2">
              <Button 
                icon={<SearchOutlined />} 
                className={`rounded-xl border-none h-10 w-10 flex items-center justify-center transition-all ${isSearchVisible ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'}`}
                onClick={() => setIsSearchVisible(!isSearchVisible)}
              />
              <Select 
                value={selectedCategory} 
                onChange={setSelectedCategory} 
                className="w-24 h-10 category-select-dark"
                variant="filled"
              >
                <Option value="Tümü">Tümü</Option>
                {ALL_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
              </Select>
            </div>
          </div>

          {isSearchVisible && (
            <Input 
              placeholder="Filtrele..." 
              variant="filled"
              className="rounded-xl h-10 border-none bg-white/5 text-white placeholder:text-gray-600"
              prefix={<SearchOutlined className="text-gray-500" />} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              allowClear
              autoFocus
            />
          )}
        </div>

        {/* LIST */}
        {filteredHarcamalar.length === 0 ? (
          <div className="bg-white/5 rounded-[32px] p-12 text-center border border-white/5">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-gray-500">Kayıt bulunamadı</span>} />
          </div>
        ) : (
          <div className="space-y-1">
            <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.IOS}>
              {filteredHarcamalar.map((h) => {
                const { icon, color } = getCategoryDetails(h.kategori);
                const isToday = dayjs(h.createdAt).isSame(now, 'day');
                
                return (
                  <SwipeableListItem 
                    key={h._id} 
                    leadingActions={<LeadingActions><SwipeAction onClick={() => openEditModal(h)}><div className="bg-blue-600 text-white flex justify-center items-center h-[76px] w-20 rounded-l-[24px] mb-3"><EditOutlined className="text-xl" /></div></SwipeAction></LeadingActions>} 
                    trailingActions={<TrailingActions><SwipeAction destructive onClick={() => startDeleteProcess(h._id)}><div className="bg-red-600 text-white flex justify-center items-center h-[76px] w-20 rounded-r-[24px] mb-3"><DeleteOutlined className="text-xl" /></div></SwipeAction></TrailingActions>}
                  >
                    <div className={`flex items-center w-full p-4 mb-3 rounded-[24px] border active:scale-[0.98] transition-all ${isToday ? 'bg-orange-500/10 border-orange-500/20' : 'bg-white/5 border-white/5'}`}>
                      <div className={`w-12 h-12 rounded-2xl mr-4 ${color} flex items-center justify-center text-xl`}>{icon}</div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center">
                          <Text className={`text-[10px] uppercase font-black tracking-widest truncate max-w-[120px] ${isToday ? 'text-orange-400' : 'text-gray-500'}`}>
                            {h.altKategori || h.kategori}
                          </Text>
                          <Text className="text-lg font-black italic text-red-500">-€{h.miktar}</Text>
                        </div>
                        <div className="flex justify-between items-end">
                            <Text className={`text-[10px] font-bold uppercase tracking-tighter ${isToday ? 'text-orange-300' : 'text-gray-500'}`}>
                                {isToday ? "Bugün, " : ""}{dayjs(h.createdAt).format('DD MMMM')}
                            </Text>
                            {h.not && <Text className="text-[11px] text-gray-400 italic truncate max-w-[140px]">{h.not}</Text>}
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
        title={<div className="text-center text-blue-400 font-black uppercase tracking-widest text-sm">İşlemi Revize Et</div>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        centered
        width={360}
        className="space-modal"
        styles={{ body: { padding: '20px' } }}
      >
        <div className="space-y-4">
          <div className="bg-red-500/5 p-4 rounded-2xl text-center border border-red-500/10">
             <Text className="text-[9px] text-red-400/60 uppercase font-black block mb-1">Harcama Tutarı</Text>
             <Input 
                variant="borderless" 
                type="number" 
                className="p-0 text-3xl font-black text-red-500 text-center" 
                value={formData.miktar} 
                suffix={<span className="text-red-900/40 text-lg">€</span>}
                onChange={e => setFormData({...formData, miktar: e.target.value})} 
             />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <Text className="text-[9px] text-gray-500 uppercase font-black block mb-1">Tarih</Text>
                <CustomDayPicker value={formData.tarih} onChange={d => setFormData({...formData, tarih: d})} />
             </div>
             <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <Text className="text-[9px] text-gray-500 uppercase font-black block mb-1">Kategori</Text>
                <Select variant="borderless" size="small" className="w-full p-0 font-bold text-white" value={formData.kategori} onChange={v => setFormData({...formData, kategori: v, altKategori: ""})}>
                  {ALL_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
                </Select>
             </div>
          </div>

          {["Market", "Giyim", "Aile"].includes(formData.kategori) && (
             <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <Text className="text-[9px] text-gray-500 uppercase font-black block mb-1">Alt Kategori</Text>
                <Select variant="borderless" size="small" className="w-full p-0 font-bold text-white" value={formData.altKategori} onChange={v => setFormData({...formData, altKategori: v})}>
                    {(formData.kategori === "Market" ? MARKETLER : formData.kategori === "Giyim" ? GIYIM_KISILERI : AILE_UYELERI).map(sub => (
                        <Option key={sub} value={sub}>{sub}</Option>
                    ))}
                </Select>
             </div>
          )}

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <Text className="text-[9px] text-gray-500 uppercase font-black block mb-1">Not</Text>
            <Input.TextArea variant="borderless" rows={2} className="p-0 text-sm text-gray-300" value={formData.not} onChange={e => setFormData({...formData, not: e.target.value})} placeholder="..." />
          </div>

          <Button 
            type="primary" 
            block 
            onClick={handleEditSave}
            loading={updateMutation.isPending}
            className="h-12 text-md font-black bg-blue-600 hover:bg-blue-500 border-none rounded-xl uppercase tracking-[0.2em] mt-2 shadow-lg shadow-blue-900/20"
          >
            Güncelle
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const Harcamalar = () => (
    <ConfigProvider theme={{ 
        token: { borderRadius: 16, colorPrimary: '#3b82f6', colorBgBase: '#020617', colorText: '#f8fafc' },
        components: {
            Modal: { contentBg: '#0f172a', headerBg: '#0f172a' },
            Select: { selectorBg: 'transparent' }
        }
    }}>
        <div className="relative min-h-screen bg-[#020617]">
            <main><HarcamalarContent /></main>
            <BottomNav />
        </div>
    </ConfigProvider>
);

export default Harcamalar;