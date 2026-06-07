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

    // DÜZELTME: Dil birliği sağlandığı için doğrudan güvenli string kontrolü
    const isGelirKategorisi = kaynakKategori.toLowerCase() === "gelir";

    if (isGelirKategorisi) {
      // Banka (Ana Gelir) bakiyesini hesapla
      const tumGelirler = await Gelir.find().session(session);
      
      const toplamBankIncome = tumGelirler
        .filter(g => g.kategori === "Gelir" && (!g.not || !g.not.includes("TRF_")))
        .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

      const tumHarcamalar = await Harcama.find().session(session);
      const totalBankExit = tumHarcamalar
        .filter(h => !h.harcamaKaynagi || h.harcamaKaynagi === "Gelir")
        .reduce((sum, h) => sum + Number(h.miktar || 0), 0);

      // Bankadan dışarı giden transfer bacakları
      const eskiTransferlerGiden = tumGelirler
        .filter(g => g.kategori === "Gelir" && g.not && g.not.includes("TRF_") && g.miktar < 0)
        .reduce((sum, g) => sum + Math.abs(g.miktar), 0);

      // Diğer havuzlardan bankaya geri dönen transfer bacakları
      const eskiTransferlerGelen = tumGelirler
        .filter(g => g.kategori === "Gelir" && g.not && g.not.includes("TRF_") && g.miktar > 0)
        .reduce((sum, g) => sum + Number(g.miktar), 0);

      anlikBakiye = (toplamBankIncome + eskiTransferlerGelen) - totalBankExit - eskiTransferlerGiden;
    } else {
      // DÜZELTME: Dinamik alt havuz bakiyelerini hatasız hesaplama motoru
      const havuzGelirleri = await Gelir.find({ kategori: kaynakKategori }).session(session);
      
      const filtrelenmişGelirler = havuzGelirleri.filter(g => {
        if (kaynakKategori.toLowerCase() === "tasarruf") {
          return g.altKategori === kaynakAltKategori || g.kaynakAltKategori === kaynakAltKategori;
        }
        return true;
      });

      const toplamGelir = filtrelenmişGelirler.reduce((sum, g) => {
        // Eğer bu havuzdan başka yere giden bir transferse miktar zaten eksidir, doğrudan ekle
        return sum + Number(g.miktar || 0);
      }, 0);

      const havuzHarcamalari = await Harcama.find({ harcamaKaynagi: kaynakKategori }).session(session);
      const filtrelenmişHarcamalar = havuzHarcamalari.filter(h => {
        if (kaynakKategori.toLowerCase() === "tasarruf") {
          return h.altKategori === kaynakAltKategori;
        }
        return true;
      });

      const toplamGider = filtrelenmişHarcamalar.reduce((sum, h) => sum + Number(h.miktar || 0), 0);
      
      anlikBakiye = toplamGelir - toplamGider;
    }

    if (anlikBakiye < transferMiktari) {
      await session.abortTransaction();
      session.endSession();
      const hesapIsmi = kaynakAltKategori ? `${kaynakKategori} (${kaynakAltKategori})` : kaynakKategori;
      return res.status(400).json({ 
        message: `Yetersiz bakiye! ${hesapIsmi} havuzunda sadece EUR ${anlikBakiye.toFixed(2).replace('.', ',')} var.` 
      });
    }

    const islemTarihi = createdAt ? new Date(createdAt) : new Date();
    const ortakTransferId = "TRF_" + Date.now();

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

    res.status(201).json({ message: "Transfer başarıyla gerçekleşti", kaynakKayit, Residential: hedefKayit });
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
      miktar: Number(miktar),
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
    const updates = { miktar: Number(miktar), kategori, altKategori, not };
    
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