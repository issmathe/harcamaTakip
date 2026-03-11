import React, { useState, useMemo, useRef } from "react";
import { Typography, Button, Modal, Input, message, Spin, Empty, ConfigProvider } from "antd";
import { 
  EditOutlined, DeleteOutlined, 
  GoldOutlined
} from '@ant-design/icons';
import BottomNav from "../components/Home/BottomNav.jsx";
import { useTotalsContext } from "../context/TotalsContext"; 
import axios from "axios";
import dayjs from 'dayjs';
import tr from 'dayjs/locale/tr';

import CustomDayPicker from "../components/Forms/CustomDayPicker";

import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions, 
  LeadingActions,  
  Type as ListType,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";

dayjs.locale(tr);

const { Text, Title } = Typography;
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api"; 
const MESSAGE_KEY = 'silmeIslemiBirikim';

const BirikimContent = () => {
  const { harcamalar = [], gelirler = [], refetch, isLoading: isContextLoading } = useTotalsContext();
  const deleteTimerRef = useRef(null); 

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ 
    miktar: "", kategori: "tasarruf", not: "", tarih: dayjs().toDate(), tip: "" 
  });

  const birikimListesi = useMemo(() => {
    const gTasarruf = (gelirler || [])
      .filter(g => g.kategori?.toLowerCase() === "tasarruf")
      .map(s => ({ ...s, tip: "ARTIŞ", renk: "text-emerald-500", iconColor: "bg-emerald-50 text-emerald-500" }));

    const hTasarruf = (harcamalar || [])
      .filter(h => h.kategori?.toLowerCase() === "tasarruf")
      .map(s => ({ ...s, tip: "AZALIŞ", renk: "text-blue-500", iconColor: "bg-blue-50 text-blue-500" }));

    return [...gTasarruf, ...hTasarruf]
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [gelirler, harcamalar]);

  const netBirikim = useMemo(() => {
    return birikimListesi.reduce((sum, item) => 
      item.tip === "ARTIŞ" ? sum + Number(item.miktar) : sum - Number(item.miktar), 0
    );
  }, [birikimListesi]);

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      miktar: item.miktar,
      kategori: item.kategori,
      not: item.not || "",
      tarih: dayjs(item.createdAt).toDate(),
      tip: item.tip
    });
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    if (!formData.miktar) return message.error("Miktar boş olamaz!");
    try {
      const endpoint = editingItem.tip === "ARTIŞ" ? "gelir" : "harcama";
      const payload = { 
        miktar: parseFloat(formData.miktar), 
        kategori: "tasarruf", 
        not: formData.not, 
        createdAt: dayjs(formData.tarih).toISOString() 
      };
      await axios.put(`${API_URL}/${endpoint}/${editingItem._id}`, payload); 
      message.success("Güncellendi");
      setEditModalVisible(false);
      refetch(); 
    } catch (err) {
      message.error("Hata oluştu");
    }
  };

  const startDeleteProcess = (item) => {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    message.success({ 
      content: (
        <span className="flex items-center space-x-2">
          <Text strong>Kayıt silindi</Text>
          <Button type="link" size="small" onClick={() => { 
              clearTimeout(deleteTimerRef.current); 
              message.destroy(MESSAGE_KEY); 
            }}>Geri Al</Button>
        </span>
      ), 
      key: MESSAGE_KEY, 
      duration: 3 
    });
    deleteTimerRef.current = setTimeout(async () => {
      const endpoint = item.tip === "ARTIŞ" ? "gelir" : "harcama";
      await axios.delete(`${API_URL}/${endpoint}/${item._id}`);
      refetch();
    }, 3000);
  };

  const leadingActions = (item) => (
    <LeadingActions>
      <SwipeAction onClick={() => openEditModal(item)}>
        <div className="bg-blue-500 text-white flex justify-center items-center h-full w-20 rounded-l-3xl">
          <EditOutlined className="text-xl" />
        </div>
      </SwipeAction>
    </LeadingActions>
  );

  const trailingActions = (item) => (
    <TrailingActions>
      <SwipeAction destructive onClick={() => startDeleteProcess(item)}>
        <div className="bg-red-500 text-white flex justify-center items-center h-full w-20 rounded-r-3xl">
          <DeleteOutlined className="text-xl" />
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  if (isContextLoading) return <div className="flex justify-center items-center h-screen bg-gray-50"><Spin size="large" /></div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24 font-sans">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 shadow-sm text-center">
          <Text className="block text-[10px] uppercase tracking-tighter text-gray-400 font-bold">Birikimler</Text>
          <Title level={5} className="m-0 uppercase font-mono tracking-widest" style={{ margin: 0 }}>Toplam Portföy</Title>
      </div>

      <div className="p-4 space-y-4">
<div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center">
  <div className="flex justify-center items-center gap-2">
    <Text className="text-[11px] font-bold uppercase text-gray-400">Net Varlık:</Text>
    {/* Rengi dinamik yapmak istersen: netBirikim >= 0 ? 'text-emerald-600' : 'text-red-500' */}
    <Text className="text-base font-black text-emerald-600 font-mono">
      {/* Math.abs başındaki - işaretini kaldırır */}
      {Math.abs(netBirikim).toFixed(2).replace('.', ',')}€
    </Text>
  </div>
</div>

        {birikimListesi.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <Empty description="Kayıt bulunamadı" />
          </div>
        ) : (
          <div className="space-y-3 transition-all">
            <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.IOS}>
              {birikimListesi.map((item) => {
                const isToday = dayjs(item.createdAt).isSame(dayjs(), 'day');
                return (
                  <SwipeableListItem 
                    key={item._id} 
                    leadingActions={leadingActions(item)} 
                    trailingActions={trailingActions(item)}
                  >
                    <div className={`flex items-center w-full p-4 mb-3 rounded-3xl shadow-sm border active:scale-[0.98] transition-all ${isToday ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-gray-50'}`}>
                      <div className={`p-3 rounded-2xl mr-4 ${item.iconColor} flex items-center justify-center text-lg`}>
                        <GoldOutlined />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center">
                          <Text strong className={`text-[10px] uppercase tracking-wide ${item.renk === 'text-emerald-500' ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {item.tip === 'ARTIŞ' ? 'Giriş' : 'Çıkış'}
                          </Text>
                          <Text className={`text-base font-black font-mono ${item.renk}`}>
                             {Number(item.miktar).toFixed(2).replace('.', ',')}€
                          </Text>
                        </div>
                        <div className="flex justify-between items-end mt-1">
                          <div className="flex flex-col min-w-0">
                            <Text className={`text-[10px] font-medium ${isToday ? 'text-emerald-400' : 'text-gray-400'}`}>
                                {isToday ? "Bugün, " : ""}{dayjs(item.createdAt).format('DD MMMM, HH:mm')}
                            </Text>
                            {item.not && (
                                <Text className="text-[11px] text-gray-400 italic truncate max-w-[150px] mt-0.5">
                                    {item.not}
                                </Text>
                            )}
                          </div>
                          {isToday && <div className="bg-emerald-100 px-2 py-0.5 rounded-md"><Text className="text-[9px] text-emerald-600 uppercase font-bold">Yeni</Text></div>}
                        </div>
                      </div>
                    </div>
                  </SwipeableListItem>
                );
              })}
            </SwipeableList>
          </div>
        )}
      </div>

      <Modal
        title={<div className="text-lg font-bold text-emerald-600 font-mono tracking-widest uppercase text-center">Düzenle</div>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        centered
        width={380}
        styles={{ body: { padding: '12px 16px' } }}
      >
        <div className="space-y-4">
          <div className="bg-emerald-50/50 py-2 px-4 rounded-2xl text-center border border-emerald-100">
            <Text strong className="text-[10px] text-emerald-400 uppercase block mb-0">Miktar</Text>
            <Input 
              variant="borderless" 
              type="number" 
              inputMode="decimal" 
              className="p-0 text-3xl font-black text-emerald-600 text-center leading-tight font-mono" 
              value={formData.miktar} 
              suffix={<span className="text-emerald-300 text-lg">€</span>}
              onFocus={(e) => e.target.select()}
              onChange={e => setFormData({...formData, miktar: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 min-w-0">
              <Text strong className="text-[9px] text-gray-400 uppercase block mb-0.5 ml-1">Tarih</Text>
              <CustomDayPicker value={formData.tarih} onChange={d => setFormData({...formData, tarih: d})} isIncome={formData.tip === "ARTIŞ"} />
            </div>
            <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 flex flex-col justify-center items-center">
              <Text strong className="text-[9px] text-gray-400 uppercase block mb-0.5">Tür</Text>
              <Text className={`font-bold text-xs uppercase ${formData.tip === 'ARTIŞ' ? 'text-emerald-600' : 'text-blue-600'}`}>
                {formData.tip === 'ARTIŞ' ? 'Giriş' : 'Çıkış'}
              </Text>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <Text strong className="text-[10px] text-gray-400 uppercase block mb-1">Not</Text>
            <Input.TextArea variant="borderless" rows={2} className="p-0 text-sm" value={formData.not} onChange={e => setFormData({...formData, not: e.target.value})} placeholder="Detaylar..." />
          </div>

          <Button 
            type="primary" 
            block 
            onClick={handleEditSave}
            className="h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-500 border-none rounded-xl uppercase tracking-widest mt-2"
          >
            Güncelle
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const Birikim = () => (
    <ConfigProvider theme={{ token: { borderRadius: 16, colorPrimary: '#10b981' } }}>
        <div className="relative min-h-screen bg-gray-50">
            <main><BirikimContent /></main>
            <BottomNav />
        </div>
    </ConfigProvider>
);

export default Birikim;