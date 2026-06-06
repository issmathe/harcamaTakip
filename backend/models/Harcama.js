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
    createdAt: {
        type: Date,
        default: () => dayjs().toDate(), // ✅ DOĞRUSU: Her kayıt atıldığında anlık tarihi üretir
    },
    updatedAt: {
        type: Date,
        default: () => dayjs().toDate(), // ✅ DOĞRUSU: Ok fonksiyonu ile sarmallandı
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