import axios from "axios";

const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000/api";

export const fetchTotalsFromAPI = async () => {
  try {
    const [gelirRes, harcamaRes] = await Promise.all([
      axios.get(`${API_URL}/gelir`),
      axios.get(`${API_URL}/harcama`),
    ]);
    
    // Sadece ham veriyi dön, hesaplamaları Context halledecek
    return { 
        gelirler: gelirRes.data || [], 
        harcamalar: harcamaRes.data || []
    };
  } catch (err) {
    console.error("Veri çekme hatası:", err);
    return { gelirler: [], harcamalar: [] };
  }
};