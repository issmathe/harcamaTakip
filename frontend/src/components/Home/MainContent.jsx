import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button, message, Select } from "antd";
import dayjs from "dayjs";
import { 
  ShoppingCart, Shirt, HeartHandshake, Fuel, Home, ReceiptText, 
  BookOpen, HeartPulse, Car, Gift, Laptop, Zap, Pencil, 
  Utensils, Users, ArrowLeftRight, HelpCircle, MessageCircle 
} from "lucide-react";
import axios from "axios";
import { useTotalsContext } from "../../context/TotalsContext";
import { useMutation } from "@tanstack/react-query";
import CustomDayPicker from "../Forms/CustomDayPicker";

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

const CategoryIcons = {
  Market: { icon: ShoppingCart, color: "text-teal-500", bgColor: "bg-teal-100" },
  Giyim: { icon: Shirt, color: "text-red-500", bgColor: "bg-red-100" },
  Bağış: { icon: HeartHandshake, color: "text-pink-500", bgColor: "bg-pink-100" },
  Petrol: { icon: Fuel, color: "text-amber-500", bgColor: "bg-amber-100" },
  Kira: { icon: Home, color: "text-purple-500", bgColor: "bg-purple-100" },
  Fatura: { icon: ReceiptText, color: "text-indigo-500", bgColor: "bg-indigo-100" },
  Eğitim: { icon: BookOpen, color: "text-lime-600", bgColor: "bg-lime-100" },
  Sağlık: { icon: HeartPulse, color: "text-emerald-500", bgColor: "bg-emerald-100" },
  Ulaşım: { icon: Car, color: "text-sky-500", bgColor: "bg-sky-100" },
  Eğlence: { icon: Gift, color: "text-yellow-500", bgColor: "bg-yellow-100" },
  Elektronik: { icon: Laptop, color: "text-gray-500", bgColor: "bg-gray-100" },
  İletisim: { icon: Zap, color: "text-blue-500", bgColor: "bg-blue-100" },
  Hediye: { icon: Pencil, color: "text-cyan-500", bgColor: "bg-cyan-100" },
  Restoran: { icon: Utensils, color: "text-orange-500", bgColor: "bg-orange-100" },
  Aile: { icon: Users, color: "text-green-600", bgColor: "bg-green-100" },
  Transfer: { icon: ArrowLeftRight, color: "text-slate-600", bgColor: "bg-slate-200" },
  Diğer: { icon: HelpCircle, color: "text-neutral-400", bgColor: "bg-neutral-100" },
};

const CATEGORIES = Object.keys(CategoryIcons);
const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Kaufland", "Rewe", "Edeka", "Diğer"];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep"];

const MainContent = ({ radius = 40, center = 50 }) => {
  const { refetch, harcamalar = [] } = useTotalsContext();
  const [form] = Form.useForm();
  const [gelirForm] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isGelirModalVisible, setIsGelirModalVisible] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [rotation, setRotation] = useState(0);

  const wheelRef = useRef(null);
  const isDragging = useRef(false);
  const lastAngle = useRef(0);

  const harcamaMutation = useMutation({
    mutationFn: (data) => axios.post(`${API_URL}/harcama`, data),
    onSuccess: () => { 
      message.success("İşlem kaydedildi"); 
      refetch(); 
      setIsModalVisible(false); 
      form.resetFields();
      setShowNote(false);
    }
  });

  const gelirMutation = useMutation({
    mutationFn: (data) => axios.post(`${API_URL}/gelir`, data),
    onSuccess: () => { 
      message.success("Gelir eklendi"); 
      refetch(); 
      setIsGelirModalVisible(false); 
      gelirForm.resetFields(); 
    }
  });

  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const monthlyCategoryTotals = useMemo(() => {
    return (harcamalar ?? []).reduce((acc, h) => {
      if (h?.createdAt?.startsWith(currentMonth)) {
        acc[h.kategori] = (acc[h.kategori] || 0) + Number(h.miktar || 0);
      }
      return acc;
    }, {});
  }, [harcamalar, currentMonth]);

  const currentTopCategory = useMemo(() => {
    const categoryAngle = 360 / CATEGORIES.length;
    const normalized = ((rotation % 360) + 360) % 360;
    const idx = (Math.round(-normalized / categoryAngle) + CATEGORIES.length) % CATEGORIES.length;
    return CATEGORIES[idx];
  }, [rotation]);

  const getAngle = (e, rect) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return Math.atan2(clientY - (rect.top + rect.height / 2), clientX - (rect.left + rect.width / 2)) * (180 / Math.PI);
  };

  const onMove = useCallback((e) => {
    if (!isDragging.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const angle = getAngle(e, rect);
    let delta = angle - lastAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    setRotation(prev => prev + delta);
    lastAngle.current = angle;
  }, []);

  useEffect(() => {
    const handleUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [onMove]);

  const startDrag = (e) => {
    isDragging.current = true;
    lastAngle.current = getAngle(e, wheelRef.current.getBoundingClientRect());
  };

  const handleIconClick = (cat) => {
    setSelectedCategory(cat);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ tarih: dayjs() });
  };

  const needsSub = ["Market", "Giyim", "Aile"].includes(selectedCategory);

  return (
    <main className="flex-1 px-4 py-8 select-none">
      <div className="text-center mb-8">
        <div className="text-blue-600 font-bold text-2xl">{currentTopCategory}</div>
        <div className="text-gray-600 text-lg font-semibold">
          {(monthlyCategoryTotals[currentTopCategory] || 0).toFixed(2).replace(".", ",")} €
        </div>
      </div>

      <div className="relative flex items-center justify-center h-80 w-80 mx-auto">
        <div 
          onClick={() => setIsGelirModalVisible(true)}
          className="w-28 h-28 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl cursor-pointer z-30 hover:scale-105 active:scale-95 transition-all"
        >
          <span className="font-bold text-lg">GELİR</span>
        </div>

        <div 
          ref={wheelRef}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          className="absolute inset-0 will-change-transform"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {CATEGORIES.map((cat, i) => {
            const angle = (360 / CATEGORIES.length) * i - 90;
            const rad = (angle * Math.PI) / 180;
            const isTop = cat === currentTopCategory;
            const { icon: Icon, color, bgColor } = CategoryIcons[cat];

            return (
              <div
                key={cat}
                onClick={() => handleIconClick(cat)}
                className={`absolute w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-all ${
                  isTop ? "bg-blue-600 scale-125 z-20" : `${bgColor} ${color}`
                }`}
                style={{ 
                  top: `${center + radius * Math.sin(rad)}%`, 
                  left: `${center + radius * Math.cos(rad)}%`,
                  transform: `translate(-50%, -50%) rotate(${-rotation}deg)` 
                }}
              >
                <Icon className={isTop ? "text-white" : ""} size={22} />
              </div>
            );
          })}
        </div>
      </div>

      <Modal 
        title={`${selectedCategory} İşlemi`} 
        open={isModalVisible} 
        onCancel={() => { setIsModalVisible(false); setShowNote(false); }} 
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={(v) => harcamaMutation.mutate({...v, kategori: selectedCategory})} initialValues={{ tarih: dayjs() }}>
          <Form.Item name="tarih" label="Tarih" rules={[{ required: true }]}><CustomDayPicker /></Form.Item>
          <Form.Item name="miktar" label="Miktar (€)" rules={[{ required: true }]}><InputNumber className="w-full" step={0.01} min={0.01} inputMode="decimal" /></Form.Item>
          
          {needsSub && (
            <Form.Item name="altKategori" label="Alt Kategori" rules={[{ required: true }]}>
              <Select placeholder="Seçim yapın">
                {(selectedCategory === "Market" ? MARKETLER : GIYIM_KISILERI).map(i => (
                  <Select.Option key={i} value={i}>{i}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {!showNote ? (
            <Button type="dashed" block icon={<MessageCircle size={16} />} onClick={() => setShowNote(true)}>Not Ekle</Button>
          ) : (
            <Form.Item name="not" label="Not"><Input.TextArea rows={3} /></Form.Item>
          )}

          <Button type="primary" htmlType="submit" block className="mt-4 bg-blue-600" loading={harcamaMutation.isPending}>Kaydet</Button>
        </Form>
      </Modal>

      <Modal title="Gelir Ekle" open={isGelirModalVisible} onCancel={() => setIsGelirModalVisible(false)} footer={null}>
        <Form form={gelirForm} layout="vertical" onFinish={(v) => gelirMutation.mutate(v)} initialValues={{ tarih: dayjs() }}>
          <Form.Item name="tarih" label="Tarih" rules={[{ required: true }]}><CustomDayPicker isIncome /></Form.Item>
          <Form.Item name="miktar" label="Miktar (€)" rules={[{ required: true }]}><InputNumber className="w-full" step={0.01} /></Form.Item>
          <Form.Item name="kategori" label="Gelir Türü">
            <Select>
              <Select.Option value="gelir">Maaş / Gelir</Select.Option>
              <Select.Option value="tasarruf">Tasarruf</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="not" label="Not"><Input.TextArea /></Form.Item>
          <Button type="primary" htmlType="submit" block className="bg-indigo-600" loading={gelirMutation.isPending}>Gelir Kaydet</Button>
        </Form>
      </Modal>
    </main>
  );
};

export default MainContent;