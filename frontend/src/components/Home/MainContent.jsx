import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Typography, Modal, Form, Input, Button, message, Select } from "antd";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import CustomDayPicker from "../Forms/CustomDayPicker";
import {
  Shirt, Wallet, Fuel, Home, ReceiptText, BookOpen, HeartPulse,
  Car, Gift, Laptop, Zap, ShoppingCart, PartyPopper, Utensils,
  HelpCircle, Users, MessageCircle, Delete, Sun
} from "lucide-react";
import axios from "axios";
import { useTotalsContext } from "../../context/TotalsContext";
import { useMutation } from "@tanstack/react-query";

dayjs.extend(isSameOrAfter);

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";
const { Text } = Typography;
const { Option } = Select;

const CategoryIcons = {
  Market: { icon: ShoppingCart, color: "text-teal-400", bgColor: "from-teal-900 to-teal-600" },
  Giyim: { icon: Shirt, color: "text-red-400", bgColor: "from-red-900 to-red-600" },
  Tasarruf: { icon: Wallet, color: "text-pink-400", bgColor: "from-pink-900 to-pink-600" },
  Petrol: { icon: Fuel, color: "text-amber-400", bgColor: "from-amber-900 to-amber-600" },
  Kira: { icon: Home, color: "text-purple-400", bgColor: "from-purple-900 to-purple-600" },
  Fatura: { icon: ReceiptText, color: "text-indigo-400", bgColor: "from-indigo-900 to-indigo-600" },
  Eğitim: { icon: BookOpen, color: "text-lime-400", bgColor: "from-lime-900 to-lime-600" },
  Sağlık: { icon: HeartPulse, color: "text-emerald-400", bgColor: "from-emerald-900 to-emerald-600" },
  Ulaşım: { icon: Car, color: "text-sky-400", bgColor: "from-sky-900 to-sky-600" },
  Eğlence: { icon: PartyPopper, color: "text-yellow-400", bgColor: "from-yellow-900 to-yellow-600" },
  Elektronik: { icon: Laptop, color: "text-gray-400", bgColor: "from-gray-900 to-gray-600" },
  İletisim: { icon: Zap, color: "text-blue-400", bgColor: "from-blue-900 to-blue-600" },
  Hediye: { icon: Gift, color: "text-cyan-400", bgColor: "from-cyan-900 to-cyan-600" },
  Restoran: { icon: Utensils, color: "text-orange-400", bgColor: "from-orange-900 to-orange-600" },
  Aile: { icon: Users, color: "text-green-400", bgColor: "from-green-900 to-green-600" },
  Diğer: { icon: HelpCircle, color: "text-neutral-400", bgColor: "from-neutral-900 to-neutral-600" },
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

const MainContent = ({ radius = 42, center = 50 }) => {
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

  const monthlyCategoryTotals = useMemo(() => {
    const startOfMonth = dayjs().startOf('month');
    return (harcamalar ?? []).reduce((acc, h) => {
      const harcamaDate = dayjs(h.createdAt);
      if (harcamaDate.isSameOrAfter(startOfMonth, 'month')) {
        const m = Number(h.miktar || 0);
        if (h.kategori) acc[h.kategori] = (acc[h.kategori] || 0) + m;
      }
      return acc;
    }, {});
  }, [harcamalar]);

  const maxHarcama = useMemo(() => {
    const values = Object.values(monthlyCategoryTotals);
    return values.length > 0 ? Math.max(...values) : 1;
  }, [monthlyCategoryTotals]);

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
      createdAt: values.tarih ? dayjs(values.tarih).toISOString() : dayjs().toISOString(),
    });
  };

  const onGelirFinish = (values) => {
    const num = parseFloat(amount.replace(",", "."));
    if (isNaN(num) || num <= 0) return message.warning("Miktar girin.");
    gelirMutation.mutate({
      miktar: num,
      kategori: values.kategori || "gelir",
      not: values.not || "",
      createdAt: values.tarih ? dayjs(values.tarih).toISOString() : dayjs().toISOString(),
    });
  };

  return (
    <main className="flex-1 px-4 pt-4 pb-4 bg-[#020617] min-h-screen overflow-hidden relative">
      
      {/* CSS YILDIZLAR ARKA PLANI */}
      <div className="stars-container absolute inset-0 pointer-events-none">
        <div id="stars" />
        <div id="stars2" />
        <div id="stars3" />
      </div>

      <div className="text-center mb-6 pt-4 relative z-30">
        <div className="text-yellow-400 font-bold text-2xl tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
          {currentTopCategory}
        </div>
        <div className="text-blue-300 font-medium text-lg mt-1 opacity-80">{formattedTotal} €</div>
      </div>

      <div className="relative flex items-center justify-center h-[450px] w-[450px] mx-auto my-6">
        
        {/* Yörünge Çizgisi */}
        <div className="absolute border border-blue-500/10 rounded-full" 
             style={{ width: `${radius * 2}%`, height: `${radius * 2}%`, top: `${center - radius}%`, left: `${center - radius}%` }} />

        {/* GÜNEŞ (GELİR) */}
        <div 
          onClick={handleGelirClick} 
          className="group relative w-36 h-36 rounded-full bg-gradient-to-br from-yellow-200 via-orange-500 to-red-600 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(234,179,8,0.3)] cursor-pointer hover:scale-105 z-20 transition-all duration-500 border border-yellow-200/20"
        >
          <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-30 group-hover:opacity-60 animate-pulse" />
          <Sun className="text-white mb-1 relative z-10 animate-spin-slow" size={36} />
          <Text className="!text-white font-black text-xs tracking-widest relative z-10">MERKEZ BANKASI</Text>
        </div>

        {/* GEZEGENLER ÇARKI */}
        <div ref={wheelRef} className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
          style={{ transform: `rotate(${rotation}deg)`, transition: isDragging ? "none" : "transform 0.6s cubic-bezier(0.15, 0.85, 0.35, 1)" }}
          onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}
        >
          {CATEGORIES.map((cat, i) => {
            const ang = (360 / CATEGORIES.length) * i - 90;
            const r = (ang * Math.PI) / 180;
            const x = radius * Math.cos(r);
            const y = radius * Math.sin(r);
            const isTop = cat === currentTopCategory;
            const { icon: Icon, color, bgColor } = CategoryIcons[cat];
            
            const catTotal = monthlyCategoryTotals[cat] || 0;
            const sizeMultiplier = 0.85 + (catTotal / (maxHarcama || 1)) * 0.75;

            return (
              <button key={cat} onClick={() => handleIconClick(cat)}
                className={`absolute w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl bg-gradient-to-b ${bgColor} border border-white/20 ${
                  isTop ? "z-30" : "z-10 opacity-70"
                }`}
                style={{ 
                    top: `${center + y}%`, 
                    left: `${center + x}%`, 
                    transform: `translate(-50%, -50%) rotate(${-rotation}deg) scale(${isTop ? sizeMultiplier * 1.35 : sizeMultiplier})`,
                    boxShadow: isTop ? `0 0 30px rgba(255,255,255,0.2), inset 0 0 10px rgba(255,255,255,0.2)` : 'none'
                }}
              >
                <Icon className={`${isTop ? "text-white" : color} w-6 h-6 transition-transform`} />
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
          <Button type="primary" htmlType="submit" block loading={harcamaMutation.isPending} className="mt-6 h-14 text-lg font-bold bg-blue-600 rounded-xl border-none">Kaydet</Button>
        </Form>
      </Modal>

      <Modal 
        title={<div className="text-xl font-bold text-indigo-700">Gelir Kaydı</div>}
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
                <Option value="gelir">Normal Gelir</Option>
                <Option value="tasarruf">Birikim</Option>
                <Option value="diğer">Diğer</Option>
              </Select>
            </Form.Item>
          </div>
          <NumericNumpad value={amount} onChange={setAmount} />
          <Form.Item name="not" label="Not" className="mt-4">
            <Input placeholder="Not..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={gelirMutation.isPending} className="mt-6 h-14 text-lg font-bold bg-indigo-600 rounded-xl border-none">Kaydet</Button>
        </Form>
      </Modal>
      
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        /* YILDIZ EFEKTLERİ */
        #stars, #stars2, #stars3 {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: transparent;
        }

        #stars {
          width: 1px; height: 1px;
          box-shadow: ${Array.from({length: 100}).map(() => `${Math.random()*2000}px ${Math.random()*2000}px #FFF`).join(',')};
          animation: animStar 50s linear infinite;
        }

        #stars2 {
          width: 2px; height: 2px;
          box-shadow: ${Array.from({length: 50}).map(() => `${Math.random()*2000}px ${Math.random()*2000}px #FFF`).join(',')};
          animation: animStar 100s linear infinite;
          opacity: 0.5;
        }

        #stars3 {
          width: 3px; height: 3px;
          box-shadow: ${Array.from({length: 20}).map(() => `${Math.random()*2000}px ${Math.random()*2000}px #FFF`).join(',')};
          animation: animStar 150s linear infinite;
          opacity: 0.3;
        }

        @keyframes animStar {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
      `}</style>
    </main>
  );
};

export default MainContent;