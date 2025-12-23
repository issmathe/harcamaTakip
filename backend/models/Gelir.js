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
      enum: ["gelir", "tasarruf", "diğer"], // sadece 3 seçenek
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
  // 💡 NOT: { timestamps: true } buradan KALDIRILDI
);


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