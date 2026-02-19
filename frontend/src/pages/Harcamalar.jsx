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
      return { icon: <DollarCircleOutlined />, color: "bg-red-50 text-red-500" };
    case "kira": case "fatura":
      return { icon: <TagOutlined />, color: "bg-blue-50 text-blue-500" };
    case "ulaşım": case "petrol":
      return { icon: <CalendarOutlined />, color: "bg-emerald-50 text-emerald-500" };
    default:
      return { icon: <SolutionOutlined />, color: "bg-gray-50 text-gray-400" };
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
    message.success({ 
      content: (
        <span className="flex items-center space-x-2">
          <Text strong>🗑️ Silindi</Text>
          <Button type="link" size="small" onClick={() => { clearTimeout(deleteTimerRef.current); message.destroy(MESSAGE_KEY); }}>Geri Al</Button>
        </span>
      ), 
      key: MESSAGE_KEY, duration: 3 
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

  const leadingActions = (harcama) => (
    <LeadingActions><SwipeAction onClick={() => openEditModal(harcama)}><div className="bg-blue-500 text-white flex justify-center items-center h-full w-20 rounded-l-3xl"><EditOutlined className="text-xl" /></div></SwipeAction></LeadingActions>
  );

  const trailingActions = (harcama) => (
    <TrailingActions><SwipeAction destructive onClick={() => startDeleteProcess(harcama._id)}><div className="bg-red-500 text-white flex justify-center items-center h-full w-20 rounded-r-3xl"><DeleteOutlined className="text-xl" /></div></SwipeAction></TrailingActions>
  );

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-50"><Spin size="large" /></div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">
          <Button icon={<LeftOutlined />} onClick={() => changeMonth("prev")} type="text" />
          <div className="text-center">
            <Text className="block text-[10px] uppercase tracking-tighter text-gray-400 font-bold">Harcamalar</Text>
            <Title level={5} className="m-0 capitalize" style={{ margin: 0 }}>{displayMonth}</Title>
          </div>
          <Button icon={<RightOutlined />} onClick={() => changeMonth("next")} type="text" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* TOPLAM KARTI VE FİLTRELER */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <Text className="text-[10px] font-bold uppercase text-gray-400">Dönem Toplamı</Text>
              <Text className="text-lg font-black text-red-500">
                -{kategoriToplam.toFixed(2).replace('.', ',')}€
              </Text>
            </div>
            <Select 
              value={selectedCategory} 
              onChange={setSelectedCategory} 
              size="middle"
              variant="filled"
              className="w-40" 
              style={{ borderRadius: '12px' }}
              dropdownStyle={{ borderRadius: '12px' }}
            >
              <Option value="Tümü">Tümü</Option>
              {ALL_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
            </Select>
          </div>

          <div className="pt-2 border-t border-gray-50">
            <Input 
              placeholder="İşlem veya not ara..." 
              variant="filled"
              className="rounded-2xl h-10 border-none bg-gray-50"
              prefix={<SearchOutlined className="text-gray-400" />} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              allowClear
            />
          </div>
        </div>

        {/* LIST */}
        {filteredHarcamalar.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm"><Empty description="Kayıt yok" /></div>
        ) : (
          <div className="space-y-3">
            <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.IOS}>
              {filteredHarcamalar.map((h) => {
                const { icon, color } = getCategoryDetails(h.kategori);
                const isToday = dayjs(h.createdAt).isSame(now, 'day');
                
                return (
                  <SwipeableListItem key={h._id} leadingActions={leadingActions(h)} trailingActions={trailingActions(h)}>
                    <div className={`flex items-center w-full p-4 mb-3 rounded-3xl shadow-sm border active:scale-[0.98] transition-all ${isToday ? 'bg-orange-50/50 border-orange-100' : 'bg-white border-gray-50'}`}>
                      <div className={`p-3 rounded-2xl mr-4 ${color} flex items-center justify-center text-lg`}>{icon}</div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center">
                          <Text strong className={`text-xs uppercase tracking-wide truncate max-w-[120px] ${isToday ? 'text-orange-600' : 'text-gray-500'}`}>
                            {h.altKategori || h.kategori}
                          </Text>
                          <Text className="text-base font-black text-red-500">-{h.miktar}€</Text>
                        </div>
                        <div className="flex justify-between items-end mt-1">
                          <div className="flex flex-col">
                            <Text className={`text-[10px] font-medium ${isToday ? 'text-orange-400' : 'text-gray-400'}`}>
                                {isToday ? "Bugün, " : ""}{dayjs(h.createdAt).format('DD MMMM, HH:mm')}
                            </Text>
                            {h.not && <Text className="text-[11px] text-gray-400 italic truncate max-w-[150px] mt-0.5">{h.not}</Text>}
                          </div>
                          {isToday && <div className="bg-orange-100 px-2 py-0.5 rounded-md"><Text className="text-[9px] text-orange-600 uppercase font-bold">Yeni</Text></div>}
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
        title={<div className="text-lg font-bold text-blue-500 font-mono tracking-widest uppercase text-center">İşlemi Düzenle</div>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        centered
        width={380}
        styles={{ body: { padding: '12px 16px' } }}
        className="edit-modal"
      >
        <div className="space-y-4">
          <div className="bg-red-50/50 py-2 px-4 rounded-2xl text-center border border-red-100">
            <Text strong className="text-[10px] text-red-400 uppercase block mb-0">Miktar</Text>
            <Input 
              variant="borderless" 
              type="number" 
              inputMode="decimal"
              className="p-0 text-3xl font-black text-red-500 text-center leading-tight" 
              value={formData.miktar} 
              suffix={<span className="text-red-300 text-lg">€</span>}
              onFocus={(e) => e.target.select()}
              onChange={e => setFormData({...formData, miktar: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 min-w-0">
              <Text strong className="text-[9px] text-gray-400 uppercase block mb-0.5 ml-1">Tarih</Text>
              <div className="flex items-center w-full overflow-hidden">
                <CustomDayPicker 
                  value={formData.tarih} 
                  onChange={d => setFormData({...formData, tarih: d})}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 min-w-0">
              <Text strong className="text-[9px] text-gray-400 uppercase block mb-0.5 ml-1">Kategori</Text>
              <Select 
                variant="borderless" 
                size="small" 
                className="w-full font-bold text-xs" 
                style={{ padding: 0 }}
                value={formData.kategori} 
                onChange={v => setFormData({...formData, kategori: v, altKategori: ""})}
              >
                {ALL_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
              </Select>
            </div>
          </div>

          {["Market", "Giyim", "Aile"].includes(formData.kategori) && (
             <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <Text strong className="text-[10px] text-gray-400 uppercase block mb-1">Alt Seçim</Text>
                <Select variant="borderless" size="small" className="w-full p-0 font-bold" value={formData.altKategori} onChange={v => setFormData({...formData, altKategori: v})}>
                    {(formData.kategori === "Market" ? MARKETLER : formData.kategori === "Giyim" ? GIYIM_KISILERI : AILE_UYELERI).map(sub => (
                        <Option key={sub} value={sub}>{sub}</Option>
                    ))}
                </Select>
             </div>
          )}

          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <Text strong className="text-[10px] text-gray-400 uppercase block mb-1">Kaptan Notu</Text>
            <Input.TextArea variant="borderless" rows={2} className="p-0 text-sm" value={formData.not} onChange={e => setFormData({...formData, not: e.target.value})} placeholder="Not..." />
          </div>

          <Button 
            type="primary" 
            block 
            onClick={handleEditSave}
            loading={updateMutation.isPending}
            className="h-12 text-lg font-bold bg-blue-600 hover:bg-blue-500 border-none rounded-xl uppercase tracking-widest mt-2"
          >
            Güncelle
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const Harcamalar = () => (
    <ConfigProvider theme={{ token: { borderRadius: 16, colorPrimary: '#3b82f6' } }}>
        <div className="relative min-h-screen bg-gray-50">
            <main><HarcamalarContent /></main>
            <BottomNav />
        </div>
    </ConfigProvider>
);

export default Harcamalar;