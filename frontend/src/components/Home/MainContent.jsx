import React, { useState, useRef, useEffect, useMemo } from "react";
import { Modal, Form, Input, Button, message, Select } from "antd";
import {
  ShoppingCart, Shirt, Wallet, Fuel, Home, ReceiptText,
  BookOpen, HeartPulse, Car, PartyPopper,
  Laptop, Zap, Gift, Utensils, Users, HelpCircle, Sun, Delete, MessageCircle
} from "lucide-react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import axios from "axios";
import { useTotalsContext } from "../../context/TotalsContext";
import { useMutation } from "@tanstack/react-query";
import CustomDayPicker from "../Forms/CustomDayPicker";

dayjs.extend(isSameOrAfter);

/* ================= CONFIG ================= */
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";
const { Option } = Select;

const CategoryIcons = {
  Market: { icon: ShoppingCart, color: "from-teal-600 to-teal-900", dist: 110 },
  Giyim: { icon: Shirt, color: "from-red-600 to-red-900", dist: 160 },
  Tasarruf: { icon: Wallet, color: "from-pink-600 to-pink-900", dist: 130 },
  Petrol: { icon: Fuel, color: "from-amber-600 to-amber-900", dist: 180 },
  Kira: { icon: Home, color: "from-purple-600 to-purple-900", dist: 145 },
  Fatura: { icon: ReceiptText, color: "from-indigo-600 to-indigo-900", dist: 120 },
  Eğitim: { icon: BookOpen, color: "from-lime-600 to-lime-900", dist: 170 },
  Sağlık: { icon: HeartPulse, color: "from-emerald-600 to-emerald-900", dist: 140 },
  Ulaşım: { icon: Car, color: "from-sky-600 to-sky-900", dist: 195 },
  Eğlence: { icon: PartyPopper, color: "from-yellow-600 to-yellow-900", dist: 155 },
  Elektronik: { icon: Laptop, color: "from-gray-600 to-gray-900", dist: 125 },
  İletisim: { icon: Zap, color: "from-blue-600 to-blue-900", dist: 185 },
  Hediye: { icon: Gift, color: "from-cyan-600 to-cyan-900", dist: 135 },
  Restoran: { icon: Utensils, color: "from-orange-600 to-orange-900", dist: 165 },
  Aile: { icon: Users, color: "from-green-600 to-green-900", dist: 115 },
  Diğer: { icon: HelpCircle, color: "from-neutral-600 to-neutral-900", dist: 175 },
};

const CATEGORIES = Object.keys(CategoryIcons);
const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", "Biomarkt", "Penny", "Diğer"];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ayşe", "Yusuf", "Zeynep"];

/* ================= NUMPAD ================= */
const NumericNumpad = ({ value, onChange }) => {
  const handlePress = (val) => {
    let newValue = value.toString();
    if (val === "back") newValue = newValue.slice(0, -1);
    else if (val === ",") newValue = newValue.includes(",") ? newValue : (newValue === "" ? "0," : newValue + ",");
    else newValue = newValue === "0" ? val : newValue + val;
    onChange(newValue);
  };
  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "back"].map((k) => (
        <Button key={k} onClick={() => handlePress(k)} className={`h-12 text-lg font-bold rounded-xl border-none shadow-md transition-all active:scale-75 ${k === "back" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white backdrop-blur-md"}`}>
          {k === "back" ? <Delete size={20} /> : k}
        </Button>
      ))}
    </div>
  );
};

/* ================= MAIN ================= */
export default function MainContent() {
  const { refetch, harcamalar = [] } = useTotalsContext();
  const [rotation, setRotation] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastX = useRef(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGelirModalVisible, setIsGelirModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [form] = Form.useForm();
  const [gelirForm] = Form.useForm();

  const monthlyTotals = useMemo(() => {
    const start = dayjs().startOf("month");
    return harcamalar.reduce((acc, h) => {
      if (dayjs(h.createdAt).isSameOrAfter(start, 'month')) {
        acc[h.kategori] = (acc[h.kategori] || 0) + Number(h.miktar || 0);
      }
      return acc;
    }, {});
  }, [harcamalar]);

  const maxValue = useMemo(() => Math.max(...Object.values(monthlyTotals), 1), [monthlyTotals]);

  useEffect(() => {
    let frame;
    if (!isDragging) {
      const animate = () => {
        setRotation(r => r + velocity);
        setVelocity(v => v * 0.96);
        if (Math.abs(velocity) > 0.01) frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(frame);
  }, [velocity, isDragging]);

  const handleTouchMove = (e) => {
    const delta = e.touches[0].clientX - lastX.current;
    setRotation(r => r + delta * 0.45);
    setVelocity(delta * 0.2);
    lastX.current = e.touches[0].clientX;
  };

  const harcamaMutation = useMutation({
    mutationFn: (data) => axios.post(`${API_URL}/harcama`, data),
    onSuccess: async () => {
      message.success("Kaydedildi");
      await refetch();
      setIsModalVisible(false);
      setAmount("");
    }
  });

  return (
    <main className="h-screen bg-[#020617] overflow-hidden relative text-white">
      <div className="absolute inset-0 opacity-20"><div id="stars" /></div>

      <div className="absolute inset-0 flex items-center justify-center touch-none"
        onTouchStart={(e) => { setIsDragging(true); lastX.current = e.touches[0].clientX; }}
        onTouchMove={handleTouchMove} onTouchEnd={() => setIsDragging(false)}
      >
        {/* GÜNEŞ (GELİR) */}
        <div onClick={() => { setAmount(""); setIsGelirModalVisible(true); }}
          className="relative w-28 h-28 rounded-full flex items-center justify-center z-50 cursor-pointer active:scale-90 transition-transform shadow-[0_0_80px_rgba(255,100,0,0.7)]"
          style={{ background: "radial-gradient(circle at 30% 30%, #fdbb2d, #ff4500)" }}
        >
          <Sun className="text-white animate-spin-slow" size={36} />
        </div>

        {/* DAĞINIK GEZEGENLER */}
        {CATEGORIES.map((cat, i) => {
          const { icon: Icon, color, dist } = CategoryIcons[cat];
          const total = monthlyTotals[cat] || 0;
          const intensity = total / maxValue;
          
          // Her gezegen için sabit ama dağınık bir başlangıç açısı
          const startAngle = i * (360 / CATEGORIES.length) + (i * 15); 
          const x = Math.cos((startAngle + rotation) * Math.PI / 180) * dist;
          const y = Math.sin((startAngle + rotation) * Math.PI / 180) * dist;

          return (
            <div key={cat} onClick={() => { setSelectedCategory(cat); setAmount(""); setShowNote(false); form.resetFields(); form.setFieldsValue({ tarih: dayjs() }); setIsModalVisible(true); }}
              className={`absolute rounded-full flex items-center justify-center border border-white/10 bg-gradient-to-br ${color} transition-all duration-300 shadow-xl active:scale-75`}
              style={{
                width: 46 + intensity * 30, height: 46 + intensity * 30,
                transform: `translate(${x}px, ${y}px) rotate(${-rotation}deg)`,
                boxShadow: intensity > 0.5 ? "0 0 20px rgba(255,255,255,0.2)" : "none"
              }}
            >
              <Icon size={18 + intensity * 8} className="text-white" />
            </div>
          );
        })}
      </div>

      {/* HARCAMA MODAL */}
      <Modal open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} centered width="92%" styles={{ content: { background: '#0f172a', borderRadius: '24px' } }}>
        <h3 className="text-center text-blue-400 font-bold uppercase tracking-widest text-xs mb-3">{selectedCategory}</h3>
        <div className="bg-white/5 rounded-2xl p-4 mb-4 text-center border border-white/10 text-4xl font-black">{amount || "0"}<span className="text-lg ml-1 opacity-40 font-normal">€</span></div>
        <Form form={form} layout="vertical" onFinish={(v) => harcamaMutation.mutate({ miktar: parseFloat(amount.replace(",", ".")), kategori: selectedCategory, altKategori: v.altKategori, not: v.not, createdAt: v.tarih.toISOString() })}>
          <div className="flex gap-2 mb-2">
            <Form.Item name="tarih" className="flex-1 mb-0"><CustomDayPicker /></Form.Item>
            {["Market", "Giyim", "Aile"].includes(selectedCategory) && (
              <Form.Item name="altKategori" className="flex-1 mb-0" rules={[{ required: true, message: 'Seç' }]}>
                <Select placeholder="Seç" className="mobile-select">
                  {(selectedCategory === "Market" ? MARKETLER : selectedCategory === "Giyim" ? GIYIM_KISILERI : AILE_UYELERI).map(i => <Option key={i} value={i}>{i}</Option>)}
                </Select>
              </Form.Item>
            )}
          </div>
          <NumericNumpad value={amount} onChange={setAmount} />
          {showNote ? <Form.Item name="not" className="mt-3"><Input placeholder="Açıklama..." className="bg-white/5 border-white/10 text-white" /></Form.Item> : 
          <Button type="text" onClick={() => setShowNote(true)} icon={<MessageCircle size={16} />} className="w-full mt-2 text-white/30">Not Ekle</Button>}
          <Button type="primary" htmlType="submit" block loading={harcamaMutation.isPending} className="mt-4 h-14 font-bold bg-blue-600 border-none rounded-xl">KAYDET</Button>
        </Form>
      </Modal>

      {/* GELİR MODAL */}
      <Modal open={isGelirModalVisible} onCancel={() => setIsGelirModalVisible(false)} footer={null} centered width="92%" styles={{ content: { background: '#020617', borderRadius: '24px' } }}>
        <div className="bg-orange-500/10 rounded-2xl p-4 mb-4 text-center border border-orange-500/20 text-4xl font-black text-orange-500">{amount || "0"}€</div>
        <Form form={gelirForm} layout="vertical" onFinish={(v) => axios.post(`${API_URL}/gelir`, { miktar: parseFloat(amount.replace(",", ".")), kategori: v.kategori, not: v.not, createdAt: v.tarih.toISOString() }).then(() => { message.success("Eklendi"); refetch(); setIsGelirModalVisible(false); })}>
          <div className="flex gap-2 mb-2">
            <Form.Item name="tarih" className="flex-1 mb-0" initialValue={dayjs()}><CustomDayPicker isIncome={true} /></Form.Item>
            <Form.Item name="kategori" className="flex-1 mb-0" initialValue="gelir"><Select className="mobile-select"><Option value="gelir">Maaş</Option><Option value="tasarruf">Birikim</Option></Select></Form.Item>
          </div>
          <NumericNumpad value={amount} onChange={setAmount} />
          <Button type="primary" htmlType="submit" block className="mt-4 h-14 font-bold bg-orange-600 border-none rounded-xl">GELİR EKLE</Button>
        </Form>
      </Modal>

      <style>{`
        #stars { width: 1px; height: 1px; background: white; box-shadow: ${Array.from({length:100}).map(()=>`${Math.random()*100}vw ${Math.random()*100}vh white`).join(',')}; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .mobile-select .ant-select-selector { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: white !important; height: 45px !important; border-radius: 10px !important; display: flex; align-items: center; }
        .ant-modal-mask { backdrop-filter: blur(8px); }
      `}</style>
    </main>
  );
}