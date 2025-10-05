import React, { useState } from "react";
import {
    Typography,
    Tooltip,
    Modal,
    Form,
    Input,
    Button,
    InputNumber,
    message
} from "antd";
import {
    QuestionCircleOutlined, CarOutlined, HomeOutlined, ShoppingOutlined,
    DollarOutlined, CloseOutlined, ForkOutlined,
    BookOutlined, LaptopOutlined, GiftOutlined, MedicineBoxOutlined,
    ReadOutlined, ThunderboltOutlined
} from "@ant-design/icons";
import axios from "axios";
import { useTotalsContext } from "../../context/TotalsContext"; // Context'ten alıyoruz

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";
const { Text } = Typography;

const CategoryIcons = {
    Giyim: <ShoppingOutlined className="text-pink-600 text-xl" />,
    Gıda: <ForkOutlined className="text-orange-500 text-xl" />,
    Petrol: <CarOutlined className="text-gray-700 text-xl" />,
    Kira: <HomeOutlined className="text-blue-600 text-xl" />,
    Fatura: <DollarOutlined className="text-green-600 text-xl" />,
    Eğitim: <BookOutlined className="text-indigo-600 text-xl" />,
    Sağlık: <MedicineBoxOutlined className="text-red-500 text-xl" />,
    Ulaşım: <CarOutlined className="text-gray-700 text-xl" />,
    Eğlence: <GiftOutlined className="text-purple-600 text-xl" />,
    Elektronik: <LaptopOutlined className="text-cyan-500 text-xl" />,
    Spor: <ThunderboltOutlined className="text-lime-600 text-xl" />,
    Market: <ShoppingOutlined className="text-pink-600 text-xl" />,
    Kırtasiye: <ReadOutlined className="text-indigo-400 text-xl" />,
    "Restoran / Kafe": <ForkOutlined className="text-orange-500 text-xl" />,
    Diğer: <QuestionCircleOutlined className="text-yellow-600 text-xl" />,
};

const CATEGORIES = [
    "Giyim", "Gıda", "Petrol", "Kira", "Fatura", "Eğitim", "Sağlık",
    "Ulaşım", "Eğlence", "Elektronik", "Spor", "Market", "Kırtasiye",
    "Restoran / Kafe", "Diğer"
];

const MainContent = ({ radius = 30, center = 50, onCategoryClick }) => {
    const [showIcons, setShowIcons] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const { fetchTotals } = useTotalsContext(); // Context'ten fetchTotals alıyoruz

    const handleCenterClick = () => setShowIcons(prev => !prev);

    const handleIconClick = (category) => {
        setShowIcons(false);
        setSelectedCategory(category);
        setIsModalVisible(true);
        form.resetFields();
        if (onCategoryClick) onCategoryClick(category);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setSelectedCategory(null);
        form.resetFields();
    };

    const onFinish = async (values) => {
        const harcamaData = {
            miktar: values.miktar,
            kategori: selectedCategory,
            not: values.not,
        };

        setLoading(true);
        try {
            await axios.post(`${API_URL}/harcama`, harcamaData);
            message.success(`'${selectedCategory}' kategorisine ${values.miktar} ₺ harcama başarıyla eklendi!`);
            
            // Anlık veriyi güncelle
            await fetchTotals();

            handleModalCancel();
        } catch (error) {
            console.error(error.response?.data || error.message);
            message.error(`Harcama eklenirken hata: ${error.response?.data?.message || "Sunucu hatası"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 px-4 pt-4 pb-24">
            <div className="relative flex items-center justify-center h-80 w-80 mx-auto my-6">
                <div
                    onClick={handleCenterClick}
                    className="w-32 h-32 rounded-full bg-indigo-600 text-white flex flex-col items-center justify-center text-center z-0 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.05]"
                >
                    {showIcons ? (
                        <>
                            <CloseOutlined className="text-xl font-bold" />
                            <Text className="block !text-white text-xs mt-1 opacity-80">Vazgeç</Text>
                        </>
                    ) : (
                        <Text className="block !text-white font-bold text-lg">Harcama Ekle</Text>
                    )}
                </div>

                {showIcons && CATEGORIES.map((category, index) => {
                    const angle = (360 / CATEGORIES.length) * index;
                    const rad = (angle * Math.PI) / 180;
                    const finalRadius = 40;
                    const x = finalRadius * Math.cos(rad);
                    const y = finalRadius * Math.sin(rad);

                    return (
                        <Tooltip key={category} title={category} placement="top">
                            <button
                                onClick={() => handleIconClick(category)}
                                className="absolute bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:bg-indigo-100"
                                style={{
                                    top: `${center + y}%`,
                                    left: `${center + x}%`,
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                {CategoryIcons[category] || <QuestionCircleOutlined />}
                            </button>
                        </Tooltip>
                    );
                })}
            </div>

            <Modal
                title={`${selectedCategory} Harcaması Ekle`}
                visible={isModalVisible}
                onCancel={handleModalCancel}
                footer={null}
                maskClosable={!loading} 
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ miktar: null, not: "" }}
                >
                    <Form.Item
                        name="miktar"
                        label="Miktar (₺)"
                        rules={[
                            { required: true, message: 'Lütfen harcama miktarını girin!' },
                            { type: 'number', min: 0.01, message: 'Miktar 0\'dan büyük olmalıdır!' }
                        ]}
                    >
                        <InputNumber
                            min={0.01}
                            step={0.01}
                            style={{ width: '100%' }}
                            placeholder="Örn: 50.75"
                        />
                    </Form.Item>

                    <Form.Item
                        name="not"
                        label="Not (İsteğe Bağlı)"
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Harcama ile ilgili kısa bir not ekle"
                            maxLength={100}
                        />
                    </Form.Item>

                    <Form.Item className="mt-6">
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={loading}
                            disabled={loading}
                        >
                            {loading ? "Kaydediliyor..." : "Harcamayı Kaydet"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </main>
    );
};

export default MainContent;
