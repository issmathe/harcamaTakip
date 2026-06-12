import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, List, Select, Popconfirm, message } from "antd";
import { 
  PlusOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined, 
  SearchOutlined,
  SaveOutlined,
  MenuUnfoldOutlined
} from "@ant-design/icons";
import axios from "axios";

const API_URL = "http://localhost:5001/notes"; 

const Notes = () => {
  const navigate = useNavigate();
  const [notlar, setNotlar] = useState([]);
  const [seciliNot, setSeciliNot] = useState(null);
  const [aramaMetni, setAramaMetni] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Mobilde liste mi yoksa editör mü görünecek kontrolü
  const [mobilGörünüm, setMobilGörünüm] = useState("liste"); // "liste" veya "editor"

  // Form State'leri
  const [baslik, setBaslik] = useState("");
  const [icerik, setIerik] = useState("");
  const [etiket, setEtiket] = useState("Genel");

  const notlariGetir = async (secilecekId = null) => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setNotlar(res.data);
      
      if (secilecekId) {
        const bulunan = res.data.find(n => n._id === secilecekId);
        if (bulunan) notSec(bulunan);
      } else if (res.data.length > 0 && !seciliNot && window.innerWidth > 768) {
        // Bilgisayarda ilk notu seç ama mobilde boş ekran kalmasın diye seçme
        notSec(res.data[0]);
      }
    } catch (err) {
      message.error("Notlar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    notlariGetir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notSec = (not) => {
    setSeciliNot(not);
    setBaslik(not.baslik);
    setIerik(not.icerik);
    setEtiket(not.etiket || "Genel");
    setMobilGörünüm("editor"); // Mobilde direkt editör ekranına geçiş yap
  };

  const yeniNotEkle = async () => {
    try {
      const yeni = {
        baslik: "Yeni Not",
        icerik: "",
        etiket: "Genel"
      };
      const res = await axios.post(API_URL, yeni);
      message.success("Yeni not oluşturuldu.");
      await notlariGetir(res.data._id);
    } catch (err) {
      message.error("Not oluşturulamadı.");
    }
  };

  const notuKaydet = async () => {
    if (!seciliNot) return;
    try {
      const guncelVeri = { baslik, icerik, etiket };
      await axios.put(`${API_URL}/${seciliNot._id}`, guncelVeri);
      message.success("Değişiklikler kaydedildi.");
      await notlariGetir(seciliNot._id);
    } catch (err) {
      message.error("Not güncellenirken hata oluştu.");
    }
  };

  const notuSil = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      message.success("Not silindi.");
      setSeciliNot(null);
      setMobilGörünüm("liste");
      await notlariGetir();
    } catch (err) {
      message.error("Not silinemedi.");
    }
  };

  const filtrelenmisNotlar = notlar.filter(not => 
    not.baslik.toLowerCase().includes(aramaMetni.toLowerCase()) ||
    not.icerik.toLowerCase().includes(aramaMetni.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans antialiased overflow-hidden">
      
      {/* SOL PANEL: NOT LİSTESİ (Mobilde sadece liste görünümündeyse açılır) */}
      <div className={`w-full md:w-80 border-r border-gray-200 bg-white flex flex-col h-full shadow-sm transition-all duration-300
        ${mobilGörünüm === "liste" ? "block" : "hidden md:flex"}`}>
        
        {/* Üst Menü */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2 bg-gray-50/50">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-gray-800"
          />
          <span className="font-bold text-base tracking-tight text-indigo-950">Notlarım</span>
          <Button 
            type="primary" 
            shape="circle" 
            icon={<PlusOutlined />} 
            onClick={yeniNotEkle}
            className="bg-indigo-600 hover:bg-indigo-700 border-none shadow-sm flex items-center justify-center"
          />
        </div>

        {/* Arama Barı */}
        <div className="p-3 border-b border-gray-100">
          <Input
            placeholder="Notlarda ara..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            className="rounded-xl bg-gray-100 border-none focus:bg-white transition-all py-1.5"
            allowClear
          />
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          <List
            loading={loading}
            dataSource={filtrelenmisNotlar}
            renderItem={(item) => {
              const isSelected = seciliNot?._id === item._id;
              return (
                <div
                  onClick={() => notSec(item)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-all flex justify-between items-start select-none
                    ${isSelected ? "bg-indigo-50 border-l-4 border-l-indigo-600" : "hover:bg-gray-50"}`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-semibold text-sm text-gray-900 truncate mb-1">
                      {item.baslik || "Başlıksız Not"}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {item.icerik ? item.icerik.substring(0, 45) : "Metin girilmedi..."}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    item.etiket === "Borç" ? "bg-rose-50 text-rose-600" :
                    item.etiket === "Alacak" ? "bg-emerald-50 text-emerald-600" :
                    item.etiket === "Plan" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    {item.etiket || "Genel"}
                  </span>
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* SAĞ PANEL: EDİTÖR (Mobilde sadece editör görünümündeyse açılır) */}
      <div className={`flex-1 flex flex-col bg-white h-full transition-all duration-300
        ${mobilGörünüm === "editor" ? "block" : "hidden md:flex"}`}>
        
        {seciliNot ? (
          <>
            {/* Editör Üst Aksiyon Çubuğu */}
            <div className="px-4 md:px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-2">
                {/* Mobilde Listeye Geri Dönme Butonu */}
                <Button
                  type="text"
                  icon={<MenuUnfoldOutlined />}
                  onClick={() => setMobilGörünüm("liste")}
                  className="md:hidden text-gray-500"
                />
                <Select
                  value={etiket}
                  onChange={(val) => setEtiket(val)}
                  variant="borderless"
                  className="font-semibold text-indigo-600"
                  options={[
                    { value: "Genel", label: "Genel" },
                    { value: "Borç", label: "Borç" },
                    { value: "Alacak", label: "Alacak" },
                    { value: "Plan", label: "Plan" },
                  ]}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={notuKaydet}
                  className="bg-emerald-600 hover:bg-emerald-700 border-none shadow-sm rounded-xl px-3 text-xs md:text-sm"
                >
                  Kaydet
                </Button>
                <Popconfirm
                  title="Not silinecek?"
                  onConfirm={() => notuSil(seciliNot._id)}
                  okText="Evet"
                  cancelText="Hayır"
                  okButtonProps={{ danger: true }}
                >
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    className="hover:bg-red-50 rounded-xl"
                  />
                </Popconfirm>
              </div>
            </div>

            {/* Giriş Alanları */}
            <div className="flex-1 p-4 md:p-8 flex flex-col gap-4 overflow-y-auto">
              <input
                type="text"
                value={baslik}
                onChange={(e) => setBaslik(e.target.value)}
                placeholder="Not Başlığı"
                className="w-full text-xl md:text-2xl font-bold tracking-tight text-gray-900 border-none outline-none placeholder-gray-300 bg-transparent"
              />
              <textarea
                value={icerik}
                onChange={(e) => setIerik(e.target.value)}
                placeholder="Buraya yazmaya başlayın..."
                className="w-full flex-1 text-sm md:text-base leading-relaxed text-gray-700 border-none outline-none resize-none placeholder-gray-300 min-h-[250px] bg-transparent"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 p-4 text-center">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-sm font-medium">Görüntülenecek not yok.</div>
            <div className="text-xs text-gray-400 mt-1">Sol üstteki menüden bir not seçebilir veya yeni bir not ekleyebilirsin.</div>
            <Button 
              type="primary" 
              onClick={() => setMobilGörünüm("liste")}
              className="mt-4 md:hidden bg-indigo-600 border-none rounded-xl"
            >
              Not Listesini Göster
            </Button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Notes;