const express = require("express");
const router = express.Router();
const Gelir = require("../models/Gelir");

// ➕ Yeni gelir ekle
router.post("/", async (req, res) => {
  try {
    const { miktar, kategori, not } = req.body;

    if (!miktar || !kategori) {
      return res.status(400).json({ message: "Miktar ve kategori zorunludur" });
    }

    const yeniGelir = new Gelir({
      miktar,
      kategori,
      not,
    });

    await yeniGelir.save();
    res.status(201).json(yeniGelir);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// 📥 Tüm gelirleri getir
router.get("/", async (req, res) => {
  try {
    const gelirler = await Gelir.find().sort({ createdAt: -1 });
    res.json(gelirler);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// 🔄 Tek geliri güncelle
router.put("/:id", async (req, res) => {
  try {
    const guncellenmis = await Gelir.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!guncellenmis) {
      return res.status(404).json({ message: "Gelir bulunamadı" });
    }
    res.json(guncellenmis);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// ❌ Tek geliri sil
router.delete("/:id", async (req, res) => {
  try {
    const silinen = await Gelir.findByIdAndDelete(req.params.id);
    if (!silinen) {
      return res.status(404).json({ message: "Gelir bulunamadı" });
    }
    res.json({ message: "Gelir silindi" });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

module.exports = router;