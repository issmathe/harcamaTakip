const express = require("express");
const router = express.Router();
const Gelir = require("../models/Gelir");
const Harcama = require("../models/Harcama"); // Bakiye kontrolü için harcamalar da gerekiyor
const mongoose = require("mongoose"); // Transaction için eklendi

// 🔄 Kategoriler Arası Para Transferi (Akıllı Bakiye Kontrollü)
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
    let anlikBakiye = 0;

    const isGelirKategorisi = kaynakKategori.toLowerCase() === "gelir";

    // --- AKILLI BAKİYE KONTROLÜ ---
    if (isGelirKategorisi) {
      // 1. Senaryo: Kaynak ana nakit havuzu "gelir" ise (Gerçek Banka Bakiyesi Kontrolü)
      const tumGercekGelirler = await Gelir.find({ kategori: { $regex: /^gelir$/i } }).session(session);
      
      // Saf ana gelirler (Daha önceki transfer girişlerini hariç tutuyoruz)
      const toplamBankIncome = tumGercekGelirler
        .filter(g => !g.not || !g.not.includes("[Transfer"))
        .reduce((sum, g) => sum + Number(g.miktar || 0), 0);

      // Bankadan çıkan tüm harcamalar
      const tumHarcamalar = await Harcama.find().session(session);
      const totalBankExit = tumHarcamalar.reduce((sum, h) => sum + Number(h.miktar || 0), 0);

      // Daha önce "gelir"den diğer kutulara aktarılan (eksi işaretli) transferler
      const eskiTransferler = tumGercekGelirler
        .filter(g => g.not && g.not.includes("[Transfer ->") && g.miktar < 0)
        .reduce((sum, g) => sum + Math.abs(g.miktar), 0);

      // Bankada harcanabilir net bakiye
      anlikBakiye = toplamBankIncome - totalBankExit - eskiTransferler;
    } else {
      // 2. Senaryo: Kaynak "tasarruf", "birikim" gibi alt kutulardan biriyse
      const kutuGelirleri = await Gelir.find({ kategori: { $regex: new RegExp(`^${kaynakKategori}$`, "i") } }).session(session);
      const kutuHarcamalari = await Harcama.find({ kategori: { $regex: new RegExp(`^${kaynakKategori}$`, "i") } }).session(session);

      const toplamGelir = kutuGelirleri.reduce((sum, g) => sum + Number(g.miktar || 0), 0);
      const toplamGider = kutuHarcamalari.reduce((sum, h) => sum + Number(h.miktar || 0), 0);
      
      anlikBakiye = toplamGelir - toplamGider;
    }

    // Yetersiz bakiye durumunda işlemi kilitle ve iptal et
    if (anlikBakiye < transferMiktari) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: `Yetersiz bakiye! ${kaynakKategori} havuzunda sadece €${anlikBakiye.toFixed(2)} var. Transfer edilmek istenen: €${transferMiktari.toFixed(2)}` 
      });
    }
    // ------------------------------

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