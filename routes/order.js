import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  getAllOrder,
  getAllOrderAdmin,
  getMyOrder,
  newOrderCod,
  newOrderOnline,
  payment,
  updateStatus,
} from "../controllers/order.js";

const router = express.Router();

router.post("/order/new/cod", isAuth, newOrderCod);
router.post("/order/new/online", isAuth, newOrderOnline);
router.post("/payment", isAuth, payment);
router.get("/order/all", isAuth, getAllOrder);
router.get("/order/admin/all", isAuth, getAllOrderAdmin);
router.get("/order/:id", isAuth, getMyOrder);
router.put("/order/:id", isAuth, updateStatus);

export default router;
