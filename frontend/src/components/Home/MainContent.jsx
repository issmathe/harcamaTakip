import React, { useState, useRef, useCallback } from "react";
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
    MedicineBoxOutlined, ReadOutlined, ThunderboltOutlined
} from "@ant-design/icons";
import axios from "axios";
import { useTotalsContext } from "../../context/TotalsContext";

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";
const { Text } = Typography;
const { Option } = Select;

// Market alt kategorileri
const MARKETLER = [
    "Lidl", "Rewe",  "Aldi", "Netto", "DM",
    "Kaufland",  "Norma","Edeka", "Tegut", "Hit", "Famila",
    "Nahkauf", "Biomarkt", "Penny", "Rossmann","Real", "Diğer"
];

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

const MainContent = ({ radius = 40, center = 50 }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedMarket, setSelectedMarket] = useState(""); 
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const [isGelirModalVisible, setIsGelirModalVisible] = useState(false);
    const [gelirForm] = Form.useForm();

    // Rotation states
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [lastAngle, setLastAngle] = useState(0);
    const wheelRef = useRef(null);

    const { fetchTotals } = useTotalsContext();

    // Calculate which category is at the top (12 o'clock position)
    const getTopCategory = useCallback(() => {
        const categoryAngle = 360 / CATEGORIES.length;
        // Normalize rotation to 0-360 range
        const normalizedRotation = ((rotation % 360) + 360) % 360;
        // Calculate which index is at the top (since we start from top and go clockwise)
        // When rotation is 0, index 0 should be at top
        // When rotation is positive (clockwise), we need to go backwards in the array
        const topIndex = (Math.round((-normalizedRotation) / categoryAngle) + CATEGORIES.length) % CATEGORIES.length;
        return CATEGORIES[topIndex];
    }, [rotation]);

    const currentTopCategory = getTopCategory();

    // Calculate angle from center to point
    const getAngle = (centerX, centerY, pointX, pointY) => {
        const dx = pointX - centerX;
        const dy = pointY - centerY;
        return Math.atan2(dy, dx) * (180 / Math.PI);
    };

    // Mouse events
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = getAngle(centerX, centerY, e.clientX, e.clientY);
        setLastAngle(angle);
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        
        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = getAngle(centerX, centerY, e.clientX, e.clientY);
        
        let deltaAngle = angle - lastAngle;
        
        // Handle angle wrap-around
        if (deltaAngle > 180) deltaAngle -= 360;
        if (deltaAngle < -180) deltaAngle += 360;
        
        setRotation(prev => prev + deltaAngle);
        setLastAngle(angle);
    }, [isDragging, lastAngle]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Touch events
    const handleTouchStart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = getAngle(centerX, centerY, touch.clientX, touch.clientY);
        setIsDragging(true);
        setLastAngle(angle);
    };

    const handleTouchMove = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = getAngle(centerX, centerY, touch.clientX, touch.clientY);
        
        let deltaAngle = angle - lastAngle;
        
        // Handle angle wrap-around
        if (deltaAngle > 180) deltaAngle -= 360;
        if (deltaAngle < -180) deltaAngle += 360;
        
        setRotation(prev => prev + deltaAngle);
        setLastAngle(angle);
    }, [isDragging, lastAngle]);

    const handleTouchEnd = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    // Add global event listeners
    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    const handleIconClick = (category) => {
        if (isDragging) return; // Prevent click during drag
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

    const onGelirFinish = async (values) => {
        const gelirData = {
            miktar: values.miktar,
            kategori: values.kategori,
            not: values.not || "",
        };

        setLoading(true);
        try {
            await axios.post(`${API_URL}/gelir`, gelirData);
            message.success(`${gelirData.kategori} kategorisine ${gelirData.miktar} ₺ gelir eklendi!`);
            await fetchTotals();
            handleGelirCancel();
        } catch (error) {
            console.error(error.response?.data || error.message);
            message.error(`Gelir eklenirken hata: ${error.response?.data?.message || "Sunucu hatası"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 px-4 pt-4 pb-24">
            <div className="relative flex items-center justify-center h-80 w-80 mx-auto my-6">
                {/* Center button */}
                <div
                    onClick={handleGelirClick}
                    className="w-32 h-32 rounded-full bg-indigo-600 text-white flex flex-col items-center justify-center text-center shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.05] z-20"
                >
                    <Text className="block !text-white font-bold text-lg">Gelir Ekle</Text>
                </div>

                {/* Top category indicator - Çarkıfelek göstergesi */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 z-30">
                    <div className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-lg border-4 border-blue-200">
                        {currentTopCategory}
                    </div>
                    <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-blue-600 mx-auto mt-1"></div>
                </div>

                {/* Fixed pointer at 12 o'clock */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-25">
                    <div className="w-1 h-8 bg-blue-600 rounded-full shadow-lg"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full mx-auto -mt-1 shadow-lg"></div>
                </div>

                {/* Rotatable wheel */}
                <div
                    ref={wheelRef}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    {CATEGORIES.map((category, index) => {
                        const angle = (360 / CATEGORIES.length) * index - 90; // Start from top
                        const rad = (angle * Math.PI) / 180;
                        const x = radius * Math.cos(rad);
                        const y = radius * Math.sin(rad);
                        
                        // Check if this category is at the top
                        const isTopCategory = category === currentTopCategory;

                        return (
                            <Tooltip key={category} title={category} placement="top">
                                <button
                                    onClick={() => handleIconClick(category)}
                                    className={`absolute w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                                        isTopCategory 
                                            ? 'bg-blue-600 text-white scale-150 shadow-2xl ring-4 ring-blue-200 ring-opacity-75 border-2 border-white' 
                                            : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-indigo-100'
                                    }`}
                                    style={{
                                        top: `${center + y}%`,
                                        left: `${center + x}%`,
                                        transform: `translate(-50%, -50%) rotate(${-rotation}deg)`, // Counter-rotate icons
                                    }}
                                >
                                    {React.cloneElement(CategoryIcons[category] || <QuestionCircleOutlined />, {
                                        className: `${isTopCategory ? 'text-2xl text-white' : 'text-xl text-gray-700'}`
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
                maskClosable={!loading}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={async (values) => {
                        const harcamaData = {
                            miktar: values.miktar,
                            kategori: selectedCategory || "Diğer",
                            altKategori: selectedCategory === "Market" ? selectedMarket : "",
                            not: values.not || "",
                        };

                        setLoading(true);
                        try {
                            await axios.post(`${API_URL}/harcama`, harcamaData);
                            message.success(
                                `${harcamaData.kategori}${harcamaData.altKategori ? " - " + harcamaData.altKategori : ""} kategorisine ${values.miktar} ₺ harcama eklendi!`
                            );
                            await fetchTotals();
                            handleModalCancel();
                        } catch (error) {
                            console.error(error.response?.data || error.message);
                            message.error(`Harcama eklenirken hata: ${error.response?.data?.message || "Sunucu hatası"}`);
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    <Form.Item
                        name="miktar"
                        label="Miktar (₺)"
                        rules={[
                            { required: true, message: 'Lütfen harcama miktarını girin!' },
                            { type: 'number', min: 0.01, message: 'Miktar 0\'dan büyük olmalı!' }
                        ]}
                    >
                        <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} placeholder="Örn: 50.75" />
                    </Form.Item>

                    {selectedCategory === "Market" && (
                        <Form.Item
                            name="altKategori"
                            label="Market Seç"
                            rules={[{ required: true, message: 'Lütfen bir market seçin!' }]}
                        >
                            <Select
                                placeholder="Market seçin"
                                value={selectedMarket}
                                onChange={setSelectedMarket}
                                allowClear={false}
                            >
                                {MARKETLER.map(m => <Option key={m} value={m}>{m}</Option>)}
                            </Select>
                        </Form.Item>
                    )}

                    <Form.Item name="not" label="Not (İsteğe Bağlı)">
                        <Input.TextArea rows={3} placeholder="Harcama ile ilgili kısa bir not ekle" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            {loading ? "Kaydediliyor..." : "Harcamayı Kaydet"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Gelir Modal */}
            <Modal
                title="Gelir Ekle"
                open={isGelirModalVisible}
                onCancel={handleGelirCancel}
                footer={null}
                maskClosable={!loading}
            >
                <Form
                    form={gelirForm}
                    layout="vertical"
                    onFinish={onGelirFinish}
                    initialValues={{ miktar: null, kategori: "maaş", not: "" }}
                >
                    <Form.Item
                        name="miktar"
                        label="Miktar (₺)"
                        rules={[
                            { required: true, message: 'Lütfen gelir miktarını girin!' },
                            { type: 'number', min: 0.01, message: 'Miktar 0\'dan büyük olmalı!' }
                        ]}
                    >
                        <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} placeholder="Örn: 1500" />
                    </Form.Item>

                    <Form.Item
                        name="kategori"
                        label="Kategori"
                        rules={[{ required: true, message: 'Lütfen kategori seçin!' }]}
                    >
                        <Select placeholder="Kategori seçin">
                            <Option value="maaş">maaş</Option>
                            <Option value="tasarruf">tasarruf</Option>
                            <Option value="diğer">diğer</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="not" label="Not (İsteğe Bağlı)">
                        <Input.TextArea rows={3} placeholder="Gelir ile ilgili kısa bir not ekle" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            {loading ? "Kaydediliyor..." : "Geliri Kaydet"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </main>
    );
};

export default MainContent;