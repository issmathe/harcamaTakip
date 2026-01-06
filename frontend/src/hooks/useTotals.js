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

    const currentMonthPrefix = getCurrentMonthString();
    const todayStr = new Date().toISOString().split("T")[0];

    // --- 1. KÜMÜLATİF HESAPLAMALAR ---
    
    // Banka Bakiyesi Hesaplama
    const totalBankIncome = allGelirler
        .filter(i => i.kategori?.toLowerCase() === 'gelir')
        .reduce((sum, i) => sum + Number(i.miktar || 0), 0);
    
    const totalBankExit = allHarcamalar
        .reduce((sum, i) => sum + Number(i.miktar || 0), 0); // Tasarruflar dahil her şey bankadan çıkar

    const bankBalance = totalBankIncome - totalBankExit;

    // Portföy İçin Toplamlar
    const cumulativeIncome = allGelirler.reduce((sum, i) => sum + Number(i.miktar || 0), 0);
    const cumulativeExpense = allHarcamalar
      .filter(h => h.kategori?.toLowerCase() !== "tasarruf")
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // --- 2. AYLIK VE GÜNLÜK TOPLAMLAR ---

    // Aylık Gider (Tasarruf kutuya yansımaz)
    const monthlyExpense = allHarcamalar
      .filter(i => i.createdAt?.startsWith(currentMonthPrefix) && i.kategori?.toLowerCase() !== "tasarruf")
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Aylık Gelir
    const monthlyIncome = allGelirler
      .filter(i => i.createdAt?.startsWith(currentMonthPrefix) && i.kategori?.toLowerCase() === "gelir")
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Günlük Harcama (Tasarruf kutuya yansımaz)
    const totalToday = allHarcamalar
      .filter(i => i.createdAt?.startsWith(todayStr) && i.kategori?.toLowerCase() !== "tasarruf")
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