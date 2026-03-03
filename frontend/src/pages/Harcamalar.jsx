import React, { useState, useMemo, useCallback, useRef } from "react";
import { Typography, Button, Modal, Input, Select, message, Spin, Empty, ConfigProvider, Badge } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  TagOutlined,
  CalendarOutlined,
  SolutionOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
  ClockCircleOutlined
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
import { useTotalsContext } from "../context/TotalsContext"; // Context'i içeri aldık
import axios from "axios";
import dayjs from "dayjs";
import tr from "dayjs/locale/tr";

dayjs.locale(tr);

const { Text, Title } = Typography;
const { Option } = Select;

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api"; 
const MESSAGE_KEY = "harcamaSilmeIslemi";

const ALL_CATEGORIES = [
  "Market", "Giyim", "Tasarruf", "Kira", "Fatura", "Eğitim",
  "Sağlık", "Ulaşım", "Eğlence", "Elektronik", "İletisim", "Hediye",
  "Restoran", "Aile", "Diğer",
];

const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", "Biomarkt", "Penny", "Diğer"];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep"]; 
const ULASIM_TURLERI = ["Benzin", "Motorin", "Bilet", "Tamir", "Diğer"];

const getCategoryDetails = (kategori) => {
  const normalizedKategori = kategori?.toLowerCase();
  switch (normalizedKategori) {
    case "tasarruf": case "market": case "restoran": case "aile": 
      return { icon: <DollarCircleOutlined />, color: "bg-red-50 text-red-500" };
    case "kira": case "fatura":
      return { icon: <TagOutlined />, color: "bg-blue-50 text-blue-500" };
    case "ulaşım":
      return { icon: <CalendarOutlined />, color: "bg-emerald-50 text-emerald-500" };
    default:
      return { icon: <SolutionOutlined />, color: "bg-gray-50 text-gray-400" };
  }
};

const HarcamalarContent = () => {
  // Veriyi artık useQuery ile değil, Context'ten alıyoruz. Hızın kaynağı burası.
  const { harcamalar = [], refetch, isLoading } = useTotalsContext();
  const deleteTimerRef = useRef(null);
  const now = dayjs();

  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [searchTerm, setSearchTerm] = useState("");
  const [futureModalVisible, setFutureModalVisible] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingHarcama, setEditingHarcama] = useState(null);

  const [formData, setFormData] = useState({
    miktar: "", kategori: "", altKategori: "", not: "", tarih: dayjs().toDate(),
  });

  const handleEditSave = async () => {
    if (!formData.miktar) return message.error("Miktar giriniz");
    try {
      const payload = {
        ...formData,
        miktar: parseFloat(formData.miktar),
        createdAt: dayjs(formData.tarih).toISOString(),
      };
      await axios.put(`${API_URL}/harcama/${editingHarcama._id}`, payload);
      message.success("İşlem güncellendi");
      setEditModalVisible(false);
      refetch(); // Tüm uygulamadaki veriyi tazele
    } catch (err) {
      message.error("Güncelleme hatası");
    }
  };

  const definitiveDelete = async (id) => {
    await axios.delete(`${API_URL}/harcama/${id}`);
    refetch(); // Silme sonrası context'i tazele
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

  const { normalHarcamalar, futureHarcamalar } = useMemo(() => {
    const filtered = harcamalar.filter((h) => {
      const categoryMatch = selectedCategory === "Tümü" || h.kategori === selectedCategory;
      const searchMatch = h.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         h.altKategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         h.not?.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });

    const normal = [];
    const future = [];

    filtered.forEach(h => {
      const t = dayjs(h.createdAt);
      if (t.isAfter(now, 'minute')) {
        future.push(h);
      } else {
        const isSearching = searchTerm.trim().length > 0;
        if (isSearching || (t.month() === selectedMonth && t.year() === selectedYear)) {
          normal.push(h);
        }
      }
    });

    return {
      normalHarcamalar: normal.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()),
      futureHarcamalar: future.sort((a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf())
    };
  }, [harcamalar, selectedMonth, selectedYear, selectedCategory, searchTerm, now]);

  const kategoriToplam = useMemo(
    () => normalHarcamalar
      .filter(h => h.kategori?.toLowerCase() !== "tasarruf") 
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0),
    [normalHarcamalar]
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
    setFutureModalVisible(false);
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
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-3 relative overflow-hidden">
          {futureHarcamalar.length > 0 && (
            <div className="absolute top-2 right-2">
              <Badge count={futureHarcamalar.length} size="small" offset={[-2, 2]}>
                <Button 
                  shape="circle" 
                  icon={<ClockCircleOutlined className="text-orange-500" />} 
                  size="small"
                  className="bg-orange-50 border-orange-100"
                  onClick={() => setFutureModalVisible(true)}
                />
              </Badge>
            </div>
          )}

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
              className="w-32" 
              style={{ borderRadius: '12px' }}
            >
              <Option value="Tümü">Tümü</Option>
              {ALL_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
            </Select>
          </div>

          <div className="pt-2 border-t border-gray-50">
            <Input 
              placeholder="Ara..." 
              variant="filled"
              className="rounded-2xl h-10 border-none bg-gray-50"
              prefix={<SearchOutlined className="text-gray-400" />} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              allowClear
            />
          </div>
        </div>

        {normalHarcamalar.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm"><Empty description="Bu ay kayıt yok" /></div>
        ) : (
          <div className="space-y-3">
            <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.IOS}>
              {normalHarcamalar.map((h) => {
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
        title={<div className="text-sm font-bold text-orange-500 uppercase flex items-center justify-center gap-2"><ClockCircleOutlined /> Bekleyen İşlemler</div>}
        open={futureModalVisible}
        onCancel={() => setFutureModalVisible(false)}
        footer={null}
        centered
        width={340}
        styles={{ body: { padding: '12px', maxHeight: '60vh', overflowY: 'auto' } }}
      >
        {futureHarcamalar.length > 0 ? (
          <div className="space-y-2">
            {futureHarcamalar.map(h => (
              <div key={h._id} onClick={() => openEditModal(h)} className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex justify-between items-center active:bg-gray-100 transition-colors">
                <div>
                  <Text strong className="text-[10px] block text-gray-400 uppercase leading-none mb-1">{h.kategori}</Text>
                  <Text className="text-xs font-bold block leading-none">{dayjs(h.createdAt).format('DD MMM, ddd HH:mm')}</Text>
                  {h.not && <Text className="text-[10px] text-gray-400 italic block mt-1">{h.not}</Text>}
                </div>
                <div className="text-right">
                  <Text className="text-sm font-black text-orange-500">-{h.miktar}€</Text>
                </div>
              </div>
            ))}
          </div>
        ) : <Empty description="Gelecek tarihli işlem yok" />}
      </Modal>

      <Modal
        title={<div className="text-lg font-bold text-blue-500 font-mono tracking-widest uppercase text-center">İşlemi Düzenle</div>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        centered
        width={380}
        styles={{ body: { padding: '12px 16px' } }}
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

          {["Market", "Giyim", "Aile", "Ulaşım"].includes(formData.kategori) && (
             <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <Text strong className="text-[10px] text-gray-400 uppercase block mb-1">Alt Seçim</Text>
                <Select variant="borderless" size="small" className="w-full p-0 font-bold" value={formData.altKategori} onChange={v => setFormData({...formData, altKategori: v})}>
                    {(formData.kategori === "Market" ? MARKETLER : 
                      formData.kategori === "Giyim" ? GIYIM_KISILERI : 
                      formData.kategori === "Aile" ? AILE_UYELERI : 
                      ULASIM_TURLERI).map(sub => (
                        <Option key={sub} value={sub}>{sub}</Option>
                    ))}
                </Select>
             </div>
          )}

          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <Input.TextArea variant="borderless" rows={2} className="p-0 text-sm" value={formData.not} onChange={e => setFormData({...formData, not: e.target.value})} placeholder="Not..." />
          </div>

          <Button 
            type="primary" 
            block 
            onClick={handleEditSave}
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