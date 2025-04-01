const express = require("express");
const connectDB = require("./Config/db");
const app = express();
const cookieParser = require("cookie-parser");

require("dotenv").config();
const PORT = process.env.PORT || 7777;

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");

app.use("/", authRouter);
app.use("/", profileRouter);

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database can't connect", err);
  });
