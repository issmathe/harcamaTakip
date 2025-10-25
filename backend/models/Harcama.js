const mongoose = require("mongoose");

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
        "Bağış",
        "Petrol",
        "Kira",
        "Fatura",
        "Eğitim",
        "Sağlık",
        "Ulaşım",
        "Eğlence",
        "Elektronik",
        "Spor",
        "Market",
        "Kırtasiye",
        "Restoran",
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Harcama", HarcamaSchema);
