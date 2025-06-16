const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "",
    },
    wishlist: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: [] },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);
module.exports = User;
