import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Typography,
  Input,
  Select,
  Button,
  DatePicker,
  message,
  Card,
  Space,
} from "antd";
import {
  DollarOutlined,
  CalendarOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ShoppingOutlined, // Market ikonu eklendi
} from "@ant-design/icons";
import BottomNav from "../components/Home/BottomNav.jsx";
import { useTotalsContext } from "../context/TotalsContext";
import axios from "axios";
import dayjs from "dayjs";
import tr from "dayjs/locale/tr";

// dayjs lokalizasyonu bir kez yapılıyor
dayjs.locale(tr);

const { Title, Text } = Typography;
const { Option } = Select;

// Ortam değişkenini daha güvenli kullanma (mevcut kodda zaten var, tutuluyor)
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

// Sabitler dışarı taşındı, bileşenin yeniden render edilmesinde tekrar oluşturulmaz
const ALL_CATEGORIES = [
  "Market",
  "Giyim",
  "Bağış",
  "Petrol",
  "Kira",
  "Fatura",
  "Eğitim",
  "Sağlık",
  "Ulaşım",
  "Eğlence",
  "Elektronik",
  "Spor",
  "Kırtasiye",
  "Restoran",
  "Diğer",
];

const MARKETLER = [
  "Lidl",
  "Aldi",
  "DM",
  "Action",
  "Norma",
  "Türk Market",
  "Et-Tavuk",
  "Kaufland",
  "Rewe",
  "Netto",
  "Edeka",
  "Biomarkt",
  "Penny",
  "Rossmann",
  "Diğer",
];

// Başlangıç formu durumu
const INITIAL_FORM_DATA = {
  miktar: "",
  kategori: "",
  altKategori: "",
  not: "",
  tarih: dayjs(),
};

// Alt bileşenler için ikon eşlemesi
const ICON_MAP = {
    Miktar: <DollarOutlined className="text-green-600" />,
    Tarih: <CalendarOutlined className="text-blue-600" />,
    Not: <EditOutlined className="text-gray-600" />,
    Market: <ShoppingOutlined className="text-orange-500" />,
};

// Form Alanı Bileşeni (Tekrar Kullanılabilir Alanlar için)
const FormField = ({ label, icon, children, required = false }) => (
    <div className="mb-4">
        <Text strong className="block mb-1 flex items-center">
            <Space size={4}>
                {icon}
                {label}
                {required && <span className="text-red-500">*</span>}
            </Space>
        </Text>
        {children}
    </div>
);


const KayitEklemeContent = () => {
  const { fetchTotals } = useTotalsContext();

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);

  // Form alanlarındaki değişimi daha düzenli yönetmek için tek fonksiyon
  const handleChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Kategori değiştiğinde altKategori'yi sıfırlama
  const handleCategoryChange = useCallback((v) => {
    handleChange("kategori", v);
    handleChange("altKategori", ""); // Kategori değişince alt kategoriyi sıfırla
  }, [handleChange]);

  // iPhone/Android zoom engelleme ve font boyutu sabitleme (mevcut koddan iyileştirildi)
  // Bu tür global DOM manipülasyonları genellikle zorunlu kalmadıkça önerilmez
  // ancak mobil format isteği ve mevcut kod yapısı nedeniyle tutuluyor.
  useEffect(() => {
    const disableZoom = () => {
        document.body.style.touchAction = 'manipulation';
    };
    disableZoom();
    // Font büyüklüğü düzeltmesi için style tag ekleme
    const style = document.createElement("style");
    style.innerHTML = `
      input, select, textarea, button, .ant-select-selection-item {
        font-size: 16px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
        document.body.style.touchAction = '';
        document.head.removeChild(style);
    };
  }, []);
  
  // handleSubmit fonksiyonu useCallback ile önbelleğe alındı
  const handleSubmit = useCallback(async () => {
    const { miktar, kategori, tarih, altKategori } = formData;
    
    // Gerekli alan kontrolü
    if (!miktar || !kategori || !tarih) {
      return message.warning("Lütfen **miktar**, **kategori** ve **tarihi** doldurun!");
    }

    try {
      setLoading(true);
      
      // Payload oluşturma ve veri dönüşümleri
      const payload = { ...formData };
      
      // Miktarı sayıya çevirme ve global formatı destekleme
      payload.miktar = Number(miktar.replace(",", "."));
      
      // Tarihi ISO formatına çevirme
      payload.createdAt = tarih.toISOString();

      // Market değilse altKategori'yi silme
      if (kategori !== "Market" || !altKategori) {
        delete payload.altKategori;
      }

      // 'tarih' alanını silme (çünkü 'createdAt' kullanılıyor)
      delete payload.tarih;

      await axios.post(`${API_URL}/harcama`, payload);

      message.success("Harcama kaydı başarıyla eklendi!");

      // Context ve Header güncellemesi
      await fetchTotals();

      // Form sıfırlama
      setFormData(INITIAL_FORM_DATA);
    } catch (err) {
      console.error(err.response?.data || err.message);
      message.error("Kayıt eklenemedi! Bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  }, [formData, fetchTotals]); // formData ve fetchTotals bağımlılıkları

  // Dinamik olarak oluşturulan kategori seçenekleri (useMemo ile optimize edildi)
  const categoryOptions = useMemo(() => ALL_CATEGORIES.map((cat) => (
    <Option key={cat} value={cat}>
      {cat}
    </Option>
  )), []);

  // Dinamik olarak oluşturulan market seçenekleri (useMemo ile optimize edildi)
  const marketOptions = useMemo(() => MARKETLER.map((m) => (
    <Option key={m} value={m}>
      {m}
    </Option>
  )), []);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={3} className="text-center text-gray-800 mb-6 font-semibold">
        💰 Yeni Harcama Kaydı Ekle
      </Title>

      <Card className="shadow-2xl rounded-xl border-t-4 border-green-500 bg-white p-4">
        {/* Miktar Alanı */}
        <FormField label="Miktar (₺)" icon={ICON_MAP.Miktar} required>
          <Input
            // inputMode="decimal" yerine numeric kullanmak mobil klavyeyi tetikleyebilir
            inputMode="numeric" 
            value={formData.miktar}
            onChange={(e) =>
              handleChange("miktar", e.target.value.replace(/[^0-9.,]/g, '')) // Sadece sayı, virgül ve nokta kabul et
            }
            placeholder="Örn: 45.50"
            size="large"
            className="rounded-lg border-gray-300 focus:border-green-500"
          />
        </FormField>
        
        {/* Kategori Alanı */}
        <FormField label="Kategori" icon={ICON_MAP.Kategori} required>
          <Select
            value={formData.kategori}
            onChange={handleCategoryChange}
            style={{ width: "100%" }}
            placeholder="Kategori seçin"
            size="large"
            className="rounded-lg"
          >
            {categoryOptions}
          </Select>
          
          {/* Alt Kategori (Market) Alanı - Koşullu Render */}
          {formData.kategori === "Market" && (
            <div className="mt-4">
              <FormField label="Market Seç" icon={ICON_MAP.Market}>
                <Select
                  value={formData.altKategori}
                  onChange={(v) => handleChange("altKategori", v)}
                  style={{ width: "100%" }}
                  placeholder="Market seçin (isteğe bağlı)"
                  size="large"
                  className="rounded-lg"
                  allowClear // Seçimi temizleme butonu
                >
                  {marketOptions}
                </Select>
              </FormField>
            </div>
          )}
        </FormField>

        {/* Tarih Alanı */}
        <FormField label="Tarih" icon={ICON_MAP.Tarih} required>
          <DatePicker
            value={formData.tarih}
            onChange={(date) => handleChange("tarih", date)}
            style={{ width: "100%" }}
            placeholder="Tarih seçin"
            format="DD.MM.YYYY"
            size="large"
            className="rounded-lg border-gray-300 focus:border-blue-500"
            disabledDate={(current) => current && current > dayjs().endOf("day")} // Bugünden sonraki günleri devre dışı bırak
            
          />
        </FormField>

        {/* Not Alanı */}
        <FormField label="Not" icon={ICON_MAP.Not}>
          <Input.TextArea
            rows={2}
            value={formData.not}
            onChange={(e) => handleChange("not", e.target.value)}
            placeholder="Ek not (isteğe bağlı)"
            size="large"
            className="rounded-lg border-gray-300 focus:border-gray-500"
          />
        </FormField>

        {/* Kaydet Butonu */}
        <Button
          type="primary"
          block
          icon={<CheckCircleOutlined />}
          onClick={handleSubmit}
          loading={loading}
          size="large"
          className="mt-6 h-12 text-lg font-bold rounded-xl bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600 transition duration-300 ease-in-out"
        >
          Kaydı Ekle
        </Button>
      </Card>
    </div>
  );
};

const KayitEkleme = () => (
  // min-h-screen ve relative yapı mobil uyumluluk için korundu.
  // Tailwind BG rengi hafifçe değiştirildi.
  <div className="relative min-h-screen bg-gray-100"> 
    <main className="pb-20"> {/* BottomNav için boşluk bırakıldı */}
      <KayitEklemeContent />
    </main>
    <BottomNav />
  </div>
);

export default KayitEkleme;