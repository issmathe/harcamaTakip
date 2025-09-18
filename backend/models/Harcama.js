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
        "Gıda",
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
        "Restoran / Kafe",
        "Diğer",
      ],
      required: true,
    },
    not: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Harcama", HarcamaSchema);
