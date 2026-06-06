const express = require("express");
const router = express.Router();
const Gelir = require("../models/Gelir");
const Harcama = require("../models/Harcama"); // Bakiye kontrolü için harcamalar da gerekiyor
const mongoose = require("mongoose");

// 🔄 Kategoriler Arası Para Transferi (Bakiye Kontrollü Versiyon)
router.post("/transfer", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { kaynakKategori, hedefKategori, miktar, not, createdAt } = req.body;

    if (!kaynakKategori || !hedefKategori || !miktar) {
      return res.status(400).json({ message: "Kaynak, hedef kategori ve miktar zorunludur" });
    }

    if (kaynakKategori === hedefKategori) {
      return res.status(400).json({ message: "Aynı kategoriye transfer yapılamaz" });
    }

    const transferMiktari = Math.abs(Number(miktar));

    // --- BAKİYE KONTROLÜ ---
    // 1. Kaynak kategoriye ait tüm geçmiş gelirleri (veya pozitif transferleri) getir
    const kaynakGelirler = await Gelir.find({ kategori: { $regex: new RegExp(`^${kaynakKategori}$`, "i") } }).session(session);
    
    // 2. Kaynak kategoriye ait tüm harcamaları getir
    const kaynakHarcamalar = await Harcama.find({ kategori: { $regex: new RegExp(`^${kaynakKategori}$`, "i") } }).session(session);

    // 3. Kaynak kategorinin anlık toplam bakiyesini hesapla
    const toplamGelir = kaynakGelirler.reduce((sum, g) => sum + Number(g.miktar || 0), 0);
    const toplamGider = kaynakHarcamalar.reduce((sum, h) => sum + Number(h.miktar || 0), 0);
    const anlikBakiye = toplamGelir - toplamGider;

    // 4. Eğer transfer edilmek istenen miktar mevcut bakiyeden büyükse işlemi iptal et
    if (anlikBakiye < transferMiktari) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: `Yetersiz bakiye! ${kaynakKategori} kategorisinde sadece €${anlikBakiye.toFixed(2)} var. Transfer edilmek istenen: €${transferMiktari.toFixed(2)}` 
      });
    }
    // ------------------------

    const islemTarihi = createdAt ? new Date(createdAt) : new Date();
    const ortakTransferId = "TRF_" + Date.now();

    // 1. Kayıt: Kaynak kategoriden parayı azalt (Eksi miktar)
    const kaynakKayit = new Gelir({
      miktar: -transferMiktari,
      kategori: kaynakKategori,
      not: not ? `[Transfer -> ${hedefKategori}] ${not} | ID:${ortakTransferId}` : `[Transfer -> ${hedefKategori}] | ID:${ortakTransferId}`,
      createdAt: islemTarihi
    });

    // 2. Kayıt: Hedef kategoriye parayı ekle (Artı miktar)
    const hedefKayit = new Gelir({
      miktar: transferMiktari,
      kategori: hedefKategori,
      not: not ? `[Transfer <- ${kaynakKategori}] ${not} | ID:${ortakTransferId}` : `[Transfer <- ${kaynakKategori}] | ID:${ortakTransferId}`,
      createdAt: islemTarihi
    });

    await kaynakKayit.save({ session });
    await hedefKayit.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Transfer başarıyla gerçekleşti", kaynakKayit, hedefKayit });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Transfer sırasında sunucu hatası", error: err.message });
  }
});

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
      ...(createdAt && { createdAt: createdAt }), 
    });

    await yeniGelir.save();
    res.status(201).json(yeniGelir);
  } catch (err) {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: "Doğrulama Hatası", errors: err.errors });
    }
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
    const { miktar, kategori, not, createdAt } = req.body; 
    const updates = { miktar, kategori, not };
    
    if (createdAt) {
      updates.createdAt = createdAt; 
    }
    
    const guncellenmis = await Gelir.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    
    if (!guncellenmis) {
      return res.status(404).json({ message: "Gelir bulunamadı" });
    }
    res.json(guncellenmis);
  } catch (err) {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: "Doğrulama Hatası", errors: err.errors });
    }
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// ❌ Tek geliri veya ilişkili transferi sil
router.delete("/:id", async (req, res) => {
  try {
    const hedefKayit = await Gelir.findById(req.params.id);
    
    if (!hedefKayit) {
      return res.status(404).json({ message: "Gelir bulunamadı" });
    }

    const transferIdMatch = hedefKayit.not && hedefKayit.not.match(/\| ID:(TRF_\d+)/);

    if (transferIdMatch) {
      const transferId = transferIdMatch[1];
      await Gelir.deleteMany({ not: { $regex: transferId } });
      return res.json({ message: "Transfer işlemi ve ilişkili tüm kayıtlar silindi" });
    }

    await Gelir.findByIdAndDelete(req.params.id);
    res.json({ message: "Gelir silindi" });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

module.exports = router;