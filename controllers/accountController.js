const utilities = require("../utilities")

/* ****************************************
 * Deliver the registration view
 * *************************************** */
async function buildRegister(req, res, next) {
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
async function registerAccount(req, res, next) {
    res.send("Registration process will go here")
}

/* ****************************************
 * Deliver the login view
 * *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email: ""
    })
}

/* ****************************************
 * Placeholder for login process
 * *************************************** */
async function loginAccount(req, res, next) {
    res.send("Login process will go here")
}

module.exports = {
    buildRegister,
    registerAccount,
    buildLogin,
    loginAccount
}