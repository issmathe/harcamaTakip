import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
    Typography,
    Tooltip,
    Modal,
    Form,
    Input,
    InputNumber,
    Button,
    message,
    Select
} from "antd";
import {
    QuestionCircleOutlined, CarOutlined, HomeOutlined, ShoppingOutlined,
    DollarOutlined, ForkOutlined, BookOutlined, LaptopOutlined, GiftOutlined,
    MedicineBoxOutlined, ReadOutlined, ThunderboltOutlined,
    WalletOutlined // Gelir için yeni ikon
} from "@ant-design/icons";
import axios from "axios";
import { useTotalsContext } from "../../context/TotalsContext";

// Sabitler
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";
const { Text } = Typography;
const { Option } = Select;

// Kategori İkonları
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
    "Giyim", "Gıda", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık",
    "Ulaşım", "Eğlence", "Elektronik", "Spor", "Market", "Kırtasiye",
    "Restoran / Kafe", "Diğer"
];

const MARKETLER = [
    "Lidl", "Rewe", "Aldi", "Netto", "DM",
    "Kaufland", "Norma", "Edeka", "Tegut", "Hit", "Famila",
    "Nahkauf", "Biomarkt", "Penny", "Rossmann", "Real", "Diğer"
];

// Yardımcı Fonksiyon: Açı Hesaplama
const getAngle = (centerX, centerY, pointX, pointY) =>
    Math.atan2(pointY - centerY, pointX - centerX) * (180 / Math.PI);

const MainContent = ({ radius = 40, center = 50 }) => {
    // Context
    const { fetchTotals, harcamalar = [] } = useTotalsContext();

    // State Yönetimi
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedMarket, setSelectedMarket] = useState("");
    const [loading, setLoading] = useState(false);
    const [isGelirModalVisible, setIsGelirModalVisible] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [lastAngle, setLastAngle] = useState(0);
    
    // Ref'ler ve Formlar
    const wheelRef = useRef(null);
    const touchStartPos = useRef({ x: 0, y: 0 });
    const [form] = Form.useForm();
    const [gelirForm] = Form.useForm();

    // Mevcut Ay ve Yıl
    const getCurrentMonthYear = () => new Date().toISOString().slice(0, 7);

    // Harcama Toplamlarını Hesaplama (Memoize Edilmiş)
    const monthlyCategoryTotals = useMemo(() => {
        const currentMonth = getCurrentMonthYear();
        return (harcamalar ?? []).reduce((acc, harcama) => {
            // Kontrol: Harcamanın bu aya ait olup olmadığı
            if (harcama?.createdAt?.startsWith(currentMonth)) {
                const kategori = harcama.kategori;
                const miktar = Number(harcama.miktar || 0);
                if (kategori) acc[kategori] = (acc[kategori] || 0) + miktar;
            }
            return acc;
        }, {});
    }, [harcamalar]);

    // En Üstteki Kategoriyi Hesaplama (Callback)
    const getTopCategory = useCallback(() => {
        const categoryAngle = 360 / CATEGORIES.length;
        const normalizedRotation = ((rotation % 360) + 360) % 360;
        // Dönüş açısına göre en üstteki kategoriyi bulma
        const topIndex =
            (Math.round(-normalizedRotation / categoryAngle) + CATEGORIES.length) % CATEGORIES.length;
        return CATEGORIES[topIndex];
    }, [rotation]);

    const currentTopCategory = getTopCategory();
    const currentCategoryTotal = monthlyCategoryTotals[currentTopCategory] || 0;
    const formattedTotal = (currentCategoryTotal ?? 0).toFixed(2).replace(".", ",");

    // --- Çark Etkileşim Fonksiyonları (Dokunmatik/Mouse) ---

    // Mouse Aşağı Basma
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const rect = wheelRef.current.getBoundingClientRect();
        setLastAngle(getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY));
    };

    // Mouse Hareket Ettirme (Callback)
    const handleMouseMove = useCallback(
        (e) => {
            if (!isDragging || !wheelRef.current) return;
            const rect = wheelRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const angle = getAngle(centerX, centerY, e.clientX, e.clientY);
            let deltaAngle = angle - lastAngle;
            // Açı farkını normalize etme (360 derece döngüsü)
            if (deltaAngle > 180) deltaAngle -= 360;
            if (deltaAngle < -180) deltaAngle += 360;
            setRotation((prev) => prev + deltaAngle);
            setLastAngle(angle);
        },
        [isDragging, lastAngle]
    );

    // Mouse Bırakma (Callback)
    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    // Dokunmatik Başlatma
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setLastAngle(getAngle(centerX, centerY, touch.clientX, touch.clientY));
        touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    };

    // Dokunmatik Hareket Ettirme (Callback) - Mobil Uyumluluk İçin Kritik
    const handleTouchMove = useCallback(
        (e) => {
            const touch = e.touches[0];
            const dx = touch.clientX - touchStartPos.current.x;
            const dy = touch.clientY - touchStartPos.current.y;
            
            // Yeterli hareket olduğunda veya zaten sürükleniyorsa
            if (Math.sqrt(dx * dx + dy * dy) > 10 || isDragging) {
                e.preventDefault(); // Sayfanın kaymasını engelle
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

    // Dokunmatik Bırakma (Callback)
    const handleTouchEnd = useCallback(() => setIsDragging(false), []);

    // Etkinlik Dinleyicilerini Ekleme/Kaldırma (useEffect)
    useEffect(() => {
        const wheel = wheelRef.current;
        if (!wheel) return;

        // Global mouse olayları
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        
        // Dokunmatik olaylar (passive: false mobil kaydırmayı engellemek için)
        wheel.addEventListener("touchmove", handleTouchMove, { passive: false });
        wheel.addEventListener("touchend", handleTouchEnd);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            wheel.removeEventListener("touchmove", handleTouchMove);
            wheel.removeEventListener("touchend", handleTouchEnd);
        };
    }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);
    
    // --- Modal ve Form İşlemleri ---

    const handleIconClick = (category) => {
        // Sürükleme işlemi bittikten hemen sonra tıklama olmasını engeller
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

    const onHarcamaFinish = async (values) => {
        const harcamaData = {
            miktar: values.miktar,
            kategori: selectedCategory || "Diğer",
            altKategori: selectedCategory === "Market" ? selectedMarket : "",
            not: values.not || "",
            // Tarih backend'de varsayılan olarak eklenecek, gerekirse values'dan alınabilir
        };
        setLoading(true);
        try {
            await axios.post(`${API_URL}/harcama`, harcamaData);
            message.success(`${harcamaData.kategori} kategorisine ${values.miktar} ₺ eklendi!`);
            await fetchTotals(); // Context'i güncelle
            handleModalCancel();
        } catch (err) {
            console.error(err);
            message.error("Harcama eklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const onGelirFinish = async (values) => {
        const gelirData = { miktar: values.miktar, kategori: values.kategori, not: values.not || "" };
        setLoading(true);
        try {
            await axios.post(`${API_URL}/gelir`, gelirData);
            message.success(`${gelirData.kategori} kategorisine ${gelirData.miktar} ₺ eklendi!`);
            await fetchTotals(); // Context'i güncelle
            handleGelirCancel();
        } catch (err) {
            console.error(err);
            message.error("Gelir eklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // --- JSX Render ---
    return (
        <main className="flex-1 px-4 pt-4 pb-24 bg-gray-50 min-h-screen">
            <div className="relative flex items-center justify-center h-80 w-80 mx-auto my-6">
                
                {/* Merkezdeki Gelir Ekle Butonu */}
                <div
                    onClick={handleGelirClick}
                    className="w-32 h-32 rounded-full bg-indigo-600 text-white flex flex-col items-center justify-center shadow-xl cursor-pointer hover:scale-[1.05] z-20 transition-all active:scale-[0.98]"
                >
                    <WalletOutlined className="text-3xl mb-1" />
                    <Text className="!text-white font-bold text-lg leading-none">Gelir Ekle</Text>
                </div>

                {/* En Üstteki Kategori Bilgi Alanı */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-24 z-30 w-40 text-center">
                    <div className="text-blue-600 font-extrabold text-2xl leading-snug">
                        {currentTopCategory}
                    </div>
                    <div className="text-gray-700 font-semibold text-lg mt-1 bg-white p-1 rounded shadow">
                        {formattedTotal} ₺
                    </div>
                </div>

                {/* Dairesel Kategori Çarkı */}
                <div
                    ref={wheelRef}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
                    // Mouse/Dokunmatik basıldığında animasyonu devre dışı bırak
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
                                    // Sürükleme bittikten hemen sonra tıklamayı engellemek için
                                    onClick={() => isDragging === false && handleIconClick(category)} 
                                    className={`absolute w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all duration-300 transform-gpu ${
                                        isTop
                                            ? "bg-blue-600 text-white scale-[1.3] ring-4 ring-blue-300 border-2 border-white z-10"
                                            : "bg-white text-gray-700 hover:bg-gray-100 scale-100"
                                    }`}
                                    style={{
                                        top: `${center + y}%`,
                                        left: `${center + x}%`,
                                        // Butonların dik durmasını sağlamak için ters döndürme
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

            {/* Harcama Modal */}
            <Modal
                title={`${selectedCategory || "Harcama"} Harcaması Ekle`}
                open={isModalVisible}
                onCancel={handleModalCancel}
                footer={null}
                centered // Ekranı ortalar
            >
                <Form form={form} layout="vertical" onFinish={onHarcamaFinish}>
                    <Form.Item
                        name="miktar"
                        label={<Text strong>Miktar (₺)</Text>}
                        rules={[{ required: true, message: "Lütfen miktarı girin!" }]}
                    >
                        <InputNumber 
                            min={0.01} 
                            step={0.01} 
                            style={{ width: "100%" }} 
                            placeholder="Örn: 45.50"
                            formatter={value => `${value}`.replace('.', ',')}
                            parser={value => value.replace(',', '.')}
                        />
                    </Form.Item>
                    {selectedCategory === "Market" && (
                        <Form.Item 
                            name="altKategori" 
                            label={<Text strong>Market Seç</Text>}
                            initialValue={selectedMarket}
                        >
                            <Select
                                placeholder="Market seçin"
                                onChange={setSelectedMarket}
                                size="large"
                            >
                                {MARKETLER.map((m) => (
                                    <Option key={m} value={m}>
                                        {m}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                    <Form.Item name="not" label={<Text strong>Not</Text>}>
                        <Input.TextArea rows={2} placeholder="Ek not (isteğe bağlı)" />
                    </Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        loading={loading}
                        size="large"
                        className="mt-4"
                    >
                        Kaydet
                    </Button>
                </Form>
            </Modal>

            {/* Gelir Modal */}
            <Modal
                title="Gelir Ekle"
                open={isGelirModalVisible}
                onCancel={handleGelirCancel}
                footer={null}
                centered
            >
                <Form form={gelirForm} layout="vertical" onFinish={onGelirFinish}>
                    <Form.Item 
                        name="miktar" 
                        label={<Text strong>Miktar (₺)</Text>} 
                        rules={[{ required: true, message: "Lütfen miktarı girin!" }]}
                    >
                        <InputNumber 
                            min={0.01} 
                            step={0.01} 
                            style={{ width: "100%" }} 
                            placeholder="Örn: 1500.00"
                            formatter={value => `${value}`.replace('.', ',')}
                            parser={value => value.replace(',', '.')}
                        />
                    </Form.Item>
                    <Form.Item 
                        name="kategori" 
                        label={<Text strong>Kategori</Text>} 
                        rules={[{ required: true, message: "Lütfen kategori seçin!" }]}
                        initialValue="maaş"
                    >
                        <Select size="large">
                            <Option value="Maaş/Maaş Ödemesi">Maaş/Maaş Ödemesi</Option>
                            <Option value="Ek Gelir/Yan İş">Ek Gelir/Yan İş</Option>
                            <Option value="Tasarruf/Yatırım Dönüşü">Tasarruf/Yatırım Dönüşü</Option>
                            <Option value="Diğer">Diğer</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="not" label={<Text strong>Not</Text>}>
                        <Input.TextArea rows={2} placeholder="Ek not (isteğe bağlı)" />
                    </Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        loading={loading}
                        size="large"
                        className="mt-4"
                    >
                        Kaydet
                    </Button>
                </Form>
            </Modal>
        </main>
    );
};

export default MainContent;