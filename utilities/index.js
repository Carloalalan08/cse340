const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ***************************************
* Build the vehicle detail view HTML
* ************************************** */
Util.buildVehicleDetailHTML = function (vehicle) {
  return `
    <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
    <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />
    <p>Year: ${vehicle.inv_year}</p>
    <p>Price: $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
    <p>Mileage: ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
    <p>Description: ${vehicle.inv_description}</p>
  `;
};

/* ***************************************
* Build the classification dropdown HTML
* *************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList = '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected"
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* *******************************
 * JWT Token check middleware
 ****************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt

  if (!token) {
    // Guest user
    res.locals.accountData = null
    res.locals.loggedin = 0
    return next()
  }

  // Token exists → verify it
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
    if (err) {
      req.flash("notice", "Please log in")
      res.clearCookie("jwt")

      // Treat as logged out
      res.locals.accountData = null
      res.locals.loggedin = 0

      return res.redirect("/account/login")
    }

    // Valid token → user logged in
    res.locals.accountData = accountData
    res.locals.loggedin = 1

    next()
  })
}

// ==============================
//  Only Employee / Admin Allowed
// ==============================
Util.checkAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.jwt
    if (!token) {
      req.flash('notice', 'Please log in to access that page.')
      return res.redirect('/account/login')
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
      if (err) {
        req.flash('notice', 'Please log in.')
        res.clearCookie('jwt')
        return res.redirect('/account/login')
      }

      // accountData comes from token payload at login
      if (accountData.account_type === 'Employee' || accountData.account_type === 'Admin') {
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        return next()
      } else {
        req.flash('notice', 'You do not have sufficient permissions to access that page.')
        return res.redirect('/account/login')
      }
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* *******************************
 * Error handling utility
 ************************** */
Util.handleErrors = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      console.error("ERROR:", error)
      next(error) // send to your global error handler in server.js
    }
  }
}

module.exports = Util
