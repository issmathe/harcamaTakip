// backend/models/Gelir.js (GÜNCELLENMİŞ VERSİYON)

const mongoose = require("mongoose");

const GelirSchema = new mongoose.Schema(
  {
    miktar: {
      type: Number,
      required: true,
    },
    kategori: {
      type: String,
      // Frontend'deki "nakit" seçeneği buradaki enum listesine eklendi
      enum: ["gelir", "tasarruf", "diğer", "nakit"], 
      required: true,
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