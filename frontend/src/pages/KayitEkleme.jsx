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

// KayitEklemeContent bileşeni aynı kalır, sadece kaydırma yapısını kaldırırız.
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

  // iPhone/Android zoom engelleme ve font fix (Aynı Kalır)
  useEffect(() => {
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

    const style = document.createElement("style");
    style.innerHTML = `
      input, select, textarea, button {
        font-size: 16px !important; 
      }
    `;
    document.head.appendChild(style);

    return () => {
        if (style) document.head.removeChild(style);
    };
  }, []);

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
    // İç padding bırakılır
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

// ---
// KAYIT EKLEME YAPISININ DEĞİŞTİRİLDİĞİ YER BURASIDIR
// ---

const KayitEkleme = () => (
  // 1. Dikey Flexbox Konteyneri: Ekranın tamamını kaplar (h-screen, flex flex-col)
  <div className="flex flex-col h-screen bg-gray-50">
    
    {/* 2. Header: Sabit Yükseklik */}
    <Header className="flex-shrink-0" /> {/* flex-shrink-0 bu bileşenin boyutunun sabit kalmasını sağlar */}
    
    {/* 3. Ana İçerik Alanı (main): Geri kalan tüm alanı kaplar ve kendi içinde kaydırılabilir olur (flex-grow, overflow-y-auto) */}
    <main className="flex-grow overflow-y-auto">
      <KayitEklemeContent />
    </main>
    
    {/* 4. BottomNav: Sabit Yükseklik */}
    <BottomNav className="flex-shrink-0" /> {/* flex-shrink-0 bu bileşenin boyutunun sabit kalmasını sağlar */}
  </div>
);

export default KayitEkleme;