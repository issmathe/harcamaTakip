import React, { useState, useRef, useEffect, useMemo } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import {
  ShoppingCart, Shirt, Wallet, Fuel, Home, ReceiptText,
  BookOpen, HeartPulse, Car, PartyPopper,
  Laptop, Zap, Gift, Utensils, Users, HelpCircle
} from "lucide-react";
import dayjs from "dayjs";
import axios from "axios";
import { useTotalsContext } from "../../context/TotalsContext";
import { useMutation } from "@tanstack/react-query";

/* ================= CONFIG ================= */

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

const CategoryIcons = {
  Market: ShoppingCart,
  Giyim: Shirt,
  Tasarruf: Wallet,
  Petrol: Fuel,
  Kira: Home,
  Fatura: ReceiptText,
  Eğitim: BookOpen,
  Sağlık: HeartPulse,
  Ulaşım: Car,
  Eğlence: PartyPopper,
  Elektronik: Laptop,
  İletisim: Zap,
  Hediye: Gift,
  Restoran: Utensils,
  Aile: Users,
  Diğer: HelpCircle,
};

const CATEGORIES = Object.keys(CategoryIcons);

/* ================= COMPONENT ================= */

export default function MainContent() {

  const { refetch, harcamalar = [] } = useTotalsContext();

  const [rotation, setRotation] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastX = useRef(0);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [amount, setAmount] = useState("");

  const [form] = Form.useForm();

  /* ================= HARcAMA TOTAL ================= */

  const monthlyTotals = useMemo(() => {
    const start = dayjs().startOf("month");
    return harcamalar.reduce((acc, h) => {
      if (dayjs(h.createdAt).isAfter(start)) {
        acc[h.kategori] = (acc[h.kategori] || 0) + Number(h.miktar || 0);
      }
      return acc;
    }, {});
  }, [harcamalar]);

  const maxValue = Math.max(...Object.values(monthlyTotals), 1);

  /* ================= PHYSICS ROTATION ================= */

  useEffect(() => {
    let frame;
    if (!isDragging) {
      frame = requestAnimationFrame(() => {
        setRotation(r => r + velocity);
        setVelocity(v => v * 0.95);
      });
    }
    return () => cancelAnimationFrame(frame);
  }, [velocity, isDragging]);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    lastX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    const delta = currentX - lastX.current;
    setRotation(r => r + delta * 0.5);
    setVelocity(delta * 0.2);
    lastX.current = currentX;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  /* ================= MUTATION ================= */

  const harcamaMutation = useMutation({
    mutationFn: (data) => axios.post(`${API_URL}/harcama`, data),
    onSuccess: async () => {
      message.success("Kaydedildi");
      await refetch();
      setIsModalVisible(false);
      setAmount("");
    }
  });

  /* ================= RENDER ================= */

  return (
    <main className="h-screen bg-black overflow-hidden relative">

      {/* Yıldız Alanı */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div id="stars" />
      </div>

      {/* GALAKSİ ALANI */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >

        {/* ENERJİ ÇEKİRDEĞİ */}
        <div
          className="absolute w-36 h-36 rounded-full flex items-center justify-center text-white font-bold z-50"
          style={{
            background: "radial-gradient(circle at 30% 30%, #ff7b00, #ff0000)",
            boxShadow: "0 0 80px rgba(255,100,0,0.9)",
            animation: "corePulse 3s ease-in-out infinite"
          }}
        >
          GELİR
        </div>

        {/* SPİRAL GEZEGENLER */}
        {CATEGORIES.map((cat, i) => {

          const Icon = CategoryIcons[cat];

          const total = monthlyTotals[cat] || 0;

          const intensity = total / maxValue;

          const spiralAngle = i * 40;
          const dynamicRadius = 120 + i * 12 - intensity * 80;

          const x =
            Math.cos((spiralAngle + rotation) * Math.PI / 180) *
            dynamicRadius;

          const y =
            Math.sin((spiralAngle + rotation) * Math.PI / 180) *
            dynamicRadius;

          return (
            <div
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setIsModalVisible(true);
              }}
              className="absolute rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-300"
              style={{
                width: 50 + intensity * 30,
                height: 50 + intensity * 30,
                transform: `translate(${x}px, ${y}px)`,
                background: `radial-gradient(circle, rgba(59,130,246,0.9), rgba(30,64,175,0.6))`,
                boxShadow: intensity > 0.7
                  ? "0 0 30px rgba(59,130,246,0.9)"
                  : "0 0 10px rgba(59,130,246,0.4)",
              }}
            >
              <Icon size={20} />
            </div>
          );
        })}

      </div>

      {/* MODAL */}
      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
      >
        <h2>{selectedCategory}</h2>
        <Input
          placeholder="Miktar"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Button
          type="primary"
          block
          onClick={() =>
            harcamaMutation.mutate({
              miktar: parseFloat(amount),
              kategori: selectedCategory,
              createdAt: dayjs().toISOString(),
            })
          }
        >
          Kaydet
        </Button>
      </Modal>

      {/* GLOBAL STYLE */}
      <style jsx global>{`
        #stars {
          width: 2px;
          height: 2px;
          background: white;
          box-shadow: ${Array.from({ length: 150 })
            .map(
              () =>
                `${Math.random() * 100}vw ${Math.random() * 100}vh white`
            )
            .join(",")};
        }

        @keyframes corePulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </main>
  );
}
