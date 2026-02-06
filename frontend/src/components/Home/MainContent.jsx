import React, { useState, useRef, useEffect, useMemo } from "react";
import { Modal, Input, Button, message } from "antd";
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

const API_URL =
  process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

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

  /* ================= AYLIK TOPLAM ================= */

  const monthlyTotals = useMemo(() => {
    const start = dayjs().startOf("month");
    return harcamalar.reduce((acc, h) => {
      if (dayjs(h.createdAt).isAfter(start)) {
        acc[h.kategori] =
          (acc[h.kategori] || 0) + Number(h.miktar || 0);
      }
      return acc;
    }, {});
  }, [harcamalar]);

  const maxValue = Math.max(...Object.values(monthlyTotals), 1);

  /* ================= SPIRAL PHYSICS ================= */

  useEffect(() => {
    let frame;
    if (!isDragging) {
      frame = requestAnimationFrame(() => {
        setRotation((r) => r + velocity);
        setVelocity((v) => v * 0.94);
      });
    }
    return () => cancelAnimationFrame(frame);
  }, [velocity, isDragging]);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    lastX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const delta = e.touches[0].clientX - lastX.current;
    setRotation((r) => r + delta * 0.5);
    setVelocity(delta * 0.18);
    lastX.current = e.touches[0].clientX;
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
    },
  });

  /* ================= RENDER ================= */

  return (
    <main
      className="h-screen w-full overflow-hidden relative text-white"
      style={{
        background:
          "radial-gradient(circle at center, #0f172a, #000000)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Yıldız Arkaplan */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div id="stars" />
      </div>

      {/* GALAKSİ */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* MERKEZ ÇEKİRDEK (YAZISIZ) */}
        <div
          className="absolute rounded-full z-40"
          style={{
            width: 150,
            height: 150,
            background:
              "radial-gradient(circle at 30% 30%, #ff7b00, #ff0000)",
            boxShadow: "0 0 100px rgba(255,120,0,0.9)",
            animation: "corePulse 3s ease-in-out infinite",
          }}
        />

        {/* SPİRAL ICONLAR */}
        {CATEGORIES.map((cat, i) => {
          const Icon = CategoryIcons[cat];
          const total = monthlyTotals[cat] || 0;
          const intensity = total / maxValue;

          const spiralAngle = i * 38;
          const radius =
            130 + i * 14 - intensity * 90;

          const x =
            Math.cos((spiralAngle + rotation) *
              (Math.PI / 180)) * radius;

          const y =
            Math.sin((spiralAngle + rotation) *
              (Math.PI / 180)) * radius;

          const size = 50 + intensity * 40;

          return (
            <div
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setIsModalVisible(true);
              }}
              className="absolute flex items-center justify-center cursor-pointer active:scale-90 transition-all duration-300"
              style={{
                width: size,
                height: size,
                borderRadius: "50%",
                transform: `translate(${x}px, ${y}px)`,
                background:
                  "radial-gradient(circle, rgba(59,130,246,0.95), rgba(30,64,175,0.6))",
                boxShadow:
                  intensity > 0.6
                    ? "0 0 35px rgba(59,130,246,0.9)"
                    : "0 0 12px rgba(59,130,246,0.4)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Icon size={22 + intensity * 12} />
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
        <h3 style={{ marginBottom: 10 }}>{selectedCategory}</h3>
        <Input
          type="number"
          placeholder="Miktar"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginBottom: 12 }}
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
      <style>
        {`
          #stars {
            width: 2px;
            height: 2px;
            background: white;
            box-shadow: ${Array.from({ length: 180 })
              .map(
                () =>
                  `${Math.random() * 100}vw ${
                    Math.random() * 100
                  }vh white`
              )
              .join(",")};
          }

          @keyframes corePulse {
            0%,100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
        `}
      </style>
    </main>
  );
}
