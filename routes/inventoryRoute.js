// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// ===============================
// Inventory Management Routes
// ===============================

// Management home view (/inv)
router.get(
  "/",
  utilities.handleErrors(invController.buildManagement)
)

// Deliver "Add Classification" view
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
)

// Process classification form
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Deliver "Add Inventory" view
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
)

// Process inventory form
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Build inventory by classification
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Single vehicle detail
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildVehicleDetail)
)

// Return inventory JSON for a classification
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

// Edit Inventory View
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
)

// Update Inventory Handler
router.post(
  "/update",
  utilities.handleErrors(invController.updateInventory)
)

// Deliver Delete Confirmation View
router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.buildDeleteView)
);

// Process Delete
router.post(
  "/delete",
  utilities.handleErrors(invController.deleteInventory)
);

// Test 500 error route
router.get("/trigger-error", (req, res, next) => {
  next(new Error("This is a test 500 error!"))
})

module.exports = router
