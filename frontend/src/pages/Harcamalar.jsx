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
  "Market", "Giyim", "Bağış", "Petrol", "Kira", "Fatura", "Eğitim",
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
    case "bağış":
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
    const ayFiltreli = harcamalar
      .filter((h) => {
        const t = dayjs(h.createdAt);
        return t.month() === selectedMonth && t.year() === selectedYear;
      })
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());

    if (selectedCategory === "Tümü" || selectedCategory === "Kategoriler") {
      return ayFiltreli;
    }
    return ayFiltreli.filter((h) => h.kategori === selectedCategory);
  }, [harcamalar, selectedMonth, selectedYear, selectedCategory]);

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

  const isFutureMonth = useMemo(() => {
    const current = dayjs().year(selectedYear).month(selectedMonth);
    return current.isAfter(now, "month");
  }, [selectedMonth, selectedYear, now]);

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
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={3} className="text-center text-gray-700 mb-6">Harcamalar</Title>

      <Card className="shadow-lg rounded-xl mb-6 bg-white sticky top-0 z-10" styles={{ body: { padding: "16px" } }}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <Button icon={<LeftOutlined />} onClick={() => changeMonth("prev")}>Önceki Ay</Button>
          <Title level={5} className="m-0 text-blue-600">{displayMonth}</Title>
          <Button icon={<RightOutlined />} onClick={() => changeMonth("next")} disabled={isFutureMonth}>Sonraki Ay</Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Select value={selectedCategory} onChange={(v) => setSelectedCategory(v)} style={{ width: "100%" }}>
            <Option value="Tümü">Tümü</Option>
            {ALL_CATEGORIES.map((cat) => <Option key={cat} value={cat}>{cat}</Option>)}
          </Select>
        </div>

        {/* Toplam Bilgi Alanı: Her durumda gösterilir */}
        <div className="flex items-center justify-center mt-4 bg-gray-50 p-3 rounded-lg border">
          {(selectedCategory === "Tümü" || selectedCategory === "Kategoriler") ? (
            <SolutionOutlined className="text-gray-600" />
          ) : (
            getCategoryDetails(selectedCategory).icon
          )}
          <span className="ml-2 text-gray-700 font-medium">
            {(selectedCategory === "Tümü" || selectedCategory === "Kategoriler") ? "Toplam Harcama" : `${selectedCategory} Toplamı`}: 
            <span className="text-red-600 font-bold ml-1">{kategoriToplam.toFixed(2)} €</span>
          </span>
        </div>
      </Card>

      <Card className="shadow-lg rounded-xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        {filteredHarcamalar.length === 0 ? (
          <div className="p-6 text-center text-gray-500">{`${displayMonth} döneminde veri bulunmamaktadır.`}</div>
        ) : (
          <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.IOS}>
            {filteredHarcamalar.map((harcama) => {
              const { icon, color } = getCategoryDetails(harcama.kategori);
              const isToday = dayjs(harcama.createdAt).isSame(now, "day");

              return (
                <SwipeableListItem key={harcama._id} leadingActions={leadingActions(harcama)} trailingActions={trailingActions(harcama)}>
                  <div className={`flex items-center w-full p-4 sm:p-5 cursor-pointer transition-all duration-300 ${isToday ? "bg-yellow-50 border-2 border-yellow-300 shadow-md" : "bg-white border-b"}`}>
                    <div className={`p-3 rounded-full mr-4 sm:mr-6 ${color}`}>{icon}</div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <Text strong className="text-lg text-gray-800 truncate">
                          {harcama.altKategori ? `${harcama.kategori} (${harcama.altKategori})` : harcama.kategori}
                        </Text>
                        <Text className="text-xl font-bold text-red-600 ml-4 flex-shrink-0">
                          -{harcama.miktar} €
                        </Text>
                      </div>
                      <div className="text-sm text-gray-500 mb-1"><CalendarOutlined className="mr-1" />{dayjs(harcama.createdAt).format("DD.MM.YYYY HH:mm")}</div>
                      <div className="text-sm text-gray-600 italic truncate"><SolutionOutlined className="mr-1" />Not: {harcama.not || "Yok"}</div>
                    </div>
                  </div>
                </SwipeableListItem>
              );
            })}
          </SwipeableList>
        )}
      </Card>

      <Modal
        title={<Title level={4} className="text-center text-blue-600">Harcamayı Düzenle</Title>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSave}
        okText="Kaydet"
        cancelText="İptal"
        destroyOnClose={true}
      >
        <div className="space-y-4 pt-4">
          <div>
            <Text strong className="block mb-1">Tarih:</Text>
            <CustomDayPicker value={formData.tarih} onChange={(date) => setFormData({ ...formData, tarih: date })} disabledDate={(current) => current && current.isAfter(dayjs(), "day")} isIncome={false} />
          </div>

          <div>
            <Text strong className="block mb-1">Miktar (€):</Text>
            <Input type="number" value={formData.miktar} onChange={(e) => setFormData({ ...formData, miktar: e.target.value })} prefix="€" />
          </div>

          <div>
            <Text strong className="block mb-1">Kategori:</Text>
            <Select value={formData.kategori} onChange={(v) => setFormData({ ...formData, kategori: v, altKategori: "" })} style={{ width: "100%" }}>
              {ALL_CATEGORIES.map((cat) => <Option key={cat} value={cat}>{cat}</Option>)}
            </Select>

            {formData.kategori === "Market" && (
              <div className="mt-3">
                <Text strong className="block mb-1">Market Seç:</Text>
                <Select value={formData.altKategori} onChange={(v) => setFormData({ ...formData, altKategori: v })} style={{ width: "100%" }} placeholder="Market seçin">
                  {MARKETLER.map((m) => <Option key={m} value={m}>{m}</Option>)}
                </Select>
              </div>
            )}

            {formData.kategori === "Giyim" && (
              <div className="mt-3">
                <Text strong className="block mb-1">Kişi Seç:</Text>
                <Select value={formData.altKategori} onChange={(v) => setFormData({ ...formData, altKategori: v })} style={{ width: "100%" }} placeholder="Kişi seçin">
                  {GIYIM_KISILERI.map((k) => <Option key={k} value={k}>{k}</Option>)}
                </Select>
              </div>
            )}

            {formData.kategori === "Aile" && (
              <div className="mt-3">
                <Text strong className="block mb-1">Aile Üyesi Seç:</Text>
                <Select value={formData.altKategori} onChange={(v) => setFormData({ ...formData, altKategori: v })} style={{ width: "100%" }} placeholder="Üye seçin">
                  {AILE_UYELERI.map((u) => <Option key={u} value={u}>{u}</Option>)}
                </Select>
              </div>
            )}
          </div>

          <div>
            <Text strong className="block mb-1">Not:</Text>
            <Input.TextArea rows={2} value={formData.not} onChange={(e) => setFormData({ ...formData, not: e.target.value })} placeholder="Ek not" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Harcamalar = () => (
  <div className="relative min-h-screen bg-gray-50">
    <main className="pb-20"><HarcamalarContent /></main>
    <BottomNav />
  </div>
);

export default Harcamalar;