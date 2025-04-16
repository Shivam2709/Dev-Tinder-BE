// Importing required modules
const express = require("express");
const userRouter = express.Router();

// Middleware for user authentication
const { userAuth } = require("../middleware/auth");

// Models for database operations
const ConnectionRequest = require("../models/connectionRequest");
const Users = require("../models/users");

// Fields to be included when fetching user data for security and privacy
// Ensures sensitive information like passwords is excluded from responses
const USER_SAFE_DATA = "firstName lastName profilePic age gender about skills";

// Route: GET /user/requests/received
// Description: Fetches all connection requests received by the logged-in user with a status of "interested".
// Middleware: Requires user authentication (userAuth).
// Response: Returns a list of connection requests with limited user data (populated from `fromUserId`).
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user; // Authenticated user object

    // Fetch connection requests where the logged-in user is the recipient and the status is "interested"
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA); // Populate sender's user data with safe fields

    // Respond with the fetched data
    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (error) {
    // Handle errors and send a 400 status with the error message
    res.status(400).send("ERROR: " + error.message);
  }
});

// Route: GET /user/connections
// Description: Fetches all active connections (status: "accepted") for the logged-in user.
// Middleware: Requires user authentication (userAuth).
// Response: Returns a list of connected users with limited user data.
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user; // Authenticated user object

    // Fetch connection requests where the logged-in user is either the sender or recipient and the status is "accepted"
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA) // Populate sender's user data with safe fields
      .populate("toUserId", USER_SAFE_DATA); // Populate recipient's user data with safe fields

    // Map the connection requests to extract the connected user's data
    const data = connectionRequests.map((row) => {
      // If the logged-in user is the sender, return the recipient's data; otherwise, return the sender's data
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    // Respond with the list of connected users
    res.json({ data });
  } catch (error) {
    // Handle errors and send a 400 status with the error message
    res.status(400).send("ERROR: " + error.message);
  }
});

// Route: GET /feed
// Description: Fetches a paginated list of users to display in the logged-in user's feed.
// Middleware: Requires user authentication (userAuth).
// Logic: Excludes users who are already connected or have pending connection requests with the logged-in user.
// Response: Returns a list of users with limited user data.
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user; // Authenticated user object

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const adjustedLimit = limit > 50 ? 50 : limit; // Limit the maximum number of results per page
    const skip = (page - 1) * adjustedLimit;

    // Fetch connection requests involving the logged-in user
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    // Create a set of user IDs to exclude from the feed
    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    // Fetch users who are not connected to or have pending requests with the logged-in user
    const users = await Users.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } }, // Exclude users in the set
        { _id: { $ne: loggedInUser._id } }, // Exclude the logged-in user
      ],
    })
      .select(USER_SAFE_DATA) // Select only safe fields
      .skip(skip) // Skip results for pagination
      .limit(adjustedLimit); // Limit the number of results

    // Respond with the list of users
    res.json({ data: users });
  } catch (err) {
    // Handle errors and send a 400 status with the error message
    res.status(400).send("ERROR: " + err.message);
  }
});

// Export the user router to be used in the main application
module.exports = userRouter;
