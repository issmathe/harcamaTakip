import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";

const API_URL = process.env.REACT_APP_SERVER_URL;

export const KategoriContext = createContext();

export const KategoriProvider = ({ children }) => {
  const [kategoriler, setKategoriler] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchKategoriler = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/kategori`);
      setKategoriler(res.data);
    } catch (err) {
      message.error("Kategoriler alınamadı");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategoriler();
  }, []);

  return (
    <KategoriContext.Provider value={{ kategoriler, loading }}>
      {children}
    </KategoriContext.Provider>
  );
};
