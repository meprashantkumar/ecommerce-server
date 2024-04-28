import { Address } from "../models/Address.js";

export const addAddress = async (req, res) => {
  try {
    const { address, phone } = req.body;

    await Address.create({
      address,
      phone,
      user: req.user._id,
    });

    res.json({
      message: "Address added",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const fetchAllAddress = async (req, res) => {
  try {
    const alladdress = await Address.find({ user: req.user._id });

    res.json({
      alladdress,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getSingleAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    res.json({ address });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    await address.deleteOne();

    res.json({
      message: "Address Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
