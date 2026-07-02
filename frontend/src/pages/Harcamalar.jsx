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
  SearchOutlined,
  ClockCircleOutlined,
  DownOutlined,
  UpOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  WalletOutlined,
  BankOutlined,
  HomeOutlined,
  CreditCardOutlined
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
import { useTotalsContext } from "../context/TotalsContext";
import axios from "axios";
import dayjs from "dayjs";
import tr from "dayjs/locale/tr";

dayjs.locale(tr);

const { Text, Title } = Typography;
const { Option } = Select;

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";
const MESSAGE_KEY = "harcamaSilmeIslemi";

const ALL_CATEGORIES = [
  "Market", "Giyim", "Kira", "Fatura", "Eğitim", "Sağlık",
  "Ulaşım", "Eğlence", "EvEsyasi", "İletisim", "Hediye",
  "Restoran", "Aile", "Diğer",
];

const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", "Biomarkt", "Penny", "Diğer"];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep"];
const ULASIM_TURLERI = ["Benzin", "Motorin", "Bilet", "Tamir", "Diğer"];
const EV_ESYASI_TURLERI = ["Mobilya & Dekorasyon", "Elektronik", "Küçük Ev Aletleri", "Tamirat"];

const HARCAMA_KAYNAKLARI = ["Gelir", "Tasarruf"];
const BIRIKIM_HESAPLARI = ["Trade Republic", "Wise", "Nakit"];

const getCategoryDetails = (kategori) => {
  const normalizedKategori = kategori?.toLowerCase();
  switch (normalizedKategori) {
    case "market": case "restoran": case "aile":
      return { icon: <DollarCircleOutlined />, color: "bg-red-50 text-red-500" };
    case "kira": case "fatura":
      return { icon: <TagOutlined />, color: "bg-blue-50 text-blue-500" };
    case "ulaşım":
      return { icon: <CalendarOutlined />, color: "bg-emerald-50 text-emerald-500" };
    case "evesyasi":
      return { icon: <HomeOutlined />, color: "bg-cyan-50 text-cyan-500" };
    default:
      return { icon: <SolutionOutlined />, color: "bg-gray-50 text-gray-400" };
  }
};

const getSourceBadgeClass = (source) => {
  if (source === "Tasarruf") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
};

const HarcamalarContent = () => {
  const { harcamalar = [], refetch, isLoading } = useTotalsContext();
  const deleteTimerRef = useRef(null);
  const now = dayjs();

  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFuture, setShowFuture] = useState(false);
  const [sortByAmount, setSortByAmount] = useState("date");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingHarcama, setEditingHarcama] = useState(null);
  const [taksitModalVisible, setTaksitModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    miktar: "", kategori: "", altKategori: "", not: "", harcamaKaynagi: "Gelir", birikimHesabi: "", tarih: dayjs().toDate(),
  });

  const handleEditSave = async () => {
    if (!formData.miktar) return message.error("Miktar giriniz");
    if (formData.harcamaKaynagi === "Tasarruf" && !formData.birikimHesabi) {
      return message.error("Lütfen bir birikim hesabı seçin");
    }

    try {
      const payload = {
        ...formData,
        miktar: parseFloat(formData.miktar),
        birikimHesabi: formData.harcamaKaynagi === "Tasarruf" ? formData.birikimHesabi : "",
        createdAt: dayjs(formData.tarih).toISOString(),
      };
      await axios.put(`${API_URL}/harcama/${editingHarcama._id}`, payload);
      message.success("İşlem güncellendi");
      setEditModalVisible(false);
      refetch();
    } catch (err) {
      message.error("Güncelleme hatası");
    }
  };

  const definitiveDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/harcama/${id}`);
      refetch();
    } catch (err) {
      message.error("Silme işlemi sunucuda başarısız oldu");
    }
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

  const toggleSort = () => {
    setSortByAmount((prev) => {
      if (prev === "date") return "desc";
      if (prev === "desc") return "asc";
      return "date";
    });
  };

  const { normalHarcamalar, futureHarcamalar, tumGelecekTaksitler } = useMemo(() => {
    const filtered = harcamalar.filter((h) => {
      const categoryMatch = selectedCategory === "Tümü" || h.kategori === selectedCategory;
      const searchMatch = h.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.altKategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.harcamaKaynagi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.birikimHesabi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.not?.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });

    const normal = [];
    const future = [];
    const gelecekTaksitler = [];

    const endOfCurrentMonth = now.endOf('month');

    filtered.forEach(h => {
      const t = dayjs(h.createdAt);
      
      if (t.isAfter(now, 'minute')) {
        if (t.isAfter(endOfCurrentMonth) && h.not?.includes("Taksit")) {
          gelecekTaksitler.push(h);
        } else {
          future.push(h);
        }
      } else {
        if (searchTerm.trim().length > 0 || (t.month() === selectedMonth && t.year() === selectedYear)) {
          normal.push(h);
        }
      }
    });

    if (sortByAmount === "desc") {
      normal.sort((a, b) => Number(b.miktar || 0) - Number(a.miktar || 0));
    } else if (sortByAmount === "asc") {
      normal.sort((a, b) => Number(a.miktar || 0) - Number(b.miktar || 0));
    } else {
      normal.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
    }

    return {
      normalHarcamalar: normal,
      futureHarcamalar: future.sort((a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf()),
      tumGelecekTaksitler: gelecekTaksitler.sort((a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf())
    };
  }, [harcamalar, selectedMonth, selectedYear, selectedCategory, searchTerm, now, sortByAmount]);

  const kategoriToplam = useMemo(
    () => normalHarcamalar
      .filter(h => !h.harcamaKaynagi || h.harcamaKaynagi === "Gelir")
      .reduce((sum, h) => sum + Number(h.miktar || 0), 0),
    [normalHarcamalar]
  );

  const changeMonth = useCallback((direction) => {
    const current = dayjs().year(selectedYear).month(selectedMonth);
    const newDate = direction === "prev" ? current.subtract(1, "month") : current.add(1, "month");
    setSelectedMonth(newDate.month());
    setSelectedYear(newDate.year());
  }, [selectedMonth, selectedYear]);

  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format("MMMM YYYY");

  const openEditModal = (harcama) => {
    setEditingHarcama(harcama);
    setFormData({
      miktar: harcama.miktar,
      kategori: harcama.kategori,
      altKategori: harcama.altKategori || "",
      not: harcama.not || "",
      harcamaKaynagi: harcama.harcamaKaynagi || "Gelir",
      birikimHesabi: harcama.birikimHesabi || "",
      tarih: dayjs(harcama.createdAt).toDate(),
    });
    setEditModalVisible(true);
  };

  const leadingActions = (harcama) => (
    <LeadingActions><SwipeAction onClick={() => openEditModal(harcama)}><div className="bg-blue-500 text-white flex justify-center items-center h-full w-16 rounded-l-3xl"><EditOutlined className="text-lg" /></div></SwipeAction></LeadingActions>
  );

  const trailingActions = (harcama) => (
    <TrailingActions><SwipeAction destructive onClick={() => startDeleteProcess(harcama._id)}><div className="bg-red-500 text-white flex justify-center items-center h-full w-16 rounded-r-3xl"><DeleteOutlined className="text-lg" /></div></SwipeAction></TrailingActions>
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
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <Text className="text-[10px] font-bold uppercase text-gray-400">Dönem Toplamı</Text>
              <div className="flex items-center gap-2">
                <Text className="text-lg font-black text-red-500">
                  €{kategoriToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                {tumGelecekTaksitler.length > 0 && (
                  <Button 
                    type="primary" 
                    size="small" 
                    shape="circle"
                    icon={<CreditCardOutlined />} 
                    className="bg-orange-500 hover:bg-orange-400 border-none flex items-center justify-center text-xs animate-pulse"
                    onClick={() => setTaksitModalVisible(true)}
                  />
                )}
              </div>
            </div>

            <Button
              type={sortByAmount !== "date" ? "primary" : "default"}
              shape="circle"
              size="middle"
              onClick={toggleSort}
              className="flex items-center justify-center border-gray-200"
              icon={sortByAmount === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
            />

            <Select value={selectedCategory} onChange={setSelectedCategory} size="middle" variant="filled" className="w-40" style={{ borderRadius: '12px' }}>
              <Option value="Tümü">Tümü</Option>
              {ALL_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat === "EvEsyasi" ? "Ev Eşyası" : cat}</Option>)}
            </Select>
          </div>
          <div className="pt-2 border-t border-gray-50">
            <Input placeholder="Ara (Kategori, alt kategori veya kaynak)..." variant="filled" className="rounded-2xl h-10 border-none bg-gray-50" prefix={<SearchOutlined className="text-gray-400" />} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} allowClear />
          </div>
        </div>

        {futureHarcamalar.length > 0 && (
          <div className="bg-orange-50/50 rounded-3xl border border-orange-100 overflow-hidden transition-all">
            <div
              className="flex justify-between items-center p-4 cursor-pointer active:bg-orange-100/50"
              onClick={() => setShowFuture(!showFuture)}
            >
              <div className="flex items-center space-x-2">
                <ClockCircleOutlined className="text-orange-500" />
                <Text className="text-[11px] font-bold uppercase text-orange-600 tracking-wider">
                  Bekleyen İşlemler ({futureHarcamalar.length})
                </Text>
              </div>
              {showFuture ? <UpOutlined className="text-[10px] text-orange-400" /> : <DownOutlined className="text-[10px] text-orange-400" />}
            </div>

            {showFuture && (
              <div className="px-3 pb-3 space-y-2">
                <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.IOS}>
                  {futureHarcamalar.map((h) => {
                    const inlineKaynak = h.harcamaKaynagi === "Tasarruf" && h.birikimHesabi ? `Tasarruf (${h.birikimHesabi === "Ev" ? "Nakit" : h.birikimHesabi})` : (h.harcamaKaynagi || "Gelir");
                    return (
                      <SwipeableListItem key={h._id} leadingActions={leadingActions(h)} trailingActions={trailingActions(h)}>
                        <div className="bg-white/80 p-3 mb-2 rounded-2xl border border-orange-100 flex justify-between items-center w-full shadow-sm">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Text strong className="text-[9px] block text-orange-400 uppercase leading-none">{h.kategori === "EvEsyasi" ? "Ev Eşyası" : h.kategori}</Text>
                              <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase leading-none ${getSourceBadgeClass(h.harcamaKaynagi)}`}>
                                {inlineKaynak}
                              </span>
                            </div>
                            <Text className="text-[11px] font-bold block leading-none truncate max-w-[150px]">{h.altKategori || h.kategori}</Text>
                            <Text className="text-[9px] text-gray-400 block mt-1">{dayjs(h.createdAt).format('DD MMM, HH:mm')}</Text>
                          </div>
                          <Text className="text-sm font-black text-orange-500">-{h.miktar}€</Text>
                        </div>
                      </SwipeableListItem>
                    );
                  })}
                </SwipeableList>
              </div>
            )}
          </div>
        )}

        {normalHarcamalar.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm"><Empty description="Kayıt yok" /></div>
        ) : (
          <div className="space-y-3">
            <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.IOS}>
              {normalHarcamalar.map((h) => {
                const { icon, color } = getCategoryDetails(h.kategori);
                const isToday = dayjs(h.createdAt).isSame(now, 'day');
                const kaynakStr = h.harcamaKaynagi === "Tasarruf" && h.birikimHesabi ? `Tasarruf (${h.birikimHesabi === "Ev" ? "Nakit" : h.birikimHesabi})` : (h.harcamaKaynagi || "Gelir");
                return (
                  <SwipeableListItem key={h._id} leadingActions={leadingActions(h)} trailingActions={trailingActions(h)}>
                    <div className={`flex items-center w-full p-4 mb-3 rounded-3xl shadow-sm border active:scale-[0.98] transition-all ${isToday ? 'bg-blue-50/30 border-blue-100' : 'bg-white border-gray-50'}`}>
                      <div className={`p-3 rounded-2xl mr-4 ${color} flex items-center justify-center text-lg shadow-sm`}>{icon}</div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center min-w-0 gap-2">
                            <div className="flex flex-col min-w-0">
                              <Text strong className="text-xs uppercase tracking-wide truncate max-w-[120px] text-gray-500">
                                {h.kategori === "EvEsyasi" && !h.altKategori ? "Ev Eşyası" : (h.altKategori || h.kategori)}
                              </Text>
                              <div className="mt-0.5">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getSourceBadgeClass(h.harcamaKaynagi || "Gelir")}`}>
                                  {kaynakStr}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Text className="text-base font-black text-red-500">-{h.miktar}€</Text>
                        </div>
                        <div className="flex justify-between items-end mt-1">
                          <div className="flex flex-col">
                            <Text className="text-[10px] font-medium text-gray-400">{dayjs(h.createdAt).format('DD MMMM, HH:mm')}</Text>
                            {h.not && <Text className="text-[11px] text-gray-400 italic truncate max-w-[150px] mt-0.5">{h.not}</Text>}
                          </div>
                          {isToday && <div className="bg-blue-100 px-2 py-0.5 rounded-md"><Text className="text-[9px] text-blue-600 uppercase font-bold">Bugün</Text></div>}
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

      {/* GELECEK TAKSİTLER MODALİ (Mobilde Butonlu Stabil Tasarım) */}
      <Modal
        title={<div className="text-md font-bold text-orange-500 font-mono tracking-wider uppercase text-center flex items-center justify-center gap-2"><CreditCardOutlined /> Gelecek Dönem Taksitleri</div>}
        open={taksitModalVisible}
        onCancel={() => setTaksitModalVisible(false)}
        footer={null}
        centered
        width={380}
        styles={{ body: { padding: '12px 16px', maxHeight: '420px', overflowY: 'auto' } }}
      >
        <div className="space-y-3">
          {tumGelecekTaksitler.map((h) => {
            const inlineKaynak = h.harcamaKaynagi === "Tasarruf" && h.birikimHesabi ? `Tasarruf (${h.birikimHesabi === "Ev" ? "Nakit" : h.birikimHesabi})` : (h.harcamaKaynagi || "Gelir");
            return (
              <div key={h._id} className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex justify-between items-center w-full shadow-sm">
                <div className="min-w-0 flex-grow pr-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Text strong className="text-[9px] block text-gray-400 uppercase leading-none">{h.kategori === "EvEsyasi" ? "Ev Eşyası" : h.kategori}</Text>
                    <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase leading-none ${getSourceBadgeClass(h.harcamaKaynagi)}`}>
                      {inlineKaynak}
                    </span>
                  </div>
                  <Text className="text-[11px] font-bold block leading-none truncate max-w-[140px]">{h.altKategori || h.kategori}</Text>
                  {h.not && <Text className="text-[10px] text-orange-600 block mt-1 font-medium">{h.not}</Text>}
                  <Text className="text-[9px] text-gray-400 block mt-0.5">{dayjs(h.createdAt).format('DD MMMM YYYY')}</Text>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Text className="text-sm font-black text-red-500">-{h.miktar}€</Text>
                  <div className="flex flex-col gap-1">
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<EditOutlined className="text-blue-500 text-xs" />} 
                      onClick={() => { setTaksitModalVisible(false); openEditModal(h); }} 
                      className="hover:bg-blue-50 flex items-center justify-center h-6 w-6 rounded-lg"
                    />
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<DeleteOutlined className="text-red-500 text-xs" />} 
                      onClick={() => startDeleteProcess(h._id)} 
                      className="hover:bg-red-50 flex items-center justify-center h-6 w-6 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* DÜZENLEME MODALİ */}
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
            <Input variant="borderless" type="number" inputMode="decimal" className="p-0 text-3xl font-black text-red-500 text-center leading-tight" value={formData.miktar} suffix={<span className="text-red-300 text-lg">€</span>} onFocus={(e) => e.target.select()} onChange={e => setFormData({ ...formData, miktar: e.target.value })} />
          </div>

          <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
            <Text strong className="text-[9px] text-gray-400 uppercase block mb-1 ml-1 flex items-center gap-1">
              <WalletOutlined /> Harcama Yapılan Grup (Kasa)
            </Text>
            <Select variant="borderless" size="small" className="w-full font-bold text-xs" style={{ padding: 0 }} value={formData.harcamaKaynagi} onChange={v => setFormData({ ...formData, harcamaKaynagi: v, birikimHesabi: v === "Tasarruf" ? "Wise" : "" })}>
              {HARCAMA_KAYNAKLARI.map(src => <Option key={src} value={src}>{src}</Option>)}
            </Select>
          </div>

          {formData.harcamaKaynagi === "Tasarruf" && (
            <div className="bg-blue-50/50 p-2.5 rounded-2xl border border-blue-100 transition-all">
              <Text strong className="text-[9px] text-blue-500 uppercase block mb-1 ml-1 flex items-center gap-1">
                <BankOutlined /> Birikim Hesabı Seçimi
              </Text>
              <Select variant="borderless" size="small" className="w-full font-bold text-xs text-blue-600" style={{ padding: 0 }} value={formData.birikimHesabi} onChange={v => setFormData({ ...formData, birikimHesabi: v })}>
                {BIRIKIM_HESAPLARI.map(acc => <Option key={acc} value={acc}>{acc}</Option>)}
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 min-w-0">
              <Text strong className="text-[9px] text-gray-400 uppercase block mb-0.5 ml-1">Tarih</Text>
              <div className="flex items-center w-full overflow-hidden">
                <CustomDayPicker value={formData.tarih} onChange={d => setFormData({ ...formData, tarih: d })} />
              </div>
            </div>
            <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 min-w-0">
              <Text strong className="text-[9px] text-gray-400 uppercase block mb-0.5 ml-1">Kategori</Text>
              <Select variant="borderless" size="small" className="w-full font-bold text-xs" style={{ padding: 0 }} value={formData.kategori} onChange={v => setFormData({ ...formData, kategori: v, altKategori: "" })}>
                {ALL_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat === "EvEsyasi" ? "Ev Eşyası" : cat}</Option>)}
              </Select>
            </div>
          </div>

          {["Market", "Giyim", "Aile", "Ulaşım", "EvEsyasi"].includes(formData.kategori) && (
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <Text strong className="text-[10px] text-gray-400 uppercase block mb-1">Alt Seçim</Text>
              <Select variant="borderless" size="small" className="w-full p-0 font-bold" value={formData.altKategori} onChange={v => setFormData({ ...formData, altKategori: v })}>
                {(formData.kategori === "Market" ? MARKETLER :
                  formData.kategori === "Giyim" ? GIYIM_KISILERI :
                  formData.kategori === "Aile" ? AILE_UYELERI :
                  formData.kategori === "Ulaşım" ? ULASIM_TURLERI :
                  EV_ESYASI_TURLERI).map(sub => (
                    <Option key={sub} value={sub}>{sub}</Option>
                  ))}
              </Select>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <Input.TextArea variant="borderless" rows={2} className="p-0 text-sm" value={formData.not} onChange={e => setFormData({ ...formData, not: e.target.value })} placeholder="Not..." />
          </div>
          <Button type="primary" block onClick={handleEditSave} className="h-12 text-lg font-bold bg-blue-600 hover:bg-blue-500 border-none rounded-xl uppercase tracking-widest mt-2">Güncelle</Button>
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