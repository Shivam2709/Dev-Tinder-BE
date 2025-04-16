// Importing required modules
const express = require("express");
const requestRouter = express.Router();

// Middleware for user authentication
const { userAuth } = require("../middleware/auth");

// Models for database operations
const ConnectionRequest = require("../models/connectionRequest");
const Users = require("../models/users");

// Route: POST /request/send/:status/:toUserId
// Description: Allows a user to send a connection request to another user with a specific status.
// Middleware: Requires user authentication (userAuth).
// Validation: Ensures the status is either "ignored" or "interested" and the recipient user exists.
// Response: Returns a success message and the created connection request object.
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id; // Authenticated user's ID
      const toUserId = req.params.toUserId; // Recipient user's ID
      const status = req.params.status; // Status of the connection request

      // Validate the status parameter
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type: " + status });
      }

      // Check if the recipient user exists
      const toUser = await Users.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if a connection request already exists between the two users
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection Request already exists" });
      }

      // Create a new connection request
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();

      // Respond with a success message and the created connection request
      res.json({
        message: req.user.firstName + " is " + status + " " + toUser.firstName,
        data,
      });
    } catch (error) {
      // Handle errors and send a 400 status with the error message
      res.status(400).send("ERROR: " + error.message);
    }
  }
);

// Route: POST /request/review/:status/:requestId
// Description: Allows a user to review a connection request (accept or reject).
// Middleware: Requires user authentication (userAuth).
// Validation: Ensures the status is either "accepted" or "rejected" and the connection request exists.
// Response: Returns a success message and the updated connection request object.
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user; // Authenticated user object
      const { status, requestId } = req.params; // Extract status and request ID from parameters

      // Validate the status parameter
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status not allowed!" });
      }

      // Find the connection request for the logged-in user with status "interested"
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      // If the connection request is not found, return a 404 error
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection Request not found!" });
      }

      // Update the status of the connection request
      connectionRequest.status = status;

      // Save the updated connection request to the database
      const data = await connectionRequest.save();

      // Respond with a success message and the updated connection request
      res.json({ message: "Connection Request " + status, data });
    } catch (err) {
      // Handle errors and send a 400 status with the error message
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

// Export the request router to be used in the main application
module.exports = requestRouter;
