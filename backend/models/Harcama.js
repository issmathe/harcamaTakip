const mongoose = require("mongoose");
const dayjs = require('dayjs'); // dayjs eklendi

const HarcamaSchema = new mongoose.Schema(
  {
    miktar: {
      type: Number,
      required: true,
    },
    kategori: {
      type: String,
      enum: [
        "Giyim",
        "Tasarruf",
        "Kira",
        "Fatura",
        "Eğitim",
        "Sağlık",
        "Ulaşım",
        "Eğlence",
        "Elektronik",
        "İletisim",
        "Market",
        "Hediye",
        "Restoran",
        "Aile",
        "Diğer",
      ],
      required: true,
    },
    altKategori: {
      type: String, // sadece Market seçilince doldurulacak
    },
    not: {
      type: String,
    },
    
    // ✅ DÜZELTME 1: timestamps: true KALDIRILDI ve alanlar manuel eklendi
    createdAt: {
        type: Date,
        default: dayjs().toDate(),
    },
    updatedAt: {
        type: Date,
        default: dayjs().toDate(),
    },
  }
  // { timestamps: true } KALDIRILDI!
);

// ✅ DÜZELTME 2: updatedAt alanını manuel güncellemek için Mongoose hook'ları eklendi

// Hem save (yeni oluşturma) hem de findOneAndUpdate (güncelleme) işlemlerinde updatedAt'i ayarla
HarcamaSchema.pre('save', function(next) {
  this.updatedAt = dayjs().toDate();
  next();
});

HarcamaSchema.pre('findOneAndUpdate', function(next) {
  // $set operatörüne updatedAt'i ekle
  this._update.updatedAt = dayjs().toDate();
  next();
});


module.exports = mongoose.model("Harcama", HarcamaSchema);