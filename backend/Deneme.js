const mongoose = require("mongoose");

const DenemeSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { timestamps: true }
);

const Deneme = mongoose.model("istenenler", DenemeSchema); // istenenler mongodb de açılan alan

module.exports = Deneme ;