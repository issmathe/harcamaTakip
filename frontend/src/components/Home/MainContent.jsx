import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Shirt,
  Wallet,
  Fuel,
  Home,
  ReceiptText,
  BookOpen,
  HeartPulse,
  Car,
  Gift,
  Laptop,
  Zap,
  ShoppingCart,
  PartyPopper,
  Utensils,
  HelpCircle,
  Users,
  MessageCircle,
  Delete,
  TrendingUp
} from "lucide-react";

const CategoryIcons = {
  Market: { icon: ShoppingCart, gradient: "from-teal-400 to-cyan-500", glow: "shadow-teal-500/50" },
  Giyim: { icon: Shirt, gradient: "from-red-400 to-pink-500", glow: "shadow-red-500/50" },
  Tasarruf: { icon: Wallet, gradient: "from-pink-400 to-rose-500", glow: "shadow-pink-500/50" },
  Petrol: { icon: Fuel, gradient: "from-amber-400 to-orange-500", glow: "shadow-amber-500/50" },
  Kira: { icon: Home, gradient: "from-purple-400 to-violet-500", glow: "shadow-purple-500/50" },
  Fatura: { icon: ReceiptText, gradient: "from-indigo-400 to-blue-500", glow: "shadow-indigo-500/50" },
  Eğitim: { icon: BookOpen, gradient: "from-lime-400 to-green-500", glow: "shadow-lime-500/50" },
  Sağlık: { icon: HeartPulse, gradient: "from-emerald-400 to-teal-500", glow: "shadow-emerald-500/50" },
  Ulaşım: { icon: Car, gradient: "from-sky-400 to-blue-500", glow: "shadow-sky-500/50" },
  Eğlence: { icon: PartyPopper, gradient: "from-yellow-400 to-orange-500", glow: "shadow-yellow-500/50" },
  Elektronik: { icon: Laptop, gradient: "from-gray-400 to-slate-500", glow: "shadow-gray-500/50" },
  İletisim: { icon: Zap, gradient: "from-blue-400 to-cyan-500", glow: "shadow-blue-500/50" },
  Hediye: { icon: Gift, gradient: "from-fuchsia-400 to-pink-500", glow: "shadow-fuchsia-500/50" },
  Restoran: { icon: Utensils, gradient: "from-orange-400 to-red-500", glow: "shadow-orange-500/50" },
  Aile: { icon: Users, gradient: "from-green-400 to-emerald-500", glow: "shadow-green-500/50" },
  Diğer: { icon: HelpCircle, gradient: "from-neutral-400 to-gray-500", glow: "shadow-neutral-500/50" },
};

const CATEGORIES = Object.keys(CategoryIcons);
const MARKETLER = ["Lidl", "Aldi", "DM", "Action", "Norma", "Türk Market", "Et-Tavuk", "Kaufland", "bäckerei", "Rewe", "Netto", "Tedi", "Kik", "Fundgrube", "Rossmann", "Edeka", "Biomarkt", "Penny", "Diğer"];
const GIYIM_KISILERI = ["Ahmet", "Ayşe", "Yusuf", "Zeynep", "Hediye"];
const AILE_UYELERI = ["Ayşe", "Yusuf", "Zeynep"];

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
    <div className="grid grid-cols-3 gap-3 mt-4">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "back"].map((key) => (
        <button
          key={key}
          onClick={() => handlePress(key)}
          className={`h-14 text-xl font-semibold rounded-xl transition-all transform active:scale-95 ${
            key === "back" 
              ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30" 
              : "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20"
          }`}
        >
          {key === "back" ? <Delete size={24} className="mx-auto" /> : key}
        </button>
      ))}
    </div>
  );
};

const MainContent = ({ radius = 40, center = 50 }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isGelirModalVisible, setIsGelirModalVisible] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [amount, setAmount] = useState("");
  const [tarih, setTarih] = useState(new Date());
  const [altKategori, setAltKategori] = useState("");
  const [not, setNot] = useState("");
  const [gelirKategori, setGelirKategori] = useState("gelir");
  
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);
  const wheelRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  const getTopCategory = useCallback(() => {
    const angle = 360 / CATEGORIES.length;
    const normalized = ((rotation % 360) + 360) % 360;
    return CATEGORIES[(Math.round(-normalized / angle) + CATEGORIES.length) % CATEGORIES.length];
  }, [rotation]);

  const currentTopCategory = getTopCategory();
  const currentCategoryTotal = 1247.50;
  const formattedTotal = currentCategoryTotal.toFixed(2).replace(".", ",");

  const getAngle = (cX, cY, pX, pY) => Math.atan2(pY - cY, pX - cX) * (180 / Math.PI);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = wheelRef.current.getBoundingClientRect();
    setLastAngle(getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY));
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const angle = getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY);
    let delta = angle - lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    setRotation((p) => p + delta);
    setLastAngle(angle);
  }, [isDragging, lastAngle]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    const rect = wheelRef.current.getBoundingClientRect();
    setLastAngle(getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, t.clientX, t.clientY));
    touchStartPos.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchMove = useCallback((e) => {
    const t = e.touches[0];
    const dx = t.clientX - touchStartPos.current.x;
    const dy = t.clientY - touchStartPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10 || isDragging) {
      if (e.cancelable) e.preventDefault();
      if (!isDragging) setIsDragging(true);
      const rect = wheelRef.current.getBoundingClientRect();
      const angle = getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, t.clientX, t.clientY);
      let delta = angle - lastAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      setRotation((p) => p + delta);
      setLastAngle(angle);
    }
  }, [isDragging, lastAngle]);

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    wheel.addEventListener("touchmove", handleTouchMove, { passive: false });
    wheel.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      wheel.removeEventListener("touchmove", handleTouchMove);
      wheel.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const handleIconClick = (category) => {
    if (isDragging) return;
    setSelectedCategory(category);
    setIsModalVisible(true);
    setAmount("");
    setShowNote(false);
    setAltKategori("");
    setNot("");
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedCategory(null);
    setAmount("");
    setShowNote(false);
  };

  const handleGelirClick = () => {
    setIsGelirModalVisible(true);
    setAmount("");
    setGelirKategori("gelir");
    setNot("");
  };

  const handleGelirCancel = () => {
    setIsGelirModalVisible(false);
    setAmount("");
  };

  const handleSave = () => {
    const num = parseFloat(amount.replace(",", "."));
    if (isNaN(num) || num <= 0) {
      alert("Geçerli bir miktar girin!");
      return;
    }
    alert(`${selectedCategory}: ${amount}€ kaydedildi!`);
    handleModalCancel();
  };

  const handleGelirSave = () => {
    const num = parseFloat(amount.replace(",", "."));
    if (isNaN(num) || num <= 0) {
      alert("Geçerli bir miktar girin!");
      return;
    }
    alert(`Gelir: ${amount}€ kaydedildi!`);
    handleGelirCancel();
  };

  return (
    <main className="flex-1 px-4 pt-4 pb-4 relative overflow-hidden">
      {/* Animated Space Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 -z-10">
        {/* Stars */}
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDuration: `${Math.random() * 2 + 1}s`
            }}
          />
        ))}
        
        {/* Planet 1 - Large Purple */}
        <div 
          className="absolute w-64 h-64 rounded-full opacity-30 blur-2xl animate-pulse"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #a855f7, #6366f1)',
            top: '-10%',
            right: '-10%',
            animationDuration: '4s'
          }}
        />
        
        {/* Planet 2 - Small Blue */}
        <div 
          className="absolute w-32 h-32 rounded-full opacity-40 blur-xl animate-pulse"
          style={{
            background: 'radial-gradient(circle at 40% 40%, #60a5fa, #3b82f6)',
            bottom: '20%',
            left: '5%',
            animationDuration: '3s',
            animationDelay: '1s'
          }}
        />
        
        {/* Planet 3 - Medium Pink */}
        <div 
          className="absolute w-48 h-48 rounded-full opacity-25 blur-2xl animate-pulse"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #ec4899, #f43f5e)',
            bottom: '-5%',
            right: '10%',
            animationDuration: '5s',
            animationDelay: '2s'
          }}
        />

        {/* Shooting Stars */}
        <div className="absolute top-1/4 left-1/4 w-1 h-20 bg-gradient-to-b from-white to-transparent opacity-60 animate-ping" 
             style={{ animationDuration: '3s', transform: 'rotate(45deg)' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-16 bg-gradient-to-b from-white to-transparent opacity-40 animate-ping" 
             style={{ animationDuration: '4s', animationDelay: '1.5s', transform: 'rotate(30deg)' }} />
      </div>

      {/* Header */}
      <div className="text-center mb-6 pt-4 relative z-10">
        <div className={`text-white font-bold text-xl mb-1 drop-shadow-lg`}>
          {currentTopCategory}
        </div>
        <div className="text-white/90 font-semibold text-base backdrop-blur-sm bg-white/10 px-4 py-1 rounded-full inline-block border border-white/20">
          {formattedTotal} €
        </div>
      </div>

      {/* Wheel Container */}
      <div className="relative flex items-center justify-center h-80 w-80 mx-auto my-6">
        {/* Center Button */}
        <div 
          onClick={handleGelirClick}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white flex flex-col items-center justify-center shadow-2xl shadow-purple-500/50 cursor-pointer hover:scale-105 z-20 transition-all border-2 border-white/30"
        >
          <TrendingUp className="mb-1" size={28} />
          <span className="font-bold text-base">Gelir Ekle</span>
        </div>

        {/* Rotating Wheel */}
        <div 
          ref={wheelRef} 
          className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
          style={{ 
            transform: `rotate(${rotation}deg)`, 
            transition: isDragging ? "none" : "transform 0.3s ease-out" 
          }}
          onMouseDown={handleMouseDown} 
          onTouchStart={handleTouchStart}
        >
          {CATEGORIES.map((cat, i) => {
            const ang = (360 / CATEGORIES.length) * i - 90;
            const r = (ang * Math.PI) / 180;
            const x = radius * Math.cos(r);
            const y = radius * Math.sin(r);
            const isTop = cat === currentTopCategory;
            const { icon: Icon, gradient, glow } = CategoryIcons[cat];

            return (
              <button 
                key={cat} 
                onClick={() => handleIconClick(cat)}
                className={`absolute w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isTop 
                    ? `bg-gradient-to-br ${gradient} scale-150 ring-4 ring-white/50 z-10 shadow-2xl ${glow} border-2 border-white` 
                    : `bg-gradient-to-br ${gradient} shadow-lg ${glow}`
                }`}
                style={{ 
                  top: `${center + y}%`, 
                  left: `${center + x}%`, 
                  transform: `translate(-50%, -50%) rotate(${-rotation}deg)`
                }}
              >
                <Icon className="text-white" size={isTop ? 24 : 20} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Expense Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 w-full max-w-md shadow-2xl border border-white/10">
            <div className={`text-2xl font-bold bg-gradient-to-r ${CategoryIcons[selectedCategory]?.gradient} bg-clip-text text-transparent mb-4 text-center`}>
              {selectedCategory}
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl mb-4 text-center border border-white/20">
              <div className="text-4xl font-black text-white">
                {amount || "0"}
                <span className="text-2xl ml-1">€</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <label className="text-white/70 text-sm mb-1 block">Tarih</label>
                <input 
                  type="date" 
                  value={tarih.toISOString().split('T')[0]}
                  onChange={(e) => setTarih(new Date(e.target.value))}
                  className="w-full bg-white/10 text-white rounded-xl px-3 py-2 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {["Market", "Giyim", "Aile"].includes(selectedCategory) && (
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Alt Kategori</label>
                  <select 
                    value={altKategori}
                    onChange={(e) => setAltKategori(e.target.value)}
                    className="w-full bg-white/10 text-white rounded-xl px-3 py-2 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seç</option>
                    {(selectedCategory === "Market" ? MARKETLER : selectedCategory === "Giyim" ? GIYIM_KISILERI : AILE_UYELERI).map(i => 
                      <option key={i} value={i}>{i}</option>
                    )}
                  </select>
                </div>
              )}
            </div>

            <NumericNumpad value={amount} onChange={setAmount} />

            {showNote ? (
              <div className="mt-4">
                <label className="text-white/70 text-sm mb-1 block">Not</label>
                <textarea 
                  value={not}
                  onChange={(e) => setNot(e.target.value)}
                  rows={2}
                  placeholder="Açıklama..."
                  className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            ) : (
              <button 
                onClick={() => setShowNote(true)}
                className="w-full mt-2 py-2 text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle size={16} />
                Not Ekle
              </button>
            )}

            <div className="flex gap-3 mt-4">
              <button 
                onClick={handleModalCancel}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                İptal
              </button>
              <button 
                onClick={handleSave}
                className={`flex-1 py-3 bg-gradient-to-r ${CategoryIcons[selectedCategory]?.gradient} text-white rounded-xl font-semibold shadow-lg transition-all`}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {isGelirModalVisible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 w-full max-w-md shadow-2xl border border-indigo-500/30">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4 text-center">
              Gelir Ekle
            </div>
            
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 rounded-2xl mb-4 text-center border border-white/20">
              <div className="text-4xl font-black text-white">
                {amount || "0"}
                <span className="text-2xl ml-1">€</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <label className="text-white/70 text-sm mb-1 block">Tarih</label>
                <input 
                  type="date" 
                  value={tarih.toISOString().split('T')[0]}
                  onChange={(e) => setTarih(new Date(e.target.value))}
                  className="w-full bg-white/10 text-white rounded-xl px-3 py-2 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-1 block">Tür</label>
                <select 
                  value={gelirKategori}
                  onChange={(e) => setGelirKategori(e.target.value)}
                  className="w-full bg-white/10 text-white rounded-xl px-3 py-2 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="gelir">Gelir</option>
                  <option value="tasarruf">Tasarruf</option>
                  <option value="diğer">Diğer</option>
                </select>
              </div>
            </div>

            <NumericNumpad value={amount} onChange={setAmount} />

            <div className="mt-4">
              <label className="text-white/70 text-sm mb-1 block">Not</label>
              <input 
                type="text"
                value={not}
                onChange={(e) => setNot(e.target.value)}
                placeholder="Not ekle..."
                className="w-full bg-white/10 text-white rounded-xl px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                onClick={handleGelirCancel}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                İptal
              </button>
              <button 
                onClick={handleGelirSave}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg transition-all"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MainContent;