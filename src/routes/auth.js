// Importing required modules
const express = require("express");
const authRouter = express.Router();

// Importing utility functions and dependencies
const { validateSignUpData } = require("../../utils/validations"); // Validation for sign-up data
const bcrypt = require("bcrypt"); // Library for hashing passwords
const Users = require("../models/users"); // User model for database operations

// Route: POST /signup
// Description: Handles user registration by validating input, hashing the password, and saving the user to the database.
// Middleware: None
// Response: Returns a success message, the created user data, and sets a JWT token in cookies.
authRouter.post("/signup", async (req, res) => {
  try {
    // Validate the incoming request data
    validateSignUpData(req);

    // Destructure user details from the request body
    const { firstName, lastName, emailId, password } = req.body;

    // Encrypt the password using bcrypt with a salt round of 10
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash); // Debugging log for hashed password (should be removed in production)

    // Create a new user instance with the hashed password
    const user = new Users({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    // Save the user to the database
    const savedUser = await user.save();

    // Generate a JWT token for the user
    const token = await savedUser.getJWT();

    // Set the JWT token in an HTTP-only cookie with an 8-hour expiration
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // 8 hours
    });

    // Respond with a success message and the saved user data
    res.json({ message: "User created successfully!", data: savedUser });
  } catch (err) {
    // Handle errors and send a 400 status with the error message
    res.status(400).send("ERROR :" + err.message);
  }
});

// Route: POST /login
// Description: Handles user login by validating credentials and returning a JWT token.
// Middleware: None
// Response: Returns the user data and sets a JWT token in cookies.
authRouter.post("/login", async (req, res) => {
  try {
    // Destructure login credentials from the request body
    const { emailId, password } = req.body;

    // Find the user by email ID
    const user = await Users.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials!"); // Throw error if user is not found
    }

    // Validate the provided password with the stored hashed password
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      // Generate a JWT token for the user
      const token = await user.getJWT();

      // Set the JWT token in an HTTP-only cookie with an 8-hour expiration
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), // 8 hours
      });

      // Respond with the user data
      res.send(user);
    } else {
      throw new Error("Invalid Credentials!"); // Throw error if password is invalid
    }
  } catch (error) {
    // Handle errors and send a 400 status with the error message
    res.status(400).send("ERROR: " + error.message);
  }
});

// Route: POST /logout
// Description: Logs out the user by clearing the JWT token from cookies.
// Middleware: None
// Response: Returns a success message.
authRouter.post("/logout", async (req, res) => {
  // Clear the JWT token by setting it to null and expiring the cookie immediately
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  // Respond with a success message
  res.send("Logged out successfully!");
});

// Export the auth router to be used in the main application
module.exports = authRouter;
