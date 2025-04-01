const validator = require("validator");

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

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );
  if (!isEditAllowed) return false;

  // Validate profilePic (ensure it's a valid URL if provided)
  // if (req.body.profilePic) {
  //   const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i;
  //   if (!urlPattern.test(req.body.profilePic)) {
  //     return false;
  //   }
  // }

  // Validate skills (should be an array with a max length of 10)
  if (
    req.body.skills &&
    (!Array.isArray(req.body.skills) || req.body.skills.length > 10)
  ) {
    return false;
  }

  return true;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
