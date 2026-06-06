const express = require("express");
const router = express.Router();
const Gelir = require("../models/Gelir");
const Harcama = require("../models/Harcama");
const mongoose = require("mongoose");

// 🔄 Kategoriler Arası Para Transferi
router.post("/transfer", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      kaynakKategori, 
      hedefKategori, 
      miktar, 
      not, 
      createdAt,
      kaynakAltKategori,
      hedefAltKategori
    } = req.body;

    if (!kaynakKategori || !hedefKategori || !miktar) {
      return res.status(400).json({ message: "Kaynak, hedef kategori ve miktar zorunludur" });
    }

    if (kaynakKategori === hedefKategori && kaynakAltKategori === hedefAltKategori) {
      return res.status(400).json({ message: "Aynı kategori ve hesaba transfer yapılamaz" });
    }

    const transferMiktari = Math.abs(Number(miktar));
    let anlikBakiye = 0;

    const isGelirKategorisi = kaynakKategori.toLowerCase() === "gelir";

    if (isGelirKategorisi) {
      const tumGercekGelirler = await Gelir.find({ kategori: { $regex: /^gelir$/i } }).session(session);
      
      const toplamBankIncome = tumGercekGelirler
        .filter(g => !g.not || !g.not.includes("[Transfer"))
        .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

      const tumHarcamalar = await Harcama.find().session(session);
      const totalBankExit = tumHarcamalar
        .filter(h => !h.harcamaKaynagi || h.harcamaKaynagi === "Gelir")
        .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

      const eskiTransferler = tumGercekGelirler
        .filter(g => g.not && g.not.includes("[Transfer ->") && g.miktar < 0)
        .reduce((sum, g) => sum + Math.abs(g.miktar), 0);

      anlikBakiye = toplamBankIncome - totalBankExit - eskiTransferler;
    } else {
      let query = { kategori: { $regex: new RegExp(`^${kaynakKategori}$`, "i") } };
      if (kaynakKategori.toLowerCase() === "tasarruf" && kaynakAltKategori) {
        query.altKategori = kaynakAltKategori;
      }
      
      const kutuGelirleri = await Gelir.find(query).session(session);
      
      let harcamaQuery = { harcamaKaynagi: { $regex: new RegExp(`^${kaynakKategori}$`, "i") } };
      const kutuHarcamalari = await Harcama.find(harcamaQuery).session(session);

      const toplamGelir = kutuGelirleri.reduce((sum, g) => sum + Number(g.miktar || 0), 0);
      const toplamGider = kutuHarcamalari.reduce((sum, h) => sum + Number(h.miktar || 0), 0);
      
      anlikBakiye = toplamGelir - toplamGider;
    }

    if (anlikBakiye < transferMiktari) {
      await session.abortTransaction();
      session.endSession();
      const hesapIsmi = kaynakAltKategori ? `${kaynakKategori} (${kaynakAltKategori})` : kaynakKategori;
      return res.status(400).json({ 
        message: `Yetersiz bakiye! ${hesapIsmi} havuzunda sadece EUR ${anlikBakiye.toFixed(2)} var.` 
      });
    }

    const islemTarihi = createdAt ? new Date(createdAt) : new Date();
    const ortakTransferId = "TRF_" + Date.now();

    // Not alanlarını temiz dize birleştirmeyle oluşturuyoruz
    const kaynakNotEki = hedefAltKategori ? ` (${hedefAltKategori})` : "";
    const kaynakNotu = not ? `[Transfer -> ${hedefKategori}${kaynakNotEki}] ${not} | ID:${ortakTransferId}` : `[Transfer -> ${hedefKategori}${kaynakNotEki}] | ID:${ortakTransferId}`;

    const hedefNotEki = kaynakAltKategori ? ` (${kaynakAltKategori})` : "";
    const hedefNotu = not ? `[Transfer <- ${kaynakKategori}${hedefNotEki}] ${not} | ID:${ortakTransferId}` : `[Transfer <- ${kaynakKategori}${hedefNotEki}] | ID:${ortakTransferId}`;

    const kaynakKayit = new Gelir({
      miktar: -transferMiktari,
      kategori: kaynakKategori,
      altKategori: kaynakKategori.toLowerCase() === "tasarruf" ? kaynakAltKategori : "",
      kaynakAltKategori: kaynakKategori.toLowerCase() === "tasarruf" ? kaynakAltKategori : "",
      hedefAltKategori: hedefKategori.toLowerCase() === "tasarruf" ? hedefAltKategori : "",
      not: kaynakNotu,
      createdAt: islemTarihi
    });

    const hedefKayit = new Gelir({
      miktar: transferMiktari,
      kategori: hedefKategori,
      altKategori: hedefKategori.toLowerCase() === "tasarruf" ? hedefAltKategori : "",
      kaynakAltKategori: kaynakKategori.toLowerCase() === "tasarruf" ? kaynakAltKategori : "",
      hedefAltKategori: hedefKategori.toLowerCase() === "tasarruf" ? hedefAltKategori : "",
      not: hedefNotu,
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
    const { miktar, kategori, altKategori, not, createdAt } = req.body; 

    if (!miktar || !kategori) {
      return res.status(400).json({ message: "Miktar ve kategori zorunludur" });
    }

    const yeniGelir = new Gelir({
      miktar,
      kategori,
      altKategori: kategori.toLowerCase() === "tasarruf" ? altKategori : "",
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
    const { miktar, kategori, altKategori, not, createdAt } = req.body; 
    const updates = { miktar, kategori, altKategori, not };
    
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