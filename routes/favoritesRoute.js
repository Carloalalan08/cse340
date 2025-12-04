const express = require("express")
const router = new express.Router()
const favController = require("../controllers/favoritesController")
const utilities = require("../utilities")

// Must be logged in
router.get("/", utilities.checkLogin, favController.buildFavoritesView)
router.post("/add", utilities.checkLogin, favController.addFavorite)
router.post("/remove", utilities.checkLogin, favController.removeFavorite)

module.exports = router
