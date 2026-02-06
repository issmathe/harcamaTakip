import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Select,
} from "antd";

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import CustomDayPicker from "../Forms/CustomDayPicker";

import {
  MessageCircle,
  Delete,
} from "lucide-react";

import axios from "axios";
import { useTotalsContext } from "../../context/TotalsContext";
import { useMutation } from "@tanstack/react-query";

dayjs.extend(isSameOrAfter);

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";
const { Option } = Select;

/**
 * Gezegen Efektleri: Saf CSS ile 3D Görünüm
 */
const PlanetStyle = ({ type, isTop }) => {
  const configs = {
    Market: { bg: "bg-emerald-500", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(16,185,129,0.4)]", ring: false },
    Giyim: { bg: "bg-rose-500", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(244,63,94,0.4)]", ring: false },
    Tasarruf: { bg: "bg-amber-400", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(251,191,36,0.4)]", ring: true }, // Satürn stili
    Petrol: { bg: "bg-orange-700", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.7),0_0_15px_rgba(194,65,12,0.4)]", ring: false },
    Kira: { bg: "bg-indigo-600", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(79,70,229,0.4)]", ring: false },
    Fatura: { bg: "bg-cyan-500", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(6,182,212,0.4)]", ring: false },
    Eğitim: { bg: "bg-blue-400", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(96,165,250,0.4)]", ring: false },
    Sağlık: { bg: "bg-red-600", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.6),0_0_15px_rgba(220,38,38,0.4)]", ring: false },
    Ulaşım: { bg: "bg-slate-400", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(148,163,184,0.4)]", ring: false },
    Eğlence: { bg: "bg-purple-500", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(168,85,247,0.4)]", ring: false },
    Elektronik: { bg: "bg-zinc-700", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(63,63,70,0.4)]", ring: true },
    İletisim: { bg: "bg-yellow-300", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.3),0_0_15px_rgba(253,224,71,0.4)]", ring: false },
    Hediye: { bg: "bg-pink-400", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(244,114,182,0.4)]", ring: false },
    Restoran: { bg: "bg-orange-400", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(251,146,60,0.4)]", ring: false },
    Aile: { bg: "bg-lime-500", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(132,204,22,0.4)]", ring: false },
    Diğer: { bg: "bg-neutral-500", shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(115,115,115,0.4)]", ring: false },
  };

  const current = configs[type] || configs.Diğer;

  return (
    <div className={`relative w-full h-full rounded-full ${current.bg} ${current.shadow} transition-transform duration-500 overflow-visible`}>
      {/* Atmosferik Işıma */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30" />
      
      {/* Halkalı Gezegenler (Örn: Satürn/Uranüs tipi) */}
      {current.ring && (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[20%] border-2 border-white/20 rounded-[100%] rotate-[25deg] shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
      )}
      
      {/* Yüzey Detayı (Krater/Leke efekti) */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-black/10 blur-[1px]" />
      <div className="absolute bottom-1/3 right-1/4 w-4 h-3 rounded-full bg-black/5 blur-[2px]" />
      
      {/* Kategori İsmi (Sadece aktifse) */}
      {isTop && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold tracking-widest uppercase text-white drop-shadow-lg">
          {type}
        </div>
      )}
    </div>
  );
};

const CATEGORIES = ["Market", "Giyim", "Tasarruf", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık", "Ulaşım", "Eğlence", "Elektronik", "İletisim", "Hediye", "Restoran", "Aile", "Diğer"];
const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", "Biomarkt", "Penny", "Diğer"];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ayşe", "Yusuf", "Zeynep"];

const SpaceBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
    resize();

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
      o: Math.random(),
    }));

    const draw = () => {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.z -= 0.5;
        if (star.z <= 0) star.z = canvas.width;

        const x = (star.x - canvas.width / 2) * (canvas.width / star.z) + canvas.width / 2;
        const y = (star.y - canvas.height / 2) * (canvas.width / star.z) + canvas.height / 2;
        const s = (1 - star.z / canvas.width) * 3;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.o})`;
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
};

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
    <main className="relative flex-1 px-4 pt-4 pb-4 overflow-hidden">
      <SpaceBackground />
      
      {/* Üst Bilgi Paneli */}
      <div className="text-center mb-6 pt-4 relative z-10">
        <div className="text-blue-300 font-bold text-2xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] tracking-widest">{currentTopCategory}</div>
        <div className="text-white font-medium text-lg mt-1 opacity-90">{formattedTotal} €</div>
      </div>

      <div className="relative flex items-center justify-center h-[400px] w-full mx-auto my-6 z-10">
        {/* MERKEZ: GÜNEŞ (GELİR) */}
        <div 
          onClick={handleGelirClick} 
          className="relative group cursor-pointer z-20 flex items-center justify-center active:scale-95 transition-transform duration-200"
        >
          <div className="absolute w-[180px] h-[180px] bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
          <svg width="150" height="150" viewBox="0 0 100 100" className="drop-shadow-[0_0_30px_rgba(251,146,60,0.9)]">
            <defs>
              <filter id="sunNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="4" seed="5" result="noise">
                  <animate attributeName="seed" from="1" to="1000" dur="20s" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
              </filter>
              <radialGradient id="sunInner">
                <stop offset="0%" stopColor="#fff7ed" />
                <stop offset="40%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#ea580c" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="url(#sunInner)" filter="url(#sunNoise)" opacity="0.9" />
            <circle cx="50" cy="50" r="35" fill="url(#sunInner)" />
          </svg>
        </div>

        {/* GEZEGENLER HALKASI */}
        <div ref={wheelRef} className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
          style={{ transform: `rotate(${rotation}deg)`, transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.2, 0, 0.2, 1)" }}
          onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}
        >
          {CATEGORIES.map((cat, i) => {
            const ang = (360 / CATEGORIES.length) * i - 90;
            const r = (ang * Math.PI) / 180;
            const x = radius * Math.cos(r);
            const y = radius * Math.sin(r);
            const isTop = cat === currentTopCategory;

            return (
              <div key={cat}
                className="absolute"
                style={{ 
                  top: `${center + y}%`, 
                  left: `${center + x}%`, 
                  transform: `translate(-50%, -50%)`,
                  width: isTop ? '80px' : '50px',
                  height: isTop ? '80px' : '50px',
                  transition: 'width 0.3s, height 0.3s'
                }}
              >
                <button 
                  onClick={() => handleIconClick(cat)}
                  className="w-full h-full p-0 border-none bg-transparent outline-none active:scale-90 transition-transform"
                  style={{ transform: `rotate(${-rotation}deg)` }}
                >
                  <PlanetStyle type={cat} isTop={isTop} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Harcama Modalı */}
      <Modal 
        title={<div className="text-xl font-bold text-blue-700">{selectedCategory} Harcaması</div>}
        open={isModalVisible} onCancel={handleModalCancel} footer={null} centered width={400}
      >
        <div className="bg-slate-900 p-6 rounded-3xl mb-4 text-center border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
          <div className="text-5xl font-black text-blue-400 tracking-tighter">
            {amount || "0"}<span className="text-2xl ml-1 font-light text-blue-200/50">€</span>
          </div>
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
              <Input.TextArea rows={2} placeholder="Kısa bir not..." className="rounded-xl" />
            </Form.Item>
          ) : (
            <Button type="text" onClick={() => setShowNote(true)} icon={<MessageCircle size={16} />} className="w-full mt-2 text-slate-400">Not Ekle</Button>
          )}
          <Button type="primary" htmlType="submit" block loading={harcamaMutation.isPending} className="mt-6 h-16 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 border-none rounded-2xl shadow-xl hover:shadow-blue-500/20">Sisteme İşle</Button>
        </Form>
      </Modal>

      {/* Gelir Modalı */}
      <Modal 
        title={<div className="text-xl font-bold text-orange-600 font-mono">Enerji Girişi (Gelir)</div>}
        open={isGelirModalVisible} onCancel={handleGelirCancel} footer={null} centered width={400}
      >
        <div className="bg-orange-950 p-6 rounded-3xl mb-4 text-center border border-orange-500/30">
          <div className="text-5xl font-black text-orange-400 tracking-tighter">
            {amount || "0"}<span className="text-2xl ml-1 font-light opacity-50">€</span>
          </div>
        </div>
        <Form form={gelirForm} layout="vertical" onFinish={onGelirFinish}>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="tarih" label="Zaman Hattı" className="mb-2">
              <CustomDayPicker isIncome={true} />
            </Form.Item>
            <Form.Item name="kategori" label="Kaynak" className="mb-2">
              <Select>
                <Option value="gelir">Maaş/Gelir</Option>
                <Option value="tasarruf">Birikim</Option>
                <Option value="diğer">Ek Kaynak</Option>
              </Select>
            </Form.Item>
          </div>
          <NumericNumpad value={amount} onChange={setAmount} />
          <Form.Item name="not" label="Detay" className="mt-4">
            <Input placeholder="Nereden geldi?" className="rounded-xl h-12" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={gelirMutation.isPending} className="mt-6 h-16 text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 border-none rounded-2xl shadow-xl">Kaydı Tamamla</Button>
        </Form>
      </Modal>
    </main>
  );
};

export default MainContent;