import React, { useMemo, useRef } from "react";
import { Typography, Button, message, Spin, Empty, ConfigProvider } from "antd";
import { DeleteOutlined, GoldOutlined } from '@ant-design/icons';
import BottomNav from "../components/Home/BottomNav.jsx";
import { useTotalsContext } from "../context/TotalsContext"; 
import axios from "axios";
import dayjs from 'dayjs';
import tr from 'dayjs/locale/tr';

import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions, 
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

  // Birikim (tasarruf) ile ilgili tüm ham listeyi oluşturma
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

  // Alt hesapların ve genel varlığın hesaplanması
  const hesapOzetleri = useMemo(() => {
    let tradeRepublic = 0;
    let wise = 0;
    let nakit = 0;
    let netVarlik = 0;

    birikimListesi.forEach((item) => {
      const miktarNum = Number(item.miktar || 0);

      if (item.tip === "ARTIŞ") {
        netVarlik += miktarNum;
        // Doğrudan giriş veya transfer hedefi kontrolü
        const hedef = item.altKategori || item.hedefAltKategori;
        if (hedef === "Trade Republic") tradeRepublic += miktarNum;
        else if (hedef === "Wise") wise += miktarNum;
        else if (hedef === "Nakit") nakit += miktarNum;
      } else {
        netVarlik -= miktarNum;
        // Harcama çıkışı veya transfer kaynak kontrolü
        const kaynak = item.altKategori || item.kaynakAltKategori;
        if (kaynak === "Trade Republic") tradeRepublic -= miktarNum;
        else if (kaynak === "Wise") wise -= miktarNum;
        else if (kaynak === "Nakit") nakit -= miktarNum;
      }
    });

    return { tradeRepublic, wise, nakit, netVarlik };
  }, [birikimListesi]);

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
        {/* Net Varlık Ana Kartı */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="flex justify-center items-center gap-2">
            <Text className="text-[11px] font-bold uppercase text-gray-400">Net Varlık:</Text>
            <Text className={`text-base font-black font-mono ${hesapOzetleri.netVarlik >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {hesapOzetleri.netVarlik.toFixed(2).replace('.', ',')}€
            </Text>
          </div>
        </div>

        {/* 📊 Üçlü Alt Hesap Kırılım Kartları */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-2.5 rounded-2xl border border-gray-100 text-center shadow-sm">
            <Text className="block text-[9px] uppercase tracking-tight text-gray-400 font-bold">Trade Rep.</Text>
            <Text className={`text-xs font-bold font-mono block mt-0.5 ${hesapOzetleri.tradeRepublic >= 0 ? 'text-slate-700' : 'text-rose-500'}`}>
              {hesapOzetleri.tradeRepublic.toFixed(2).replace('.', ',')}€
            </Text>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-gray-100 text-center shadow-sm">
            <Text className="block text-[9px] uppercase tracking-tight text-gray-400 font-bold">Wise</Text>
            <Text className={`text-xs font-bold font-mono block mt-0.5 ${hesapOzetleri.wise >= 0 ? 'text-slate-700' : 'text-rose-500'}`}>
              {hesapOzetleri.wise.toFixed(2).replace('.', ',')}€
            </Text>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-gray-100 text-center shadow-sm">
            <Text className="block text-[9px] uppercase tracking-tight text-gray-400 font-bold">Evde Nakit</Text>
            <Text className={`text-xs font-bold font-mono block mt-0.5 ${hesapOzetleri.nakit >= 0 ? 'text-slate-700' : 'text-rose-500'}`}>
              {hesapOzetleri.nakit.toFixed(2).replace('.', ',')}€
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
                // Kayıttaki aktif hesabı belirleme
                const aktifHesap = item.altKategori || (item.tip === "ARTIŞ" ? item.hedefAltKategori : item.kaynakAltKategori);

                return (
                  <SwipeableListItem 
                    key={item._id} 
                    trailingActions={trailingActions(item)}
                  >
                    <div className={`flex items-center w-full p-4 mb-3 rounded-3xl shadow-sm border active:scale-[0.98] transition-all ${isToday ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-gray-50'}`}>
                      <div className={`p-3 rounded-2xl mr-4 ${item.iconColor} flex items-center justify-center text-lg`}>
                        <GoldOutlined />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <Text strong className={`text-[10px] uppercase tracking-wide ${item.renk === 'text-emerald-500' ? 'text-emerald-600' : 'text-blue-600'}`}>
                              {item.tip === 'ARTIŞ' ? 'Giriş' : 'Çıkış'}
                            </Text>
                            {aktifHesap && (
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] text-gray-500 font-medium">
                                {aktifHesap}
                              </span>
                            )}
                          </div>
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