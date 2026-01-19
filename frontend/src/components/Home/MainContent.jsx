import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  Typography,
  Modal,
  Form,
  Input,
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
  Delete,
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
  Tasarruf: { icon: Wallet, color: "text-pink-500", bgColor: "bg-pink-100" },
  Petrol: { icon: Fuel, color: "text-amber-500", bgColor: "bg-amber-100" },
  Kira: { icon: Home, color: "text-purple-500", bgColor: "bg-purple-100" },
  Fatura: { icon: ReceiptText, color: "text-indigo-500", bgColor: "bg-indigo-100" },
  Eğitim: { icon: BookOpen, color: "text-lime-600", bgColor: "bg-lime-100" },
  Sağlık: { icon: HeartPulse, color: "text-emerald-500", bgColor: "bg-emerald-100" },
  Ulaşım: { icon: Car, color: "text-sky-500", bgColor: "bg-sky-100" },
  Eğlence: { icon: PartyPopper, color: "text-yellow-500", bgColor: "bg-yellow-100" },
  Elektronik: { icon: Laptop, color: "text-gray-500", bgColor: "bg-gray-100" },
  İletisim: { icon: Zap, color: "text-blue-500", bgColor: "bg-blue-100" },
  Hediye: { icon: Gift, color: "text-cyan-500", bgColor: "bg-cyan-100" },
  Restoran: { icon: Utensils, color: "text-orange-500", bgColor: "bg-orange-100" },
  Aile: { icon: Users, color: "text-green-600", bgColor: "bg-green-100" },
  Diğer: { icon: HelpCircle, color: "text-neutral-400", bgColor: "bg-neutral-100" },
};

const CATEGORIES = Object.keys(CategoryIcons);
const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", "Biomarkt", "Penny", "Diğer"];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ayşe", "Yusuf", "Zeynep"];

const NumericNumpad = ({ value, onChange }) => {
  const handlePress = (val) => {
    let newValue = value.toString();
    if (val === "back") {
      newValue = newValue.slice(0, -1);
    } else if (val === ",") {
      if (!newValue.includes(",")) {
        newValue = newValue === "" ? "0," : newValue + ",";
      }
    } else {
      if (newValue === "0") newValue = val;
      else newValue += val;
    }
    onChange(newValue);
  };

  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "back"].map((key) => (
        <Button
          key={key}
          onClick={() => handlePress(key)}
          className={`h-14 text-xl font-semibold flex items-center justify-center rounded-xl border-none shadow-sm transition-all active:scale-95 ${
            key === "back" ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-700"
          }`}
        >
          {key === "back" ? <Delete size={24} /> : key}
        </Button>
      ))}
    </div>
  );
};

const MainContent = ({ radius = 40, center = 50 }) => {
  const { refetch, harcamalar = [] } = useTotalsContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isGelirModalVisible, setIsGelirModalVisible] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [amount, setAmount] = useState("");

  const [form] = Form.useForm();
  const [gelirForm] = Form.useForm();
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);
  const wheelRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  const harcamaMutation = useMutation({
    mutationFn: (data) => axios.post(`${API_URL}/harcama`, data),
    onSuccess: async () => {
      message.success("Harcama eklendi!");
      await refetch();
      handleModalCancel();
    },
    onError: () => message.error("Harcama eklenirken hata oluştu."),
  });

  const gelirMutation = useMutation({
    mutationFn: (data) => axios.post(`${API_URL}/gelir`, data),
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
    return (harcamalar ?? []).reduce((acc, h) => {
      if (h?.createdAt?.startsWith(currentMonth)) {
        const m = Number(h.miktar || 0);
        if (h.kategori) acc[h.kategori] = (acc[h.kategori] || 0) + m;
      }
      return acc;
    }, {});
  }, [harcamalar]);

  const getTopCategory = useCallback(() => {
    const angle = 360 / CATEGORIES.length;
    const normalized = ((rotation % 360) + 360) % 360;
    return CATEGORIES[(Math.round(-normalized / angle) + CATEGORIES.length) % CATEGORIES.length];
  }, [rotation]);

  const currentTopCategory = getTopCategory();
  const currentCategoryTotal = monthlyCategoryTotals[currentTopCategory] || 0;
  const formattedTotal = currentCategoryTotal.toFixed(2).replace(".", ",");

  const getAngle = (cX, cY, pX, pY) => Math.atan2(pY - cY, pX - cX) * (180 / Math.PI);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = wheelRef.current.getBoundingClientRect();
    setLastAngle(getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY));
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const angle = getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY);
    let delta = angle - lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    setRotation((p) => p + delta);
    setLastAngle(angle);
  }, [isDragging, lastAngle]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    const rect = wheelRef.current.getBoundingClientRect();
    setLastAngle(getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, t.clientX, t.clientY));
    touchStartPos.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchMove = useCallback((e) => {
    const t = e.touches[0];
    const dx = t.clientX - touchStartPos.current.x;
    const dy = t.clientY - touchStartPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10 || isDragging) {
      if (e.cancelable) e.preventDefault();
      if (!isDragging) setIsDragging(true);
      const rect = wheelRef.current.getBoundingClientRect();
      const angle = getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, t.clientX, t.clientY);
      let delta = angle - lastAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      setRotation((p) => p + delta);
      setLastAngle(angle);
    }
  }, [isDragging, lastAngle]);

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
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
    setAmount("");
    form.resetFields();
    form.setFieldsValue({ tarih: dayjs().toDate() });
    setShowNote(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedCategory(null);
    setAmount("");
    form.resetFields();
    setShowNote(false);
  };

  const handleGelirClick = () => {
    setIsGelirModalVisible(true);
    setAmount("");
    gelirForm.resetFields();
    gelirForm.setFieldsValue({ tarih: dayjs().toDate(), kategori: "gelir" });
  };

  const handleGelirCancel = () => {
    setIsGelirModalVisible(false);
    setAmount("");
    gelirForm.resetFields();
  };

  const onHarcamaFinish = (values) => {
    const num = parseFloat(amount.replace(",", "."));
    if (isNaN(num) || num <= 0) return message.warning("Miktar girin.");

    harcamaMutation.mutate({
      miktar: num,
      kategori: selectedCategory || "Diğer",
      altKategori: ["Market", "Giyim", "Aile"].includes(selectedCategory) ? values.altKategori : "",
      not: values.not || "",
      createdAt: values.tarih ? dayjs(values.tarih).toISOString() : new Date().toISOString(),
    });
  };

  const onGelirFinish = (values) => {
    const num = parseFloat(amount.replace(",", "."));
    if (isNaN(num) || num <= 0) return message.warning("Miktar girin.");

    gelirMutation.mutate({
      miktar: num,
      kategori: values.kategori || "gelir",
      not: values.not || "",
      createdAt: values.tarih ? dayjs(values.tarih).toISOString() : new Date().toISOString(),
    });
  };

  return (
    <main className="flex-1 px-4 pt-4 pb-4">
      <div className="text-center mb-6 pt-4">
        <div className="text-blue-600 font-bold text-xl">{currentTopCategory}</div>
        <div className="text-gray-700 font-semibold text-base mt-1">{formattedTotal} €</div>
      </div>

      <div className="relative flex items-center justify-center h-80 w-80 mx-auto my-6">
        <div onClick={handleGelirClick} className="w-32 h-32 rounded-full bg-indigo-600 text-white flex flex-col items-center justify-center shadow-lg cursor-pointer hover:scale-105 z-20 transition-all">
          <Text className="!text-white font-bold text-lg">Gelir Ekle</Text>
        </div>

        <div ref={wheelRef} className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
          style={{ transform: `rotate(${rotation}deg)`, transition: isDragging ? "none" : "transform 0.3s ease-out" }}
          onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}
        >
          {CATEGORIES.map((cat, i) => {
            const ang = (360 / CATEGORIES.length) * i - 90;
            const r = (ang * Math.PI) / 180;
            const x = radius * Math.cos(r);
            const y = radius * Math.sin(r);
            const isTop = cat === currentTopCategory;
            const { icon: Icon, color, bgColor } = CategoryIcons[cat];

            return (
              <button key={cat} onClick={() => handleIconClick(cat)}
                className={`absolute w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                  isTop ? "bg-blue-600 text-white scale-150 ring-4 ring-blue-300 border-2 border-white z-10" : `${bgColor} ${color}`
                }`}
                style={{ top: `${center + y}%`, left: `${center + x}%`, transform: `translate(-50%, -50%) rotate(${-rotation}deg)` }}
              >
                <Icon className={isTop ? "w-6 h-6" : "w-5 h-5"} />
              </button>
            );
          })}
        </div>
      </div>

      <Modal 
        title={<div className="text-xl font-bold text-blue-700">{selectedCategory}</div>}
        open={isModalVisible} onCancel={handleModalCancel} footer={null} centered width={400}
      >
        <div className="bg-gray-50 p-4 rounded-2xl mb-4 text-center border border-gray-200">
          <div className="text-4xl font-black text-blue-600">{amount || "0"}<span className="text-2xl ml-1">€</span></div>
        </div>
        <Form form={form} layout="vertical" onFinish={onHarcamaFinish}>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="tarih" label="Tarih" className="mb-2">
              <CustomDayPicker />
            </Form.Item>
            {["Market", "Giyim", "Aile"].includes(selectedCategory) && (
              <Form.Item name="altKategori" label="Alt Kategori" rules={[{ required: true, message: "Seç" }]} className="mb-2">
                <Select placeholder="Seç">
                  {(selectedCategory === "Market" ? MARKETLER : selectedCategory === "Giyim" ? GIYIM_KISILERI : AILE_UYELERI).map(i => <Option key={i} value={i}>{i}</Option>)}
                </Select>
              </Form.Item>
            )}
          </div>
          <NumericNumpad value={amount} onChange={setAmount} />
          {showNote ? (
            <Form.Item name="not" label="Not" className="mt-4">
              <Input.TextArea rows={2} placeholder="Açıklama..." />
            </Form.Item>
          ) : (
            <Button type="text" onClick={() => setShowNote(true)} icon={<MessageCircle size={16} />} className="w-full mt-2 text-gray-400">Not Ekle</Button>
          )}
          <Button type="primary" htmlType="submit" block loading={harcamaMutation.isPending} className="mt-6 h-14 text-lg font-bold bg-blue-600 rounded-xl">Kaydet</Button>
        </Form>
      </Modal>

      <Modal 
        title={<div className="text-xl font-bold text-indigo-700">Gelir Ekle</div>}
        open={isGelirModalVisible} onCancel={handleGelirCancel} footer={null} centered width={400}
      >
        <div className="bg-indigo-50 p-4 rounded-2xl mb-4 text-center border border-indigo-100">
          <div className="text-4xl font-black text-indigo-600">{amount || "0"}<span className="text-2xl ml-1">€</span></div>
        </div>
        <Form form={gelirForm} layout="vertical" onFinish={onGelirFinish}>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="tarih" label="Tarih" className="mb-2">
              <CustomDayPicker isIncome={true} />
            </Form.Item>
            <Form.Item name="kategori" label="Tür" className="mb-2">
              <Select>
                <Option value="gelir">Gelir</Option>
                <Option value="tasarruf">Tasarruf</Option>
                <Option value="diğer">Diğer</Option>
              </Select>
            </Form.Item>
          </div>
          <NumericNumpad value={amount} onChange={setAmount} />
          <Form.Item name="not" label="Not" className="mt-4">
            <Input placeholder="Not ekle..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={gelirMutation.isPending} className="mt-6 h-14 text-lg font-bold bg-indigo-600 rounded-xl">Kaydet</Button>
        </Form>
      </Modal>
    </main>
  );
};

export default MainContent;