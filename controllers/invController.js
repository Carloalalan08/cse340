const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invController = {}

/* ================================
 *  Inventory Management Home
 * ================================ */
invController.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const message = req.flash("message")

    // Add the classification select list
    const classificationSelect = await utilities.buildClassificationList()

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message: message.length ? message[0] : null,
      classificationSelect // <-- pass to view
    })
  } catch (error) {
    next(error)
  }
}

/* ================================
 *  Add Classification View
 * ================================ */
invController.buildAddClassification = async function (req, res, next) {
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
invController.addClassification = async function (req, res, next) {
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
invController.buildAddInventory = async function (req, res, next) {
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
invController.addInventory = async function (req, res, next) {
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
    inv_miles,
    inv_color
  })
}

/* ================================
 *  Build Inventory by Classification
 * ================================ */
invController.buildByClassificationId = async function (req, res, next) {
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
invController.buildVehicleDetail = async function (req, res, next) {
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invController.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id, 10)
    if (Number.isNaN(classification_id)) {
      return res.status(400).json({ error: 'Invalid classification id' })
    }

    const invData = await invModel.getInventoryByClassificationId(classification_id)

    if (Array.isArray(invData) && invData.length > 0) {
      return res.json(invData)
    } else {
      // empty array is valid; return empty array (not an error)
      return res.json([])
      // Or if you prefer to treat empty as error:
      // next(new Error("No data returned"))
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invController.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)

    let nav = await utilities.getNav()

    // Get item data from model
    const itemData = await invModel.getInventoryById(inv_id)

    // Build classification select with current classification selected
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)

    // Create name for title
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
    
  } catch (error) {
    next(error)
  }
}

/* ***************************
  *  Update inventory item
  * ************************** */
invController.updateInventory = async function (req, res, next) {
  try {
    const updated = await invModel.updateInventory(req.body)
    if (updated) {
      req.flash("notice", "Vehicle updated successfully.")
      return res.redirect("/inv/")
    } else {
      throw new Error("Update failed.")
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Delete inventory item
 * ************************** */
invController.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id, 10); // use req.body for POST
    const deleted = await invModel.deleteInventory(inv_id);

    if (deleted) {
      req.flash("notice", "Vehicle deleted successfully.");
      return res.redirect("/inv");
    } else {
      // If delete fails, redisplay confirmation
      const itemData = await invModel.getInventoryById(inv_id);
      const nav = await utilities.getNav();

      req.flash("notice", "Delete failed. Try again.");
      return res.status(501).render("inventory/delete-inventory", {
        title: `Delete ${itemData.inv_make} ${itemData.inv_model}`,
        nav,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year
      });
    }
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build Delete Inventory View
 * ************************** */
invController.buildDeleteView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id, 10);
    const nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      const error = new Error("Vehicle not found");
      error.status = 404;
      throw error;
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render("inventory/delete-inventory", {
      title: "Delete " + itemName,
      nav,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color
    });
  } catch (error) {
    next(error);
  }
};

module.exports = invController
