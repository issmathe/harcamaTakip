// backend/routes/gelirs.js (GÜNCEL VERSİYON)

const express = require("express");
const router = express.Router();
const Gelir = require("../models/Gelir");

// ➕ Yeni gelir ekle
router.post("/", async (req, res) => {
  try {
    const { miktar, kategori, not, createdAt } = req.body; 

    if (!miktar || !kategori) {
      return res.status(400).json({ message: "Miktar ve kategori zorunludur" });
    }

    const yeniGelir = new Gelir({
      miktar,
      kategori,
      not,
      // Eğer client'tan 'createdAt' geliyorsa onu kullan.
      ...(createdAt && { createdAt: createdAt }), 
    });

    await yeniGelir.save();
    res.status(201).json(yeniGelir);
  } catch (err) {
    // Hata yönetimini iyileştirelim
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: "Doğrulama Hatası", errors: err.errors });
    }
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// 📥 Tüm gelirleri getir
router.get("/", async (req, res) => {
  try {
    // En yeni kaydı en üste getirmek için tarihe göre sırala
    const gelirler = await Gelir.find().sort({ createdAt: -1 });
    res.json(gelirler);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// 🔄 Tek geliri güncelle
router.put("/:id", async (req, res) => {
  try {
    // Gelen verileri ayır
    const { miktar, kategori, not, createdAt } = req.body; 
    
    // Güncellenecek nesneyi oluştur (yalnızca gelen alanlar)
    const updates = { miktar, kategori, not };
    
    // ✅ KRİTİK DÜZELTME: Eğer createdAt geldiyse, onu güncelleme nesnesine ekle
    if (createdAt) {
      updates.createdAt = createdAt; 
    }
    
    // Mongoose güncellemesi
    const guncellenmis = await Gelir.findByIdAndUpdate(req.params.id, updates, {
      new: true, // Güncellenmiş dokümanı geri döndür
      runValidators: true, // Miktarın Number olması gibi doğrulayıcıları çalıştır
    });
    
    if (!guncellenmis) {
      return res.status(404).json({ message: "Gelir bulunamadı" });
    }
    res.json(guncellenmis);
  } catch (err) {
    // Hata yönetimini iyileştirelim
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: "Doğrulama Hatası", errors: err.errors });
    }
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