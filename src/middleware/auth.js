const jwt = require("jsonwebtoken");
const Users = require("../models/users");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login!");
    }

    const decodedObj = await jwt.verify(token, "Dev@Tinder$789");

    const { _id } = decodedObj;
    const user = await Users.findById({ _id });
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send("Please authenticate", error.message);
  }
};

module.exports = { userAuth };
