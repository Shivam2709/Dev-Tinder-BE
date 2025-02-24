const mongoose = require("mongoose");
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
};

connectDB()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log("Database can't connect", err);
  });
