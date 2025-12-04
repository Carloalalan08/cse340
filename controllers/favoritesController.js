const favoriteModel = require("../models/favorites-model")
const utilities = require("../utilities")

const favoritesController = {}

/* Show Favorites List */
favoritesController.buildFavoritesView = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const nav = await utilities.getNav()
    const favorites = await favoriteModel.getFavoritesByAccountId(account_id)

    res.render("account/favorites", {
      title: "My Favorites",
      nav,
      favorites,
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

/* Add Favorite */
favoritesController.addFavorite = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const { inv_id } = req.body

    await favoriteModel.addFavorite(account_id, inv_id)

    req.flash("notice", "Added to favorites!")
    res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    next(error)
  }
}

/* Remove Favorite */
favoritesController.removeFavorite = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const { inv_id } = req.body

    await favoriteModel.removeFavorite(account_id, inv_id)

    req.flash("notice", "Removed from favorites!")
    res.redirect("/account/favorites")
  } catch (error) {
    next(error)
  }
}

module.exports = favoritesController
