import mongoose from "mongoose";

const schema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const Cart = mongoose.model("Cart", schema);
