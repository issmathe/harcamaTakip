const express = require("express");
const router = express.Router();
const Harcama = require("../models/Harcama");

// ➕ Yeni harcama ekle
router.post("/", async (req, res) => {
  try {
    const harcamaData = { ...req.body };

    // DÜZELTME: Eğer harcama bir tasarruf havuzundan yapılıyorsa, 
    // raporlarda çift sayılmaması için kategori alanını normalize ediyoruz.
    if (harcamaData.harcamaKaynagi?.toLowerCase() === "tasarruf") {
      harcamaData.kategori = "Tasarruf";
    }

    const yeniHarcama = new Harcama(harcamaData);
    const kaydedilen = await yeniHarcama.save();
    res.status(201).json(kaydedilen);
  } catch (err) {
    res.status(400).json({ error: "Harcama eklenemedi", details: err.message });
  }
});

// 📋 Tüm harcamaları getir
router.get("/", async (req, res) => {
  try {
    const harcamalar = await Harcama.find().sort({ createdAt: -1 });
    res.json(harcamalar);
  } catch (err) {
    res.status(500).json({ error: "Harcamalar alınamadı", details: err.message });
  }
});

// 🗑 Harcama sil
router.delete("/:id", async (req, res) => {
  try {
    const silinen = await Harcama.findByIdAndDelete(req.params.id);
    if (!silinen) return res.status(404).json({ error: "Harcama bulunamadı" });
    res.json({ message: "Harcama silindi", silinen });
  } catch (err) {
    res.status(500).json({ error: "Silme başarısız", details: err.message });
  }
});

// ✏️ Harcama düzenle
router.put("/:id", async (req, res) => {
  try {
    const harcamaData = { ...req.body };

    if (harcamaData.harcamaKaynagi?.toLowerCase() === "tasarruf") {
      harcamaData.kategori = "Tasarruf";
    }

    const guncellenen = await Harcama.findByIdAndUpdate(
      req.params.id,
      harcamaData,
      { new: true, runValidators: true }
    );
    if (!guncellenen) return res.status(404).json({ error: "Harcama bulunamadı" });
    res.json(guncellenen);
  } catch (err) {
    res.status(400).json({ error: "Düzenleme başarısız", details: err.message });
  }
});

module.exports = router;