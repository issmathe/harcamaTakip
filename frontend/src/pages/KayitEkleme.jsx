import React, { useEffect } from "react";
import {
  Typography,
  Input,
  Select,
  Button,
  DatePicker,
  message,
  Card,
  Form,
  Space,
} from "antd";
import {
  DollarCircleOutlined,
  TagOutlined,
  CalendarOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import BottomNav from "../components/Home/BottomNav.jsx";
import { useTotalsContext } from "../context/TotalsContext";
import axios from "axios";
import dayjs from "dayjs";
import tr from "dayjs/locale/tr";
import { useMutation } from "@tanstack/react-query";

dayjs.locale(tr);

const { Title } = Typography; // <<< Sadece kullanılan 'Title' import edildi. 'Text' kaldırıldı.
const { Option } = Select;
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

// Sabitler
const ALL_CATEGORIES = [
  "Market", "Giyim", "Bağış", "Petrol", "Kira", "Fatura",
  "Eğitim", "Sağlık", "Ulaşım", "Eğlence", "Elektronik",
  "Spor", "Kırtasiye", "Restoran", "Diğer",
];
const MARKETLER = [
  "Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market",
  "Et-Tavuk", "Kaufland", "Rewe", "Netto", "Edeka",
  "Biomarkt", "Penny", "Rossmann", "Diğer",
];

// API Fonksiyonu
const addExpense = async (payload) => {
  const response = await axios.post(`${API_URL}/harcama`, payload);
  return response.data;
};

// Ana Bileşen
const KayitEklemeContent = () => {
  const { refetch } = useTotalsContext();
  const [form] = Form.useForm();
  
  const initialValues = {
    miktar: "",
    kategori: ALL_CATEGORIES[0], 
    altKategori: "",
    not: "",
    tarih: dayjs(),
  };

  // React Query Mutasyonu
  const addExpenseMutation = useMutation({
    mutationFn: addExpense,
    onSuccess: async () => {
      message.success("Harcama kaydı başarıyla eklendi!", 1.5);
      await refetch();
      form.resetFields();
      form.setFieldsValue({ 
        tarih: dayjs(),
        kategori: ALL_CATEGORIES[0] 
      }); 
    },
    onError: (err) => {
      console.error(err.response?.data || err.message);
      message.error("Kayıt eklenirken bir sorun oluştu!", 2);
    },
  });

  const onFinish = (values) => {
    let payload = { ...values };
    payload.miktar = Number(values.miktar.toString().replace(",", "."));
    payload.createdAt = values.tarih.toISOString();

    if (payload.kategori !== "Market" || !payload.altKategori) {
      delete payload.altKategori;
    }
    
    delete payload.tarih;

    addExpenseMutation.mutate(payload);
  };
  
  const handleCategoryChange = (value) => {
    form.setFieldsValue({
        kategori: value,
        altKategori: "",
    });
  };

  // Mobil Zoom ve Font Düzeltmesi
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
      document.head.removeChild(style);
    };
  }, []);


  return (
    <div className="p-4 pt-8 md:p-6 lg:p-8 pb-20 bg-gray-50 min-h-full"> 
      <Title 
        level={3} 
        className="text-center font-extrabold text-blue-600 mb-8 flex items-center justify-center"
      >
        <DollarCircleOutlined className="mr-2 text-2xl" /> Yeni Harcama Kaydı
      </Title>

      <Card 
        className="shadow-2xl rounded-2xl border-t-4 border-blue-500 hover:shadow-blue-300/50 transition-shadow duration-300"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
          scrollToFirstError
        >
          {/* 1. Miktar Alanı */}
          <Form.Item
            name="miktar"
            label={
              <Space className="font-semibold text-gray-700">
                <DollarCircleOutlined className="text-green-500" /> Miktar (₺)
              </Space>
            }
            rules={[
              { required: true, message: "Miktar boş bırakılamaz!" },
              { pattern: /^\d+(?:[.,]\d{1,2})?$/, message: "Geçerli format: 100.00 veya 100,00" },
            ]}
          >
            <Input
              inputMode="decimal"
              placeholder="Örn: 150.75"
              size="large"
              prefix="₺"
              className="rounded-lg shadow-sm border-2 border-gray-200 focus:border-blue-500"
            />
          </Form.Item>

          {/* 2. Kategori Alanı */}
          <Form.Item
            name="kategori"
            label={
              <Space className="font-semibold text-gray-700">
                <TagOutlined className="text-orange-500" /> Kategori
              </Space>
            }
            rules={[{ required: true, message: "Lütfen bir kategori seçin!" }]}
          >
            <Select
              style={{ width: "100%" }}
              placeholder="Kategori seçin"
              size="large"
              onChange={handleCategoryChange}
              className="rounded-lg shadow-sm"
            >
              {ALL_CATEGORIES.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* 3. Alt Kategori (Market) Alanı - Koşullu */}
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.kategori !== currentValues.kategori}
          >
            {({ getFieldValue }) =>
              getFieldValue("kategori") === "Market" ? (
                <div className="mt-[-8px] mb-4">
                  <Form.Item
                    name="altKategori"
                    label={
                      <Space className="font-semibold text-gray-700">
                        <ShopOutlined className="text-purple-500" /> Market Seçimi
                      </Space>
                    }
                  >
                    <Select
                      style={{ width: "100%" }}
                      placeholder="Market/Mağaza Adı (isteğe bağlı)"
                      size="large"
                      allowClear
                      className="rounded-lg shadow-sm"
                    >
                      {MARKETLER.map((m) => (
                        <Option key={m} value={m}>
                          {m}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              ) : null
            }
          </Form.Item>

          {/* 4. Tarih Alanı */}
          <Form.Item
            name="tarih"
            label={
              <Space className="font-semibold text-gray-700">
                <CalendarOutlined className="text-blue-500" /> Tarih
              </Space>
            }
            rules={[{ required: true, message: "Tarih seçimi zorunludur!" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Tarih seçin"
              format="DD.MM.YYYY"
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              size="large"
              className="rounded-lg shadow-sm border-2 border-gray-200 focus:border-blue-500"
            />
          </Form.Item>

          {/* 5. Not Alanı */}
          <Form.Item
            name="not"
            label={
              <Space className="font-semibold text-gray-700">
                <EditOutlined className="text-gray-500" /> Not
              </Space>
            }
            className="mb-8"
          >
            <Input.TextArea
              rows={2}
              placeholder="Ek notlar (ürünler, detaylar vb.)"
              className="rounded-lg shadow-sm border-2 border-gray-200 focus:border-blue-500"
            />
          </Form.Item>

          {/* Kaydet Butonu */}
          <Form.Item className="m-0">
            <Button
              type="primary"
              block
              icon={<CheckCircleOutlined />}
              htmlType="submit"
              loading={addExpenseMutation.isPending}
              size="large"
              className="h-12 text-lg font-bold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-shadow duration-300 bg-blue-500 hover:bg-blue-600 border-none"
            >
              {addExpenseMutation.isPending ? "Kaydediliyor..." : "Harcamayı Kaydet"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

// ---
// Ana Kayıt Ekleme Bileşeni (Alt Boşluk Giderildi)
// ---

const KayitEkleme = () => (
  <div className="flex flex-col min-h-screen bg-gray-50 relative"> 
    <main className="flex-grow pb-16">
      <KayitEklemeContent />
    </main>
    {/* BottomNav'ı ekranın altına sabitliyoruz */}
    <div className="fixed bottom-0 left-0 right-0 z-10 shadow-t-xl">
        <BottomNav />
    </div>
  </div>
);

export default KayitEkleme;