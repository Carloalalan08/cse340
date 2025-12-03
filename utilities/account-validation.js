const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

/* ****************************************
 * Validation Object
 * *************************************** */
const validate = {}

/* ****************************************
 * Registration Rules
 * *************************************** */
validate.registrationRules = () => [
  body("account_firstname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a first name."),

  body("account_lastname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a last name."),

  body("account_email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .isEmail()
    .withMessage("A valid email is required.")
    .custom(async (email) => {
      const exists = await accountModel.checkExistingEmail(email)
      if (exists) throw new Error("Email exists. Please log in or use a different email.")
    }),

  body("account_password")
    .trim()
    .notEmpty()
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
    .withMessage("Password does not meet strength requirements."),
]

validate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email
    })
  }
  next()
}

/* ****************************************
 * Login Rules
 * *************************************** */
validate.loginRules = () => [
  body("account_email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .isEmail()
    .withMessage("A valid email is required."),
  body("account_password")
    .trim()
    .notEmpty()
    .withMessage("Password cannot be empty."),
]

validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email: req.body.account_email
    })
  }
  next()
}

/* ****************************************
 * Update Account Rules
 * *************************************** */
validate.updateAccountRules = () => [
  body("account_firstname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("First name is required."),
  body("account_lastname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Last name is required."),
  body("account_email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Enter a valid email.")
    .custom(async (email, { req }) => {
      const account_id = parseInt(req.body.account_id, 10)
      const existing = await accountModel.getAccountByEmail(email)
      if (existing && existing.account_id !== account_id) {
        throw new Error("Email already in use by another account.")
      }
    }),
]

validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("account/edit-account", {
      title: "Edit Account",
      nav,
      account: req.body,
      errors: errors.array(),
      message: null
    })
  }
  next()
}

/* ****************************************
 * Password Update Rules
 * *************************************** */
validate.updatePasswordRules = () => [
  body("account_password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/\d/)
    .withMessage("Password must contain at least one number.")
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain at least one letter.")
]

validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("account/edit-account", {
      title: "Change Password",
      nav,
      account: { account_id: req.body.account_id },
      errors: errors.array(),
      message: null
    })
  }
  next()
}

module.exports = validate
