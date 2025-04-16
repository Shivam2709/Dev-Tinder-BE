// Importing required modules
const jwt = require("jsonwebtoken"); // Library for handling JSON Web Tokens (JWT)
const Users = require("../models/users"); // User model for database operations

// Middleware: userAuth
// Description: Middleware to authenticate users based on the JWT token stored in cookies.
// Parameters:
// - req: Express request object
// - res: Express response object
// - next: Express next middleware function
// Process:
// - Extracts the JWT token from cookies.
// - Verifies the token using the secret key from environment variables.
// - Decodes the token to retrieve the user ID and fetches the user from the database.
// - Attaches the authenticated user object to the `req` object for downstream use.
// - If authentication fails, responds with appropriate error messages and status codes.
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies; // Extract the token from cookies

    // Check if the token is present
    if (!token) {
      return res.status(401).send("Please Login!"); // Respond with 401 if no token is found
    }

    // Verify the token and decode the payload
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);

    const { _id } = decodedObj; // Extract the user ID from the decoded token

    // Fetch the user from the database using the ID
    const user = await Users.findById(_id);

    // If the user is not found, throw an error
    if (!user) {
      throw new Error("User not found");
    }

    // Attach the authenticated user object to the request object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Handle errors and respond with a 400 status and an error message
    res.status(400).send("Please authenticate " + err.message);
  }
};

// Exporting the userAuth middleware for use in other parts of the application
module.exports = { userAuth };
