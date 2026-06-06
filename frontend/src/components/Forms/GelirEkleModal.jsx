import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Radio, Select } from "antd";
import { MessageCircle, Delete } from "lucide-react";import dayjs from "dayjs";
import CustomDayPicker from "./CustomDayPicker";

const { Option } = Select;

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

const GelirEkleModal = ({ open, onClose, onSave }) => {
  const [gelirForm] = Form.useForm();
  const [amount, setAmount] = useState("");
  const [gelirIslemTuru, setGelirIslemTuru] = useState("gelir");
  const [showNote, setShowNote] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dinamik olarak alt kategorileri göstermek için state takipleri
  const kategoriWatch = Form.useWatch("kategori", gelirForm);
  const kaynakWatch = Form.useWatch("kaynakKategori", gelirForm);
  const hedefWatch = Form.useWatch("hedefKategori", gelirForm);

  useEffect(() => {
    if (open) {
      setAmount("");
      setGelirIslemTuru("gelir");
      setShowNote(false);
      gelirForm.resetFields();
      gelirForm.setFieldsValue({
        tarih: dayjs().toDate(),
        kategori: "gelir",
        kaynakKategori: "gelir",
        hedefKategori: "tasarruf",
        altKategori: "Trade Republic",
        kaynakAltKategori: "Nakit",
        hedefAltKategori: "Trade Republic"
      });
    }
  }, [open, gelirForm]);

  const handleFormFinish = async (values) => {
    const num = parseFloat(amount.replace(",", "."));
    if (isNaN(num) || num <= 0) return;

    setLoading(true);
    try {
      let payload = {
        miktar: num,
        not: values.not || "",
        createdAt: values.tarih ? dayjs(values.tarih).toISOString() : dayjs().toISOString(),
      };

      if (gelirIslemTuru === "transfer") {
        if (values.kaynakKategori === values.hedefKategori && values.kaynakAltKategori === values.hedefAltKategori) {
          return; // Aynı hesaba transferi engelle
        }
        payload.kaynakKategori = values.kaynakKategori;
        payload.hedefKategori = values.hedefKategori;
        
        if (values.kaynakKategori === "tasarruf") payload.kaynakAltKategori = values.kaynakAltKategori;
        if (values.hedefKategori === "tasarruf") payload.hedefAltKategori = values.hedefAltKategori;
        
      } else {
        payload.kategori = values.kategori || "gelir";
        if (values.kategori === "tasarruf") {
          payload.altKategori = values.altKategori; // Trade Republic, Wise veya Nakit
        }
      }

      await onSave(payload);
      onClose();
    } catch (err) {
      // Hata yönetimi üst bileşende
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex flex-col gap-2">
          <div className="text-lg font-bold text-orange-400 font-mono tracking-widest uppercase">
            {gelirIslemTuru === "transfer" ? "Kategoriler Arası Transfer" : "Gelir Kaynağı"}
          </div>
          <Radio.Group value={gelirIslemTuru} onChange={(e) => setGelirIslemTuru(e.target.value)} size="small" className="mt-1">
            <Radio.Button value="gelir" className="text-xs">Gelir Ekle</Radio.Button>
            <Radio.Button value="transfer" className="text-xs">Transfer Et</Radio.Button>
          </Radio.Group>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={380}
      styles={{ body: { padding: "12px 16px" } }}
    >
      <div className="bg-orange-950/40 backdrop-blur-xl p-3 rounded-2xl mb-3 text-center border border-orange-500/20">
        <div className="text-4xl font-black text-white tracking-tight">
          {amount || "0"}<span className="text-xl ml-2 text-orange-500/50">€</span>
        </div>
      </div>

      <Form form={gelirForm} layout="vertical" onFinish={handleFormFinish}>
        {gelirIslemTuru === "transfer" ? (
          <div className="space-y-2 mb-2">
            <div className="grid grid-cols-3 gap-2 items-end">
              <Form.Item name="tarih" label={<span className="text-gray-400 text-xs">Zaman</span>} className="mb-0">
                <CustomDayPicker isIncome={true} />
              </Form.Item>
              <Form.Item name="kaynakKategori" label={<span className="text-gray-400 text-xs">Nereden</span>} className="mb-0">
                <Select className="w-full" style={{ height: "38px" }}>
                  <Option value="gelir">Normal</Option>
                  <Option value="tasarruf">Birikim</Option>
                  <Option value="diğer">Ekstra</Option>
                </Select>
              </Form.Item>
              <Form.Item name="hedefKategori" label={<span className="text-gray-400 text-xs">Nereye</span>} className="mb-0">
                <Select className="w-full" style={{ height: "38px" }}>
                  <Option value="gelir">Normal</Option>
                  <Option value="tasarruf">Birikim</Option>
                  <Option value="diğer">Ekstra</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Transfer alt hesap kırılımları */}
            <div className="grid grid-cols-2 gap-2">
              {kaynakWatch === "tasarruf" && (
                <Form.Item name="kaynakAltKategori" label={<span className="text-orange-400 text-[10px] uppercase font-bold">Kaynak Hesap</span>} className="mb-0">
                  <Select className="w-full" style={{ height: "38px" }}>
                    <Option value="Trade Republic">Trade Republic</Option>
                    <Option value="Wise">Wise</Option>
                    <Option value="Nakit">Evdeki Nakit</Option>
                  </Select>
                </Form.Item>
              )}
              {hedefWatch === "tasarruf" && (
                <Form.Item name="hedefAltKategori" label={<span className="text-emerald-400 text-[10px] uppercase font-bold">Hedef Hesap</span>} className="mb-0">
                  <Select className="w-full" style={{ height: "38px" }}>
                    <Option value="Trade Republic">Trade Republic</Option>
                    <Option value="Wise">Wise</Option>
                    <Option value="Nakit">Evdeki Nakit</Option>
                  </Select>
                </Form.Item>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 mb-2">
            <div className="grid grid-cols-2 gap-3 items-end">
              <Form.Item name="tarih" label={<span className="text-gray-400 text-xs">Zaman</span>} className="mb-0">
                <CustomDayPicker isIncome={true} />
              </Form.Item>
              <Form.Item name="kategori" label={<span className="text-gray-400 text-xs">Tür</span>} className="mb-0">
                <Select className="w-full" style={{ height: "38px" }}>
                  <Option value="gelir">Normal Gelir</Option>
                  <Option value="tasarruf">Birikim (Tasarruf)</Option>
                  <Option value="diğer">Ekstra</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Normal Gelir eklerken eğer Birikim seçildiyse hesap türü sor */}
            {kategoriWatch === "tasarruf" && (
              <Form.Item name="altKategori" label={<span className="text-emerald-400 text-[10px] uppercase font-bold">Hangi Birikim Hesabı?</span>} className="mb-0">
                <Select className="w-full" style={{ height: "38px" }}>
                  <Option value="Trade Republic">Trade Republic</Option>
                  <Option value="Wise">Wise</Option>
                  <Option value="Nakit">Evdeki Nakit</Option>
                </Select>
              </Form.Item>
            )}
          </div>
        )}

        <NumericNumpad value={amount} onChange={setAmount} />

        {showNote ? (
          <Form.Item name="not" className="mt-2 mb-0">
            <Input placeholder="Not ekleyin..." autoFocus className="bg-slate-800 border-slate-700 text-white rounded-xl h-10" style={{ color: "#ffffff", backgroundColor: "#1e293b" }} />
          </Form.Item>
        ) : (
          <Button type="text" onClick={() => setShowNote(true)} icon={<MessageCircle size={14} />} className="w-full mt-2 text-slate-400 text-xs">Not Ekle</Button>
        )}

        <Button type="primary" htmlType="submit" block loading={loading} className="mt-4 h-12 text-lg font-bold bg-orange-600 hover:bg-orange-500 border-none rounded-xl uppercase">
          {gelirIslemTuru === "transfer" ? "Transferi Tamamla" : "Gelir Ekle"}
        </Button>
      </Form>
    </Modal>
  );
};

export default GelirEkleModal;