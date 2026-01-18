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
  Sparkles,
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
          className={`h-16 text-xl font-bold rounded-2xl transition-all transform active:scale-95 hover:scale-105 ${
            key === "back" 
              ? "bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/50" 
              : "bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-900/50 hover:shadow-xl"
          }`}
        >
          {key === "back" ? <Delete size={24} className="mx-auto" /> : key}
        </button>
      ))}
    </div>
  );
};

const MainContent = ({ radius = 45, center = 50 }) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden relative">
      {/* Animated Background Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

      {/* Header with Glow Effect */}
      <div className="text-center mb-8 pt-8 relative z-10">
        <div className="inline-block">
          <div className={`text-5xl font-black bg-gradient-to-r ${CategoryIcons[currentTopCategory]?.gradient} bg-clip-text text-transparent mb-2 animate-pulse`}>
            {currentTopCategory}
          </div>
          <div className="text-white/90 font-bold text-3xl tracking-wider backdrop-blur-sm bg-white/10 px-6 py-2 rounded-full inline-block shadow-2xl">
            {formattedTotal} €
          </div>
        </div>
        <Sparkles className="absolute -top-2 -right-2 text-yellow-300 animate-spin" size={24} style={{ animationDuration: '3s' }} />
      </div>

      {/* Main Wheel Container */}
      <div className="flex-1 flex items-center justify-center relative px-4">
        <div className="relative w-full max-w-md aspect-square">
          
          {/* Center Button with Pulsing Effect */}
          <button 
            onClick={handleGelirClick}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white flex flex-col items-center justify-center shadow-2xl shadow-purple-500/50 cursor-pointer hover:scale-110 z-20 transition-all duration-300 animate-pulse border-4 border-white/30"
          >
            <TrendingUp size={32} className="mb-2" />
            <span className="font-black text-lg tracking-wide">GELIR</span>
            <span className="text-xs opacity-80">EKLE</span>
          </button>

          {/* Rotating Wheel */}
          <div 
            ref={wheelRef} 
            className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
            style={{ 
              transform: `rotate(${rotation}deg)`, 
              transition: isDragging ? "none" : "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" 
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
                  className={`absolute w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isTop 
                      ? `bg-gradient-to-br ${gradient} scale-[2.2] ring-4 ring-white/50 z-10 shadow-2xl ${glow} animate-bounce` 
                      : `bg-gradient-to-br ${gradient} shadow-lg ${glow} hover:scale-125`
                  }`}
                  style={{ 
                    top: `${center + y}%`, 
                    left: `${center + x}%`, 
                    transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
                    animationDuration: isTop ? '1s' : '0s'
                  }}
                >
                  <Icon className="text-white" size={isTop ? 32 : 24} />
                </button>
              );
            })}
          </div>

          {/* Outer Ring Glow */}
          <div className="absolute inset-0 rounded-full border-4 border-white/10 shadow-2xl shadow-purple-500/20 pointer-events-none animate-pulse" style={{ animationDuration: '2s' }} />
        </div>
      </div>

      {/* Expense Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border-2 border-purple-500/30 animate-in zoom-in duration-300">
            <div className={`text-2xl font-black bg-gradient-to-r ${CategoryIcons[selectedCategory]?.gradient} bg-clip-text text-transparent mb-6 text-center`}>
              {selectedCategory}
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-2xl mb-6 text-center border-2 border-white/10 shadow-inner">
              <div className="text-5xl font-black text-white">
                {amount || "0"}
                <span className="text-3xl ml-2 text-purple-300">€</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block font-semibold">Tarih</label>
                <input 
                  type="date" 
                  value={tarih.toISOString().split('T')[0]}
                  onChange={(e) => setTarih(new Date(e.target.value))}
                  className="w-full bg-slate-700/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {["Market", "Giyim", "Aile"].includes(selectedCategory) && (
                <div>
                  <label className="text-white/70 text-sm mb-2 block font-semibold">Alt Kategori</label>
                  <select 
                    value={altKategori}
                    onChange={(e) => setAltKategori(e.target.value)}
                    className="w-full bg-slate-700/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <label className="text-white/70 text-sm mb-2 block font-semibold">Not</label>
                <textarea 
                  value={not}
                  onChange={(e) => setNot(e.target.value)}
                  rows={2}
                  placeholder="Açıklama..."
                  className="w-full bg-slate-700/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            ) : (
              <button 
                onClick={() => setShowNote(true)}
                className="w-full mt-4 py-3 text-white/50 hover:text-white/80 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Not Ekle
              </button>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleModalCancel}
                className="flex-1 py-4 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all shadow-lg"
              >
                İptal
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all shadow-lg"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {isGelirModalVisible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border-2 border-indigo-500/30 animate-in zoom-in duration-300">
            <div className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6 text-center">
              Gelir Ekle
            </div>
            
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 rounded-2xl mb-6 text-center border-2 border-white/10 shadow-inner">
              <div className="text-5xl font-black text-white">
                {amount || "0"}
                <span className="text-3xl ml-2 text-indigo-300">€</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block font-semibold">Tarih</label>
                <input 
                  type="date" 
                  value={tarih.toISOString().split('T')[0]}
                  onChange={(e) => setTarih(new Date(e.target.value))}
                  className="w-full bg-indigo-800/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-2 block font-semibold">Tür</label>
                <select 
                  value={gelirKategori}
                  onChange={(e) => setGelirKategori(e.target.value)}
                  className="w-full bg-indigo-800/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="gelir">Gelir</option>
                  <option value="tasarruf">Tasarruf</option>
                  <option value="diğer">Diğer</option>
                </select>
              </div>
            </div>

            <NumericNumpad value={amount} onChange={setAmount} />

            <div className="mt-4">
              <label className="text-white/70 text-sm mb-2 block font-semibold">Not</label>
              <input 
                type="text"
                value={not}
                onChange={(e) => setNot(e.target.value)}
                placeholder="Not ekle..."
                className="w-full bg-indigo-800/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleGelirCancel}
                className="flex-1 py-4 bg-indigo-800 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
              >
                İptal
              </button>
              <button 
                onClick={handleGelirSave}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-indigo-500/50 transition-all shadow-lg"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;