import axios from "axios";

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

export const fetchTotalsFromAPI = async () => {
  try {
    const [gelirRes, harcamaRes] = await Promise.all([
      axios.get(`${API_URL}/gelir`),
      axios.get(`${API_URL}/harcama`),
    ]);

    const gelirler = gelirRes.data || [];
    const harcamalar = harcamaRes.data || [];

    // Toplam gelir
    const totalIncome = gelirler.reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Toplam harcama
    const totalExpense = harcamalar.reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Bugünkü toplam harcama
    const today = new Date().toISOString().split("T")[0];
    const totalToday = harcamalar
      .filter(i => i.createdAt?.startsWith(today))
      .reduce((sum, i) => sum + Number(i.miktar || 0), 0);

    // Alt kategori bilgisi varsa döndür
    const enrichedHarcamalar = harcamalar.map(h => ({
      ...h,
      altKategori: h.altKategori || null // Market alt kategori veya boş
    }));

    return { totalIncome, totalExpense, totalToday, gelirler, harcamalar: enrichedHarcamalar };
  } catch (err) {
    console.error("Toplamlar çekilirken hata:", err);
    return { totalIncome: 0, totalExpense: 0, totalToday: 0, gelirler: [], harcamalar: [] };
  }
};
