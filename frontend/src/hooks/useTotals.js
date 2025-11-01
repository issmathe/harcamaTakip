// useTotals.js (SON GÜNCELLEME)

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

    // 🚨 ÖNEMLİ DEĞİŞİKLİK: Bunlar artık tüm zamanların verileri
    const allGelirler = gelirRes.data || [];
    const allHarcamalar = harcamaRes.data || [];

    // --- 1. KÜMÜLATİF (TÜM ZAMANLAR) TOPLAMLARI HESAPLA (BAKİYE İÇİN) ---
    const cumulativeIncome = allGelirler.reduce((sum, i) => sum + Number(i.miktar || 0), 0);
    const cumulativeExpense = allHarcamalar.reduce((sum, i) => sum + Number(i.miktar || 0), 0);


    // --- 2. AYLIK TOPLAMLAR İÇİN FİLTRELEME VE HESAPLAMA (HEADER'DAKİ İSTATİSTİKLER İÇİN) ---
    
    const currentMonthPrefix = getCurrentMonthString();

    // Sadece mevcut ayın verilerini filtrele
    const aylikHarcamalar = allHarcamalar.filter(i => 
        i.createdAt?.startsWith(currentMonthPrefix)
    );
    const aylikGelirler = allGelirler.filter(i => 
        i.createdAt?.startsWith(currentMonthPrefix)
    );


    // ✅ SADECE AYLIK İSTATİSTİKLER İÇİN KULLANILACAK TOPLAMLAR
    const monthlyIncome = aylikGelirler.reduce((sum, i) => sum + Number(i.miktar || 0), 0);
    const monthlyExpense = aylikHarcamalar.reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Bugünkü toplam harcama
    const today = new Date().toISOString().split("T")[0];
    const totalToday = aylikHarcamalar
      .filter(i => i.createdAt?.startsWith(today))
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Tüm zamanların harcamalarını zenginleştiriyoruz.
    const enrichedAllHarcamalar = allHarcamalar.map(h => ({
      ...h,
      altKategori: h.altKategori || null
    }));
    
    // Geriye döndürülen değerleri güncelledik:
    // totalIncome/Expense aylık kalsın.
    // gelirler/harcamalar ise artık TÜM ZAMANLARIN verisini tutuyor!
    return { 
        totalIncome: monthlyIncome,          
        totalExpense: monthlyExpense,        
        cumulativeIncome,          
        cumulativeExpense,         
        totalToday, 
        // 🚨 ÖNEMLİ: Artık context'e TÜM ZAMANLARIN verisini gönderiyoruz
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