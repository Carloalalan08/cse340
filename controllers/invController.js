const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ================================
 *  Inventory Management Home
 * ================================ */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  const message = req.flash("message")

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: message.length ? message[0] : null
  })
}

/* ================================
 *  Add Classification View
 * ================================ */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()

  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    classification_name: ""
  })
}

/* ================================
 *  Process Add Classification
 * ================================ */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const resultId = await invModel.addClassification(classification_name)

  if (resultId) {
    req.flash("message", `Classification "${classification_name}" added successfully.`)
    return res.redirect("/inv")
  }

  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: [{ msg: "Unable to add classification. Try again." }],
    classification_name
  })
}

/* ================================
 *  Add Inventory View
 * ================================ */
invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()

  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    errors: null,
    classificationList,
    inv_make: "",
    inv_model: "",
    inv_description: "",
    inv_image: "/images/no-image.png",
    inv_thumbnail: "/images/no-image-thumb.png",
    inv_price: "",
    inv_year: "",
    inv_miles: "",
    inv_color: ""
  })
}

/* ================================
 *  Process Add Inventory
 * ================================ */
invCont.addInventory = async function (req, res, next) {
  const {
  classification_id, inv_make, inv_model, inv_description,
  inv_image, inv_thumbnail, inv_price, inv_year, inv_miles,
  inv_color
} = req.body


  const result = await invModel.addInventory({
  classification_id, inv_make, inv_model, inv_description,
  inv_image, inv_thumbnail, inv_price, inv_year, inv_miles,
  inv_color
})


  if (result) {
    req.flash("message", `Vehicle "${inv_make} ${inv_model}" added successfully.`)
    return res.redirect("/inv")
  }

  // Failed insert — reload form with stickiness
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(classification_id)

  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    errors: [{ msg: "Failed to add vehicle. Try again." }],
    classificationList,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles
  })
}

/* ================================
 *  Build Inventory by Classification
 * ================================ */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)

  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()

  const className = data.length ? data[0].classification_name : "No Vehicles Found"

  res.render("./inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid,
  })
}

/* ================================
 *  Build Single Vehicle Detail
 * ================================ */
invCont.buildVehicleDetail = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const vehicle = await invModel.getVehicleById(inv_id)

  if (!vehicle) {
    const err = new Error("Vehicle not found")
    err.status = 404
    throw err
  }

  const nav = await utilities.getNav()
  const vehicleHTML = utilities.buildVehicleDetailHTML(vehicle)

  return res.render("./inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    vehicleHTML
  })
}

module.exports = invCont
