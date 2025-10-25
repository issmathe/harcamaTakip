import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Typography,
  Tooltip,
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Select,
} from "antd";

// Hata veren 'GasStation' yerine 'Fuel' kullanıldı.
// 'MedicineBoxOutlined' karşılığı olarak estetik durması için 'HeartPulse' kullanıldı.
import {
  Shirt,
  HeartHandshake,
  Fuel, // DÜZELTİLDİ: Petrol için GasStation yerine Fuel
  Home,
  ReceiptText,
  BookOpen,
  HeartPulse, // Sağlık için daha estetik bir seçim
  Car,
  Gift,
  Laptop,
  Zap,
  ShoppingCart,
  Pencil, // Kırtasiye için Pencil, BookOpen da uygun, ikisi de mevcut.
  Utensils,
  HelpCircle,
} from "lucide-react";

import axios from "axios";
import { useTotalsContext } from "../../context/TotalsContext";
import { useMutation } from "@tanstack/react-query";

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";
const { Text } = Typography;
const { Option } = Select;

// Modern ve renkli ikonlar ve Tailwind sınıfları
const CategoryIcons = {
  Giyim: { icon: Shirt, color: "text-red-500", bgColor: "bg-red-100" },
  Bağış: { icon: HeartHandshake, color: "text-pink-500", bgColor: "bg-pink-100" },
  Petrol: { icon: Fuel, color: "text-amber-500", bgColor: "bg-amber-100" }, // Fuel ikonu
  Kira: { icon: Home, color: "text-purple-500", bgColor: "bg-purple-100" },
  Fatura: { icon: ReceiptText, color: "text-indigo-500", bgColor: "bg-indigo-100" },
  Eğitim: { icon: BookOpen, color: "text-lime-600", bgColor: "bg-lime-100" },
  Sağlık: { icon: HeartPulse, color: "text-emerald-500", bgColor: "bg-emerald-100" }, // HeartPulse ikonu
  Ulaşım: { icon: Car, color: "text-sky-500", bgColor: "bg-sky-100" },
  Eğlence: { icon: Gift, color: "text-yellow-500", bgColor: "bg-yellow-100" },
  Elektronik: { icon: Laptop, color: "text-gray-500", bgColor: "bg-gray-100" },
  Spor: { icon: Zap, color: "text-blue-500", bgColor: "bg-blue-100" },
  Market: { icon: ShoppingCart, color: "text-teal-500", bgColor: "bg-teal-100" },
  Kırtasiye: { icon: Pencil, color: "text-cyan-500", bgColor: "bg-cyan-100" },
  "Restoran / Kafe": { icon: Utensils, color: "text-orange-500", bgColor: "bg-orange-100" },
  Diğer: { icon: HelpCircle, color: "text-neutral-400", bgColor: "bg-neutral-100" },
};

const CATEGORIES = Object.keys(CategoryIcons);

const MARKETLER = [
  "Lidl",
  "Rewe",
  "Aldi",
  "Netto",
  "DM",
  "Kaufland",
  "Norma",
  "Edeka",
  "Tegut",
  "Hit",
  "Famila",
  "Nahkauf",
  "Biomarkt",
  "Penny",
  "Rossmann",
  "Real",
  "Diğer",
];

const MainContent = ({ radius = 40, center = 50 }) => {
  const { fetchTotals, harcamalar = [] } = useTotalsContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState("");
  const [isGelirModalVisible, setIsGelirModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [gelirForm] = Form.useForm();
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);
  const wheelRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  // --- Mutasyonlar ---

  const harcamaMutation = useMutation({
    mutationFn: async (harcamaData) => axios.post(`${API_URL}/harcama`, harcamaData),
    onSuccess: async () => {
      message.success("Harcama eklendi!");
      await fetchTotals();
      handleModalCancel();
    },
    onError: () => message.error("Harcama eklenirken hata oluştu."),
  });

  const gelirMutation = useMutation({
    mutationFn: async (gelirData) => axios.post(`${API_URL}/gelir`, gelirData),
    onSuccess: async () => {
      message.success("Gelir eklendi!");
      await fetchTotals();
      handleGelirCancel();
    },
    onError: () => message.error("Gelir eklenirken hata oluştu."),
  });

  // --- Yardımcı Fonksiyonlar ---

  const getCurrentMonthYear = () => new Date().toISOString().slice(0, 7);

  const monthlyCategoryTotals = useMemo(() => {
    const currentMonth = getCurrentMonthYear();
    return (harcamalar ?? []).reduce((acc, harcama) => {
      if (harcama?.createdAt?.startsWith(currentMonth)) {
        const kategori = harcama.kategori;
        const miktar = Number(harcama.miktar || 0);
        if (kategori) acc[kategori] = (acc[kategori] || 0) + miktar;
      }
      return acc;
    }, {});
  }, [harcamalar]);

  const getTopCategory = useCallback(() => {
    const categoryAngle = 360 / CATEGORIES.length;
    // Normalized rotation to be between 0 and 360
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    // Calculate which category is at the top (0 degrees, assuming the first icon starts at -90 degrees)
    const topIndex =
      (Math.round(-normalizedRotation / categoryAngle) + CATEGORIES.length) %
      CATEGORIES.length;
    return CATEGORIES[topIndex];
  }, [rotation]);

  const currentTopCategory = getTopCategory();
  const currentCategoryTotal = monthlyCategoryTotals[currentTopCategory] || 0;
  // Para birimini Euro (€) olarak tutuyorum.
  const formattedTotal = (currentCategoryTotal ?? 0).toFixed(2).replace(".", ",");

  // --- Çark Döndürme Mantığı ---

  const getAngle = (centerX, centerY, pointX, pointY) =>
    Math.atan2(pointY - centerY, pointX - centerX) * (180 / Math.PI);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = wheelRef.current.getBoundingClientRect();
    setLastAngle(
      getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY)
    );
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const rect = wheelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = getAngle(centerX, centerY, e.clientX, e.clientY);
      let deltaAngle = angle - lastAngle;
      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;
      setRotation((prev) => prev + deltaAngle);
      setLastAngle(angle);
    },
    [isDragging, lastAngle]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setLastAngle(getAngle(centerX, centerY, touch.clientX, touch.clientY));
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = useCallback(
    (e) => {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartPos.current.x;
      const dy = touch.clientY - touchStartPos.current.y;
      // Check if touch moved enough to start drag or if already dragging
      if (Math.sqrt(dx * dx + dy * dy) > 10 || isDragging) {
        e.preventDefault(); // Prevent scrolling
        if (!isDragging) setIsDragging(true);

        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = getAngle(centerX, centerY, touch.clientX, touch.clientY);
        let deltaAngle = angle - lastAngle;
        if (deltaAngle > 180) deltaAngle -= 360;
        if (deltaAngle < -180) deltaAngle += 360;
        setRotation((prev) => prev + deltaAngle);
        setLastAngle(angle);
      }
    },
    [isDragging, lastAngle]
  );

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  React.useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    // Event listeners globally for mouse up/move for better dragging experience
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    wheel.addEventListener("touchmove", handleTouchMove, { passive: false });
    wheel.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      wheel.removeEventListener("touchmove", handleTouchMove);
      wheel.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // --- Modal ve Form İşleyicileri ---

  const handleIconClick = (category) => {
    // Only open modal if not dragging
    if (isDragging) return; 
    setSelectedCategory(category);
    setSelectedMarket("");
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedCategory(null);
    setSelectedMarket("");
    form.resetFields();
  };

  const handleGelirClick = () => {
    setIsGelirModalVisible(true);
    gelirForm.resetFields();
  };

  const handleGelirCancel = () => {
    setIsGelirModalVisible(false);
    gelirForm.resetFields();
  };

  const onHarcamaFinish = (values) => {
    const harcamaData = {
      miktar: values.miktar,
      kategori: selectedCategory || "Diğer",
      altKategori: selectedCategory === "Market" ? selectedMarket : "",
      not: values.not || "",
    };
    harcamaMutation.mutate(harcamaData);
  };

  const onGelirFinish = (values) => {
    const gelirData = { miktar: values.miktar, kategori: values.kategori, not: values.not || "" };
    gelirMutation.mutate(gelirData);
  };

  // --- Render ---

  return (
    <main className="flex-1 px-4 pt-4 pb-24">
      <div className="relative flex items-center justify-center h-80 w-80 mx-auto my-6">
        {/* Gelir Ekle Merkezi Butonu */}
        <div
          onClick={handleGelirClick}
          className="w-32 h-32 rounded-full bg-indigo-600 text-white flex flex-col items-center justify-center shadow-lg cursor-pointer hover:scale-[1.05] z-20 transition-all"
        >
          <Text className="!text-white font-bold text-lg">Gelir Ekle</Text>
        </div>

        {/* Üst Kategori ve Toplam Göstergesi */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-24 z-30 w-40 text-center">
          <div className="text-blue-600 font-bold text-xl leading-snug">{currentTopCategory}</div>
          <div className="text-gray-700 font-semibold text-base mt-1">{formattedTotal} €</div>
        </div>
        
        {/* Dönen Çark Alanı */}
        <div
          ref={wheelRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
          // CSS transition to smooth rotation when not dragging
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {CATEGORIES.map((category, i) => {
            const angle = (360 / CATEGORIES.length) * i - 90; // Start at the top (-90 deg)
            const rad = (angle * Math.PI) / 180;
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad);
            const isTop = category === currentTopCategory;
            const { icon: Icon, color, bgColor } = CategoryIcons[category];

            return (
              <Tooltip key={category} title={category} placement="top">
                <button
                  onClick={() => handleIconClick(category)}
                  className={`absolute w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                    isTop
                      ? "bg-blue-600 text-white scale-150 ring-4 ring-blue-300 border-2 border-white z-10"
                      : `${bgColor} ${color} hover:${bgColor.replace('100', '200')}`
                  }`}
                  style={{
                    // Position icons around the circle
                    top: `${center + y}%`, 
                    left: `${center + x}%`,
                    transform: `translate(-50%, -50%) rotate(${-rotation}deg)`, // Counter-rotate the icon
                  }}
                >
                  <Icon 
                    className={isTop ? "w-6 h-6 text-white" : "w-5 h-5"} 
                  />
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Harcama Ekleme Modalı */}
      <Modal
        title={`${selectedCategory || "Harcama"} Harcaması Ekle`}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onHarcamaFinish}>
          <Form.Item
            name="miktar"
            label="Miktar (€)"
            rules={[{ required: true, message: "Miktar gerekli" }]}
          >
            <InputNumber 
                min={0.01} 
                step={0.01} 
                style={{ width: "100%" }} 
                formatter={value => `${value} €`.replace('.', ',')}
                parser={value => value.replace(' €', '').replace(',', '.')}
            />
          </Form.Item>

          {selectedCategory === "Market" && (
            <Form.Item name="altKategori" label="Market Seç" initialValue={selectedMarket}>
              <Select
                placeholder="Market seçin"
                onChange={setSelectedMarket}
              >
                {MARKETLER.map((m) => (
                  <Option key={m} value={m}>
                    {m}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="not" label="Not">
            <Input.TextArea rows={3} placeholder="Açıklama ekle (isteğe bağlı)" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={harcamaMutation.isPending}
            className="mt-4"
          >
            Kaydet
          </Button>
        </Form>
      </Modal>

      {/* Gelir Ekleme Modalı */}
      <Modal
        title="Gelir Ekle"
        open={isGelirModalVisible}
        onCancel={handleGelirCancel}
        footer={null}
      >
        <Form form={gelirForm} layout="vertical" onFinish={onGelirFinish}>
          <Form.Item 
            name="miktar" 
            label="Miktar (€)" 
            rules={[{ required: true, message: "Miktar gerekli" }]}
          >
            <InputNumber 
                min={0.01} 
                step={0.01} 
                style={{ width: "100%" }} 
                formatter={value => `${value} €`.replace('.', ',')}
                parser={value => value.replace(' €', '').replace(',', '.')}
            />
          </Form.Item>
          
          <Form.Item 
            name="kategori" 
            label="Kategori" 
            rules={[{ required: true, message: "Kategori gerekli" }]}
          >
            <Select placeholder="Gelir türü seçin">
              <Option value="maaş">Maaş</Option>
              <Option value="tasarruf">Tasarruf</Option>
              <Option value="diğer">Diğer</Option>
            </Select>
          </Form.Item>

          <Form.Item name="not" label="Not">
            <Input.TextArea rows={3} placeholder="Açıklama ekle (isteğe bağlı)" />
          </Form.Item>
          
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={gelirMutation.isPending}
            className="mt-4"
          >
            Kaydet
          </Button>
        </Form>
      </Modal>
    </main>
  );
};

export default MainContent;