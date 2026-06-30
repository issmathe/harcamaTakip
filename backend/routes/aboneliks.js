const express = require("express");
const router = express.Router();
const Abonelik = require("../models/Abonelik");

// 1. Tüm aktif abonelikleri getir (Telefonda ve PC'de listelemek için)
router.get("/", async (req, res) => {
  try {
    const abonelikler = await Abonelik.find();
    res.status(200).json(abonelikler);
  } catch (err) {
    res.status(500).json({ message: "Abonelikler getirilemedi.", error: err.message });
  }
});

// 2. Yeni abonelik ekle (Fatura/İletişim modalından kaydedildiğinde)
router.post("/", async (req, res) => {
  try {
    const yeniAbonelik = new Abonelik(req.body);
    const kaydedilen = await yeniAbonelik.save();
    res.status(201).json(kaydedilen);
  } catch (err) {
    res.status(400).json({ message: "Abonelik oluşturulamadı.", error: err.message });
  }
});

// 3. Abonelik güncelle (Tetiklenen ayları veritabanına işlemek için)
router.put("/:id", async (req, res) => {
  try {
    const guncel = await Abonelik.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(guncel);
  } catch (err) {
    res.status(400).json({ message: "Güncelleme başarısız.", error: err.message });
  }
});

// 4. Abonelik iptal et (Sil)
router.delete("/:id", async (req, res) => {
  try {
    await Abonelik.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Abonelik başarıyla iptal edildi." });
  } catch (err) {
    res.status(500).json({ message: "Silme işlemi başarısız.", error: err.message });
  }
});

module.exports = router;