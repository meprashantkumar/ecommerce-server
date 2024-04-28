import sendMail from "../middlewares/sendMail.js";
import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
import { Payment } from "../models/Payment.js";

dotenv.config();

const instance = new Razorpay({
  key_id: process.env.Razorpay_key,
  key_secret: process.env.Razorpay_Secret,
});

export const newOrderCod = async (req, res) => {
  try {
    const { method, phone, address } = req.body;

    const cart = await Cart.find({ user: req.user._id }).populate("product");

    let subTotal = 0;

    cart.forEach((i) => {
      const itemSubtotal = i.product.price * i.quantity;

      subTotal += itemSubtotal;
    });

    const items = await Cart.find({ user: req.user._id })
      .select("-_id")
      .select("-user")
      .select("-__v");

    const order = await Order.create({
      items,
      method,
      user: req.user._id,
      phone,
      address,
      subTotal,
    });

    for (let i of order.items) {
      let product = await Product.findOne({ _id: i.product });

      product.$inc("stock", -1 * i.quantity);
      product.$inc("sold", +i.quantity);

      await product.save();
    }

    await Cart.find({ user: req.user._id }).deleteMany();

    await sendMail(
      req.user.email,
      "Let's negotitate",
      `Thanks your shopping of ₹ ${subTotal} from our Platform your order will be deliverd soon`
    );

    res.status(201).json({
      message: "Order Placed Successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllOrder = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });

    res.json({ orders: orders.reverse() });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllOrderAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({
        message: "Unauthorized",
      });

    const orders = await Order.find();

    res.json({ orders });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");

    res.json({ order });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "This is admin route",
      });
    }

    const order = await Order.findById(req.params.id);

    if (order.status === "Pending") {
      order.status = "Processing";

      await sendMail(
        req.user.email,
        "Lets negotiate",
        "Your order is in processing and it will be delivered soon"
      );

      await order.save();

      return res.json({
        message: "order status updated",
      });
    }

    if (order.status === "Processing") {
      order.status = "Shipped";

      await sendMail(
        req.user.email,
        "Lets negotiate",
        "Your order is Shipped and it will be delivered soon"
      );

      await order.save();

      return res.json({
        message: "order status updated",
      });
    }

    if (order.status === "Shipped") {
      order.status = "Out for delivery";

      await sendMail(
        req.user.email,
        "Lets negotiate",
        "Your order is Out for delivery and it will be delivered soon"
      );

      await order.save();

      return res.json({
        message: "order status updated",
      });
    }

    if (order.status === "Out for delivery") {
      order.status = "Delivered";

      await sendMail(
        req.user.email,
        "Lets negotiate",
        "Your order is Delivered Thank you for shopping"
      );

      await order.save();

      return res.json({
        message: "order status updated",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const newOrderOnline = async (req, res) => {
  try {
    const { method, phone, address } = req.body;

    const cart = await Cart.find({ user: req.user._id }).populate("product");

    let subTotal = 0;

    cart.forEach((i) => {
      const itemSubtotal = i.product.price * i.quantity;

      subTotal += itemSubtotal;
    });

    const items = await Cart.find({ user: req.user._id })
      .select("-_id")
      .select("-user")
      .select("-__v");

    const orderOptions = {
      items,
      method,
      user: req.user._id,
      phone,
      address,
      subTotal,
    };

    const options = {
      amount: Number(subTotal) * 100,
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      order,
      orderOptions,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const payment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderOptions,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.Razorpay_Secret)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const payment = await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      const order = await Order.create({
        ...orderOptions,
        paidAt: new Date(Date.now()),
        paymentInfo: payment._id,
      });

      for (let i of order.items) {
        let product = await Product.findOne({ _id: i.product });

        product.$inc("stock", -1 * i.quantity);
        product.$inc("sold", +i.quantity);

        await product.save();
      }

      await Cart.find({ user: req.user._id }).deleteMany();

      await sendMail(
        req.user.email,
        "Let's negotitate",
        `Thanks your shopping from our Platform your order will be deliverd soon`
      );

      res.status(201).json({
        message: "Order Placed Successfully",
        order,
      });
    } else {
      return res.status(400).json({
        message: "Payment Failed",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
