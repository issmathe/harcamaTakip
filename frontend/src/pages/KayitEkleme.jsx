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
import { TotalsProvider } from "../context/TotalsContext.js";
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
  "Restoran / Kafe",
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

const UnutulanKayitEklemeContent = () => {
  const [formData, setFormData] = useState({
    miktar: "",
    kategori: "",
    altKategori: "",
    not: "",
    tarih: null,
  });
  const [loading, setLoading] = useState(false);

  // 🔹 iPhone/Android'de zoom yapılmasını engelle
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

    // Input focus olduğunda zoom yapmasını engellemek için font büyüklüğü sabit tut
    const style = document.createElement("style");
    style.innerHTML = `
      input, select, textarea, button {
        font-size: 16px !important; /* Safari zoom fix */
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSubmit = async () => {
    if (!formData.miktar || !formData.kategori || !formData.tarih) {
      return message.warning("Lütfen miktar, kategori ve tarihi doldurun!");
    }

    try {
      setLoading(true);
      const payload = { ...formData };

      if (formData.kategori === "Market" && formData.altKategori) {
        payload.kategori = `Market - ${formData.altKategori}`;
      }

      payload.createdAt = formData.tarih.toISOString();
      await axios.post(`${API_URL}/harcama`, payload);

      message.success("Unutulan harcama başarıyla eklendi!");
      setFormData({ miktar: "", kategori: "", altKategori: "", not: "", tarih: null });
    } catch (err) {
      console.error(err);
      message.error("Kayıt eklenemedi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={3} className="text-center text-gray-700 mb-6">
        Unutulan Kayıt Ekle
      </Title>

      <Card className="shadow-lg rounded-xl bg-white">
        {/* Miktar */}
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

        {/* Kategori */}
        <div className="mb-4">
          <Text strong className="block mb-1">
            Kategori:
          </Text>
          <Select
            value={formData.kategori}
            onChange={(v) =>
              setFormData({ ...formData, kategori: v, altKategori: "" })
            }
            style={{ width: "100%" }}
            placeholder="Kategori seçin"
            size="large"
          >
            {ALL_CATEGORIES.map((cat) => (
              <Option key={cat} value={cat}>
                {cat}
              </Option>
            ))}
          </Select>

          {/* Alt kategori sadece Market için */}
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
                  <Option key={m} value={m}>
                    {m}
                  </Option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {/* Tarih */}
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

        {/* Not */}
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

        {/* Kaydet Butonu */}
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

const UnutulanKayitEkleme = () => (
  <TotalsProvider>
    <div className="relative min-h-screen bg-gray-50">
      <Header />
      <main className="pb-20">
        <UnutulanKayitEklemeContent />
      </main>
      <BottomNav />
    </div>
  </TotalsProvider>
);

export default UnutulanKayitEkleme;
