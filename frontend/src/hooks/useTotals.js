import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_SERVER_URL;

export const useTotals = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalToday, setTotalToday] = useState(0);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const [gelirRes, harcamaRes] = await Promise.all([
          axios.get(`${API_URL}/gelir`),
          axios.get(`${API_URL}/harcama`),
        ]);

        const gelirler = gelirRes.data || [];
        const harcamalar = harcamaRes.data || [];

        setTotalIncome(gelirler.reduce((sum, i) => sum + Number(i.miktar || 0), 0));
        setTotalExpense(harcamalar.reduce((sum, i) => sum + Number(i.miktar || 0), 0));

        const today = new Date().toISOString().split("T")[0];
        setTotalToday(
          harcamalar
            .filter((i) => i.createdAt?.startsWith(today))
            .reduce((sum, i) => sum + Number(i.miktar || 0), 0)
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchTotals();
  }, []);

  return { totalIncome, totalExpense, totalToday };
};
