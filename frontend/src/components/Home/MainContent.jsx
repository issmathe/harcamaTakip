import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Select,
  Popconfirm,
  Switch,
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
  Sofa,
  Wifi,
  Gift,
  Utensils,
  Users,
  GraduationCap,
  Plus,
  XCircle,
  CreditCard,
  Trash2,
  Layers,
} from "lucide-react";

import axios from "axios";
import { useTotalsContext } from "../../context/TotalsContext";
dayjs.extend(isSameOrAfter);

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5001";
const { Option } = Select;

const CATEGORY_CONFIG = {
  Market: {
    icon: ShoppingCart,
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.2)",
  },
  Giyim: { icon: Shirt, color: "#ec4899", bg: "rgba(236, 72, 153, 0.2)" },
  Kira: { icon: Home, color: "#6366f1", bg: "rgba(99, 102, 241, 0.2)" },
  Fatura: { icon: FileText, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.2)" },
  Diğer: {
    icon: MoreHorizontal,
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.2)",
  },
  Sağlık: { icon: HeartPulse, color: "#ef4444", bg: "rgba(239, 68, 68, 0.2)" },
  Ulaşım: { icon: Car, color: "#f97316", bg: "rgba(249, 115, 22, 0.2)" },
  Eğlence: { icon: Gamepad2, color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.2)" },
  EvEsyasi: { icon: Sofa, color: "#06b6d4", bg: "rgba(6, 182, 212, 0.2)" },
  İletisim: { icon: Wifi, color: "#14b8a6", bg: "rgba(20, 184, 166, 0.2)" },
  Hediye: { icon: Gift, color: "#f43f5e", bg: "rgba(244, 63, 94, 0.2)" },
  Restoran: { icon: Utensils, color: "#d946ef", bg: "rgba(217, 70, 239, 0.2)" },
  Aile: { icon: Users, color: "#84cc16", bg: "rgba(132, 204, 22, 0.2)" },
  Eğitim: {
    icon: GraduationCap,
    color: "#fbbf24",
    bg: "rgba(251, 191, 36, 0.2)",
  },
};

const CategoryIcon = ({ type, isTop }) => {
  const config = CATEGORY_CONFIG[type] || CATEGORY_CONFIG.Diğer;
  const IconComponent = config.icon;

  const labelElement = (
    <div
      className={`absolute -bottom-7 left-1/2 -translate-x-1/2 transition-all duration-300 z-50 ${isTop ? "opacity-100 scale-110 translate-y-1" : "opacity-40 scale-90"}`}
    >
      <span
        className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap tracking-wider shadow-lg ${isTop ? "bg-white text-black" : "bg-black/20 text-gray-400"}`}
      >
        {type === "EvEsyasi" ? "Ev Eşyası" : type}
      </span>
    </div>
  );

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center rounded-2xl transition-all duration-300 shadow-xl  
      ${isTop ? "scale-125" : "scale-100 opacity-60"}`}
      style={{
        backgroundColor: isTop ? config.bg : "rgba(255,255,255,0.05)",
        border: `1.5px solid ${isTop ? config.color : "rgba(255,255,255,0.1)"}`,
        boxShadow: isTop ? `0 0 20px ${config.bg}` : "none",
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
const MARKETLER = [
  "Lidl",
  "Aldi",
  "DM",
  "Action",
  "Norma",
  "Türk Market",
  "Et-Tavuk",
  "Kaufland",
  "bäckerei",
  "Rewe",
  "Netto",
  "Tedi",
  "Kik",
  "Fundgrube",
  "Rossmann",
  "Edeka",
  "Biomarkt",
  "Penny",
  "Diğer",
];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ayşe", "Yusuf", "Zeynep"];
const ULASIM_TURLERI = ["Benzin", "Motorin", "Bilet", "Tamir", "Diğer"];
const EV_ESYASI_TURLERI = [
  "Mobilya & Dekorasyon",
  "Elektronik",
  "Küçük Ev Aletleri",
  "Tamirat",
];

const HARCAMA_KAYNAKLARI = ["Gelir", "Ekstra Gelir", "Birikim"];
const BIRIKIM_HESAPLARI = ["Nakit", "Wise", "Trade Republic"];
const LAST_EXPENSE_SELECTIONS_KEY = "lastExpenseSelections";

const getLastExpenseSelections = () => {
  try {
    return JSON.parse(localStorage.getItem(LAST_EXPENSE_SELECTIONS_KEY)) || {};
  } catch {
    return {};
  }
};

const saveLastExpenseSelections = (selections) => {
  try {
    localStorage.setItem(LAST_EXPENSE_SELECTIONS_KEY, JSON.stringify(selections));
  } catch {
    // Tarayıcı depolaması kullanılamıyorsa form normal başlangıç değerleriyle çalışır.
  }
};

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
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "back"].map(
        (key) => (
          <Button
            key={key}
            onClick={() => handlePress(key)}
            className={`h-11 text-lg font-semibold flex items-center justify-center rounded-xl border-none shadow-sm transition-all active:scale-95 ${
              key === "back"
                ? "bg-red-500/80 text-white"
                : "bg-white text-gray-800"
            }`}
          >
            {key === "back" ? <Delete size={20} /> : key}
          </Button>
        ),
      )}
    </div>
  );
};

const MainContent = ({ radius = 42, center = 50 }) => {
  const { refetch, harcamalar = [] } = useTotalsContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isGelirModalVisible, setIsGelirModalVisible] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showActiveSubs, setShowActiveSubs] = useState(false);
  const [showFutureTaksits, setShowFutureTaksits] = useState(false);
  const [amount, setAmount] = useState("");
  const [isTaksitli, setIsTaksitli] = useState(false);
  const [currentTaksitSayisi, setCurrentTaksitSayisi] = useState("2");
  const [isAbonelik, setIsAbonelik] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeSubscriptions, setActiveSubscriptions] = useState({});

  const [form] = Form.useForm();
  const watchHarcamaKaynagi = Form.useWatch("harcamaKaynagi", form);

  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);
  const wheelRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get(`${API_URL}/abonelik`);
        const subObj = {};
        response.data.forEach((sub) => {
          subObj[sub._id] = {
            id: sub._id,
            miktar: sub.miktar,
            kategori: sub.kategori,
            altKategori: sub.altKategori,
            not: sub.not,
            kayitGunu: sub.kayitGunu,
            harcamaKaynagi: sub.harcamaKaynagi,
            triggeredMonths: sub.triggeredMonths || [],
          };
        });
        setActiveSubscriptions(subObj);
      } catch (err) {
        console.error("Abonelikler veritabanından çekilemedi:", err);
      }
    };

    if (isModalVisible) {
      fetchSubscriptions();
    }
  }, [isModalVisible]);

  const handleGelirOrTransferSave = async (payload) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (payload.kaynakKategori) {
        await axios.post(`${API_URL}/gelir/transfer`, payload);
        message.success("Transfer başarıyla gerçekleşti!");
      } else {
        await axios.post(`${API_URL}/gelir`, payload);
        message.success("Gelir eklendi!");
      }
      await refetch();
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "İşlem sırasında sunucu hatası oluştu.";
      message.error(errMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const checkAndTriggerSubscriptions = async () => {
      try {
        const response = await axios.get(`${API_URL}/abonelik`);
        const subscriptions = response.data;

        const today = dayjs();
        const currentMonthStr = today.format("YYYY-MM");
        const currentDay = today.date();
        const daysInMonth = today.daysInMonth();
        let hasNewTrigger = false;

        for (const sub of subscriptions) {
          const triggeredMonths = sub.triggeredMonths || [];
          if (triggeredMonths.includes(currentMonthStr)) continue;

          const targetDay = Math.min(sub.kayitGunu, daysInMonth);

          if (currentDay === targetDay) {
            await axios.post(`${API_URL}/harcama`, {
              miktar: sub.miktar,
              toplamMiktar: sub.miktar,
              taksitSayisi: 1,
              taksitGrupId: "",
              kategori: sub.kategori,
              altKategori: sub.altKategori || "",
              not: sub.not,
              harcamaKaynagi: sub.harcamaKaynagi || "Gelir",
              createdAt: today.toISOString(),
            });

            const updatedMonths = [...triggeredMonths, currentMonthStr];
            await axios.put(`${API_URL}/abonelik/${sub._id}`, {
              triggeredMonths: updatedMonths,
            });

            hasNewTrigger = true;
          }
        }

        if (hasNewTrigger) {
          await refetch();
          message.info(
            "Aylık düzenli ödemeleriniz veritabanı üzerinden senkronize işlendi.",
          );
        }
      } catch (err) {
        console.error("Abonelik tetikleme hatası:", err);
      }
    };

    checkAndTriggerSubscriptions();
  }, [harcamalar, refetch]);

  const handleCancelSubscription = async (subId) => {
    try {
      await axios.delete(`${API_URL}/abonelik/${subId}`);
      message.success("Aylık düzenli ödeme aboneliği başarıyla iptal edildi.");
      setActiveSubscriptions((prev) => {
        const guncel = { ...prev };
        delete guncel[subId];
        return guncel;
      });
    } catch (err) {
      message.error("Abonelik iptal edilirken bir hata oluştu.");
    }
  };

  const categoryFutureTaksits = useMemo(() => {
    if (!selectedCategory) return [];
    const now = dayjs();
    return (harcamalar ?? [])
      .filter(
        (h) =>
          h.kategori === selectedCategory &&
          h.not?.includes("Taksit") &&
          dayjs(h.createdAt).isAfter(now, "minute"),
      )
      .sort(
        (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      );
  }, [harcamalar, selectedCategory]);

  // 🚀 ARTIK ZİNCİR SİLME İŞLEMİ DİREKT BACKEND ENDPOINT'İNE `taksitGrupId` GÖNDERİYOR
  const handleTaksitDelete = async (harcama, deleteAllChain) => {
    try {
      if (deleteAllChain) {
        if (!harcama.taksitGrupId) {
          return message.error(
            "Bu eski kayıt bir grup kimliğine sahip değil. Güvenlik için lütfen tek tek silin.",
          );
        }

        await axios.delete(`${API_URL}/harcama/grup/${harcama.taksitGrupId}`);
        message.success("Taksit zincirinin tamamı güvenle silindi.");
      } else {
        await axios.delete(`${API_URL}/harcama/${harcama._id}`);
        message.success("Seçili taksit başarıyla silindi.");
      }
      await refetch();
    } catch (err) {
      message.error("Silme işlemi gerçekleştirilemedi.");
    }
  };

  const monthlyCategoryTotals = useMemo(() => {
    const startOfMonth = dayjs().startOf("month");
    return (harcamalar ?? []).reduce((acc, h) => {
      const harcamaDate = dayjs(h.createdAt);
      if (harcamaDate.isSameOrAfter(startOfMonth, "month")) {
        const m = Number(h.miktar || 0);
        if (h.kategori) acc[h.kategori] = (acc[h.kategori] || 0) + m;
      }
      return acc;
    }, {});
  }, [harcamalar]);

  const getTopCategory = useCallback(() => {
    const angle = 360 / CATEGORIES.length;
    const normalized = ((rotation % 360) + 360) % 360;
    return CATEGORIES[
      (Math.round(-normalized / angle) + CATEGORIES.length) % CATEGORIES.length
    ];
  }, [rotation]);

  const currentTopCategory = getTopCategory();
  const currentCategoryTotal = monthlyCategoryTotals[currentTopCategory] || 0;
  const formattedTotal = currentCategoryTotal.toFixed(2).replace(".", ",");

  const getAngle = (cX, cY, pX, pY) =>
    Math.atan2(pY - cY, pX - cX) * (180 / Math.PI);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = wheelRef.current.getBoundingClientRect();
    setLastAngle(
      getAngle(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        e.clientX,
        e.clientY,
      ),
    );
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const rect = wheelRef.current.getBoundingClientRect();
      const angle = getAngle(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        e.clientX,
        e.clientY,
      );
      let delta = angle - lastAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      setRotation((p) => p + delta);
      setLastAngle(angle);
    },
    [isDragging, lastAngle],
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    const rect = wheelRef.current.getBoundingClientRect();
    setLastAngle(
      getAngle(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        t.clientX,
        t.clientY,
      ),
    );
    touchStartPos.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchMove = useCallback(
    (e) => {
      const t = e.touches[0];
      const dx = t.clientX - touchStartPos.current.x;
      const dy = t.clientY - touchStartPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10 || isDragging) {
        if (e.cancelable) e.preventDefault();
        if (!isDragging) setIsDragging(true);
        const rect = wheelRef.current.getBoundingClientRect();
        const angle = getAngle(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          t.clientX,
          t.clientY,
        );
        let delta = angle - lastAngle;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        setRotation((p) => p + delta);
        setLastAngle(angle);
      }
    },
    [isDragging, lastAngle],
  );

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
    setIsSubmitting(false);
    form.resetFields();
    const lastSelections = getLastExpenseSelections();
    form.setFieldsValue({
      tarih: dayjs().toDate(),
      harcamaKaynagi:
        HARCAMA_KAYNAKLARI.includes(lastSelections.harcamaKaynagi)
          ? lastSelections.harcamaKaynagi
          : "Gelir",
      birikimHesabi: BIRIKIM_HESAPLARI.includes(lastSelections.birikimHesabi)
        ? lastSelections.birikimHesabi
        : undefined,
      altKategori: lastSelections.categoryDetails?.[category],
      taksitSayisi: "2",
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
    setIsSubmitting(false);
    form.resetFields();
    setShowNote(false);
  };

  const onHarcamaFinish = async (values) => {
    if (isSubmitting) return;

    const totalAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(totalAmount) || totalAmount <= 0)
      return message.warning("Miktar girin.");

    if (!selectedCategory) return message.error("Kategori seçimi eksik.");

    setIsSubmitting(true);

    let taksitSayisi = isTaksitli
      ? parseInt(values.taksitSayisi || currentTaksitSayisi, 10)
      : 1;
    let customNoteBase = values.not || "";
    const baseDate = values.tarih ? dayjs(values.tarih) : dayjs();

    // ➕ HER TAKSİTLİ GRUP İÇİN BENZERSİZ BİR GRUP KİMLİĞİ OLUŞTURUYORUZ
    const taksitGrupId = isTaksitli
      ? `grup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      : "";

    if (
      (selectedCategory === "Fatura" || selectedCategory === "İletisim") &&
      isAbonelik
    ) {
      const currentMonthStr = baseDate.format("YYYY-MM");
      const kayitGunu = baseDate.date();

      const abonelikPayload = {
        miktar: totalAmount,
        kategori: selectedCategory,
        altKategori: values.altKategori || "",
        not: customNoteBase,
        kayitGunu: kayitGunu,
        harcamaKaynagi: values.harcamaKaynagi || "Gelir",
        triggeredMonths: [currentMonthStr],
      };

      try {
        await axios.post(`${API_URL}/abonelik`, abonelikPayload);
      } catch (err) {
        console.error("Abonelik veritabanına kaydedilemedi:", err);
      }
    }

    try {
      for (let i = 1; i <= taksitSayisi; i++) {
        let finalAmount = isTaksitli
          ? parseFloat((totalAmount / taksitSayisi).toFixed(2))
          : totalAmount;
        let customNote = customNoteBase;

        if (isTaksitli) {
          const taksitIbaresi = `[${i}/${taksitSayisi} Taksit]`;
          customNote = customNoteBase
            ? `${taksitIbaresi} ${customNoteBase}`
            : taksitIbaresi;
        }

        const currentTaksitDate = baseDate.add(i - 1, "month").toISOString();

        await axios.post(`${API_URL}/harcama`, {
          miktar: finalAmount,
          toplamMiktar: totalAmount,
          taksitSayisi: taksitSayisi,
          taksitGrupId: taksitGrupId, // 🚀 ARTIK KELİME FİLTRESİ YERİNE BU ID YAZILIYOR
          kategori: selectedCategory,
          altKategori: [
            "Market",
            "Giyim",
            "Aile",
            "Ulaşım",
            "EvEsyasi",
          ].includes(selectedCategory)
            ? values.altKategori
            : "",
          not: customNote,
          harcamaKaynagi: values.harcamaKaynagi || "Gelir",
          birikimHesabi:
            values.harcamaKaynagi === "Birikim" ? values.birikimHesabi : "",
          createdAt: currentTaksitDate,
        });
      }

      message.success(
        isTaksitli
          ? `${taksitSayisi} Taksit başarıyla planlandı ve eklendi!`
          : "Harcama eklendi!",
      );
      const lastSelections = getLastExpenseSelections();
      saveLastExpenseSelections({
        harcamaKaynagi: values.harcamaKaynagi || "Gelir",
        birikimHesabi:
          values.harcamaKaynagi === "Birikim"
            ? values.birikimHesabi || ""
            : lastSelections.birikimHesabi || "",
        categoryDetails: {
          ...(lastSelections.categoryDetails || {}),
          ...(isAltKategoriRequired
            ? { [selectedCategory]: values.altKategori || "" }
            : {}),
        },
      });
      await refetch();
      handleModalCancel();
    } catch (err) {
      message.error("Harcama eklenirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    return Object.values(activeSubscriptions).filter(
      (sub) => sub.kategori === selectedCategory,
    );
  }, [activeSubscriptions, selectedCategory]);

  const isAltKategoriRequired = [
    "Market",
    "Giyim",
    "Aile",
    "Ulaşım",
    "EvEsyasi",
  ].includes(selectedCategory);
  const isBirikimSelected = watchHarcamaKaynagi === "Birikim";

  let gridCols = 2;
  if (isBirikimSelected) gridCols += 1;
  if (isAltKategoriRequired) gridCols += 1;

  return (
    <main className="relative flex-1 px-4 pt-4 pb-4 overflow-hidden">
      <SpaceBackground />

      <div className="text-center mb-6 pt-4 relative z-10">
        <div
          className="text-white font-bold text-2xl tracking-widest transition-all uppercase"
          style={{
            color: CATEGORY_CONFIG[currentTopCategory]?.color || "#fff",
          }}
        >
          {currentTopCategory === "EvEsyasi" ? "Ev Eşyası" : currentTopCategory}
        </div>
        <div className="text-white/60 font-mono text-xl mt-1">
          {formattedTotal} €
        </div>
      </div>

      <div className="relative flex items-center justify-center h-[420px] w-full mx-auto my-6 z-10">
        <div
          onClick={() => setIsGelirModalVisible(true)}
          className="relative group cursor-pointer z-20 flex items-center justify-center active:scale-95 transition-transform duration-200"
        >
          <div className="absolute w-[160px] h-[160px] bg-orange-500/10 rounded-full blur-[40px]" />
          <div className="relative w-[110px] h-[110px] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-gradient-to-tr from-orange-600 to-amber-400 border-4 border-white/20">
            <Plus size={48} color="white" strokeWidth={3} />
          </div>
        </div>

        <div
          ref={wheelRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isDragging
              ? "none"
              : "transform 0.5s cubic-bezier(0.15, 0, 0.15, 1)",
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {CATEGORIES.map((cat, i) => {
            const ang = (360 / CATEGORIES.length) * i - 90;
            const r = (ang * Math.PI) / 180;
            const x = radius * Math.cos(r);
            const y = radius * Math.sin(r);
            const isTop = cat === currentTopCategory;

            return (
              <div
                key={cat}
                className="absolute"
                style={{
                  top: `${center + y}%`,
                  left: `${center + x}%`,
                  transform: `translate(-50%, -50%)`,
                  width: isTop ? "80px" : "55px",
                  height: isTop ? "80px" : "55px",
                  zIndex: isTop ? 50 : 10,
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
        title={
          <div
            className="text-base font-bold font-mono tracking-widest uppercase"
            style={{ color: CATEGORY_CONFIG[selectedCategory]?.color }}
          >
            {selectedCategory === "EvEsyasi" ? "Ev Eşyası" : selectedCategory}
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        centered
        width={360}
        className="space-modal"
        styles={{
          body: {
            padding: "8px 12px",
            maxHeight: "calc(100vh - 120px)",
            overflowY: "auto",
          },
        }}
      >
        {/* 🚀 GELECEK TAKSİTLER DETAY BUTONU VE AKORDİYON PANEL */}
        {categoryFutureTaksits.length > 0 && (
          <div className="mb-2 rounded-xl overflow-hidden border border-amber-500/20 bg-amber-950/10 transition-all duration-300">
            <button
              type="button"
              onClick={() => setShowFutureTaksits(!showFutureTaksits)}
              className="w-full px-2.5 py-2 flex items-center justify-between text-left bg-transparent border-none outline-none cursor-pointer active:bg-amber-900/10"
            >
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                <CreditCard size={12} className="animate-pulse" />
                <span>
                  Gelecek Dönem Taksitleri ({categoryFutureTaksits.length})
                </span>
              </div>
              <div
                className={`text-amber-400 font-bold text-[10px] font-mono px-1 py-0.5 rounded bg-amber-500/10 flex items-center gap-1 transition-transform duration-300 ${showFutureTaksits ? "rotate-180" : ""}`}
              >
                ▼
              </div>
            </button>

            {showFutureTaksits && (
              <div className="px-2 pb-2 space-y-1 max-h-[120px] overflow-y-auto border-t border-amber-500/10 pt-1.5 animate-fadeIn">
                {categoryFutureTaksits.map((taksit) => (
                  <div
                    key={taksit._id}
                    className="flex items-center justify-between bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60 gap-1.5"
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] text-gray-200 font-medium truncate">
                        {taksit.not || taksit.altKategori || taksit.kategori}
                      </span>
                      <span className="text-[8px] text-gray-400/80 font-mono mt-0.5">
                        {dayjs(taksit.createdAt).format("DD MMM YYYY")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/10">
                        -{taksit.miktar.toFixed(2)}€
                      </span>

                      <Popconfirm
                        title="Sadece bu taksit silinsin mi?"
                        onConfirm={() => handleTaksitDelete(taksit, false)}
                        okText="Evet"
                        cancelText="Hayır"
                        okButtonProps={{ size: "small", danger: true }}
                        cancelButtonProps={{ size: "small" }}
                        placement="topRight"
                      >
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<Trash2 size={11} />}
                          className="p-0 h-5 w-5 flex items-center justify-center rounded bg-red-500/10 hover:bg-red-500/20 border-none transition-all active:scale-90"
                        />
                      </Popconfirm>

                      {/* Tüm Zinciri Sil (Kompakt ve iPhone 15 Uyumlu Popconfirm) */}
                      <Popconfirm
                        title={
                          <span className="text-red-400 font-bold text-xs tracking-wide block mb-0.5">
                            Tüm Zincir Silinsin mi?
                          </span>
                        }
                        description={
                          <span className="text-gray-400 text-[10px] block leading-tight max-w-[180px]">
                            Gelecekteki tüm taksit serisi tek hamlede iptal
                            edilecektir.
                          </span>
                        }
                        onConfirm={() => handleTaksitDelete(taksit, true)}
                        okText="Seriyi Sil"
                        cancelText="Vazgeç"
                        okButtonProps={{
                          size: "small",
                          type: "primary",
                          danger: true,
                          className:
                            "text-[10px] h-6 px-2 rounded-md font-bold",
                        }}
                        cancelButtonProps={{
                          size: "small",
                          className: "text-[10px] h-6 px-2 rounded-md",
                        }}
                        placement="topRight"
                      >
                        <Button
                          type="primary"
                          danger
                          size="small"
                          icon={<Layers size={10} />}
                          className="h-5 w-5 p-0 rounded flex items-center justify-center bg-red-600 border-none active:scale-90 transition-all shadow-md hover:bg-red-700"
                        />
                      </Popconfirm>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-900/80 backdrop-blur-xl p-2.5 rounded-xl mb-2 text-center border border-blue-500/20">
          <div className="text-3xl font-black text-white tracking-tight">
            {amount || "0"}
            <span className="text-lg ml-1 text-blue-500/50">€</span>
          </div>
          {isTaksitli && (
            <div className="text-[11px] text-slate-400 mt-0.5 font-semibold flex flex-col gap-0.5">
              <div>
                Aylık Ödeme:{" "}
                {(
                  parseFloat(amount.replace(",", ".")) /
                    parseInt(currentTaksitSayisi || 1, 10) || 0
                )
                  .toFixed(2)
                  .replace(".", ",")}{" "}
                €
              </div>
              <div className="text-blue-400 text-[10px]">
                Kayıt Türü: [1/{currentTaksitSayisi} Taksit] (Kalan:{" "}
                {parseInt(currentTaksitSayisi, 10) - 1})
              </div>
            </div>
          )}
          {(selectedCategory === "Fatura" || selectedCategory === "İletisim") &&
            isAbonelik && (
              <div className="text-[11px] text-emerald-400 mt-0.5 font-semibold">
                🔄 Her ay otomatik olarak tekrarlanacak.
              </div>
            )}
        </div>

        {/* 🚀 AKTİF OTOMATİK ÖDEMELER DETAY BUTONU VE AKORDİYON PANEL */}
        {(selectedCategory === "Fatura" || selectedCategory === "İletisim") &&
          filteredSubscriptions.length > 0 && (
            <div className="mb-2 rounded-xl overflow-hidden border border-emerald-500/20 bg-emerald-950/10 transition-all duration-300">
              <button
                type="button"
                onClick={() => setShowActiveSubs(!showActiveSubs)}
                className="w-full px-2.5 py-2 flex items-center justify-between text-left bg-transparent border-none outline-none cursor-pointer active:bg-emerald-900/10"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span>
                    Aktif Otomatik Ödemeler ({filteredSubscriptions.length})
                  </span>
                </div>
                <div
                  className={`text-emerald-400 font-bold text-[10px] font-mono px-1 py-0.5 rounded bg-emerald-500/10 flex items-center gap-1 transition-transform duration-300 ${showActiveSubs ? "rotate-180" : ""}`}
                >
                  ▼
                </div>
              </button>

              {showActiveSubs && (
                <div className="px-2 pb-2 space-y-1 max-h-[110px] overflow-y-auto border-t border-emerald-500/10 pt-1.5">
                  {filteredSubscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60 gap-1.5"
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[10px] text-gray-200 font-mono font-bold">
                          {sub.miktar.toFixed(2).replace(".", ",")} €
                        </span>
                        {sub.not && (
                          <span className="text-[8px] text-gray-400/80 truncate mt-0.5">
                            {sub.not}
                          </span>
                        )}
                      </div>

                      <Popconfirm
                        title="Abonelik İptali"
                        description="Bu otomatik ödeme aboneliğini iptal etmek istediğinize emin misiniz?"
                        onConfirm={() => handleCancelSubscription(sub.id)}
                        okText="İptal Et"
                        cancelText="Vazgeç"
                        okButtonProps={{ danger: true, size: "small" }}
                        cancelButtonProps={{ size: "small" }}
                        placement="topRight"
                      >
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<XCircle size={12} />}
                          className="h-5 px-1.5 text-[9px] font-bold bg-red-500/10 hover:bg-red-500/20 border-none rounded flex items-center gap-0.5 active:scale-90 transition-all"
                        >
                          İptal Et
                        </Button>
                      </Popconfirm>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onHarcamaFinish}
          initialValues={{ tarih: dayjs() }} // Tarihin direkt seçili gelmesi için
          className="w-full max-w-md mx-auto p-1"
        >
          {/* 👑 ÜST SEÇİM ALANI (Tam Simetrik Grid) */}
          <div
            className="grid gap-2 items-end mb-3"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            }}
          >
            <Form.Item
              name="tarih"
              label={
                <span className="text-gray-400 text-[10px] font-semibold tracking-wide uppercase">
                  Tarih
                </span>
              }
              className="mb-0"
            >
              <CustomDayPicker />
            </Form.Item>

            <Form.Item
              name="harcamaKaynagi"
              label={
                <span className="text-gray-400 text-[10px] font-semibold tracking-wide uppercase">
                  Ödeme Hesabı
                </span>
              }
              rules={[{ required: true }]}
              className="mb-0"
            >
              <Select
                className="w-full custom-select-modern"
                style={{ height: "38px" }}
                dropdownStyle={{ borderRadius: "12px" }}
              >
                {HARCAMA_KAYNAKLARI.map((i) => (
                  <Option key={i} value={i}>
                    {i}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {isBirikimSelected && (
              <Form.Item
                name="birikimHesabi"
                label={
                  <span className="text-gray-400 text-[10px] font-semibold tracking-wide uppercase">
                    Hesap Detay
                  </span>
                }
                rules={[{ required: true, message: "Seç" }]}
                className="mb-0 animate-fade-in"
              >
                <Select
                  placeholder="Hesap"
                  className="w-full"
                  style={{ height: "38px" }}
                  dropdownStyle={{ borderRadius: "12px" }}
                >
                  {BIRIKIM_HESAPLARI.map((i) => (
                    <Option key={i} value={i}>
                      {i}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {isAltKategoriRequired && (
              <Form.Item
                name="altKategori"
                label={
                  <span className="text-gray-400 text-[10px] font-semibold tracking-wide uppercase">
                    Kategori Detay
                  </span>
                }
                rules={[{ required: true, message: "Seç" }]}
                className="mb-0 animate-fade-in"
              >
                <Select
                  placeholder="Seç"
                  className="w-full"
                  style={{ height: "38px" }}
                  dropdownStyle={{ borderRadius: "12px" }}
                >
                  {(selectedCategory === "Market"
                    ? MARKETLER
                    : selectedCategory === "Giyim"
                      ? GIYIM_KISILERI
                      : selectedCategory === "Aile"
                        ? AILE_UYELERI
                        : selectedCategory === "Ulaşım"
                          ? ULASIM_TURLERI
                          : EV_ESYASI_TURLERI
                  ).map((i) => (
                    <Option key={i} value={i}>
                      {i}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </div>

          {/* 🔄 MODERN EK ÖZELLİKLER PANELİ (iOS Tarzı Kart Tasarımı) */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3 mb-4 space-y-3">
            {selectedCategory === "İletisim" ? (
              <div className="space-y-3 split-rows">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs font-medium">
                    Taksitli Alışveriş
                  </span>
                  <Switch
                    size="small"
                    checked={isTaksitli}
                    onChange={(checked) => {
                      setIsTaksitli(checked);
                      if (checked) {
                        setIsAbonelik(false);
                        form.setFieldsValue({ taksitSayisi: "2" });
                        setCurrentTaksitSayisi("2");
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/60 pt-2.5">
                  <span className="text-gray-300 text-xs font-medium">
                    Aylık Düzenli Ödeme
                  </span>
                  <Switch
                    size="small"
                    checked={isAbonelik}
                    onChange={(checked) => {
                      setIsAbonelik(checked);
                      if (checked) setIsTaksitli(false);
                    }}
                  />
                </div>
              </div>
            ) : selectedCategory === "Fatura" ? (
              <div className="flex items-center justify-between py-0.5">
                <span className="text-gray-300 text-xs font-medium">
                  Aylık Düzenli Ödeme (Otomatik)
                </span>
                <Switch
                  size="small"
                  checked={isAbonelik}
                  onChange={(checked) => {
                    setIsAbonelik(checked);
                    if (checked) setIsTaksitli(false);
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between py-0.5">
                <span className="text-gray-300 text-xs font-medium">
                  Taksitli Alışveriş
                </span>
                <Switch
                  size="small"
                  checked={isTaksitli}
                  onChange={(checked) => {
                    setIsTaksitli(checked);
                    if (checked) {
                      form.setFieldsValue({ taksitSayisi: "2" });
                      setCurrentTaksitSayisi("2");
                    }
                  }}
                />
              </div>
            )}

            {/* 🎯 Kancalanmış Taksit Menüsü (Açıldığında Layout Bozmaz) */}
            {isTaksitli && selectedCategory !== "Fatura" && (
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-2.5 animate-fade-in">
                <span className="text-gray-400 text-[11px]">
                  Taksit Sayısı Seçin
                </span>
                <Form.Item
                  name="taksitSayisi"
                  className="mb-0"
                  rules={[{ required: true, message: "Seç" }]}
                >
                  <Select
                    style={{ width: 110, height: "32px" }}
                    dropdownStyle={{ borderRadius: "10px" }}
                    listHeight={140}
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    onChange={(val) => setCurrentTaksitSayisi(val)}
                    className="modern-sub-select"
                  >
                    {[2, 3, 4, 5, 6, 9, 12].map((m) => (
                      <Option key={m} value={m.toString()}>
                        {m} Taksit
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            )}
          </div>

          {/* 🔢 NUMPAD ALANI */}
          <div className="mb-4">
            <NumericNumpad value={amount} onChange={setAmount} />
          </div>

          {/* 📝 NOT ALANI */}
          {showNote ? (
            <Form.Item name="not" className="mb-4 animate-fade-in">
<Input.TextArea
  rows={2}
  placeholder="Not ekleyin..."
  autoFocus
  className="w-full border border-slate-800 text-white rounded-xl placeholder-slate-500 text-sm focus:border-blue-500"
  style={{
    backgroundColor: "#0f172a", // slate-900 karşılığı
    color: "#ffffff",
    padding: "8px 12px",
    resize: "none",
  }}
/>
            </Form.Item>
          ) : (
            <Button
              type="text"
              onClick={() => setShowNote(true)}
              icon={<MessageCircle size={14} />}
              className="w-full mb-4 text-slate-400 hover:text-slate-300 text-xs h-8 flex items-center justify-center gap-1 bg-slate-900/20 rounded-xl border border-dashed border-slate-800"
            >
              Not Ekle
            </Button>
          )}

          {/* 🚀 AKSİYON BUTONU */}
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isSubmitting}
            disabled={isSubmitting}
            className="h-12 text-sm font-bold bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all border-none rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 tracking-wider"
          >
            KAYDET
          </Button>
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
