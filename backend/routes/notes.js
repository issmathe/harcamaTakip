const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

// ➕ Yeni not ekle
router.post("/", async (req, res) => {
  try {
    const yeniNot = new Note(req.body);
    const kaydedilen = await yeniNot.save();
    res.status(201).json(kaydedilen);
  } catch (err) {
    res.status(400).json({ error: "Not eklenemedi", details: err.message });
  }
});

// 📋 Tüm notları getir (En son güncellenen en üstte)
router.get("/", async (req, res) => {
  try {
    const notlar = await Note.find().sort({ updatedAt: -1 });
    res.json(notlar);
  } catch (err) {
    res.status(500).json({ error: "Notlar alınamadı", details: err.message });
  }
});

// ✏️ Notu güncelle
router.put("/:id", async (req, res) => {
  try {
    const guncellenen = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!guncellenen) return res.status(404).json({ error: "Not bulunamadı" });
    res.json(guncellenen);
  } catch (err) {
    res.status(400).json({ error: "Güncelleme başarısız", details: err.message });
  }
});

// 🗑 Notu sil
router.delete("/:id", async (req, res) => {
  try {
    const silinen = await Note.findByIdAndDelete(req.params.id);
    if (!silinen) return res.status(404).json({ error: "Not bulunamadı" });
    res.json({ message: "Not başarıyla silindi" });
  } catch (err) {
    res.status(500).json({ error: "Silme başarısız", details: err.message });
  }
});

module.exports = router;