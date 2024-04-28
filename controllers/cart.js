import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

export const addToCart = async (req, res) => {
  try {
    const { product } = req.body;

    const cart = await Cart.findOne({
      product: product,
      user: req.user._id,
    }).populate("product");

    if (cart) {
      if (cart.product.stock === cart.quantity)
        return res.status(400).json({
          message: "Out of stock",
        });

      cart.quantity = cart.quantity + 1;

      await cart.save();

      return res.status(200).json({
        message: "Added to cart",
      });
    }

    const cartProd = await Product.findById(product);

    if (cartProd.stock === 0)
      return res.status(400).json({
        message: "Out of stock",
      });

    await Cart.create({
      quantity: 1,
      product: product,
      user: req.user._id,
    });

    res.status(200).json({
      message: "Added to cart",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const fetchCart = async (req, res) => {
  try {
    const cart = await Cart.find({ user: req.user._id }).populate("product");

    const sumofQuantities = cart.reduce(
      (total, item) => total + item.quantity,
      0
    );

    let subTotal = 0;

    cart.forEach((i) => {
      const itemSubtotal = i.product.price * i.quantity;
      subTotal += itemSubtotal;
    });

    res.json({ cart, subTotal, sumofQuantities });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);

    await cart.deleteOne();

    res.json({
      message: "Removed from cart",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { action } = req.query;

    if (action === "inc") {
      const { id } = req.body;
      const cart = await Cart.findById(id).populate("product");

      if (cart.quantity < cart.product.stock) {
        cart.quantity++;
        await cart.save();
      } else {
        return res.status(400).json({
          message: "Out of stock",
        });
      }

      res.json({
        message: "cart Updated",
      });
    }

    if (action === "dec") {
      const { id } = req.body;

      const cart = await Cart.findById(id).populate("product");

      if (cart.quantity > 1) {
        cart.quantity--;
        await cart.save();
      } else {
        return res.status(400).json({
          message: "You have only one item",
        });
      }

      res.status(200).json({
        message: "Cart updated",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
