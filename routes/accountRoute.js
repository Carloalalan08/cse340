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

// Middleware ensures logged-in user
router.get(
  "/update/:account_id",
  utilities.checkJWTToken,
  utilities.handleErrors(accountController.buildEditAccount)
)

// Process account update
router.post("/update", utilities.checkJWTToken, utilities.handleErrors(accountController.updateAccount))
router.post("/update-password", utilities.checkJWTToken, utilities.handleErrors(accountController.updatePassword))


router.get('/logout', (req, res) => {
  // Remove the JWT cookie
  res.clearCookie('jwt')

  // Flash a notice to the user
  req.flash('notice', 'You have been logged out.')

  // Redirect to home page
  return res.redirect('/')
})

module.exports = router
