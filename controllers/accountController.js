const utilities = require("../utilities")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const accountModel = require("../models/account-model")
require("dotenv").config()

const accountController = {}

/* ****************************************
 * Deliver the registration view
 * *************************************** */
accountController.buildRegister = async function(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
        account_firstname: "",
        account_lastname: "",
        account_email: ""
    })
}

/* ****************************************
 * Placeholder for registration process
 * *************************************** */
/* ****************************************
 * Registration process
 * *************************************** */
accountController.registerAccount = async function(req, res, next) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password
  const hashedPassword = await bcrypt.hash(account_password, 10)

  try {
    // Insert into DB
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      // Fetch nav
      const nav = await utilities.getNav()

      // Log user in immediately
      const accountData = {
        account_id: regResult.account_id,
        account_firstname,
        account_lastname,
        account_email,
        account_type: "Client" // default per course
      }

      // Build JWT
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 }
      )

      // Store cookie
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 3600 * 1000
      })

      req.flash("notice", "Registration successful. Welcome!")
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Registration failed. Please try again.")
      return res.status(501).render("account/register", {
        title: "Register",
        nav: await utilities.getNav(),
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
      })
    }
  } catch (error) {
    console.error(error)
    req.flash("notice", "Something went wrong. Try again.")
    let nav = await utilities.getNav()
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
 * Deliver the login view
 * *************************************** */
accountController.buildLogin = async function(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email: ""
    })
}

/* ****************************************
 * Login process
 * *************************************** */
accountController.accountLogin = async function(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  // 1. Look up account
  const accountData = await accountModel.getAccountByEmail(account_email)

  // If email doesn't exist
  if (!accountData) {
    req.flash("notice", "Invalid email or password.")
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email
    })
  }

  try {
    // 2. Compare password
    const validPassword = await bcrypt.compare(
      account_password,
      accountData.account_password
    )

    if (!validPassword) {
      req.flash("notice", "Invalid email or password.")
      return res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email
      })
    }

    // 3. Remove sensitive field
    delete accountData.account_password

    // 4. Build JWT
    const accessToken = jwt.sign(
      accountData,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 } // 1 hour in seconds
    )

    // 5. Store cookie
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 3600 * 1000, // 1 hour
    })

    // 6. Redirect after successful login
    return res.redirect("/account/")
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

/* ****************************************
 * Deliver the account management view
 * *************************************** */
accountController.buildAccountManagement = async function(req, res) {
  const nav = await utilities.getNav()
  res.render("account/account", {
    title: "Account Management",
    nav,
    errors: null,
    accountData: res.locals.accountData
  })
}

/* ****************************************
 * Logout
 * *************************************** */
accountController.logout = async function(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/account/login")
}

/* ****************************************
 * Update account information
 * *************************************** */
accountController.updateAccount = async function (req, res, next) {
  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body

    // Prevent editing another user's account
    if (parseInt(account_id) !== res.locals.accountData.account_id) {
      req.flash("notice", "You can only update your own account.")
      return res.redirect("/account")
    }

    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (updateResult) {
      req.flash("notice", "Account updated successfully.")

      // Update JWT with new data
      const newToken = jwt.sign(
        {
          account_id,
          account_firstname,
          account_lastname,
          account_email,
          account_type: res.locals.accountData.account_type
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 }
      )

      res.cookie("jwt", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 3600 * 1000
      })
    } else {
      req.flash("notice", "Update failed. Please try again.")
    }

    return res.redirect("/account")
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Update account password
 * *************************************** */
accountController.updatePassword = async function (req, res, next) {
  try {
    const { account_id, account_password } = req.body

    // Prevent editing another user's password
    if (parseInt(account_id) !== res.locals.accountData.account_id) {
      req.flash("notice", "You can only update your own password.")
      return res.redirect("/account")
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const result = await accountModel.updatePassword(account_id, hashedPassword)

    if (result) {
      req.flash("notice", "Password updated successfully.")
    } else {
      req.flash("notice", "Password update failed. Try again.")
    }

    return res.redirect("/account")
  } catch (err) {
    next(err)
  }
}

accountController.buildEditAccount = async function (req, res, next) {
  try {
    // Only allow user to edit their own account
    if (parseInt(req.params.account_id) !== res.locals.accountData.account_id) {
      req.flash("notice", "You can only edit your own account.");
      return res.redirect("/account");
    }

    const nav = await utilities.getNav();
    res.render("account/edit-account", {
      title: "Edit Account",
      nav,
      account: res.locals.accountData, // logged-in user
      message: null,
      errors: null
    });
  } catch (err) {
    next(err);
  }
};

module.exports = accountController