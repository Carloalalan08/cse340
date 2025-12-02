const express = require("express")
const router = express.Router()
const regValidate = require("../utilities/account-validation")
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// Show registration page
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process registration
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Show login page
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Process login
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Account management view
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)


router.get("/logout", accountController.logout)

module.exports = router
