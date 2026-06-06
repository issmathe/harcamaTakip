const mongoose = require("mongoose");

const GelirSchema = new mongoose.Schema(
  {
    miktar: {
      type: Number,
      required: true,
    },
    kategori: {
      type: String,
      // Geçmiş raporlarda transferleri ayırt edebilmek için "transfer" eklendi
      enum: ["gelir", "tasarruf", "diğer", "transfer"], 
      required: true,
    },
    // Birikim alt hesap kırılımları için eklenen alanlar
    altKategori: {
      type: String,
      enum: ["Trade Republic", "Wise", "Nakit", ""],
      default: "",
    },
    kaynakAltKategori: {
      type: String,
      enum: ["Trade Republic", "Wise", "Nakit", ""],
      default: "",
    },
    hedefAltKategori: {
      type: String,
      enum: ["Trade Republic", "Wise", "Nakit", ""],
      default: "",
    },
    not: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

// Kayıt öncesi updatedAt güncelleme
GelirSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Güncelleme (update) işlemi sırasında updatedAt'i manuel güncelliyoruz
GelirSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model("Gelir", GelirSchema);