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

import dayjs from "dayjs";
import CustomDayPicker from "../Forms/CustomDayPicker";

import {
  Shirt,
  Wallet,
  Fuel,
  Home,
  ReceiptText,
  BookOpen,
  HeartPulse,
  Car,
  Gift,
  Laptop,
  Zap,
  ShoppingCart,
  PartyPopper,
  Utensils,
  HelpCircle,
  Users,
  MessageCircle,
} from "lucide-react";

import axios from "axios";
import { useTotalsContext } from "../../context/TotalsContext";
import { useMutation } from "@tanstack/react-query";

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";
const { Text } = Typography;
const { Option } = Select;

const CategoryIcons = {
  Market: { icon: ShoppingCart, color: "text-teal-500", bgColor: "bg-teal-100" },
  Giyim: { icon: Shirt, color: "text-red-500", bgColor: "bg-red-100" },
  Tasarruf: { icon: Wallet, color: "text-pink-500", bgColor: "bg-pink-100" }, // Domuz yerine Cüzdan eklendi
  Petrol: { icon: Fuel, color: "text-amber-500", bgColor: "bg-amber-100" },
  Kira: { icon: Home, color: "text-purple-500", bgColor: "bg-purple-100" },
  Fatura: { icon: ReceiptText, color: "text-indigo-500", bgColor: "bg-indigo-100" },
  Eğitim: { icon: BookOpen, color: "text-lime-600", bgColor: "bg-lime-100" },
  Sağlık: { icon: HeartPulse, color: "text-emerald-500", bgColor: "bg-emerald-100" },
  Ulaşım: { icon: Car, color: "text-sky-500", bgColor: "bg-sky-100" },
  Eğlence: { icon: PartyPopper, color: "text-yellow-500", bgColor: "bg-yellow-100" }, // Daha uygun bir ikon
  Elektronik: { icon: Laptop, color: "text-gray-500", bgColor: "bg-gray-100" },
  İletisim: { icon: Zap, color: "text-blue-500", bgColor: "bg-blue-100" },
  Hediye: { icon: Gift, color: "text-cyan-500", bgColor: "bg-cyan-100" }, // Kalem yerine Hediye Paketi
  Restoran: { icon: Utensils, color: "text-orange-500", bgColor: "bg-orange-100" },
  Aile: { icon: Users, color: "text-green-600", bgColor: "bg-green-100" },
  Diğer: { icon: HelpCircle, color: "text-neutral-400", bgColor: "bg-neutral-100" },
};

const CATEGORIES = Object.keys(CategoryIcons);

const MARKETLER = [
  "Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", 
  "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", 
  "Biomarkt", "Penny", "Diğer",
];

const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ayşe", "Yusuf", "Zeynep"];

const MainContent = ({ radius = 40, center = 50 }) => {
  const { refetch, harcamalar = [] } = useTotalsContext();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isGelirModalVisible, setIsGelirModalVisible] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const [form] = Form.useForm();
  const [gelirForm] = Form.useForm();
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);
  const wheelRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  const harcamaMutation = useMutation({
    mutationFn: async (harcamaData) =>
      axios.post(`${API_URL}/harcama`, harcamaData),
    onSuccess: async () => {
      message.success("Harcama eklendi!");
      await refetch();
      handleModalCancel();
    },
    onError: () => message.error("Harcama eklenirken hata oluştu."),
  });

  const gelirMutation = useMutation({
    mutationFn: async (gelirData) => axios.post(`${API_URL}/gelir`, gelirData),
    onSuccess: async () => {
      message.success("Gelir eklendi!");
      await refetch();
      handleGelirCancel();
    },
    onError: () => message.error("Gelir eklenirken hata oluştu."),
  });

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
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const topIndex =
      (Math.round(-normalizedRotation / categoryAngle) + CATEGORIES.length) %
      CATEGORIES.length;
    return CATEGORIES[topIndex];
  }, [rotation]);

  const currentTopCategory = getTopCategory();
  const currentCategoryTotal = monthlyCategoryTotals[currentTopCategory] || 0;
  const formattedTotal = (currentCategoryTotal ?? 0).toFixed(2).replace(".", ",");

  const getAngle = (centerX, centerY, pointX, pointY) =>
    Math.atan2(pointY - centerY, pointX - centerX) * (180 / Math.PI);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = wheelRef.current.getBoundingClientRect();
    setLastAngle(getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY));
  };

  const handleMouseMove = useCallback((e) => {
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
  }, [isDragging, lastAngle]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setLastAngle(getAngle(centerX, centerY, touch.clientX, touch.clientY));
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10 || isDragging) {
      e.preventDefault();
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
  }, [isDragging, lastAngle]);

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  React.useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;
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

  const handleIconClick = (category) => {
    if (isDragging) return;
    setSelectedCategory(category);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ tarih: dayjs().toDate() });
    setShowNote(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedCategory(null);
    form.resetFields();
    setShowNote(false);
  };

  const handleGelirClick = () => {
    setIsGelirModalVisible(true);
    gelirForm.resetFields();
    gelirForm.setFieldsValue({ tarih: dayjs().toDate() });
  };

  const handleGelirCancel = () => {
    setIsGelirModalVisible(false);
    gelirForm.resetFields();
  };

  const onHarcamaFinish = (values) => {
    const selectedDate = values.tarih ? dayjs(values.tarih).toISOString() : new Date().toISOString();
    let altKategoriValue = (needsSubCategory) ? values.altKategori : "";

    const harcamaData = {
      miktar: values.miktar,
      kategori: selectedCategory || "Diğer",
      altKategori: altKategoriValue,
      not: values.not || "",
      createdAt: selectedDate,
    };
    harcamaMutation.mutate(harcamaData);
  };

  const onGelirFinish = (values) => {
    const selectedDate = values.tarih ? dayjs(values.tarih).toISOString() : new Date().toISOString();
    const gelirData = {
      miktar: values.miktar,
      kategori: values.kategori || "Gelir",
      not: values.not || "",
      createdAt: selectedDate,
    };
    gelirMutation.mutate(gelirData);
  };

  const getSubCategoryProps = (category) => {
    switch (category) {
      case "Market": return { label: "Market Seç", placeholder: "Market seçin", options: MARKETLER };
      case "Giyim": return { label: "Kişi Seç", placeholder: "Kişi seçin", options: GIYIM_KISILERI };
      case "Aile": return { label: "Aile Üyesi Seç", placeholder: "Aile üyesi seçin", options: AILE_UYELERI };
      default: return { label: "", placeholder: "", options: [] };
    }
  };

  const needsSubCategory = ["Market", "Giyim", "Aile"].includes(selectedCategory);
  const subCategoryProps = getSubCategoryProps(selectedCategory);

  return (
    <main className="flex-1 px-4 pt-4 pb-4">
      <div className="text-center mb-6 pt-4">
        <div className="text-blue-600 font-bold text-xl leading-snug">{currentTopCategory}</div>
        <div className="text-gray-700 font-semibold text-base mt-1">{formattedTotal} €</div>
      </div>

      <div className="relative flex items-center justify-center h-80 w-80 mx-auto my-6">
        <div onClick={handleGelirClick} className="w-32 h-32 rounded-full bg-indigo-600 text-white flex flex-col items-center justify-center shadow-lg cursor-pointer hover:scale-[1.05] z-20 transition-all">
          <Text className="!text-white font-bold text-lg">Gelir Ekle</Text>
        </div>

        <div ref={wheelRef} className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
          style={{ transform: `rotate(${rotation}deg)`, transition: isDragging ? "none" : "transform 0.3s ease-out" }}
          onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}
        >
          {CATEGORIES.map((category, i) => {
            const angle = (360 / CATEGORIES.length) * i - 90;
            const rad = (angle * Math.PI) / 180;
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad);
            const isTop = category === currentTopCategory;
            const { icon: Icon, color, bgColor } = CategoryIcons[category];

            return (
              <Tooltip key={category} title={category} placement="top">
                <button onClick={() => handleIconClick(category)}
                  className={`absolute w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                    isTop ? "bg-blue-600 text-white scale-150 ring-4 ring-blue-300 border-2 border-white z-10" : `${bgColor} ${color} hover:${bgColor.replace("100", "200")}`
                  }`}
                  style={{ top: `${center + y}%`, left: `${center + x}%`, transform: `translate(-50%, -50%) rotate(${-rotation}deg)` }}
                >
                  <Icon className={isTop ? "w-6 h-6 text-white" : "w-5 h-5"} />
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <Modal title={<div className="text-2xl font-bold text-blue-700">{selectedCategory || "Harcama"} Ekle</div>}
        open={isModalVisible} onCancel={handleModalCancel} footer={null} centered className="modern-modal"
      >
        <Form form={form} layout="vertical" onFinish={onHarcamaFinish} initialValues={{ tarih: dayjs().toDate() }} className="space-y-4">
          
          <Form.Item name="tarih" label={<span className="font-semibold text-gray-700">Tarih</span>} rules={[{ required: true, message: "Tarih gerekli" }]}>
            <CustomDayPicker disabledDate={(current) => current && current.isAfter(dayjs(), "day")} isIncome={false} />
          </Form.Item>

          <Form.Item name="miktar" label={<span className="font-semibold text-gray-700">Miktar (€)</span>} rules={[{ required: true, message: "Miktar gerekli" }]}>
            <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} inputMode="decimal"
              formatter={(value) => `${value} €`.replace(".", ",")}
              parser={(value) => value.replace(" €", "").replace(",", ".")}
              className="rounded-lg shadow-sm"
            />
          </Form.Item>

          {needsSubCategory && (
            <Form.Item name="altKategori" label={<span className="font-semibold text-gray-700">{subCategoryProps.label}</span>} rules={[{ required: true, message: "Seçim zorunludur" }]}>
              <Select placeholder={subCategoryProps.placeholder} className="rounded-lg shadow-sm">
                {subCategoryProps.options.map((item) => <Option key={item} value={item}>{item}</Option>)}
              </Select>
            </Form.Item>
          )}
          
          <div className="mt-2">
            {!showNote && (
              <Button type="dashed" onClick={() => setShowNote(true)} icon={<MessageCircle className="w-4 h-4" />} block className="text-gray-600 border-gray-300">
                Not Ekle (İsteğe Bağlı)
              </Button>
            )}

            {showNote && (
              <Form.Item name="not" label={
                  <span className="font-semibold text-gray-700 flex justify-between items-center w-full">
                    Not
                    <Button type="text" size="small" onClick={() => { form.setFieldsValue({ not: "" }); setShowNote(false); }} className="text-red-500">Kapat</Button>
                  </span>
                }
              >
                <Input.TextArea rows={3} placeholder="Açıklama ekle" className="rounded-lg shadow-sm" />
              </Form.Item>
            )}
          </div>

          <Button type="primary" htmlType="submit" block loading={harcamaMutation.isPending} className="mt-6 h-12 text-lg font-bold bg-blue-600 rounded-lg">Kaydet</Button>
        </Form>
      </Modal>

      <Modal title={<div className="text-2xl font-bold text-indigo-700">Gelir Ekle</div>}
        open={isGelirModalVisible} onCancel={handleGelirCancel} footer={null} centered className="modern-modal"
      >
        <Form form={gelirForm} layout="vertical" onFinish={onGelirFinish} initialValues={{ tarih: dayjs().toDate() }} className="space-y-4">
          <Form.Item name="tarih" label={<span className="font-semibold text-gray-700">Tarih</span>} rules={[{ required: true, message: "Tarih gerekli" }]}>
            <CustomDayPicker disabledDate={(current) => current && current.isAfter(dayjs(), "day")} isIncome={true} />
          </Form.Item>

          <Form.Item name="miktar" label={<span className="font-semibold text-gray-700">Miktar (€)</span>} rules={[{ required: true, message: "Miktar gerekli" }]}>
            <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} inputMode="decimal"
              formatter={(value) => `${value} €`.replace(".", ",")}
              parser={(value) => value.replace(" €", "").replace(",", ".")}
              className="rounded-lg shadow-sm"
            />
          </Form.Item>

          <Form.Item name="kategori" label={<span className="font-semibold text-gray-700">Gelir Türü</span>}>
            <Select placeholder="Gelir türü seçin" className="rounded-lg shadow-sm">
              <Option value="gelir">Gelir</Option>
              <Option value="tasarruf">Tasarruf</Option>
              <Option value="diğer">Diğer</Option>
            </Select>
          </Form.Item>

          <Form.Item name="not" label={<span className="font-semibold text-gray-700">Not</span>}>
            <Input.TextArea rows={3} placeholder="Açıklama ekle" className="rounded-lg shadow-sm" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={gelirMutation.isPending} className="mt-6 h-12 text-lg font-bold bg-indigo-600 rounded-lg">Kaydet</Button>
        </Form>
      </Modal>
    </main>
  );
};

export default MainContent;