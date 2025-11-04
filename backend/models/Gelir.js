// backend/models/Gelir.js (SON VERSİYON)

const mongoose = require("mongoose");

const GelirSchema = new mongoose.Schema(
  {
    miktar: {
      type: Number,
      required: true,
    },
    kategori: {
      type: String,
      enum: ["maaş", "tasarruf", "diğer"], // sadece 3 seçenek
      required: true,
    },
    not: {
      type: String,
      default: "",
    },
    // ✨ KRİTİK DÜZELTME 1: timestamps: true kaldırıldı.
    // ✨ KRİTİK DÜZELTME 2: createdAt ve updatedAt manuel eklendi.
    // Artık createdAt güncellenebilir bir Date alanıdır.
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }
  // 💡 NOT: { timestamps: true } buradan KALDIRILDI
);

// Pre-save hook'u ekleyerek updatedAt'i manuel güncelliyoruz.
// Bu, Mongoose'un varsayılan 'timestamps: true' davranışını taklit eder.
GelirSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Güncelleme işlemi sırasında updatedAt'i manuel güncelliyoruz.
GelirSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});


module.exports = mongoose.model("Gelir", GelirSchema);