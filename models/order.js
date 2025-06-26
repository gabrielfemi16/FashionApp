const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        qty: Number,
        image: String,
      },
    ],
    code: String,
    status: { type: String, default: "Not Delivered" },
  },
  { timestamps: true }
);

const Order = mongoose.model("order", orderSchema);
module.exports = Order;
