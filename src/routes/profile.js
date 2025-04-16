// Importing required modules
const express = require("express");
const profileRouter = express.Router();

// Middleware for user authentication
const { userAuth } = require("../middleware/auth");

// Utility function for validating profile edit data
const { validateEditProfileData } = require("../../utils/validations");

// User model for database operations
const users = require("../models/users");

// Library for hashing and comparing passwords
const bcrypt = require("bcrypt");

// Route: GET /profile/view
// Description: Fetches the profile details of the logged-in user.
// Middleware: Requires user authentication (userAuth).
// Response: Returns the user object.
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user; // Authenticated user object

    // Respond with the user data
    res.send(user);
  } catch (error) {
    // Handle errors and send a 400 status with the error message
    res.status(400).send("ERROR: " + error.message);
  }
});

// Route: PATCH /profile/edit
// Description: Allows the logged-in user to edit their profile details.
// Middleware: Requires user authentication (userAuth).
// Validation: Validates the incoming data using `validateEditProfileData`.
// Response: Returns a success message and the updated user data.
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // Validate the incoming request data
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid data provided!");
    }

    const loggedInUser = req.user; // Authenticated user object

    // Update the user's profile with the provided data
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    // Save the updated user data to the database
    await loggedInUser.save();

    // Respond with a success message and the updated user data
    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfully!`,
      data: loggedInUser,
    });
  } catch (error) {
    // Handle errors and send a 400 status with the error message
    res.status(400).send("ERROR: " + error.message);
  }
});

// Route: PUT /profile/change-password
// Description: Allows the logged-in user to change their password.
// Middleware: Requires user authentication (userAuth).
// Validation: Ensures both current and new passwords are provided.
// Response: Returns a success message upon successful password change.
profileRouter.put("/profile/change-password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body; // Extract passwords from request body
    const userId = req.user._id; // Get the logged-in user's ID

    // Ensure both current and new passwords are provided
    if (!currentPassword || !newPassword) {
      throw new Error("Please provide both current and new passwords!");
    }

    // Fetch the user from the database
    const user = await users.findById(userId);

    // If user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Compare the provided current password with the stored hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect!" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    // Respond with a success message
    return res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error changing password:", error);

    // Handle errors and send a 500 status with a generic error message
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Export the profile router to be used in the main application
module.exports = profileRouter;
