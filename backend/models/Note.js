const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    baslik: {
      type: String,
      required: true,
      trim: true,
    },
    icerik: {
      type: String,
      default: "",
    },
    etiket: {
      type: String,
      enum: ["Genel", "Borç", "Alacak", "Plan"],
      default: "Genel",
    },
  },
  { timestamps: true } // Apple Notlar gibi son güncelleme tarihini otomatik tutar
);

module.exports = mongoose.model("Note", NoteSchema);