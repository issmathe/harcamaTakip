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
    
    // Toplam Gider: Tasarruf kategorisi olanları hesaplamaya dahil etme
    const cumulativeExpense = allHarcamalar
      .filter(h => h.kategori?.toString().trim().toLowerCase() !== "tasarruf")
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Banka Bakiyesi: Sadece 'gelir' kategorisi - Tasarruf olmayan harcamalar
    const cumulativeBankIncome = allGelirler
        .filter(i => i.kategori?.toString().trim().toLowerCase() === 'gelir')
        .reduce((sum, i) => sum + Number(i.miktar || 0), 0);
        
    const bankBalance = cumulativeBankIncome - cumulativeExpense;

    // --- 2. AYLIK VE GÜNLÜK TOPLAMLAR ---
    const currentMonthPrefix = getCurrentMonthString();
    const todayStr = new Date().toISOString().split("T")[0];

    // Aylık Harcama: Tasarruf hariç
    const monthlyExpense = allHarcamalar
      .filter(i => {
        const isCurrentMonth = i.createdAt?.startsWith(currentMonthPrefix);
        const isNotSavings = i.kategori?.toString().trim().toLowerCase() !== "tasarruf";
        return isCurrentMonth && isNotSavings;
      })
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // AYLIK GELİR: Sadece 'tasarruf' olmayanlar (Sadece 'gelir' tipi)
    const monthlyIncome = allGelirler
      .filter(i => {
        const isCurrentMonth = i.createdAt?.startsWith(currentMonthPrefix);
        const category = i.kategori?.toString().trim().toLowerCase();
        return isCurrentMonth && category === "gelir";
      })
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Günlük Harcama: Tasarruf hariç
    const totalToday = allHarcamalar
      .filter(i => {
        const isToday = i.createdAt?.startsWith(todayStr);
        const isNotSavings = i.kategori?.toString().trim().toLowerCase() !== "tasarruf";
        return isToday && isNotSavings;
      })
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