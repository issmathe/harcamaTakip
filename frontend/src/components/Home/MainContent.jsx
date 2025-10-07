import React, { useState } from "react";
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

const MainContent = ({ radius = 40, center = 50 }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedMarket, setSelectedMarket] = useState(""); 
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const [isGelirModalVisible, setIsGelirModalVisible] = useState(false);
    const [gelirForm] = Form.useForm();

    const { fetchTotals } = useTotalsContext();

    const handleIconClick = (category) => {
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
                <div
                    onClick={handleGelirClick}
                    className="w-32 h-32 rounded-full bg-indigo-600 text-white flex flex-col items-center justify-center text-center shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.05] z-10"
                >
                    <Text className="block !text-white font-bold text-lg">Gelir Ekle</Text>
                </div>

                {CATEGORIES.map((category, index) => {
                    const angle = (360 / CATEGORIES.length) * index;
                    const rad = (angle * Math.PI) / 180;
                    const x = radius * Math.cos(rad);
                    const y = radius * Math.sin(rad);

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
      allowClear={false} // allowClear kapatıldı, seçim zorunlu
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
