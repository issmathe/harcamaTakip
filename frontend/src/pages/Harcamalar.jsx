import React, { useState, useMemo, useCallback, useRef, memo } from "react";
import {
  Typography,
  Button,
  Modal,
  Input,
  Select,
  message,
  Card,
  Spin,
  Empty
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  TagOutlined,
  CalendarOutlined,
  SolutionOutlined,
  LeftOutlined,
  RightOutlined,
  UndoOutlined,
  SearchOutlined,
  CloseOutlined,
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

// --- VERİ LİSTELERİ ---
const ALL_CATEGORIES = [
  "Market", "Giyim", "Tasarruf", "Petrol", "Kira", "Fatura", "Eğitim",
  "Sağlık", "Ulaşım", "Eğlence", "Elektronik", "İletisim", "Hediye",
  "Restoran", "Aile", "Diğer",
];

const MARKETLER = [
  "Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk",
  "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann",
  "Edeka", "Biomarkt", "Penny", "Diğer",
];

const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep"]; 

const getCategoryDetails = (kategori) => {
  const normalizedKategori = kategori?.toString().toLowerCase();
  switch (normalizedKategori) {
    case "tasarruf": case "market": case "restoran": case "restoran / kafe": case "aile": 
      return { icon: <DollarCircleOutlined />, color: "bg-red-100 text-red-600" };
    case "kira": case "fatura":
      return { icon: <TagOutlined />, color: "bg-blue-100 text-blue-600" };
    case "ulaşım": case "petrol":
      return { icon: <CalendarOutlined />, color: "bg-green-100 text-green-600" };
    default:
      return { icon: <SolutionOutlined />, color: "bg-gray-100 text-gray-600" };
  }
};

// --- OPTİMİZE SATIR BİLEŞENİ ---
const HarcamaRow = memo(({ harcama, onEdit, onDelete, isToday }) => {
  const { icon, color } = getCategoryDetails(harcama.kategori);

  const leading = () => (
    <LeadingActions>
      <SwipeAction onClick={() => onEdit(harcama)}>
        <div className="bg-blue-500 text-white flex justify-center items-center h-full w-24">
          <EditOutlined className="text-2xl" />
        </div>
      </SwipeAction>
    </LeadingActions>
  );

  const trailing = () => (
    <TrailingActions>
      <SwipeAction destructive onClick={() => onDelete(harcama._id)}>
        <div className="bg-red-600 text-white flex justify-center items-center h-full w-24">
          <DeleteOutlined className="text-2xl" />
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  return (
    <SwipeableListItem leadingActions={leading()} trailingActions={trailing()}>
      <div className={`flex items-center w-full p-4 mb-2 rounded-xl transition-all shadow-sm ${isToday ? "bg-white border-l-4 border-yellow-400" : "bg-white border-b border-gray-100"}`}>
        <div className={`p-3 rounded-2xl mr-4 ${color} shadow-sm`}>{icon}</div>
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <Text strong className="text-base text-gray-800 leading-none">{harcama.altKategori || harcama.kategori}</Text>
              <Text type="secondary" className="text-[10px] mt-1 uppercase">{harcama.altKategori ? harcama.kategori : "Genel"}</Text>
            </div>
            <Text className="text-lg font-bold text-gray-900">-{harcama.miktar} €</Text>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-gray-400">{dayjs(harcama.createdAt).format("DD MMM, HH:mm")}</span>
            {harcama.not && <span className="text-[11px] text-blue-500 italic max-w-[150px] truncate">"{harcama.not}"</span>}
          </div>
        </div>
      </div>
    </SwipeableListItem>
  );
});

const HarcamalarContent = () => {
  const queryClient = useQueryClient();
  const deleteTimerRef = useRef(null);
  const now = dayjs();

  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());
  const [selectedCategory, setSelectedCategory] = useState("Kategoriler");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingHarcama, setEditingHarcama] = useState(null);

  const [formData, setFormData] = useState({ miktar: "", kategori: "", altKategori: "", not: "", tarih: dayjs().toDate() });

  const { data: harcamalar = [], isLoading } = useQuery({
    queryKey: ["harcamalar"],
    queryFn: async () => (await axios.get(`${API_URL}/harcama`)).data,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => axios.put(`${API_URL}/harcama/${payload._id}`, payload),
    onSuccess: () => {
      message.success("✨ İşlem güncellendi!");
      queryClient.invalidateQueries(["harcamalar", "totals"]);
      setEditModalVisible(false);
    },
  });

  // TEK DÖNGÜDE FİLTRELEME VE TOPLAM (Performansın kalbi)
  const { filteredList, totalAmount } = useMemo(() => {
    let total = 0;
    const isSearching = searchTerm.trim().length > 0;
    const lowSearch = searchTerm.toLowerCase();

    const list = harcamalar.filter((h) => {
      const t = dayjs(h.createdAt);
      const catMatch = selectedCategory === "Tümü" || selectedCategory === "Kategoriler" || h.kategori === selectedCategory;
      const seaMatch = !isSearching || h.kategori?.toLowerCase().includes(lowSearch) || h.altKategori?.toLowerCase().includes(lowSearch) || h.not?.toLowerCase().includes(lowSearch);
      const monMatch = isSearching ? true : (t.month() === selectedMonth && t.year() === selectedYear);

      const isMatch = catMatch && seaMatch && monMatch;
      if (isMatch) total += Number(h.miktar || 0);
      return isMatch;
    }).sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());

    return { filteredList: list, totalAmount: total };
  }, [harcamalar, selectedMonth, selectedYear, selectedCategory, searchTerm]);

  const changeMonth = useCallback((dir) => {
    const current = dayjs().year(selectedYear).month(selectedMonth);
    const next = dir === "prev" ? current.subtract(1, "month") : current.add(1, "month");
    setSelectedMonth(next.month());
    setSelectedYear(next.year());
  }, [selectedMonth, selectedYear]);

  const openEditModal = useCallback((h) => {
    const reqSub = ["Market", "Giyim", "Aile"].includes(h.kategori);
    setEditingHarcama(h);
    setFormData({ miktar: h.miktar, kategori: h.kategori, altKategori: reqSub ? h.altKategori || "" : "", not: h.not || "", tarih: dayjs(h.createdAt).toDate() });
    setEditModalVisible(true);
  }, []);

  const startDeleteProcess = useCallback((id) => {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    message.success({
      content: (
        <span className="flex items-center space-x-3">
          <Text strong>🗑️ Kayıt siliniyor...</Text>
          <Button type="link" icon={<UndoOutlined />} size="small" onClick={() => { clearTimeout(deleteTimerRef.current); message.destroy(MESSAGE_KEY); }}>Geri Al</Button>
        </span>
      ),
      key: MESSAGE_KEY,
      duration: 3
    });
    deleteTimerRef.current = setTimeout(async () => {
      await axios.delete(`${API_URL}/harcama/${id}`);
      queryClient.invalidateQueries(["harcamalar", "totals"]);
    }, 3000);
  }, [queryClient]);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <div className="sticky top-0 z-20 bg-gray-50 pb-2">
        <Card className="shadow-md rounded-xl" styles={{ body: { padding: "12px" } }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Button type="text" icon={<LeftOutlined />} onClick={() => changeMonth("prev")} size="small" />
              <Title level={5} className="m-0 min-w-[100px] text-center text-blue-700 text-sm">
                {dayjs().year(selectedYear).month(selectedMonth).format("MMMM YYYY")}
              </Title>
              <Button type="text" icon={<RightOutlined />} onClick={() => changeMonth("next")} size="small" />
            </div>
            <div className="flex items-center space-x-2">
              <Button icon={isSearchVisible ? <CloseOutlined /> : <SearchOutlined />} shape="circle" size="small" onClick={() => setIsSearchVisible(!isSearchVisible)} danger={isSearchVisible} />
              <Select value={selectedCategory} onChange={setSelectedCategory} variant="filled" size="small" className="w-28">
                <Option value="Tümü">Hepsi</Option>
                {ALL_CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}
              </Select>
            </div>
          </div>
          {isSearchVisible && <Input className="mt-3" placeholder="Ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} allowClear autoFocus />}
          <div className="flex items-center justify-between mt-3 px-2 pt-2 border-t border-dashed">
            <Text type="secondary" className="text-[10px] uppercase font-bold">Toplam Harcama</Text>
            <Text className="text-lg font-black text-red-600">-{totalAmount.toFixed(2)} €</Text>
          </div>
        </Card>
      </div>

      <div className="mt-4 pb-24">
        {filteredList.length === 0 ? <Empty className="mt-10" description="Kayıt yok" /> : (
          <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.IOS}>
            {filteredList.map(h => (
              <HarcamaRow key={h._id} harcama={h} onEdit={openEditModal} onDelete={startDeleteProcess} isToday={dayjs(h.createdAt).isSame(now, "day")} />
            ))}
          </SwipeableList>
        )}
      </div>

      <Modal title="Düzenle" open={editModalVisible} onCancel={() => setEditModalVisible(false)} onOk={() => {
        if (!formData.miktar) return message.error("Miktar girin!");
        updateMutation.mutate({ ...formData, _id: editingHarcama._id, miktar: parseFloat(formData.miktar), createdAt: dayjs(formData.tarih).toISOString() });
      }} centered destroyOnClose>
        <div className="space-y-4 pt-2">
          <CustomDayPicker value={formData.tarih} onChange={d => setFormData({...formData, tarih: d})} isIncome={false} />
          <Input size="large" type="number" value={formData.miktar} onChange={e => setFormData({...formData, miktar: e.target.value})} prefix="€" />
          <Select size="large" className="w-full" value={formData.kategori} onChange={v => setFormData({...formData, kategori: v, altKategori: ""})}>
            {ALL_CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}
          </Select>
          {["Market", "Giyim", "Aile"].includes(formData.kategori) && (
            <Select size="large" className="w-full" value={formData.altKategori} onChange={v => setFormData({...formData, altKategori: v})}>
              {(formData.kategori === "Market" ? MARKETLER : formData.kategori === "Giyim" ? GIYIM_KISILERI : AILE_UYELERI).map(i => <Option key={i} value={i}>{i}</Option>)}
            </Select>
          )}
          <Input.TextArea rows={2} value={formData.not} onChange={e => setFormData({...formData, not: e.target.value})} placeholder="Not..." />
        </div>
      </Modal>
    </div>
  );
};

const Harcamalar = () => (
  <div className="relative min-h-screen bg-gray-50">
    <main><HarcamalarContent /></main>
    <BottomNav />
  </div>
);

export default Harcamalar;