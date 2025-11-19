// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build single vehicle detail view
router.get("/detail/:inv_id", invController.buildVehicleDetail);

// Route to intentionally trigger a 500 error
router.get("/trigger-error", (req, res, next) => {
  next(new Error("This is a test 500 error!"));
});

module.exports = router;

