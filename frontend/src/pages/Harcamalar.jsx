// pages/Harcamalar.jsx (react-query ile TAM ve GÜNCEL VERSİYON)

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
  UndoOutlined, // Geri Al iconu eklendi
} from "@ant-design/icons";

// Özel bileşen importu
import CustomDayPicker from "../components/Forms/CustomDayPicker";

// Kaydırarak silme ve düzenleme için bileşenler
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
const MESSAGE_KEY = 'harcamaSilmeIslemi'; // Geri Al mesaj anahtarı

const ALL_CATEGORIES = [
  "Market", "Giyim", "Bağış", "Petrol", "Kira", "Fatura", 
  "Eğitim", "Sağlık", "Ulaşım", "Eğlence", "Elektronik", 
  "Spor", "Kırtasiye", "Restoran", "Diğer",
];

const MARKETLER = [
  "Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", 
  "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", 
  "Edeka", "Biomarkt", "Penny", "Rossmann", "Diğer",
];

const getCategoryDetails = (kategori) => {
  const normalizedKategori = kategori === "Market" ? "Market" : kategori;

  switch (normalizedKategori.toLowerCase()) {
    case "bağış":
    case "market":
    case "restoran":
    case "restoran / kafe":
      return {
        icon: <DollarCircleOutlined />,
        color: "bg-red-100 text-red-600",
      };
    case "kira":
    case "fatura":
      return { icon: <TagOutlined />, color: "bg-blue-100 text-blue-600" };
    case "ulaşım":
    case "petrol":
      return {
        icon: <CalendarOutlined />,
        color: "bg-green-100 text-green-600",
      };
    default:
      return { icon: <SolutionOutlined />, color: "bg-gray-100 text-gray-600" };
  }
};

const HarcamalarContent = () => {
  const queryClient = useQueryClient();
  const deleteTimerRef = useRef(null); // Silme zamanlayıcısı
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

  // ✅ Harcamaları Fetch Et
  const { data: harcamalar = [], isLoading } = useQuery({
    queryKey: ["harcamalar"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/harcama`);
      return res.data;
    },
  });

  // ✅ Güncelleme (PUT)
  const updateMutation = useMutation({
    mutationFn: async (payload) =>
      axios.put(`${API_URL}/harcama/${payload._id}`, payload),
    onSuccess: () => {
      message.success("✨ Harcamanız başarıyla güncellendi!");
      queryClient.invalidateQueries(["harcamalar"]);
      setEditModalVisible(false);
    },
    onError: () => message.error("Güncelleme başarısız!"),
  });

  // Geri Alma Özelliği için artık bu mutasyonu doğrudan kullanmıyoruz.
  // Silme işlemini manuel olarak yöneteceğiz.
  /*
  const deleteMutation = useMutation({
    mutationFn: async (id) => axios.delete(`${API_URL}/harcama/${id}`),
    onSuccess: () => {
      message.success("🗑️ Harcama kaydı başarıyla silindi!"); 
      queryClient.invalidateQueries(["harcamalar"]);
    },
    onError: () => message.error("Silme başarısız!"),
  });
  */


  // 1. KESİN SİLME İŞLEMİ (Sadece zamanlayıcı bitince veya Geri Al iptal edilince çağrılır)
  const definitiveDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/harcama/${id}`);
      queryClient.invalidateQueries(["harcamalar"]); 
    } catch (err) {
      console.error("Kesin silme hatası:", err);
    }
  };

  // 2. GERİ ALMA İŞLEMİ
  const handleUndo = (messageKey) => {
    clearTimeout(deleteTimerRef.current);
    message.destroy(messageKey);
    message.info("Silme işlemi iptal edildi.");
  };

  // 3. SİLME BAŞLATMA İŞLEMİ (3 saniyelik estetik bildirim)
  const startDeleteProcess = (id) => {
    if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
    }
    
    const content = (
      <span className="flex items-center space-x-3">
        <Text strong className="text-gray-900">🗑️ Silme başarılı oldu!</Text>
        <Button 
          type="link" 
          icon={<UndoOutlined />} 
          size="small"
          onClick={() => handleUndo(MESSAGE_KEY)}
          className="text-blue-500 hover:text-blue-700" 
        >
          Geri Al
        </Button>
      </span>
    );
    
    message.success({ 
        content: content, 
        key: MESSAGE_KEY, 
        duration: 3, // 3 saniye sonra otomatik kapanacak
    });

    deleteTimerRef.current = setTimeout(() => {
      definitiveDelete(id);
      message.destroy(MESSAGE_KEY); 
    }, 3000); // 3 saniye
  };
  
  // ✅ Ay / Yıl filtreleme
  const filteredHarcamalar = useMemo(() => {
    const ayFiltreli = harcamalar.filter((h) => {
      const t = dayjs(h.createdAt);
      return t.month() === selectedMonth && t.year() === selectedYear;
    }).sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()); // Tarihe göre sıralama eklendi

    if (selectedCategory === "Tümü" || selectedCategory === "Kategoriler") {
        return ayFiltreli;
    }

    return ayFiltreli.filter((h) => h.kategori === selectedCategory);
  }, [harcamalar, selectedMonth, selectedYear, selectedCategory]);

  const kategoriToplam = useMemo(
    () => filteredHarcamalar.reduce((sum, h) => sum + Number(h.miktar || 0), 0),
    [filteredHarcamalar]
  );

  const changeMonth = useCallback(
    (direction) => {
      const current = dayjs().year(selectedYear).month(selectedMonth);
      const newDate =
        direction === "prev"
          ? current.subtract(1, "month")
          : current.add(1, "month");
      setSelectedMonth(newDate.month());
      setSelectedYear(newDate.year());
      setSelectedCategory("Tümü"); 
    },
    [selectedMonth, selectedYear]
  );

  const isFutureMonth = useMemo(() => {
    const current = dayjs().year(selectedYear).month(selectedMonth);
    return current.isAfter(now, 'month');
  }, [selectedMonth, selectedYear, now]);

  const displayMonth = dayjs()
    .year(selectedYear)
    .month(selectedMonth)
    .format("MMMM YYYY");

  const formatDate = (dateString) =>
    dayjs(dateString).format("DD.MM.YYYY HH:mm");

  const openEditModal = (harcama) => {
    const isMarket = harcama.kategori === "Market";

    setEditingHarcama(harcama);
    setFormData({
      miktar: harcama.miktar,
      kategori: harcama.kategori,
      altKategori: isMarket ? harcama.altKategori || "" : "",
      not: harcama.not || "",
      tarih: dayjs(harcama.createdAt).toDate(), // Tarihi Date objesi olarak set et
    });
    setEditModalVisible(true);
  };

  const handleEditSave = () => {
    if (!formData.miktar) return message.error("Miktar boş olamaz!");

    if (formData.kategori === "Market" && !formData.altKategori) {
      return message.error("Market seçimi boş bırakılamaz!");
    }
    
    // ✅ Tarih, ISO string formatına çevrildi (Tarih güncelleme sorunu çözüldü)
    const updatedCreatedAt = dayjs(formData.tarih).toISOString();

    const payload = {
      // ✅ Miktar Sayıya Çevrildi
      miktar: parseFloat(formData.miktar),
      _id: editingHarcama._id,
      kategori: formData.kategori,
      altKategori: formData.kategori !== "Market" ? "" : formData.altKategori,
      not: formData.not,
      createdAt: updatedCreatedAt, // Güncellenmiş tarih eklendi
    };

    updateMutation.mutate(payload);
  };
  
  // KAYDIRMA SONRASI BASMA İLE SİLME (Trailing Actions - Silme)
  const trailingActions = (harcama) => (
    <TrailingActions>
      <SwipeAction
        destructive={true} 
        // ✅ Silme PC/Mobil stabilite ve Geri Al düzeltmesi
        onClick={() => startDeleteProcess(harcama._id)}
        onSwipeEnd={() => startDeleteProcess(harcama._id)}
      >
        <div className="bg-red-600 text-white flex justify-center items-center h-full w-full font-bold text-lg">
          <DeleteOutlined className="text-3xl" />
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  // KAYDIRARAK DÜZENLEME İÇİN YARDIMCI BİLEŞEN (Leading Actions - Düzenleme)
  const leadingActions = (harcama) => (
    <LeadingActions>
      <SwipeAction
        onClick={() => openEditModal(harcama)}
      >
        <div className="bg-blue-500 text-white flex justify-center items-center h-full w-full font-bold text-lg">
          <EditOutlined className="text-3xl" />
        </div>
      </SwipeAction>
    </LeadingActions>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  const currentCategoryForDisplay = 
      selectedCategory === "Kategoriler" ? "Tümü" : selectedCategory;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={3} className="text-center text-gray-700 mb-6">
        Harcamalarınız
      </Title>

      {/* Filtreleme ve Ay Seçimi Kartı */}
      <Card
        className="shadow-lg rounded-xl mb-6 bg-white"
        styles={{ body: { padding: "16px" } }}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <Button icon={<LeftOutlined />} onClick={() => changeMonth("prev")}>
            Önceki Ay
          </Button>
          <Title level={5} className="m-0 text-blue-600">
            {displayMonth}
          </Title>
          <Button icon={<RightOutlined />} onClick={() => changeMonth("next")} disabled={isFutureMonth}>
            Sonraki Ay
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          
          <Select
            value={selectedCategory} 
            onChange={(v) => setSelectedCategory(v)}
            style={{ width: "100%" }}
            popupMatchSelectWidth={true} 
          >
            <Option value="Tümü">Tümü</Option>
            {ALL_CATEGORIES.map((cat) => (
              <Option key={cat} value={cat}>
                {cat}
              </Option>
            ))}
          </Select>
        </div>

        {/* Toplamı göster */}
        {currentCategoryForDisplay !== "Tümü" && (
          <div className="flex items-center justify-center mt-4 bg-gray-50 p-3 rounded-lg border">
            {getCategoryDetails(currentCategoryForDisplay).icon}
            <span className="ml-2 text-gray-700 font-medium">
              {currentCategoryForDisplay} Toplamı:{" "}
              <span className="text-red-600 font-bold">
                {kategoriToplam.toFixed(2)} ₺
              </span>
            </span>
          </div>
        )}
      </Card>
      
      {/* Kaydırarak Silme/Düzenleme Listesi - SwipeableList kullanıldı */}
      <Card
        className="shadow-lg rounded-xl overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        {filteredHarcamalar.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {`${displayMonth} ayında harcama bulunmamaktadır.`}
          </div>
        ) : (
          <SwipeableList 
            threshold={0.3} 
            fullSwipe={true} 
            listType={ListType.IOS} 
          >
            {filteredHarcamalar.map((harcama) => {
              const { icon, color } = getCategoryDetails(harcama.kategori);

              const displayCategory =
                harcama.kategori === "Market" && harcama.altKategori
                  ? `${harcama.kategori} (${harcama.altKategori})`
                  : harcama.kategori;

              return (
                <SwipeableListItem
                  key={harcama._id}
                  leadingActions={leadingActions(harcama)} 
                  trailingActions={trailingActions(harcama)} 
                  className="bg-white" 
                >
                  {/* List Item İçeriği */}
                  <div 
                    className="flex items-center w-full bg-white p-4 sm:p-5 border-b cursor-pointer"
                  >
                    <div className={`p-3 rounded-full mr-4 sm:mr-6 ${color}`}>
                      {icon}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <Text strong className="text-lg text-gray-800 truncate">
                          {displayCategory}
                        </Text>
                        <Text className="text-xl font-bold text-red-600 ml-4 flex-shrink-0">
                          -{harcama.miktar} ₺
                        </Text>
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        <CalendarOutlined className="mr-1" />
                        <span>{formatDate(harcama.createdAt)}</span>
                      </div>
                      <div className="text-sm text-gray-600 italic truncate">
                        <SolutionOutlined className="mr-1" />
                        Not: {harcama.not || "Yok"}
                      </div>
                    </div>
                  </div>
                  
                </SwipeableListItem>
              );
            })}
          </SwipeableList>
        )}
      </Card>

      {/* Düzenleme Modalı */}
      <Modal
        title={
          <Title level={4} className="text-center text-blue-600">
            Harcamayı Düzenle
          </Title>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSave}
        okText="Kaydet"
        cancelText="İptal"
        destroyOnHidden
      >
        <div className="space-y-4 pt-4">
          
          {/* ✅ TARİH ALANI: Tarih güncelleme için CustomDayPicker */}
          <div>
            <Text strong className="block mb-1">
              Tarih:
            </Text>
            <CustomDayPicker
                value={formData.tarih}
                onChange={(date) => setFormData({ ...formData, tarih: date })}
                disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                isIncome={false} 
            />
          </div>
          
          <div>
            <Text strong className="block mb-1">
              Miktar (₺):
            </Text>
            <Input
              type="number"
              inputMode="decimal" 
              value={formData.miktar}
              onChange={(e) =>
                setFormData({ ...formData, miktar: e.target.value })
              }
            />
          </div>

          <div>
            <Text strong className="block mb-1">
              Kategori:
            </Text>
            <Select
              value={formData.kategori}
              onChange={(v) =>
                setFormData({ ...formData, kategori: v, altKategori: "" })
              }
              style={{ width: "100%" }}
            >
              {ALL_CATEGORIES.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>

            {formData.kategori === "Market" && (
              <div className="mt-2">
                <Text strong className="block mb-1">
                  Market Seç:
                </Text>
                <Select
                  value={formData.altKategori}
                  onChange={(v) => setFormData({ ...formData, altKategori: v })}
                  style={{ width: "100%" }}
                  placeholder="Market seçin"
                >
                  {MARKETLER.map((m) => (
                    <Option key={m} value={m}>
                      {m}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <div>
            <Text strong className="block mb-1">
              Not:
            </Text>
            <Input.TextArea
              rows={2}
              value={formData.not}
              // Not güncelleme düzeltildi
              onChange={(e) =>
                setFormData({ ...formData, not: e.target.value })
              }
              placeholder="Ek notunuz (isteğe bağlı)"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Harcamalar = () => (
  <div className="relative min-h-screen bg-gray-50">

    <main className="pb-20">
      <HarcamalarContent />
    </main>
    <BottomNav />
  </div>
);

export default Harcamalar;