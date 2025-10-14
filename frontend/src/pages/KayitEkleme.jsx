import React, { useState, useEffect } from "react";
import {
  Typography,
  Input,
  Select,
  Button,
  DatePicker,
  message,
  Card,
} from "antd";
import {
  DollarOutlined,
  CalendarOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Header from "../components/Home/Header.jsx";
import BottomNav from "../components/Home/BottomNav.jsx";
import { useTotalsContext } from "../context/TotalsContext";
import axios from "axios";
import dayjs from "dayjs";
import tr from "dayjs/locale/tr";

dayjs.locale(tr);
const { Title, Text } = Typography;
const { Option } = Select;
// Lütfen buradaki API_URL'in doğru olduğundan emin olun
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

const ALL_CATEGORIES = [
  "Giyim",
  "Gıda",
  "Petrol",
  "Kira",
  "Fatura",
  "Eğitim",
  "Sağlık",
  "Ulaşım",
  "Eğlence",
  "Elektronik",
  "Spor",
  "Market",
  "Kırtasiye",
  "Restoran",
  "Diğer",
];

const MARKETLER = [
  "Lidl",
  "Rewe",
  "Edeka",
  "Aldi",
  "Netto",
  "Penny",
  "Kaufland",
  "Real",
  "Norma",
  "Tegut",
  "Hit",
  "Famila",
  "Nahkauf",
  "Biomarkt",
  "DM",
  "Rossmann",
  "Diğer",
];

const KayitEklemeContent = () => {
  const { fetchTotals } = useTotalsContext();

  const [formData, setFormData] = useState({
    miktar: "",
    kategori: "",
    altKategori: "",
    not: "",
    tarih: dayjs(),
  });
  const [loading, setLoading] = useState(false);

  // GÜNCELLENEN KISIM: Global Kaydırma Engeli ve Klavye Desteği
  useEffect(() => {
    // Zoom engelleme (mobil)
    const meta = document.querySelector("meta[name=viewport]");
    if (meta) {
      meta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      );
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "viewport";
      newMeta.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(newMeta);
    }

    // Input font boyutu düzeltme
    const style = document.createElement("style");
    style.innerHTML = `
      input, select, textarea, button {
        font-size: 16px !important; 
      }
    `;
    document.head.appendChild(style);

    // Ana düzeltme: Body ve HTML'de kaydırmayı tamamen engelle.
    // Bu, klavye açılsa bile header'ın kaymasını ve overscroll efektini önler.
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Cleanup fonksiyonu: Component kaldırıldığında stilleri geri al
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (style && style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, []); // Bağımlılık dizisi boş olduğu için sadece mount/unmount anında çalışır.

  const handleSubmit = async () => {
    if (!formData.miktar || !formData.kategori || !formData.tarih) {
      return message.warning("Lütfen miktar, kategori ve tarihi doldurun!");
    }

    try {
      setLoading(true);
      const payload = { ...formData };

      payload.miktar = Number(formData.miktar.replace(",", "."));
      payload.createdAt = formData.tarih.toISOString();

      if (formData.kategori === "Market" && formData.altKategori) {
        // Alt kategori varsa payload içinde bırak
      } else {
        delete payload.altKategori;
      }

      delete payload.tarih;

      await axios.post(`${API_URL}/harcama`, payload);

      message.success("Harcama kaydı başarıyla eklendi!");

      // Header ve context anlık güncelleme
      await fetchTotals();

      // Form sıfırlama
      setFormData({ miktar: "", kategori: "", altKategori: "", not: "", tarih: dayjs() });
    } catch (err) {
      console.error(err.response?.data || err.message);
      message.error("Kayıt eklenemedi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Gereksiz büyük ekran dolguları kaldırıldı. Sadece mobil padding kaldı.
    <div className="p-4"> 
      <Title level={3} className="text-center text-gray-700 mb-6">
        Yeni Kayıt Ekle
      </Title>

      <Card className="shadow-lg rounded-xl bg-white">
        <div className="mb-4">
          <Text strong className="block mb-1">
            <DollarOutlined className="mr-1 text-green-600" />
            Miktar (₺):
          </Text>
          <Input
            inputMode="decimal"
            pattern="[0-9]*"
            value={formData.miktar}
            onChange={(e) => setFormData({ ...formData, miktar: e.target.value })}
            placeholder="Örn: 45.50"
          />
        </div>

        <div className="mb-4">
          <Text strong className="block mb-1">Kategori:</Text>
          <Select
            value={formData.kategori}
            onChange={(v) => setFormData({ ...formData, kategori: v, altKategori: "" })}
            style={{ width: "100%" }}
            placeholder="Kategori seçin"
            size="large"
          >
            {ALL_CATEGORIES.map((cat) => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>

          {formData.kategori === "Market" && (
            <div className="mt-3">
              <Text strong className="block mb-1">Market Seç:</Text>
              <Select
                value={formData.altKategori}
                onChange={(v) => setFormData({ ...formData, altKategori: v })}
                style={{ width: "100%" }}
                placeholder="Market seçin"
                size="large"
              >
                {MARKETLER.map((m) => (
                  <Option key={m} value={m}>{m}</Option>
                ))}
              </Select>
            </div>
          )}
        </div>

        <div className="mb-4">
          <Text strong className="block mb-1">
            <CalendarOutlined className="mr-1 text-blue-600" />
            Tarih:
          </Text>
          <DatePicker
            value={formData.tarih}
            onChange={(date) => setFormData({ ...formData, tarih: date })}
            style={{ width: "100%" }}
            placeholder="Tarih seçin"
            format="DD.MM.YYYY"
            disabledDate={(current) => current && current > dayjs().endOf("day")}
          />
        </div>

        <div className="mb-6">
          <Text strong className="block mb-1">
            <EditOutlined className="mr-1 text-gray-600" />
            Not:
          </Text>
          <Input.TextArea
            rows={2}
            value={formData.not}
            onChange={(e) => setFormData({ ...formData, not: e.target.value })}
            placeholder="Ek not (isteğe bağlı)"
          />
        </div>

        <Button
          type="primary"
          block
          icon={<CheckCircleOutlined />}
          onClick={handleSubmit}
          loading={loading}
          size="large"
        >
          Kaydı Ekle
        </Button>
      </Card>
    </div>
  );
};

// NİHAİ YAPI: Sabit Header/BottomNav, Kaydırılabilir İçerik
const KayitEkleme = () => (
  // Dikey flex container, minimum ekran yüksekliğini kaplar ve kaydırmayı engeller.
  <div className="flex flex-col min-h-screen overflow-hidden bg-gray-50">
    
    {/* Header: Sabit yükseklik alır */}
    <Header className="flex-shrink-0" />
    
    {/* Main: Geri kalan tüm alanı kaplar ve sadece bu alan kendi içinde kaydırılabilir. */}
    <main className="flex-grow overflow-y-auto">
      <KayitEklemeContent />
    </main>
    
    {/* BottomNav: Sabit yükseklik alır */}
    <BottomNav className="flex-shrink-0" />
  </div>
);

export default KayitEkleme;