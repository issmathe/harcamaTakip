const mongoose = require("mongoose");

const AbonelikSchema = new mongoose.Schema({
  miktar: { type: Number, required: true },
  kategori: { type: String, required: true }, // "Fatura" veya "İletisim"
  altKategori: { type: String, default: "" },
  not: { type: String, default: "" },
  kayitGunu: { type: Number, required: true }, // Her ayın hangi günü tetiklenecek? (1-31)
  harcamaKaynagi: { type: String, default: "Gelir" },
  triggeredMonths: [{ type: String }] // Çift kaydı önlemek için tetiklenen aylar ("2026-06" vb.)
}, { timestamps: true });

module.exports = mongoose.model("Abonelik", AbonelikSchema);