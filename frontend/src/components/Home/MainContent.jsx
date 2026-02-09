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

// Video ve Görsel importları
import dunyaVideo from "./gezegenler/dunya.mp4";
import gunesVideo from "./gezegenler/gunes.mp4";
import gunesPoster from "./gezegenler/gunes.jpg";

dayjs.extend(isSameOrAfter);

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";
const { Option } = Select;

/**
 * Gelişmiş Gezegen Tasarımları
 */
const PlanetStyle = ({ type, isTop }) => {
  const configs = {
    Market: { 
      name: "Dünya",
      bg: "bg-transparent", 
      shadow: "", 
      extra: (
        <video
          src={dunyaVideo}
          autoPlay
          loop
          muted
          playsInline
          webkit-playsinline="true"
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover rounded-full overflow-hidden"
          style={{ borderRadius: '50%', pointerEvents: 'none' }}
        />
      )
    },
    Giyim: { 
      name: "Mars",
      bg: "bg-red-700", 
      shadow: "shadow-[inset_-8px_-8px_15px_rgba(0,0,0,0.7),0_0_10px_rgba(185,28,28,0.4)]",
      extra: <div className="absolute top-2 left-4 w-1 h-1 bg-black/20 rounded-full shadow-[4px_10px_0_rgba(0,0,0,0.2),12px_2px_0_rgba(0,0,0,0.1)]" /> 
    },
    Tasarruf: { 
      name: "Venüs",
      bg: "bg-yellow-200", 
      shadow: "shadow-[inset_-8px_-8px_15px_rgba(0,0,0,0.3),0_0_20px_rgba(253,224,71,0.3)]",
      extra: <div className="absolute inset-0 opacity-30 bg-gradient-to-t from-orange-400 to-transparent rounded-full" />
    },
    Petrol: { 
      name: "Jüpiter",
      bg: "bg-orange-800", 
      shadow: "shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.8)]",
      extra: (
        <div className="absolute inset-0 flex flex-col justify-around py-1 opacity-50">
          <div className="h-[2px] bg-orange-200/40 w-full" />
          <div className="h-[3px] bg-red-900/60 w-full" />
          <div className="h-[1px] bg-orange-100/30 w-full" />
          <div className="absolute top-1/2 right-2 w-2 h-1 bg-red-600 rounded-full blur-[1px]" />
        </div>
      )
    },
    Kira: { 
      name: "Neptün",
      bg: "bg-indigo-700", 
      shadow: "shadow-[inset_-8px_-8px_15px_rgba(0,0,0,0.6)]",
      extra: <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full" />
    },
    Fatura: { 
      name: "Uranüs",
      bg: "bg-cyan-300", 
      shadow: "shadow-[inset_-8px_-8px_15px_rgba(0,0,0,0.2)]",
      ring: true,
      ringColor: "border-cyan-100/30"
    },
    Eğitim: { 
      name: "Merkür",
      bg: "bg-gray-400", 
      shadow: "shadow-[inset_-8px_-8px_15px_rgba(0,0,0,0.5)]",
      extra: <div className="absolute inset-0 grid grid-cols-2 gap-1 p-2 opacity-20"><div className="bg-black rounded-full" /><div className="bg-black rounded-full" /></div>
    },
    Sağlık: { 
      name: "Ay",
      bg: "bg-slate-200", 
      shadow: "shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.3)]",
      extra: <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/pollen.png')] rounded-full" />
    },
    Ulaşım: { 
      name: "Satürn",
      bg: "bg-amber-600", 
      shadow: "shadow-[inset_-8px_-8px_15px_rgba(0,0,0,0.6)]",
      ring: true,
      ringColor: "border-amber-200/40"
    },
    Eğlence: { name: "Plüton", bg: "bg-purple-400", shadow: "shadow-inner", extra: <div className="absolute bottom-1 right-2 w-4 h-4 bg-white/20 rounded-full blur-sm" /> },
    Elektronik: { name: "Titan", bg: "bg-zinc-600", shadow: "shadow-2xl" },
    İletisim: { name: "Io", bg: "bg-yellow-500", extra: <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#71710a_0%,transparent_20%)] opacity-40" /> },
    Hediye: { name: "Europa", bg: "bg-blue-100", extra: <div className="absolute inset-0 opacity-30 border-t border-blue-900/20 rotate-45" /> },
    Restoran: { name: "Callisto", bg: "bg-stone-700", shadow: "shadow-inner" },
    Aile: { name: "Güneş-2", bg: "bg-lime-500", extra: <div className="absolute inset-0 animate-pulse bg-white/10 rounded-full" /> },
    Diğer: { name: "Asteroid", bg: "bg-neutral-500", shadow: "shadow-none" },
  };

  const current = configs[type] || configs.Diğer;

  return (
    <div className={`relative w-full h-full rounded-full ${current.bg} ${current.shadow} transition-all duration-300 ${isTop ? 'scale-110' : ''}`}>
      {current.extra}
      
      {current.ring && (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[25%] border-[3px] ${current.ringColor} rounded-[100%] rotate-[20deg] pointer-events-none`} />
      )}

      <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300 ${isTop ? 'opacity-100 scale-110 translate-y-2' : 'opacity-60 scale-90'}`}>
         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap tracking-wider shadow-lg ${isTop ? 'bg-blue-600 text-white' : 'bg-black/50 text-gray-300'}`}>
            {type}
         </span>
      </div>

      {isTop && (
        <div className="absolute inset-0 rounded-full animate-ping bg-blue-400/20 pointer-events-none" />
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
      
      <div className="text-center mb-6 pt-4 relative z-10">
        <div className="text-blue-300 font-bold text-2xl drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] tracking-[0.2em] transition-all uppercase">
          {currentTopCategory}
        </div>
        <div className="text-white font-mono text-xl mt-1 opacity-80">{formattedTotal} €</div>
      </div>

      <div className="relative flex items-center justify-center h-[420px] w-full mx-auto my-6 z-10">
        
        {/* MERKEZ: GÜNEŞ VİDEOSU */}
        <div 
          onClick={handleGelirClick} 
          className="relative group cursor-pointer z-20 flex items-center justify-center active:scale-95 transition-transform duration-200"
        >
          <div className="absolute w-[180px] h-[180px] bg-orange-600/20 rounded-full blur-[50px] animate-pulse" />
          
          <div 
            className="relative w-[130px] h-[130px] rounded-full overflow-hidden shadow-[0_0_40px_rgba(234,88,12,0.6)] bg-cover bg-center"
            style={{ backgroundImage: `url(${gunesPoster})` }}
          >
            <video
              src={gunesVideo}
              poster={gunesPoster}
              autoPlay
              loop
              muted
              playsInline
              webkit-playsinline="true"
              preload="auto"
              className="w-full h-full object-cover pointer-events-none"
              style={{ borderRadius: '50%' }}
            />
          </div>
        </div>

        {/* GEZEGENLER ÇARKI */}
        <div ref={wheelRef} className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
          style={{ transform: `rotate(${rotation}deg)`, transition: isDragging ? "none" : "transform 0.5s cubic-bezier(0.15, 0, 0.15, 1)" }}
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
                  width: isTop ? '75px' : '45px',
                  height: isTop ? '75px' : '45px',
                  zIndex: isTop ? 50 : 10
                }}
              >
                <button 
                  onClick={() => handleIconClick(cat)}
                  className="w-full h-full p-0 border-none bg-transparent outline-none"
                  style={{ transform: `rotate(${-rotation}deg)` }}
                >
                  <PlanetStyle type={cat} isTop={isTop} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <Modal 
        title={<div className="text-xl font-bold text-blue-400 font-mono tracking-widest">{selectedCategory}</div>}
        open={isModalVisible} onCancel={handleModalCancel} footer={null} centered width={400}
        className="space-modal"
      >
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl mb-6 text-center border border-blue-500/20 shadow-2xl">
          <div className="text-5xl font-black text-white tracking-tight">
            {amount || "0"}<span className="text-2xl ml-2 text-blue-500/50">€</span>
          </div>
        </div>
        <Form form={form} layout="vertical" onFinish={onHarcamaFinish}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="tarih" label="Görev Tarihi" className="mb-2">
              <CustomDayPicker />
            </Form.Item>
            {["Market", "Giyim", "Aile"].includes(selectedCategory) && (
              <Form.Item name="altKategori" label="Alt Bölge" rules={[{ required: true, message: "Seç" }]} className="mb-2">
                <Select placeholder="Hedef Seç">
                  {(selectedCategory === "Market" ? MARKETLER : selectedCategory === "Giyim" ? GIYIM_KISILERI : AILE_UYELERI).map(i => <Option key={i} value={i}>{i}</Option>)}
                </Select>
              </Form.Item>
            )}
          </div>
          <NumericNumpad value={amount} onChange={setAmount} />
          {showNote ? (
            <Form.Item name="not" label="Kaptan Notu" className="mt-4">
              <Input.TextArea rows={2} className="bg-slate-800 border-slate-700 text-white rounded-xl" />
            </Form.Item>
          ) : (
            <Button type="text" onClick={() => setShowNote(true)} icon={<MessageCircle size={16} />} className="w-full mt-4 text-slate-500">Not Ekle</Button>
          )}
          <Button type="primary" htmlType="submit" block loading={harcamaMutation.isPending} className="mt-6 h-16 text-xl font-bold bg-blue-600 hover:bg-blue-500 border-none rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">KAYDET</Button>
        </Form>
      </Modal>

      {/* ENERJİ KAYNAĞI MODALI (DAİRELERLE AYNI BOYUT VE STİLE GETİRİLDİ) */}
      <Modal 
        title={<div className="text-xl font-bold text-orange-400 font-mono tracking-widest">Enerji Kaynağı</div>}
        open={isGelirModalVisible} onCancel={handleGelirCancel} footer={null} centered width={400}
        className="space-modal"
      >
        <div className="bg-orange-950/40 backdrop-blur-xl p-8 rounded-3xl mb-6 text-center border border-orange-500/20 shadow-2xl">
          <div className="text-5xl font-black text-white tracking-tight">
            {amount || "0"}<span className="text-2xl ml-2 text-orange-500/50">€</span>
          </div>
        </div>
        <Form form={gelirForm} layout="vertical" onFinish={onGelirFinish}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="tarih" label="İşlem Zamanı" className="mb-2">
              <CustomDayPicker isIncome={true} />
            </Form.Item>
            <Form.Item name="kategori" label="Tür" className="mb-2">
              <Select>
                <Option value="gelir">Normal Gelir</Option>
                <Option value="tasarruf">Birikim</Option>
                <Option value="diğer">Ekstra</Option>
              </Select>
            </Form.Item>
          </div>
          <NumericNumpad value={amount} onChange={setAmount} />
          <Form.Item name="not" label="Not" className="mt-4">
            <Input className="bg-slate-800 border-slate-700 text-white rounded-xl h-12" placeholder="Not ekleyin..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={gelirMutation.isPending} className="mt-6 h-16 text-xl font-bold bg-orange-600 hover:bg-orange-500 border-none rounded-2xl shadow-[0_0_20px_rgba(234,88,12,0.4)]">ENERJİYİ EKLE</Button>
        </Form>
      </Modal>
    </main>
  );
};

export default MainContent;