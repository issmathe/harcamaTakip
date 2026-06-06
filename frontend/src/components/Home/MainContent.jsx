import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Select,
  Checkbox,
} from "antd";

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import CustomDayPicker from "../Forms/CustomDayPicker";
import GelirEkleModal from "../Forms/GelirEkleModal";

import {
  MessageCircle,
  Delete,
  ShoppingCart,
  Shirt,
  Home,
  FileText,
  MoreHorizontal,
  HeartPulse,
  Car,
  Gamepad2,
  Smartphone,
  Wifi,
  Gift,
  Utensils,
  Users,
  GraduationCap,
  Plus,
  XCircle,
} from "lucide-react";

import axios from "axios";
import { useTotalsContext } from "../../context/TotalsContext";
import { useMutation } from "@tanstack/react-query";

dayjs.extend(isSameOrAfter);

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";
const { Option } = Select;

const CATEGORY_CONFIG = {
  Market: { icon: ShoppingCart, color: "#10b981", bg: "rgba(16, 185, 129, 0.2)" },
  Giyim: { icon: Shirt, color: "#ec4899", bg: "rgba(236, 72, 153, 0.2)" },
  Kira: { icon: Home, color: "#6366f1", bg: "rgba(99, 102, 241, 0.2)" },
  Fatura: { icon: FileText, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.2)" },
  Diğer: { icon: MoreHorizontal, color: "#94a3b8", bg: "rgba(148, 163, 184, 0.2)" },
  Sağlık: { icon: HeartPulse, color: "#ef4444", bg: "rgba(239, 68, 68, 0.2)" },
  Ulaşım: { icon: Car, color: "#f97316", bg: "rgba(249, 115, 22, 0.2)" },
  Eğlence: { icon: Gamepad2, color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.2)" },
  Elektronik: { icon: Smartphone, color: "#06b6d4", bg: "rgba(6, 182, 212, 0.2)" },
  İletisim: { icon: Wifi, color: "#14b8a6", bg: "rgba(20, 184, 166, 0.2)" },
  Hediye: { icon: Gift, color: "#f43f5e", bg: "rgba(244, 63, 94, 0.2)" },
  Restoran: { icon: Utensils, color: "#d946ef", bg: "rgba(217, 70, 239, 0.2)" },
  Aile: { icon: Users, color: "#84cc16", bg: "rgba(132, 204, 22, 0.2)" },
  Eğitim: { icon: GraduationCap, color: "#fbbf24", bg: "rgba(251, 191, 36, 0.2)" },
};

const CategoryIcon = ({ type, isTop }) => {
  const config = CATEGORY_CONFIG[type] || CATEGORY_CONFIG.Diğer;
  const IconComponent = config.icon;

  const labelElement = (
    <div className={`absolute -bottom-7 left-1/2 -translate-x-1/2 transition-all duration-300 z-50 ${isTop ? 'opacity-100 scale-110 translate-y-1' : 'opacity-40 scale-90'}`}>
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap tracking-wider shadow-lg ${isTop ? 'bg-white text-black' : 'bg-black/20 text-gray-400'}`}>
        {type}
      </span>
    </div>
  );

  return (
    <div className={`relative w-full h-full flex items-center justify-center rounded-2xl transition-all duration-300 shadow-xl  
      ${isTop ? 'scale-125' : 'scale-100 opacity-60'}`}
      style={{ 
        backgroundColor: isTop ? config.bg : 'rgba(255,255,255,0.05)',
        border: `1.5px solid ${isTop ? config.color : 'rgba(255,255,255,0.1)'}`,
        boxShadow: isTop ? `0 0 20px ${config.bg}` : 'none'
      }}
    >
      <IconComponent 
        size={isTop ? 32 : 24} 
        color={isTop ? config.color : "#94a3b8"} 
        strokeWidth={2.5}
      />
      {labelElement}
      {isTop && (
        <div 
          className="absolute inset-0 rounded-2xl animate-pulse pointer-events-none" 
          style={{ border: `2px solid ${config.color}`, opacity: 0.3 }}
        />
      )}
    </div>
  );
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG);
const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", "Biomarkt", "Penny", "Diğer"];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ayşe", "Yusuf", "Zeynep"];
const ULASIM_TURLERI = ["Benzin", "Motorin", "Bilet", "Tamir", "Diğer"];

// Kullanıcının seçeceği 3 adet harcama kaynağı
const HARCAMA_KAYNAKLARI = ["Gelir", "Ekstra Gelir", "Birikim"];

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

    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5,
      opacity: Math.random(),
    }));

    const draw = () => {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
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
    <div className="grid grid-cols-3 gap-2 mt-2">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "back"].map((key) => (
        <Button
          key={key}
          onClick={() => handlePress(key)}
          className={`h-11 text-lg font-semibold flex items-center justify-center rounded-xl border-none shadow-sm transition-all active:scale-95 ${
            key === "back" ? "bg-red-500/80 text-white" : "bg-white text-gray-800"
          }`}
        >
          {key === "back" ? <Delete size={20} /> : key}
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
  const [isTaksitli, setIsTaksitli] = useState(false);
  const [currentTaksitSayisi, setCurrentTaksitSayisi] = useState("2");
  const [isAbonelik, setIsAbonelik] = useState(false);

  const [activeSubscriptions, setActiveSubscriptions] = useState({});

  const [form] = Form.useForm();
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);
  const wheelRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const stored = localStorage.getItem("active_subscriptions");
    if (stored) {
      setActiveSubscriptions(JSON.parse(stored));
    }
  }, [isModalVisible]);

  const harcamaMutation = useMutation({
    mutationFn: (data) => axios.post(`${API_URL}/harcama`, data),
    onSuccess: async () => {
      message.success("Harcama eklendi!");
      await refetch();
      handleModalCancel();
    },
    onError: () => message.error("Harcama eklenirken hata oluştu."),
  });

  const handleGelirOrTransferSave = async (payload) => {
    try {
      if (payload.kaynakKategori) {
        await axios.post(`${API_URL}/gelir/transfer`, payload);
        message.success("Transfer başarıyla gerçekleşti!");
      } else {
        await axios.post(`${API_URL}/gelir`, payload);
        message.success("Gelir eklendi!");
      }
      await refetch();
    } catch (err) {
      const errMsg = err.response?.data?.message || "İşlem sırasında sunucu hatası oluştu.";
      message.error(errMsg);
      throw err;
    }
  };

  useEffect(() => {
    const checkAndTriggerSubscriptions = async () => {
      const stored = localStorage.getItem("active_subscriptions");
      if (!stored) return;

      try {
        const subscriptions = JSON.parse(stored);
        const today = dayjs();
        const currentMonthStr = today.format("YYYY-MM");
        const currentDay = today.date();
        const daysInMonth = today.daysInMonth();
        let hasNewTrigger = false;

        for (const subId in subscriptions) {
          const sub = subscriptions[subId];
          
          if (sub.triggeredMonths.includes(currentMonthStr)) continue;

          const targetDay = Math.min(sub.kayitGunu, daysInMonth);

          if (currentDay === targetDay) {
            await axios.post(`${API_URL}/harcama`, {
              miktar: sub.miktar,
              toplamMiktar: sub.miktar,
              taksitSayisi: 1,
              kategori: sub.kategori,
              altKategori: sub.altKategori || "",
              not: sub.not,
              harcamaKaynagi: sub.harcamaKaynagi || "Gelir", // Abonelik otomatik tetiklenirken de kaynak korunur
              createdAt: today.toISOString(),
            });

            sub.triggeredMonths.push(currentMonthStr);
            hasNewTrigger = true;
          }
        }

        if (hasNewTrigger) {
          localStorage.setItem("active_subscriptions", JSON.stringify(subscriptions));
          setActiveSubscriptions(subscriptions);
          await refetch();
          message.info("Aylık düzenli ödemeleriniz otomatik olarak sisteme işlendi.");
        }
      } catch (err) {
        console.error("Abonelik tetikleme hatası:", err);
      }
    };

    if (harcamalar && harcamalar.length > 0) {
      checkAndTriggerSubscriptions();
    }
  }, [harcamalar, refetch]);

  const handleCancelSubscription = (subId) => {
    const stored = localStorage.getItem("active_subscriptions");
    if (stored) {
      const subscriptions = JSON.parse(stored);
      if (subscriptions[subId]) {
        delete subscriptions[subId];
        localStorage.setItem("active_subscriptions", JSON.stringify(subscriptions));
        setActiveSubscriptions(subscriptions);
        message.success("Aylık düzenli ödeme aboneliği başarıyla iptal edildi.");
      }
    }
  };

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
    setIsTaksitli(false);
    setIsAbonelik(false);
    setCurrentTaksitSayisi("2");
    form.resetFields();
    form.setFieldsValue({ 
      tarih: dayjs().toDate(),
      harcamaKaynagi: "Gelir" // Modal her açıldığında varsayılan olarak "Gelir" seçilsin
    });
    setShowNote(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedCategory(null);
    setAmount("");
    setIsTaksitli(false);
    setIsAbonelik(false);
    setCurrentTaksitSayisi("2");
    form.resetFields();
    setShowNote(false);
  };

  const onHarcamaFinish = (values) => {
    const totalAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(totalAmount) || totalAmount <= 0) return message.warning("Miktar girin.");

    let finalAmount = totalAmount;
    let taksitSayisi = 1;
    let customNote = values.not || "";

    if (isTaksitli && values.taksitSayisi) {
      taksitSayisi = parseInt(values.taksitSayisi, 10);
      finalAmount = parseFloat((totalAmount / taksitSayisi).toFixed(2));
      
      const taksitIbaresi = `[1/${taksitSayisi} Taksit]`;
      customNote = customNote ? `${taksitIbaresi} ${customNote}` : taksitIbaresi;
    }

    if ((selectedCategory === "Fatura" || selectedCategory === "İletisim") && isAbonelik) {
      const subId = "SUB_" + Date.now();
      const chosenDate = dayjs(values.tarih || new Date());
      const currentMonthStr = chosenDate.format("YYYY-MM");
      const kayitGunu = chosenDate.date(); 
      
      const aboIbaresi = `[Abonelik ID: ${subId}]`;
      customNote = customNote ? `${aboIbaresi} ${customNote}` : aboIbaresi;

      const currentSubs = localStorage.getItem("active_subscriptions") ? JSON.parse(localStorage.getItem("active_subscriptions")) : {};
      currentSubs[subId] = {
        id: subId,
        miktar: finalAmount,
        kategori: selectedCategory,
        altKategori: values.altKategori || "",
        not: customNote,
        kayitGunu: kayitGunu, 
        harcamaKaynagi: values.harcamaKaynagi || "Gelir",
        triggeredMonths: [currentMonthStr]
      };
      localStorage.setItem("active_subscriptions", JSON.stringify(currentSubs));
      setActiveSubscriptions(currentSubs);
    }

    harcamaMutation.mutate({
      miktar: finalAmount,
      toplamMiktar: totalAmount,
      taksitSayisi: taksitSayisi,
      kategori: selectedCategory || "Diğer",
      altKategori: ["Market", "Giyim", "Aile", "Ulaşım"].includes(selectedCategory) ? values.altKategori : "",
      not: customNote,
      harcamaKaynagi: values.harcamaKaynagi || "Gelir", // Backend'e giden payload'a eklendi
      createdAt: values.tarih ? dayjs(values.tarih).toISOString() : dayjs().toISOString(),
    });
  };

  const filteredSubscriptions = useMemo(() => {
    return Object.values(activeSubscriptions).filter(sub => sub.kategori === selectedCategory);
  }, [activeSubscriptions, selectedCategory]);

  return (
    <main className="relative flex-1 px-4 pt-4 pb-4 overflow-hidden">
      <SpaceBackground />
      
      <div className="text-center mb-6 pt-4 relative z-10">
        <div className="text-white font-bold text-2xl tracking-widest transition-all uppercase" style={{ color: CATEGORY_CONFIG[currentTopCategory]?.color || '#fff' }}>
          {currentTopCategory}
        </div>
        <div className="text-white/60 font-mono text-xl mt-1">{formattedTotal} €</div>
      </div>

      <div className="relative flex items-center justify-center h-[420px] w-full mx-auto my-6 z-10">
        <div 
          onClick={() => setIsGelirModalVisible(true)} 
          className="relative group cursor-pointer z-20 flex items-center justify-center active:scale-95 transition-transform duration-200"
        >
          <div className="absolute w-[160px] h-[160px] bg-orange-500/10 rounded-full blur-[40px]" />
          <div 
            className="relative w-[110px] h-[110px] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-gradient-to-tr from-orange-600 to-amber-400 border-4 border-white/20"
          >
            <Plus size={48} color="white" strokeWidth={3} />
          </div>
        </div>

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
                  width: isTop ? '80px' : '55px',
                  height: isTop ? '80px' : '55px',
                  zIndex: isTop ? 50 : 10
                }}
              >
                <button 
                  onClick={() => handleIconClick(cat)}
                  className="w-full h-full p-0 border-none bg-transparent outline-none"
                  style={{ transform: `rotate(${-rotation}deg)` }}
                >
                  <CategoryIcon type={cat} isTop={isTop} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <Modal 
        title={<div className="text-lg font-bold font-mono tracking-widest uppercase" style={{ color: CATEGORY_CONFIG[selectedCategory]?.color }}>{selectedCategory}</div>}
        open={isModalVisible} onCancel={handleModalCancel} footer={null} centered width={380}
        className="space-modal"
        styles={{ body: { padding: '12px 16px' } }}
      >
        <div className="bg-slate-900/80 backdrop-blur-xl p-3 rounded-2xl mb-3 text-center border border-blue-500/20">
          <div className="text-4xl font-black text-white tracking-tight">
            {amount || "0"}<span className="text-xl ml-2 text-blue-500/50">€</span>
          </div>
          {isTaksitli && (
            <div className="text-xs text-slate-400 mt-1 font-semibold flex flex-col gap-0.5">
              <div>Aylık Ödeme: {(parseFloat(amount.replace(",", ".")) / parseInt(currentTaksitSayisi || 1, 10) || 0).toFixed(2).replace(".", ",")} €</div>
              <div className="text-blue-400 text-[11px]">Kayıt Türü: [1/{currentTaksitSayisi} Taksit] (Kalan: {parseInt(currentTaksitSayisi, 10) - 1})</div>
            </div>
          )}
          {(selectedCategory === "Fatura" || selectedCategory === "İletisim") && isAbonelik && (
            <div className="text-xs text-emerald-400 mt-1 font-semibold">
              🔄 Her ay otomatik olarak tekrarlanacak.
            </div>
          )}
        </div>

        {(selectedCategory === "Fatura" || selectedCategory === "İletisim") && filteredSubscriptions.length > 0 && (
          <div className="mb-3 p-2 bg-red-950/20 border border-red-500/30 rounded-xl">
            <div className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Aktif Otomatik Ödemeleriniz:</div>
            {filteredSubscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between bg-slate-900/60 p-1.5 rounded-lg mb-1 last:mb-0">
                <span className="text-xs text-white font-mono font-bold">{sub.miktar.toFixed(2).replace(".", ",")} €</span>
                <Button 
                  type="text" 
                  danger 
                  size="small" 
                  onClick={() => handleCancelSubscription(sub.id)}
                  icon={<XCircle size={14} />}
                  className="text-[11px] h-6 flex items-center px-1.5 hover:bg-red-500/10 border-none"
                >
                  İptal Et
                </Button>
              </div>
            ))}
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={onHarcamaFinish}>
          {/* Tarih, Detay ve Ödeme Kaynağı Alanları */}
          <div className="grid grid-cols-3 gap-2 items-end"> 
            <Form.Item name="tarih" label={<span className="text-gray-400 text-xs">Tarih</span>} className="mb-0">
              <CustomDayPicker />
            </Form.Item>
            
            {/* ÖDEME KAYNAĞI SEÇİM KUTUSU */}
            <Form.Item name="harcamaKaynagi" label={<span className="text-gray-400 text-xs">Ödeme Hesabı</span>} rules={[{ required: true }]} className="mb-0">
              <Select className="w-full" style={{ height: '38px' }} dropdownStyle={{ borderRadius: '12px' }}>
                {HARCAMA_KAYNAKLARI.map(i => <Option key={i} value={i}>{i}</Option>)}
              </Select>
            </Form.Item>

            {["Market", "Giyim", "Aile", "Ulaşım"].includes(selectedCategory) ? (
              <Form.Item name="altKategori" label={<span className="text-gray-400 text-xs">Detay</span>} rules={[{ required: true, message: "Seç" }]} className="mb-0">
                <Select placeholder="Seç" className="w-full" style={{ height: '38px' }} dropdownStyle={{ borderRadius: '12px' }}>
                  {(selectedCategory === "Market" ? MARKETLER : 
                    selectedCategory === "Giyim" ? GIYIM_KISILERI : 
                    selectedCategory === "Aile" ? AILE_UYELERI : 
                    ULASIM_TURLERI).map(i => <Option key={i} value={i}>{i}</Option>)}
                </Select>
              </Form.Item>
            ) : (
              <div className="h-[38px]" /> // Grid yapısının bozulmaması için boş alan tutucu
            )}
          </div>

          <div className="flex items-center justify-between mt-3 px-1 gap-2">
            {selectedCategory === "İletisim" ? (
              <>
                <Checkbox 
                  checked={isTaksitli} 
                  onChange={(e) => {
                    setIsTaksitli(e.target.checked);
                    if(e.target.checked) {
                      setIsAbonelik(false);
                      form.setFieldsValue({ taksitSayisi: "2" });
                      setCurrentTaksitSayisi("2");
                    }
                  }}
                  className="text-gray-300 text-xs font-medium"
                >
                  Taksitli Alışveriş
                </Checkbox>
                <Checkbox 
                  checked={isAbonelik} 
                  onChange={(e) => {
                    setIsAbonelik(e.target.checked);
                    if(e.target.checked) {
                      setIsTaksitli(false);
                    }
                  }}
                  className="text-gray-300 text-xs font-medium"
                >
                  Aylık Düzenli Ödeme (Otomatik)
                </Checkbox>
              </>
            ) : selectedCategory === "Fatura" ? (
              <Checkbox 
                checked={isAbonelik} 
                onChange={(e) => {
                  setIsAbonelik(e.target.checked);
                  if(e.target.checked) {
                    setIsTaksitli(false);
                  }
                }}
                className="text-gray-300 text-xs font-medium"
              >
                Aylık Düzenli Ödeme (Otomatik)
              </Checkbox>
            ) : (
              <Checkbox 
                checked={isTaksitli} 
                onChange={(e) => {
                  setIsTaksitli(e.target.checked);
                  if(e.target.checked) {
                    form.setFieldsValue({ taksitSayisi: "2" });
                    setCurrentTaksitSayisi("2");
                  }
                }}
                className="text-gray-300 text-xs font-medium"
              >
                Taksitli Alışveriş
              </Checkbox>
            )}

            {isTaksitli && selectedCategory !== "Fatura" && (
              <Form.Item name="taksitSayisi" className="mb-0" rules={[{ required: true, message: "Seç" }]}>
                <Select 
                  style={{ width: 100, height: '32px' }} 
                  dropdownStyle={{ borderRadius: '8px' }}
                  onChange={(val) => setCurrentTaksitSayisi(val)}
                >
                  {[2, 3, 4, 5, 6, 9, 12].map(m => (
                    <Option key={m} value={m.toString()}>{m} Taksit</Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </div>

          <NumericNumpad value={amount} onChange={setAmount} />
          {showNote ? (
            <Form.Item name="not" className="mt-2 mb-0">
              <Input.TextArea rows={2} placeholder="Not ekleyin..." autoFocus className="bg-slate-800 border-slate-700 text-white rounded-xl" style={{ color: '#ffffff', backgroundColor: '#1e293b' }} />
            </Form.Item>
          ) : (
            <Button type="text" onClick={() => setShowNote(true)} icon={<MessageCircle size={14} />} className="w-full mt-2 text-slate-400 text-xs">Not Ekle</Button>
          )}
          <Button type="primary" htmlType="submit" block loading={harcamaMutation.isPending} className="mt-4 h-12 text-lg font-bold bg-blue-600 hover:bg-blue-500 border-none rounded-xl">KAYBET</Button>
        </Form>
      </Modal>

      <GelirEkleModal 
        open={isGelirModalVisible}
        onClose={() => setIsGelirModalVisible(false)}
        onSave={handleGelirOrTransferSave}
      />
    </main>
  );
};

export default MainContent;