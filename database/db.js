import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DB);
    console.log("connected to db");
  } catch (error) {
    console.log(error);
  }
};

export default connectDb;
