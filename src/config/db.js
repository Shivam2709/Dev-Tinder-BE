const e = require("express");
const mongoose = require("mongoose");

// Function: connectDB
// Description: Establishes a connection to the MongoDB database using the connection string from environment variables.
// Process:
// - Uses the `mongoose.connect` method to connect to the database.
// - The connection string is retrieved from the `MONGODB_URL` environment variable.
// - Ensures the connection is established asynchronously.
// Throws: Errors if the connection fails, which should be handled by the caller.
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
};

module.exports = connectDB;
