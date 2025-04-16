// Importing the "validator" library for data validation
const validator = require("validator");

// Function: validateSignUpData
// Description: Validates the data provided during user sign-up.
// Parameters: req (Express request object containing the user data in req.body)
// Validation:
// - Ensures `firstName` and `lastName` are provided.
// - Validates `emailId` using the `validator.isEmail` method.
// - Ensures `password` meets strong password criteria using `validator.isStrongPassword`.
// Throws: An error with a descriptive message if validation fails.
const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not valid!");
  }
};

// Function: validateEditProfileData
// Description: Validates the data provided during profile editing.
// Parameters: req (Express request object containing the user data in req.body)
// Validation:
// - Ensures only allowed fields are being updated.
// - Validates `skills` (if provided) to ensure it is an array with a maximum length of 10.
// - (Optional) Validates `profilePic` (if provided) to ensure it is a valid URL (commented out for now).
// Returns: `true` if all validations pass, otherwise `false`.
const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "profilePic",
    "gender",
    "age",
    "about",
    "skills",
  ];

  // Ensure all fields in the request body are allowed for editing
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );
  if (!isEditAllowed) return false;

  // (Optional) Validate `profilePic` to ensure it is a valid URL (commented out for now)
  // if (req.body.profilePic) {
  //   const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i;
  //   if (!urlPattern.test(req.body.profilePic)) {
  //     return false;
  //   }
  // }

  // Validate `skills` to ensure it is an array with a maximum length of 10
  if (
    req.body.skills &&
    (!Array.isArray(req.body.skills) || req.body.skills.length > 10)
  ) {
    return false;
  }

  return true;
};

// Exporting the validation functions for use in other parts of the application
module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
