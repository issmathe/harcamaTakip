import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Typography,
  Tooltip,
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Select,
} from "antd";
import {
  QuestionCircleOutlined,
  CarOutlined,
  HomeOutlined,
  ShoppingOutlined,
  DollarOutlined,
  ForkOutlined,
  BookOutlined,
  LaptopOutlined,
  GiftOutlined,
  MedicineBoxOutlined,
  ReadOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useTotalsContext } from "../../context/TotalsContext";
import { useMutation } from "@tanstack/react-query";

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";
const { Text } = Typography;
const { Option } = Select;

const CategoryIcons = {
  Giyim: <ShoppingOutlined className="text-xl" />,
  Gıda: <ForkOutlined className="text-xl" />,
  Petrol: <CarOutlined className="text-xl" />,
  Kira: <HomeOutlined className="text-xl" />,
  Fatura: <DollarOutlined className="text-xl" />,
  Eğitim: <BookOutlined className="text-xl" />,
  Sağlık: <MedicineBoxOutlined className="text-xl" />,
  Ulaşım: <CarOutlined className="text-xl" />,
  Eğlence: <GiftOutlined className="text-xl" />,
  Elektronik: <LaptopOutlined className="text-xl" />,
  Spor: <ThunderboltOutlined className="text-xl" />,
  Market: <ShoppingOutlined className="text-xl" />,
  Kırtasiye: <ReadOutlined className="text-xl" />,
  "Restoran / Kafe": <ForkOutlined className="text-xl" />,
  Diğer: <QuestionCircleOutlined className="text-xl" />,
};

const CATEGORIES = [
  "Giyim",
  "Gıda",
  "Petrol",
  "Kira",
  "Fatura",
  "Eğitim",
  "Sağlık",
  "Ulaşım",
  "Eğlence",
  "Elektronik",
  "Spor",
  "Market",
  "Kırtasiye",
  "Restoran / Kafe",
  "Diğer",
];

const MARKETLER = [
  "Lidl",
  "Rewe",
  "Aldi",
  "Netto",
  "DM",
  "Kaufland",
  "Norma",
  "Edeka",
  "Tegut",
  "Hit",
  "Famila",
  "Nahkauf",
  "Biomarkt",
  "Penny",
  "Rossmann",
  "Real",
  "Diğer",
];

const MainContent = ({ radius = 40, center = 50 }) => {
  const { fetchTotals, harcamalar = [] } = useTotalsContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState("");
  const [isGelirModalVisible, setIsGelirModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [gelirForm] = Form.useForm();
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);
  const wheelRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  const harcamaMutation = useMutation({
    mutationFn: async (harcamaData) => axios.post(`${API_URL}/harcama`, harcamaData),
    onSuccess: async () => {
      message.success("Harcama eklendi!");
      await fetchTotals();
      handleModalCancel();
    },
    onError: () => message.error("Harcama eklenirken hata oluştu."),
  });

  const gelirMutation = useMutation({
    mutationFn: async (gelirData) => axios.post(`${API_URL}/gelir`, gelirData),
    onSuccess: async () => {
      message.success("Gelir eklendi!");
      await fetchTotals();
      handleGelirCancel();
    },
    onError: () => message.error("Gelir eklenirken hata oluştu."),
  });

  const getCurrentMonthYear = () => new Date().toISOString().slice(0, 7);

  const monthlyCategoryTotals = useMemo(() => {
    const currentMonth = getCurrentMonthYear();
    return (harcamalar ?? []).reduce((acc, harcama) => {
      if (harcama?.createdAt?.startsWith(currentMonth)) {
        const kategori = harcama.kategori;
        const miktar = Number(harcama.miktar || 0);
        if (kategori) acc[kategori] = (acc[kategori] || 0) + miktar;
      }
      return acc;
    }, {});
  }, [harcamalar]);

  const getTopCategory = useCallback(() => {
    const categoryAngle = 360 / CATEGORIES.length;
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const topIndex =
      (Math.round(-normalizedRotation / categoryAngle) + CATEGORIES.length) %
      CATEGORIES.length;
    return CATEGORIES[topIndex];
  }, [rotation]);

  const currentTopCategory = getTopCategory();
  const currentCategoryTotal = monthlyCategoryTotals[currentTopCategory] || 0;
  const formattedTotal = (currentCategoryTotal ?? 0).toFixed(2).replace(".", ",");

  const getAngle = (centerX, centerY, pointX, pointY) =>
    Math.atan2(pointY - centerY, pointX - centerX) * (180 / Math.PI);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = wheelRef.current.getBoundingClientRect();
    setLastAngle(
      getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY)
    );
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const rect = wheelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = getAngle(centerX, centerY, e.clientX, e.clientY);
      let deltaAngle = angle - lastAngle;
      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;
      setRotation((prev) => prev + deltaAngle);
      setLastAngle(angle);
    },
    [isDragging, lastAngle]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setLastAngle(getAngle(centerX, centerY, touch.clientX, touch.clientY));
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = useCallback(
    (e) => {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartPos.current.x;
      const dy = touch.clientY - touchStartPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10 || isDragging) {
        e.preventDefault();
        if (!isDragging) setIsDragging(true);
        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = getAngle(centerX, centerY, touch.clientX, touch.clientY);
        let deltaAngle = angle - lastAngle;
        if (deltaAngle > 180) deltaAngle -= 360;
        if (deltaAngle < -180) deltaAngle += 360;
        setRotation((prev) => prev + deltaAngle);
        setLastAngle(angle);
      }
    },
    [isDragging, lastAngle]
  );

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  React.useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    wheel.addEventListener("mousemove", handleMouseMove);
    wheel.addEventListener("mouseup", handleMouseUp);
    wheel.addEventListener("touchmove", handleTouchMove, { passive: false });
    wheel.addEventListener("touchend", handleTouchEnd);
    return () => {
      wheel.removeEventListener("mousemove", handleMouseMove);
      wheel.removeEventListener("mouseup", handleMouseUp);
      wheel.removeEventListener("touchmove", handleTouchMove);
      wheel.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const handleIconClick = (category) => {
    if (isDragging) return;
    setSelectedCategory(category);
    setSelectedMarket("");
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedCategory(null);
    setSelectedMarket("");
    form.resetFields();
  };

  const handleGelirClick = () => {
    setIsGelirModalVisible(true);
    gelirForm.resetFields();
  };

  const handleGelirCancel = () => {
    setIsGelirModalVisible(false);
    gelirForm.resetFields();
  };

  const onHarcamaFinish = (values) => {
    const harcamaData = {
      miktar: values.miktar,
      kategori: selectedCategory || "Diğer",
      altKategori: selectedCategory === "Market" ? selectedMarket : "",
      not: values.not || "",
    };
    harcamaMutation.mutate(harcamaData);
  };

  const onGelirFinish = (values) => {
    const gelirData = { miktar: values.miktar, kategori: values.kategori, not: values.not || "" };
    gelirMutation.mutate(gelirData);
  };

  return (
    <main className="flex-1 px-4 pt-4 pb-24">
      <div className="relative flex items-center justify-center h-80 w-80 mx-auto my-6">
        <div
          onClick={handleGelirClick}
          className="w-32 h-32 rounded-full bg-indigo-600 text-white flex flex-col items-center justify-center shadow-lg cursor-pointer hover:scale-[1.05] z-20 transition-all"
        >
          <Text className="!text-white font-bold text-lg">Gelir Ekle</Text>
        </div>

        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-24 z-30 w-40 text-center">
          <div className="text-blue-600 font-bold text-xl leading-snug">{currentTopCategory}</div>
          <div className="text-gray-700 font-semibold text-base mt-1">{formattedTotal} €</div>
        </div>

        <div
          ref={wheelRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {CATEGORIES.map((category, i) => {
            const angle = (360 / CATEGORIES.length) * i - 90;
            const rad = (angle * Math.PI) / 180;
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad);
            const isTop = category === currentTopCategory;
            return (
              <Tooltip key={category} title={category} placement="top">
                <button
                  onClick={() => handleIconClick(category)}
                  className={`absolute w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isTop
                      ? "bg-blue-600 text-white scale-150 ring-4 ring-blue-300 border-2 border-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{
                    top: `${center + y}%`,
                    left: `${center + x}%`,
                    transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
                  }}
                >
                  {React.cloneElement(CategoryIcons[category] || <QuestionCircleOutlined />, {
                    className: isTop ? "text-2xl text-white" : "text-xl text-gray-700",
                  })}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <Modal
        title={`${selectedCategory || "Harcama"} Harcaması Ekle`}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onHarcamaFinish}>
          <Form.Item
            name="miktar"
            label="Miktar (₺)"
            rules={[{ required: true, message: "Miktar gerekli" }]}
          >
            <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
          {selectedCategory === "Market" && (
            <Form.Item name="altKategori" label="Market Seç">
              <Select
                placeholder="Market seçin"
                value={selectedMarket}
                onChange={setSelectedMarket}
              >
                {MARKETLER.map((m) => (
                  <Option key={m} value={m}>
                    {m}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item name="not" label="Not">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={harcamaMutation.isPending}
          >
            Kaydet
          </Button>
        </Form>
      </Modal>

      <Modal
        title="Gelir Ekle"
        open={isGelirModalVisible}
        onCancel={handleGelirCancel}
        footer={null}
      >
        <Form form={gelirForm} layout="vertical" onFinish={onGelirFinish}>
          <Form.Item name="miktar" label="Miktar (₺)" rules={[{ required: true }]}>
            <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="kategori" label="Kategori" rules={[{ required: true }]}>
            <Select>
              <Option value="maaş">maaş</Option>
              <Option value="tasarruf">tasarruf</Option>
              <Option value="diğer">diğer</Option>
            </Select>
          </Form.Item>
          <Form.Item name="not" label="Not">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={gelirMutation.isPending}
          >
            Kaydet
          </Button>
        </Form>
      </Modal>
    </main>
  );
};

export default MainContent;
