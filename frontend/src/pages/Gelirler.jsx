import React, { useState, useMemo, useCallback, useRef } from "react"; 
import { Typography, Button, Modal, Input, Select, message, Spin, Empty, ConfigProvider } from "antd";
import { 
  EditOutlined, DeleteOutlined, 
  LeftOutlined, RightOutlined, BankOutlined, SaveOutlined, EuroCircleOutlined, SwapOutlined
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
const { Option } = Select;
const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api"; 
const MESSAGE_KEY = 'silmeIslemi'; 

const ALL_GELIR_CATEGORIES = ["Gelir", "Tasarruf", "Diğer"]; 

const getCategoryDetails = (kategori, isTransfer) => {
  if (isTransfer) return { icon: <SwapOutlined />, color: 'bg-blue-50 text-blue-500' };
  const cat = kategori?.toLowerCase();
  if (cat === 'gelir') return { icon: <BankOutlined />, color: 'bg-emerald-50 text-emerald-500' };
  if (cat === 'tasarruf') return { icon: <SaveOutlined />, color: 'bg-blue-50 text-blue-500' };
  return { icon: <EuroCircleOutlined />, color: 'bg-gray-50 text-gray-500' };
};

const GelirlerContent = () => {
  const { gelirler = [], refetch, isLoading: isContextLoading } = useTotalsContext();
  const deleteTimerRef = useRef(null); 

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingGelir, setEditingGelir] = useState(null);
  
  const [formData, setFormData] = useState({ 
    miktar: "", kategori: "", not: "", tarih: dayjs().toDate()
  });

  const now = dayjs();
  const [selectedMonth, setSelectedMonth] = useState(now.month()); 
  const [selectedYear, setSelectedYear] = useState(now.year());

  const changeMonth = useCallback((direction) => {
    const current = dayjs().year(selectedYear).month(selectedMonth);
    const newDate = direction === 'prev' ? current.subtract(1,'month') : current.add(1,'month');
    setSelectedMonth(newDate.month());
    setSelectedYear(newDate.year());
  }, [selectedMonth, selectedYear]);

  const displayMonth = dayjs().year(selectedYear).month(selectedMonth).format('MMMM YYYY');
  const isFutureMonth = dayjs().year(selectedYear).month(selectedMonth).isAfter(now, 'month');

  // 🔄 AKILLI TRANSFER BİRLEŞTİRME SÜZGECİ
  const filteredGelirler = useMemo(() => {
    const filtered = (gelirler || []).filter((g) => {
      const t = dayjs(g.createdAt);
      return t.month() === selectedMonth && t.year() === selectedYear;
    });

    const birlesikListe = [];
    const islenenTransferler = new Set();

    filtered.forEach((kayit) => {
      const transferIdMatch = kayit.not && kayit.not.match(/\| ID:(TRF_\d+)/);

      if (transferIdMatch) {
        const transferId = transferIdMatch[1];
        
        if (!islenenTransferler.has(transferId)) {
          islenenTransferler.add(transferId);

          // Eşleşen diğer bacağı bul (Biri pozitif miktar diğeri negatif miktardır)
          const esKayit = filtered.find(x => x._id !== kayit._id && x.not && x.not.includes(transferId));

          let kaynak = kayit.kategori;
          let hedef = kayit.kategori;
          let temizNot = kayit.not.split(" | ID:")[0];

          if (esKayit) {
            if (kayit.miktar < 0) {
              kaynak = kayit.kategori;
              hedef = esKayit.kategori;
            } else {
              kaynak = esKayit.kategori;
              hedef = kayit.kategori;
            }
          }

          // Temiz not alanından teknik transfer yönlendirmelerini temizle
          temizNot = temizNot.replace(/\[Transfer -> [^\]]+\]\s*/g, "").replace(/\[Transfer <- [^\]]+\]\s*/g, "").trim();

          // Tek bir sanal transfer objesi oluşturuyoruz
          birlesikListe.push({
            ...kayit,
            _id: kayit._id, // Silme işlemi tetiklendiğinde backend regex ile ikisini de silecek
            isTransfer: true,
            kaynakKategori: kaynak,
            hedefKategori: hedef,
            miktar: Math.abs(kayit.miktar), // Ekranda sadece net transfer miktarını göster
            temizNot: temizNot
          });
        }
      } else {
        // Düz normal gelir kaydıysa dokunmadan listeye ekle
        birlesikListe.push({ ...kayit, isTransfer: false });
      }
    });

    // Tarihe göre yeniden sırala
    return birlesikListe.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [gelirler, selectedMonth, selectedYear]);

  // Dönem toplamında transferlerin birbirini ezmesini engellemek için sadece gerçek gelirleri topluyoruz
  const aylikToplam = useMemo(() => {
    return (gelirler || [])
      .filter((g) => {
        const t = dayjs(g.createdAt);
        const transferIdMatch = g.not && g.not.match(/\| ID:(TRF_\d+)/);
        return t.month() === selectedMonth && t.year() === selectedYear && !transferIdMatch;
      })
      .reduce((sum, g) => sum + Number(g.miktar || 0), 0);
  }, [gelirler, selectedMonth, selectedYear]);

  const openEditModal = (gelir) => {
    if (gelir.isTransfer) {
      return message.warning("Transfer işlemleri doğrudan düzenlenemez. Silip yeniden ekleyebilirsiniz.");
    }
    setEditingGelir(gelir);
    setFormData({
      miktar: gelir.miktar,
      kategori: gelir.kategori,
      not: gelir.not || "",
      tarih: dayjs(gelir.createdAt).toDate(), 
    });
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    if (!formData.miktar) return message.error("Miktar boş olamaz!");
    try {
      const payload = { 
        miktar: parseFloat(formData.miktar), 
        kategori: formData.kategori, 
        not: formData.not, 
        createdAt: dayjs(formData.tarih).toISOString() 
      };
      await axios.put(`${API_URL}/gelir/${editingGelir._id}`, payload); 
      message.success("Güncellendi!");
      setEditModalVisible(false);
      refetch(); 
    } catch (err) {
      message.error("Güncelleme başarısız!");
    }
  };

  const startDeleteProcess = (id) => {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    message.success({ 
      content: (
        <span className="flex items-center space-x-2">
          <Text strong>🗑️ Kayıt silindi</Text>
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
      await axios.delete(`${API_URL}/gelir/${id}`);
      refetch();
    }, 3000);
  };

  const leadingActions = (gelir) => (
    <LeadingActions>
      <SwipeAction onClick={() => openEditModal(gelir)}>
        <div className="bg-blue-500 text-white flex justify-center items-center h-full w-20 rounded-l-3xl">
          <EditOutlined className="text-xl" />
        </div>
      </SwipeAction>
    </LeadingActions>
  );

  const trailingActions = (gelir) => (
    <TrailingActions>
      <SwipeAction destructive onClick={() => startDeleteProcess(gelir._id)}>
        <div className="bg-red-500 text-white flex justify-center items-center h-full w-20 rounded-r-3xl">
          <DeleteOutlined className="text-xl" />
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  if (isContextLoading) return <div className="flex justify-center items-center h-screen bg-gray-50"><Spin size="large" /></div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">
          <Button icon={<LeftOutlined />} onClick={() => changeMonth("prev")} type="text" />
          <div className="text-center">
            <Text className="block text-[10px] uppercase tracking-tighter text-gray-400 font-bold">Gelirler</Text>
            <Title level={5} className="m-0 capitalize" style={{ margin: 0 }}>{displayMonth}</Title>
          </div>
          <Button icon={<RightOutlined />} onClick={() => changeMonth("next")} disabled={isFutureMonth} type="text" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="flex justify-center items-center gap-2">
            <Text className="text-[11px] font-bold uppercase text-gray-400">Dönem Toplamı:</Text>
            <Text className="text-base font-black text-emerald-600">
              +{aylikToplam.toFixed(2).replace('.', ',')}€
            </Text>
          </div>
        </div>

        {filteredGelirler.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <Empty description="Kayıt bulunamadı" />
          </div>
        ) : (
          <div className="space-y-3 transition-all">
            <SwipeableList threshold={0.3} fullSwipe={true} listType={ListType.IOS}>
              {filteredGelirler.map((gelir) => {
                const { icon, color } = getCategoryDetails(gelir.kategori, gelir.isTransfer);
                const isToday = dayjs(gelir.createdAt).isSame(now, 'day');

                return (
                  <SwipeableListItem 
                    key={gelir._id} 
                    leadingActions={leadingActions(gelir)} 
                    trailingActions={trailingActions(gelir)}
                  >
                    <div className={`flex items-center w-full p-4 mb-3 rounded-3xl shadow-sm border active:scale-[0.98] transition-all ${
                      gelir.isTransfer 
                        ? 'bg-blue-50/20 border-blue-100' 
                        : isToday ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-gray-50'
                    }`}>
                      <div className={`p-3 rounded-2xl mr-4 ${color} flex items-center justify-center text-lg`}>
                        {icon}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center">
                          {gelir.isTransfer ? (
                            <Text strong className="text-xs uppercase tracking-wide text-blue-500">
                              {gelir.kaynakKategori} ➔ {gelir.hedefKategori}
                            </Text>
                          ) : (
                            <Text strong className={`text-xs uppercase tracking-wide ${isToday ? 'text-emerald-600' : 'text-gray-500'}`}>{gelir.kategori}</Text>
                          )}
                          <Text className={`text-base font-black ${gelir.isTransfer ? 'text-blue-500' : 'text-emerald-600'}`}>
                            {gelir.isTransfer ? "" : "+"}{gelir.miktar}€
                          </Text>
                        </div>
                        <div className="flex justify-between items-end mt-1">
                          <div className="flex flex-col">
                            <Text className={`text-[10px] font-medium ${gelir.isTransfer ? 'text-blue-400' : isToday ? 'text-emerald-400' : 'text-gray-400'}`}>
                                {isToday ? "Bugün, " : ""}{dayjs(gelir.createdAt).format('DD MMMM, HH:mm')}
                            </Text>
                            {gelir.isTransfer ? (
                              <Text className="text-[11px] text-gray-400 italic truncate max-w-[180px] mt-0.5">
                                🔄 Transfer {gelir.temizNot ? `| ${gelir.temizNot}` : ""}
                              </Text>
                            ) : (
                              gelir.not && (
                                <Text className="text-[11px] text-gray-400 italic truncate max-w-[150px] mt-0.5">
                                    {gelir.not}
                                </Text>
                              )
                            )}
                          </div>
                          {isToday && (
                            <div className={`px-2 py-0.5 rounded-md ${gelir.isTransfer ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                              <Text className={`text-[9px] uppercase font-bold ${gelir.isTransfer ? 'text-blue-600' : 'text-emerald-600'}`}>Yeni</Text>
                            </div>
                          )}
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
        title={<div className="text-lg font-bold text-emerald-600 font-mono tracking-widest uppercase text-center">Geliri Düzenle</div>}
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
              className="p-0 text-3xl font-black text-emerald-600 text-center leading-tight" 
              value={formData.miktar} 
              suffix={<span className="text-emerald-300 text-lg">€</span>}
              onFocus={(e) => e.target.select()}
              onChange={e => setFormData({...formData, miktar: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 min-w-0">
              <Text strong className="text-[9px] text-gray-400 uppercase block mb-0.5 ml-1">Tarih</Text>
              <div className="flex items-center w-full overflow-hidden">
                <CustomDayPicker value={formData.tarih} onChange={d => setFormData({...formData, tarih: d})} isIncome={true} />
              </div>
            </div>
            <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 min-w-0">
              <Text strong className="text-[9px] text-gray-400 uppercase block mb-0.5 ml-1">Kategori</Text>
              <Select 
                variant="borderless" 
                size="small" 
                className="w-full font-bold text-xs" 
                style={{ padding: 0 }}
                value={formData.kategori} 
                onChange={v => setFormData({...formData, kategori: v})}
              >
                {ALL_GELIR_CATEGORIES.map(cat => <Option key={cat} value={cat.toLowerCase()}>{cat}</Option>)}
              </Select>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <Text strong className="text-[10px] text-gray-400 uppercase block mb-1">Not</Text>
            <Input.TextArea variant="borderless" rows={2} className="p-0 text-sm" value={formData.not} onChange={e => setFormData({...formData, not: e.target.value})} placeholder="Açıklama..." />
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

const Gelirler = () => (
    <ConfigProvider theme={{ token: { borderRadius: 16, colorPrimary: '#10b981' } }}>
        <div className="relative min-h-screen bg-gray-50">
            <main><GelirlerContent /></main>
            <BottomNav />
        </div>
    </ConfigProvider>
);

export default Gelirler;