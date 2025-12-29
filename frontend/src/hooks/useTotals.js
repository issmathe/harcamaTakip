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
      axios.get(`${API_URL}/harcama`), // baseURL hatası ihtimaline karşı API_URL kullanıldı
    ]);
    
    const allGelirler = gelirRes.data || [];
    const allHarcamalar = harcamaRes.data || [];

    // Kategori kontrolü (Küçük/Büyük harf duyarsız)
    const isTransfer = (item) => item.kategori?.toString().trim().toLowerCase() === "transfer";

    // --- 1. KÜMÜLATİF HESAPLAMALAR ---
    // Toplam giren para
    const cumulativeIncome = allGelirler.reduce((sum, i) => sum + Number(i.miktar || 0), 0);
    
    // Toplam çıkan para (Artık Transferler de dahil, böylece bakiye düşer)
    const cumulativeExpense = allHarcamalar.reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Banka Bakiyesi: Sadece 'gelir' olarak girilenler - (Tüm harcamalar + Transferler)
    const cumulativeBankIncome = allGelirler
        .filter(i => i.kategori?.toString().trim().toLowerCase() === 'gelir')
        .reduce((sum, i) => sum + Number(i.miktar || 0), 0);
        
    const bankBalance = cumulativeBankIncome - cumulativeExpense;

    // --- 2. AYLIK VE GÜNLÜK TOPLAMLAR ---
    const currentMonthPrefix = getCurrentMonthString();
    const todayStr = new Date().toISOString().split("T")[0];

    // Aylık Harcama: Grafikte/Yakıt deposunda "Transfer" görünmemesi için onu hariç tutuyoruz
    const monthlyExpense = allHarcamalar
      .filter(i => i.createdAt?.startsWith(currentMonthPrefix) && !isTransfer(i))
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Aylık Transfer: Bütçe panelinde ayrıca göstermek isterseniz
    const monthlyTransfers = allHarcamalar
      .filter(i => i.createdAt?.startsWith(currentMonthPrefix) && isTransfer(i))
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    const monthlyIncome = allGelirler
      .filter(i => i.createdAt?.startsWith(currentMonthPrefix))
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Günlük Harcama: Transferleri dahil etmiyoruz
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
    return { 
      totalIncome: 0, totalExpense: 0, monthlyTransfers: 0,
      cumulativeIncome: 0, cumulativeExpense: 0, bankBalance: 0, 
      totalToday: 0, gelirler: [], harcamalar: [] 
    };
  }
};