import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  addToCart,
  fetchCart,
  removeFromCart,
  updateCart,
} from "../controllers/cart.js";

const router = express.Router();

router.post("/cart/new", isAuth, addToCart);
router.get("/cart/all", isAuth, fetchCart);
router.delete("/cart/:id", isAuth, removeFromCart);
router.put("/cart", isAuth, updateCart);

export default router;
