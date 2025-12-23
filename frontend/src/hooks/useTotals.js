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
      axios.get(`${axios.defaults.baseURL || API_URL}/harcama`),
    ]);
    
    const allGelirler = gelirRes.data || [];
    const allHarcamalar = harcamaRes.data || [];

    // Kategori kontrolü için yardımcı fonksiyon (Büyük-küçük harf duyarsız)
    const isTransfer = (item) => item.kategori?.toString().trim().toLowerCase() === "transfer";

    // --- 1. KÜMÜLATİF HESAPLAMALAR ---
    const cumulativeIncome = allGelirler.reduce((sum, i) => sum + Number(i.miktar || 0), 0);
    
    // Toplam Gider: Transferler hariç
    const cumulativeExpense = allHarcamalar
      .filter(i => !isTransfer(i)) 
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // BANKA BAKİYESİ: (Banka Geliri) - (Tüm harcamalar + Transferler)
    const cumulativeBankIncome = allGelirler
        .filter(i => i.kategori?.toString().trim().toLowerCase() === 'gelir')
        .reduce((sum, i) => sum + Number(i.miktar || 0), 0);
        
    const bankBalance = cumulativeBankIncome - allHarcamalar.reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // --- 2. AYLIK VE GÜNLÜK TOPLAMLAR ---
    const currentMonthPrefix = getCurrentMonthString();
    const todayStr = new Date().toISOString().split("T")[0];

    // AYLIK HARCAMA: Transfer Hariç (SABİT)
    const monthlyExpense = allHarcamalar
      .filter(i => i.createdAt?.startsWith(currentMonthPrefix) && !isTransfer(i))
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // AYLIK TRANSFER: Aylık Kalan'dan düşmek için
    const monthlyTransfers = allHarcamalar
      .filter(i => i.createdAt?.startsWith(currentMonthPrefix) && isTransfer(i))
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    const monthlyIncome = allGelirler
      .filter(i => i.createdAt?.startsWith(currentMonthPrefix))
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // BUGÜNKÜ HARCAMA: Transfer Hariç (SABİT)
    const totalToday = allHarcamalar
      .filter(i => i.createdAt?.startsWith(todayStr) && !isTransfer(i))
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    return { 
        totalIncome: monthlyIncome,          
        totalExpense: monthlyExpense, 
        monthlyTransfers,     
        cumulativeIncome,          
        cumulativeExpense,         
        bankBalance,
        totalToday, 
        gelirler: allGelirler, 
        harcamalar: allHarcamalar
    };
  } catch (err) {
    console.error("Veri çekme hatası:", err);
    return { totalIncome: 0, totalExpense: 0, cumulativeIncome: 0, cumulativeExpense: 0, bankBalance: 0, totalToday: 0, gelirler: [], harcamalar: [] };
  }
};