// useTotals.js (SAĞLAMLAŞTIRILMIŞ GÜNCELLEME)

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

    // --- 1. KÜMÜLATİF (TÜM ZAMANLAR) TOPLAMLARI HESAPLA (BAKİYE İÇİN) ---
    const cumulativeIncome = allGelirler.reduce((sum, i) => sum + Number(i.miktar || 0), 0);
    const cumulativeExpense = allHarcamalar.reduce((sum, i) => sum + Number(i.miktar || 0), 0);


    // --- 2. AYLIK TOPLAMLAR İÇİN FİLTRELEME VE HESAPLAMA ---
    
    const currentMonthPrefix = getCurrentMonthString();

    // 💡 GÜNCELLEME: createdAt'in varlığını ve string olup olmadığını kontrol etmek
    const isValidDateString = (date) => typeof date === 'string';

    // Sadece mevcut ayın verilerini filtrele
    const aylikHarcamalar = allHarcamalar.filter(i => 
        isValidDateString(i.createdAt) && i.createdAt.startsWith(currentMonthPrefix)
    );
    const aylikGelirler = allGelirler.filter(i => 
        isValidDateString(i.createdAt) && i.createdAt.startsWith(currentMonthPrefix)
    );


    // ✅ SADECE AYLIK İSTATİSTİKLER İÇİN KULLANILACAK TOPLAMLAR
    const monthlyIncome = aylikGelirler.reduce((sum, i) => sum + Number(i.miktar || 0), 0);
    const monthlyExpense = aylikHarcamalar.reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Bugünkü toplam harcama
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const totalToday = allHarcamalar
      .filter(i => isValidDateString(i.createdAt) && i.createdAt.startsWith(today))
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Tüm zamanların harcamalarını zenginleştiriyoruz.
    const enrichedAllHarcamalar = allHarcamalar.map(h => ({
      ...h,
      altKategori: h.altKategori || null
    }));
    
    // Geriye döndürülen değerleri güncelledik:
    return { 
        totalIncome: monthlyIncome,          
        totalExpense: monthlyExpense,        
        cumulativeIncome,          
        cumulativeExpense,         
        totalToday, 
        gelirler: allGelirler, 
        harcamalar: enrichedAllHarcamalar
    };
  } catch (err) {
    console.error("Toplamlar çekilirken hata:", err);
    return { 
        totalIncome: 0, 
        totalExpense: 0, 
        cumulativeIncome: 0,
        cumulativeExpense: 0,
        totalToday: 0, 
        gelirler: [], 
        harcamalar: [] 
    };
  }
};
// context/TotalsContext.jsx kısmında değişiklik yapmaya gerek yok.