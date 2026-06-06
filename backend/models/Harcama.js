const mongoose = require("mongoose");
const dayjs = require('dayjs');

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
      type: String,
    },
    not: {
      type: String,
    },
    // Yeni eklenen alan: Harcamanın hangi hesaptan/kasadan karşılandığı
    harcamaKaynagi: {
      type: String,
      enum: ["Gelir", "Ekstra Gelir", "Birikim"],
      default: "Gelir", // Eski ve kaynaksız harcamalar otomatik olarak "Gelir" sayılacak
      required: true
    },
    createdAt: {
        type: Date,
        default: () => dayjs().toDate(), 
    },
    updatedAt: {
        type: Date,
        default: () => dayjs().toDate(), 
    },
  }
);

HarcamaSchema.pre('save', function(next) {
  this.updatedAt = dayjs().toDate();
  next();
});

HarcamaSchema.pre('findOneAndUpdate', function(next) {
  this._update.updatedAt = dayjs().toDate();
  next();
});

module.exports = mongoose.model("Harcama", HarcamaSchema);