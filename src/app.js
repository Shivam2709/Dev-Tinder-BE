// Importing required modules
const express = require("express");
const connectDB = require("./Config/db"); // Database connection function
const app = express();
const cookieParser = require("cookie-parser"); // Middleware for parsing cookies
const cors = require("cors"); // Middleware for enabling CORS
// Load environment variables from .env file
require("dotenv").config();
const PORT = process.env.PORT || 7777; // Default port is 7777 if not specified in .env

// Middleware for parsing JSON request bodies
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // Allow credentials (cookies, authorization headers, etc.) to be sent
  })
); // Enable CORS for all routes
app.use(express.json());

// Middleware for parsing cookies
app.use(cookieParser());

// Importing route handlers
const authRouter = require("./routes/auth"); // Handles authentication-related routes
const profileRouter = require("./routes/profile"); // Handles user profile-related routes
const requestRouter = require("./routes/request"); // Handles connection request-related routes
const userRouter = require("./routes/user"); // Handles user-related routes

// Registering route handlers
// All routes are prefixed with "/"
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

// Connect to the database and start the server
connectDB()
  .then(() => {
    console.log("Database connected successfully"); // Log success message when the database connects
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`); // Log the port the server is running on
    });
  })
  .catch((err) => {
    console.log("Database can't connect", err); // Log error message if the database connection fails
  });
