const express = require("express");
const connectDB = require("./Config/db");
const users = require("./models/users");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
app.post("/signup", async (req, res) => {
  const user = new users({
    firstName: "Rohit",
    lastName: "Sharma",
    emailId: "rohit@sharma.com",
    password: "rohit@123",
  });

  try {
    await user.save();
    res.send("User created successfully");
  } catch (error) {
    res.status(400).send("User not created", error);
  }
});

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
