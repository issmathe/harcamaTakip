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
  },
  { timestamps: true } // createdAt, updatedAt otomatik gelir
);

module.exports = mongoose.model("Gelir", GelirSchema);