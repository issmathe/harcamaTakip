import axios from "axios";

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

const getCurrentMonthString = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${year}-${month}`; 
};

export const fetchTotalsFromAPI = async () => {
  try {
    const [gelirRes, harcamaRes] = await Promise.all([
      axios.get(`${API_URL}/gelir`),
      axios.get(`${API_URL}/harcama`),
    ]);
    
    const allGelirler = gelirRes.data || [];
    const allHarcamalar = harcamaRes.data || [];

    // --- 1. KÜMÜLATİF HESAPLAMALAR ---
    const cumulativeIncome = allGelirler.reduce((sum, i) => sum + Number(i.miktar || 0), 0);
    const cumulativeExpense = allHarcamalar.reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Banka Bakiyesi: Sadece 'gelir' kategorisi - Toplam Harcama
    const cumulativeBankIncome = allGelirler
        .filter(i => i.kategori?.toString().trim().toLowerCase() === 'gelir')
        .reduce((sum, i) => sum + Number(i.miktar || 0), 0);
        
    const bankBalance = cumulativeBankIncome - cumulativeExpense;

    // --- 2. AYLIK VE GÜNLÜK TOPLAMLAR ---
    const currentMonthPrefix = getCurrentMonthString();
    const todayStr = new Date().toISOString().split("T")[0];

    // Aylık Harcama (Transfer ayrımı kaldırıldı, tüm harcamalar dahil)
    const monthlyExpense = allHarcamalar
      .filter(i => i.createdAt?.startsWith(currentMonthPrefix))
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // AYLIK GELİR: Sadece 'tasarruf' olmayanlar
    const monthlyIncome = allGelirler
      .filter(i => {
        const isCurrentMonth = i.createdAt?.startsWith(currentMonthPrefix);
        const category = i.kategori?.toString().trim().toLowerCase();
        return isCurrentMonth && category !== "tasarruf";
      })
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Günlük Harcama
    const totalToday = allHarcamalar
      .filter(i => i.createdAt?.startsWith(todayStr))
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    return { 
        totalIncome: monthlyIncome,          
        totalExpense: monthlyExpense, 
        cumulativeIncome,          
        cumulativeExpense,         
        bankBalance,
        totalToday, 
        gelirler: allGelirler, 
        harcamalar: allHarcamalar
    };
  } catch (err) {
    console.error("Veri çekme hatası:", err);
    return { 
      totalIncome: 0, totalExpense: 0,
      cumulativeIncome: 0, cumulativeExpense: 0, bankBalance: 0, 
      totalToday: 0, gelirler: [], harcamalar: [] 
    };
  }
};