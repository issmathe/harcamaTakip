import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const Gelir = () => {
  const [form, setForm] = useState({ miktar: "", kategori: "maaş", not: "" });
  const [gelirler, setGelirler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [toplamGelir, setToplamGelir] = useState(0);

  const API_URL = process.env.REACT_APP_SERVER_URL + "/gelir";

  // Gelirleri getir
  const fetchGelirler = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setGelirler(res.data);
      const toplam = res.data.reduce((acc, g) => acc + Number(g.miktar), 0);
      setToplamGelir(toplam);
    } catch (err) {
      console.error("Gelirleri çekerken hata:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchGelirler();
  }, [fetchGelirler]);

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.miktar) return;

    try {
      const res = await axios.post(API_URL, form);
      setGelirler([res.data, ...gelirler]);
      setToplamGelir((prev) => prev + Number(res.data.miktar));
      setForm({ miktar: "", kategori: "maaş", not: "" });
    } catch (err) {
      console.error("Gelir eklerken hata:", err);
    }
  };

  // Silme
  const handleDelete = async (id, miktar) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setGelirler(gelirler.filter((g) => g._id !== id));
      setToplamGelir((prev) => prev - Number(miktar));
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">💰 Gelir Takip</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-5 mb-6"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Miktar (€)</label>
          <input
            type="number"
            value={form.miktar}
            onChange={(e) => setForm({ ...form, miktar: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            placeholder="Örn: 1000"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Kategori</label>
          <select
            value={form.kategori}
            onChange={(e) => setForm({ ...form, kategori: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
          >
            <option value="maaş">Maaş</option>
            <option value="tasarruf">Tasarruf</option>
            <option value="diğer">Diğer</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Not (Opsiyonel)</label>
          <input
            type="text"
            value={form.not}
            onChange={(e) => setForm({ ...form, not: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            placeholder="İşyeri, bonus vb."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition duration-200"
        >
          Ekle
        </button>
      </form>

      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6 text-center font-semibold text-lg">
        Toplam Gelir: {toplamGelir} €
      </div>

      <div className="text-center mb-4">
        <button
          onClick={() => setShowList(!showList)}
          className="bg-gray-700 hover:bg-gray-900 text-white py-2 px-4 rounded-lg transition"
        >
          {showList ? "Gelirleri Gizle" : "Gelirleri Göster"}
        </button>
      </div>

      {showList && (
        <div className="bg-white shadow-md rounded-2xl p-5">
          <h2 className="text-lg font-semibold mb-4">📋 Gelir Listesi</h2>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : gelirler.length === 0 ? (
            <p className="text-gray-500">Henüz gelir eklenmedi.</p>
          ) : (
            <ul className="space-y-3">
              {gelirler.map((g) => (
                <li
                  key={g._id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-semibold">
                      {g.miktar} €{" "}
                      <span className="text-sm text-gray-500">({g.kategori})</span>
                    </p>
                    {g.not && (
                      <p className="text-sm text-gray-600 italic">{g.not}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(g._id, g.miktar)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    Sil
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Gelir;
