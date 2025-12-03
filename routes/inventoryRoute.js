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

// ===============================
// Admin-only routes
// ===============================

// Add classification
router.get(
  "/add-classification",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)
router.post(
  "/add-classification",
  utilities.checkAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Add inventory
router.get(
  "/add-inventory",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)
router.post(
  "/add-inventory",
  utilities.checkAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Edit inventory
router.get(
  "/edit/:inv_id",
  utilities.checkAdmin,
  utilities.handleErrors(invController.editInventoryView)
)
router.post(
  "/update",
  utilities.checkAdmin,
  utilities.handleErrors(invController.updateInventory)
)

// Delete inventory
router.get(
  "/delete/:inv_id",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildDeleteView)
)
router.post(
  "/delete",
  utilities.checkAdmin,
  utilities.handleErrors(invController.deleteInventory)
)

// Test 500 error route
router.get("/trigger-error", (req, res, next) => {
  next(new Error("This is a test 500 error!"))
})

module.exports = router
