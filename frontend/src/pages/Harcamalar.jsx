// pages/Harcamalar.jsx
import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  Typography,
  Button,
  Modal,
  Input,
  Select,
  message,
  Card,
  Spin,
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
    case "tasarruf":
    case "market":
    case "restoran":
    case "restoran / kafe":
    case "aile": 
      return { icon: <DollarCircleOutlined />, color: "bg-red-100 text-red-600" };
    case "kira":
    case "fatura":
      return { icon: <TagOutlined />, color: "bg-blue-100 text-blue-600" };
    case "ulaşım":
    case "petrol":
      return { icon: <CalendarOutlined />, color: "bg-green-100 text-green-600" };
    default:
      return { icon: <SolutionOutlined />, color: "bg-gray-100 text-gray-600" };
  }
};

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

  const [formData, setFormData] = useState({
    miktar: "",
    kategori: "",
    altKategori: "",
    not: "",
    tarih: dayjs().toDate(),
  });

  const { data: harcamalar = [], isLoading } = useQuery({
    queryKey: ["harcamalar"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/harcama`);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) =>
      axios.put(`${API_URL}/harcama/${payload._id}`, payload),
    onSuccess: () => {
      message.success("✨ İşlem başarıyla güncellendi!");
      queryClient.invalidateQueries(["harcamalar"]);
      queryClient.invalidateQueries(["totals"]);
      setEditModalVisible(false);
    },
    onError: () => message.error("Güncelleme başarısız!"),
  });

  const definitiveDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/harcama/${id}`);
      queryClient.invalidateQueries(["harcamalar"]);
      queryClient.invalidateQueries(["totals"]);
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const handleUndo = (messageKey) => {
    clearTimeout(deleteTimerRef.current);
    message.destroy(messageKey);
    message.info("İşlem iptal edildi.");
  };

  const startDeleteProcess = (id) => {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);

    const content = (
      <span className="flex items-center space-x-3">
        <Text strong className="text-gray-900">🗑️ Silme başarılı oldu!</Text>
        <Button type="link" icon={<UndoOutlined />} size="small" onClick={() => handleUndo(MESSAGE_KEY)}>Geri Al</Button>
      </span>
    );

    message.success({ content, key: MESSAGE_KEY, duration: 3 });
    deleteTimerRef.current = setTimeout(() => {
      definitiveDelete(id);
      message.destroy(MESSAGE_KEY);
    }, 3000);
  };

  const filteredHarcamalar = useMemo(() => {
    return harcamalar
      .filter((h) => {
        // createdAt yerine tarih bazlı filtreleme daha tutarlı olabilir ancak mevcut yapıyı koruyoruz
        const t = dayjs(h.createdAt);
        const isSearching = searchTerm.trim().length > 0;
        
        // Arama yapılıyorsa tarih filtresini devre dışı bırakıyoruz, yoksa seçili aya bakıyoruz
        const monthMatch = isSearching 
          ? true 
          : (t.month() === selectedMonth && t.year() === selectedYear);
        
        const categoryMatch = 
          selectedCategory === "Tümü" || 
          selectedCategory === "Kategoriler" || 
          h.kategori === selectedCategory;

        const searchMatch = 
          h.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.altKategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.not?.toLowerCase().includes(searchTerm.toLowerCase());

        return monthMatch && categoryMatch && searchMatch;
      })
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [harcamalar, selectedMonth, selectedYear, selectedCategory, searchTerm]);

  const kategoriToplam = useMemo(
    () => filteredHarcamalar.reduce((sum, h) => sum + Number(h.miktar || 0), 0),
    [filteredHarcamalar]
  );

  const changeMonth = useCallback((direction) => {
      const current = dayjs().year(selectedYear).month(selectedMonth);
      const newDate = direction === "prev" ? current.subtract(1, "month") : current.add(1, "month");
      setSelectedMonth(newDate.month());
      setSelectedYear(newDate.year());
    }, [selectedMonth, selectedYear]
  );

  // İleriki ayları görmeni engelleyen kısıtlamayı kaldırdık (disabled={isFutureMonth} sildik)
  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format("MMMM YYYY");

  const openEditModal = (harcama) => {
    const requiresSubCategory = ["Market", "Giyim", "Aile"].includes(harcama.kategori);

    setEditingHarcama(harcama);
    setFormData({
      miktar: harcama.miktar,
      kategori: harcama.kategori,
      altKategori: requiresSubCategory ? harcama.altKategori || "" : "",
      not: harcama.not || "",
      tarih: dayjs(harcama.createdAt).toDate(),
    });
    setEditModalVisible(true);
  };

  const handleEditSave = () => {
    if (!formData.miktar) return message.error("Miktar boş olamaz!");
    const needsSub = ["Market", "Giyim", "Aile"].includes(formData.kategori);
    if (needsSub && !formData.altKategori) {
      return message.error(`${formData.kategori} için seçim yapmalısınız!`);
    }

    const payload = {
      miktar: parseFloat(formData.miktar),
      _id: editingHarcama._id,
      kategori: formData.kategori,
      altKategori: needsSub ? formData.altKategori : "",
      not: formData.not,
      createdAt: dayjs(formData.tarih).toISOString(),
    };
    updateMutation.mutate(payload);
  };

  const trailingActions = (harcama) => (
    <TrailingActions>
      <SwipeAction destructive={true} onClick={() => startDeleteProcess(harcama._id)}>
        <div className="bg-red-600 text-white flex justify-center items-center h-full w-full font-bold text-lg">
          <DeleteOutlined className="text-3xl" />
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  const leadingActions = (harcama) => (
    <LeadingActions>
      <SwipeAction onClick={() => openEditModal(harcama)}>
        <div className="bg-blue-500 text-white flex justify-center items-center h-full w-full font-bold text-lg">
          <EditOutlined className="text-3xl" />
        </div>
      </SwipeAction>
    </LeadingActions>
  );

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;

  return (
    <div className="p-3 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="sticky top-0 z-20 bg-gray-50 pb-2">
        <Card className="shadow-md rounded-xl" styles={{ body: { padding: "12px" } }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                type="text" 
                icon={<LeftOutlined />} 
                onClick={() => changeMonth("prev")} 
                size="small"
              />
              <Title level={5} className="m-0 min-w-[110px] text-center text-blue-700">
                {displayMonth}
              </Title>
              <Button 
                type="text" 
                icon={<RightOutlined />} 
                onClick={() => changeMonth("next")} 
                size="small"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                icon={isSearchVisible ? <CloseOutlined /> : <SearchOutlined />} 
                shape="circle" 
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                type={isSearchVisible ? "primary" : "default"}
                danger={isSearchVisible}
              />
              <Select 
                value={selectedCategory} 
                onChange={(v) => setSelectedCategory(v)} 
                variant="filled"
                className="w-32 sm:w-40"
              >
                <Option value="Tümü">Hepsi</Option>
                {ALL_CATEGORIES.map((cat) => <Option key={cat} value={cat}>{cat}</Option>)}
              </Select>
            </div>
          </div>

          {isSearchVisible && (
            <div className="mt-3 transition-all">
              <Input
                placeholder="Notlarda veya alt kategorilerde ara..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                autoFocus
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-3 px-2 pt-2 border-t border-dashed">
            <Text type="secondary" className="text-xs uppercase font-bold tracking-wider">Toplam</Text>
            <Text className="text-lg font-black text-red-600">
              {kategoriToplam.toFixed(2)} €
            </Text>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        {filteredHarcamalar.length === 0 ? (
          <Card className="text-center p-10 text-gray-400 italic">
            Bu dönemde kayıt bulunamadı.
          </Card>
        ) : (
          <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.IOS}>
            {filteredHarcamalar.map((harcama) => {
              const { icon, color } = getCategoryDetails(harcama.kategori);
              const isToday = dayjs(harcama.createdAt).isSame(now, "day");

              return (
                <SwipeableListItem 
                  key={harcama._id} 
                  leadingActions={leadingActions(harcama)} 
                  trailingActions={trailingActions(harcama)}
                >
                  <div className={`flex items-center w-full p-4 mb-2 rounded-xl transition-all ${isToday ? "bg-white border-l-4 border-yellow-400 shadow-sm" : "bg-white border-b border-gray-100"}`}>
                    <div className={`p-3 rounded-2xl mr-4 ${color} shadow-sm`}>{icon}</div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <Text strong className="text-base text-gray-800 leading-none">
                            {harcama.altKategori || harcama.kategori}
                          </Text>
                          <Text type="secondary" className="text-[10px] mt-1 uppercase">
                            {harcama.altKategori ? harcama.kategori : "Genel"}
                          </Text>
                        </div>
                        <Text className="text-lg font-bold text-gray-900">
                          -{harcama.miktar} €
                        </Text>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-gray-400">
                          {dayjs(harcama.createdAt).format("DD MMM, HH:mm")}
                        </span>
                        {harcama.not && (
                          <span className="text-[11px] text-blue-500 italic max-w-[150px] truncate">
                            "{harcama.not}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </SwipeableListItem>
              );
            })}
          </SwipeableList>
        )}
      </div>

      <Modal
        title={<Title level={4} className="text-center text-blue-600 m-0">Düzenle</Title>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSave}
        okText="Güncelle"
        cancelText="Vazgeç"
        destroyOnClose={true}
        centered
      >
        <div className="space-y-4 pt-2">
          <CustomDayPicker 
             value={formData.tarih} 
             onChange={(date) => setFormData({ ...formData, tarih: date })} 
             isIncome={false} 
          />
          
          <Input 
            size="large" 
            type="number" 
            value={formData.miktar} 
            onChange={(e) => setFormData({ ...formData, miktar: e.target.value })} 
            prefix={<span className="text-gray-400">€</span>} 
            className="rounded-lg"
          />

          <Select 
            size="large"
            value={formData.kategori} 
            onChange={(v) => setFormData({ ...formData, kategori: v, altKategori: "" })} 
            style={{ width: "100%" }}
          >
            {ALL_CATEGORIES.map((cat) => <Option key={cat} value={cat}>{cat}</Option>)}
          </Select>

          {["Market", "Giyim", "Aile"].includes(formData.kategori) && (
            <Select 
              size="large"
              value={formData.altKategori} 
              onChange={(v) => setFormData({ ...formData, altKategori: v })} 
              style={{ width: "100%" }} 
              placeholder="Seçim yapınız"
            >
              {(formData.kategori === "Market" ? MARKETLER : formData.kategori === "Giyim" ? GIYIM_KISILERI : AILE_UYELERI).map((item) => (
                <Option key={item} value={item}>{item}</Option>
              ))}
            </Select>
          )}

          <Input.TextArea 
            rows={2} 
            value={formData.not} 
            onChange={(e) => setFormData({ ...formData, not: e.target.value })} 
            placeholder="Kısa bir not ekleyin..." 
            className="rounded-lg"
          />
        </div>
      </Modal>
    </div>
  );
};

const Harcamalar = () => (
  <div className="relative min-h-screen bg-gray-50">
    <main className="pb-24"><HarcamalarContent /></main>
    <BottomNav />
  </div>
);

export default Harcamalar;