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

// Video ve Poster Tanımlamaları
const dunyaVideo = "/gezegenler/dunya.mp4";
const dunyaPoster = "/gezegenler/dunya.jpg";
const gunesVideo = "/gezegenler/gunes.mp4";
const gunesPoster = "/gezegenler/gunes.jpg";
const jupiterVideo = "/gezegenler/jupiter.mp4";
const jupiterPoster = "/gezegenler/jupiter.jpg";
const uranusVideo = "/gezegenler/uranus.mp4";
const uranusPoster = "/gezegenler/uranus.jpg";
const marsVideo = "/gezegenler/mars.mp4";
const marsPoster = "/gezegenler/mars.jpg";
const ayVideo = "/gezegenler/ay.mp4";
const ayPoster = "/gezegenler/dunya.png";
const nebulaVideo = "/gezegenler/nebula.mp4";
const nebulaPoster = "/gezegenler/nebula.jpg";
const karadelikVideo = "/gezegenler/karadelik.mp4";
const karadelikPoster = "/gezegenler/karadelik.jpg";
const bulutsuVideo = "/gezegenler/bulutsu.mp4";
const bulutsuPoster = "/gezegenler/bulutsu.jpeg";
const roketVideo = "/gezegenler/roket.mp4"; // Yeni eklendi
const roketPoster = "/gezegenler/roket.jpg"; // Yeni eklendi
const hubbleVideo = "/gezegenler/hubble.mp4"; // Yeni eklendi
const hubblePoster = "/gezegenler/hubble.jpeg";
const uyduPoster = "/gezegenler/uydu.png"; // Yeni eklendi

dayjs.extend(isSameOrAfter);

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";
const { Option } = Select;

const PlanetStyle = ({ type, isTop }) => {
  const videoPlanets = {
    Market: { video: dunyaVideo, poster: dunyaPoster },
    Ulaşım: { video: roketVideo, poster: roketPoster },
    Giyim: { video: uranusVideo, poster: uranusPoster },
    Petrol: { video: marsVideo, poster: marsPoster },
    Eğitim: { video: hubbleVideo, poster: hubblePoster },
    Aile: { video: nebulaVideo, poster: nebulaPoster },
    İletisim: { video: karadelikVideo, poster: karadelikPoster },
    Restoran: { video: bulutsuVideo, poster: bulutsuPoster },
    Kira: { video: jupiterVideo, poster: jupiterPoster }, // Jüpiter buraya geldi
    Sağlık: { video: ayVideo, poster: ayPoster },         // Ay buraya geldi
    Diğer: {  poster: uyduPoster }       // Uydu eklendi
  };

  const currentVideoPlanet = videoPlanets[type];
  const isFamily = type === "Aile";
  const isBlackHole = type === "İletisim";
  const isNebula = type === "Restoran";
  const isRocket = type === "Ulaşım";
  const isHubble = type === "Eğitim";
  const isSatellite = type === "Diğer";

  const labelElement = (
    <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300 z-50 ${isTop ? 'opacity-100 scale-110 translate-y-2' : 'opacity-60 scale-90'}`}>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap tracking-wider shadow-lg ${isTop ? 'bg-blue-600 text-white' : 'bg-black/50 text-gray-300'}`}>
        {type}
      </span>
    </div>
  );

  if (currentVideoPlanet) {
    return (
      <div className={`relative w-full h-full transition-all duration-300 ${isTop ? 'scale-110' : ''}`}>
        <div 
className={`absolute inset-0 overflow-hidden bg-black transition-all duration-500 rounded-full`}
  style={{ 
    boxShadow: isBlackHole && isTop ? '0 0 40px rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(0,0,0,1)' : 
               isRocket && isTop ? '0 0 30px rgba(234, 88, 12, 0.4)' : 
               isHubble && isTop ? '0 0 30px rgba(34, 211, 238, 0.3)' : 
               isSatellite && isTop ? '0 0 30px rgba(148, 163, 184, 0.3)' : 'none'
  }}
        >
          <video
            src={currentVideoPlanet.video}
            poster={currentVideoPlanet.poster}
            autoPlay loop muted playsInline webkit-playsinline="true" preload="auto"
            className="w-full h-full object-cover"
            style={{ 
              pointerEvents: 'none',
              transform: isBlackHole ? 'scale(1.4)' : ((isFamily || isNebula) ? 'scale(1.5)' : 'scale(1.25)'), 
              filter: (isRocket || type === "Petrol") ? 'contrast(1.1) brightness(1.1)' : 'none'
            }}
          />
        </div>

        {isTop && (
          <div className={`absolute inset-0 animate-ping pointer-events-none 
            ${(isFamily || isNebula) ? 'rounded-[60%_40%_70%_30%/50%] bg-purple-400/20' : 
              isBlackHole ? 'rounded-full bg-white/10 scale-150' : 
              isRocket ? 'rounded-full bg-orange-400/20' :
              isHubble ? 'rounded-full bg-cyan-400/20' :
              isSatellite ? 'rounded-full bg-slate-400/20' :
              'rounded-full bg-blue-400/20'}`} 
          />
        )}
        
        {labelElement}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full rounded-full border border-white/20 bg-white/5 transition-all duration-300 ${isTop ? 'scale-110 border-blue-500/50 bg-blue-500/10' : ''}`}>
      {labelElement}
      {isTop && (
        <div className="absolute inset-0 rounded-full animate-ping bg-blue-400/10 pointer-events-none" />
      )}
    </div>
  );
};
const CATEGORIES = ["Market", "Giyim", "Tasarruf", "Petrol", "Kira", "Fatura", "Diğer", "Sağlık", "Ulaşım", "Eğlence", "Elektronik", "İletisim", "Hediye", "Restoran", "Aile", "Eğitim"];const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", "Biomarkt", "Penny", "Diğer"];
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

    // Yıldızlar
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
      o: Math.random(),
    }));

    // Ana İçerik için Galaksiler (Daha büyük ve daha şeffaf)
    const galaxies = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 250 + 150,
      color: Math.random() > 0.5 ? "rgba(67, 56, 202, 0.08)" : "rgba(147, 51, 234, 0.08)",
      speed: Math.random() * 0.1 + 0.05
    }));

    const draw = () => {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Galaksileri Çiz
      galaxies.forEach(g => {
        g.x -= g.speed;
        if (g.x + g.size < 0) g.x = canvas.width + g.size;

        const gradient = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.size);
        gradient.addColorStop(0, g.color);
        gradient.addColorStop(1, "rgba(2, 6, 23, 0)");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(g.x - g.size, g.y - g.size, g.size * 2, g.size * 2);
      });

      // 2. Yıldızları Çiz
      stars.forEach((star) => {
        star.z -= 0.5;
        if (star.z <= 0) star.z = canvas.width;

        const x = (star.x - canvas.width / 2) * (canvas.width / star.z) + canvas.width / 2;
        const y = (star.y - canvas.height / 2) * (canvas.width / star.z) + canvas.height / 2;
        
        let s = (1 - star.z / canvas.width) * 3;
        if (s <= 0) s = 0.1;

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
    setShowNote(false);
  };

  const handleGelirCancel = () => {
    setIsGelirModalVisible(false);
    setAmount("");
    gelirForm.resetFields();
    setShowNote(false);
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
              autoPlay loop muted playsInline webkit-playsinline="true" preload="auto"
              className="w-full h-full object-cover pointer-events-none"
              style={{ borderRadius: '50%' }}
            />
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
        title={<div className="text-lg font-bold text-blue-400 font-mono tracking-widest uppercase">{selectedCategory}</div>}
        open={isModalVisible} onCancel={handleModalCancel} footer={null} centered width={380}
        className="space-modal"
        styles={{ body: { padding: '12px 16px' } }}
      >
        <div className="bg-slate-900/80 backdrop-blur-xl p-3 rounded-2xl mb-3 text-center border border-blue-500/20">
          <div className="text-4xl font-black text-white tracking-tight">
            {amount || "0"}<span className="text-xl ml-2 text-blue-500/50">€</span>
          </div>
        </div>
        <Form form={form} layout="vertical" onFinish={onHarcamaFinish}>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="tarih" label={<span className="text-gray-400 text-xs">Tarih</span>} className="mb-0">
              <CustomDayPicker />
            </Form.Item>
            {["Market", "Giyim", "Aile"].includes(selectedCategory) && (
              <Form.Item name="altKategori" label={<span className="text-gray-400 text-xs">Alt Bölge</span>} rules={[{ required: true, message: "Seç" }]} className="mb-0">
                <Select placeholder="Seç" size="small" className="w-full">
                  {(selectedCategory === "Market" ? MARKETLER : selectedCategory === "Giyim" ? GIYIM_KISILERI : AILE_UYELERI).map(i => <Option key={i} value={i}>{i}</Option>)}
                </Select>
              </Form.Item>
            )}
          </div>
          <NumericNumpad value={amount} onChange={setAmount} />
          {showNote ? (
            <Form.Item name="not" className="mt-2 mb-0">
              <Input.TextArea 
                rows={2} 
                placeholder="Not ekleyin..."
                autoFocus
                className="bg-slate-800 border-slate-700 text-white rounded-xl placeholder:text-slate-500"
                style={{ color: '#ffffff', backgroundColor: '#1e293b' }}
              />
            </Form.Item>
          ) : (
            <Button type="text" onClick={() => setShowNote(true)} icon={<MessageCircle size={14} />} className="w-full mt-2 text-slate-400 text-xs">Not Ekle</Button>
          )}
          <Button type="primary" htmlType="submit" block loading={harcamaMutation.isPending} className="mt-4 h-12 text-lg font-bold bg-blue-600 hover:bg-blue-500 border-none rounded-xl">KAYDET</Button>
        </Form>
      </Modal>

      <Modal 
        title={<div className="text-lg font-bold text-orange-400 font-mono tracking-widest uppercase">Gelir Kaynağı</div>}
        open={isGelirModalVisible} onCancel={handleGelirCancel} footer={null} centered width={380}
        className="space-modal"
        styles={{ body: { padding: '12px 16px' } }}
      >
        <div className="bg-orange-950/40 backdrop-blur-xl p-3 rounded-2xl mb-3 text-center border border-orange-500/20">
          <div className="text-4xl font-black text-white tracking-tight">
            {amount || "0"}<span className="text-xl ml-2 text-orange-500/50">€</span>
          </div>
        </div>
        <Form form={gelirForm} layout="vertical" onFinish={onGelirFinish}>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="tarih" label={<span className="text-gray-400 text-xs">Zaman</span>} className="mb-0">
              <CustomDayPicker isIncome={true} />
            </Form.Item>
            <Form.Item name="kategori" label={<span className="text-gray-400 text-xs">Tür</span>} className="mb-0">
              <Select className="w-full" size="small">
                <Option value="gelir">Normal Gelir</Option>
                <Option value="tasarruf">Birikim</Option>
                <Option value="diğer">Ekstra</Option>
              </Select>
            </Form.Item>
          </div>
          <NumericNumpad value={amount} onChange={setAmount} />
          {showNote ? (
            <Form.Item name="not" className="mt-2 mb-0">
              <Input 
                placeholder="Not ekleyin..." 
                autoFocus
                className="bg-slate-800 border-slate-700 text-white rounded-xl h-10 placeholder:text-slate-500"
                style={{ color: '#ffffff', backgroundColor: '#1e293b' }}
              />
            </Form.Item>
          ) : (
            <Button type="text" onClick={() => setShowNote(true)} icon={<MessageCircle size={14} />} className="w-full mt-2 text-slate-400 text-xs">Not Ekle</Button>
          )}
          <Button type="primary" htmlType="submit" block loading={gelirMutation.isPending} className="mt-4 h-12 text-lg font-bold bg-orange-600 hover:bg-orange-500 border-none rounded-xl uppercase">Gelir Ekle</Button>
        </Form>
      </Modal>
    </main>
  );
};

export default MainContent;