const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

const Category = mongoose.model("category", categorySchema);
module.exports = Category;