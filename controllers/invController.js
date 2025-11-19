const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build single vehicle detail view
 * ************************** */
invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicle = await invModel.getVehicleById(inv_id);

    if (!vehicle) {
      const nav = await utilities.getNav();
      return res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "Sorry, the vehicle you are looking for does not exist.",
        nav
      });
    }

    const vehicleHTML = await utilities.buildVehicleDetailHTML(vehicle);
    const nav = await utilities.getNav();

    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHTML,
    });
  } catch (error) {
    next(error);
  }
};

  module.exports = invCont