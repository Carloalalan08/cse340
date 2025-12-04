const pool = require("../database/")

/* Add vehicle to favorites */
async function addFavorite(account_id, inv_id) {
  try {
    const sql = `
      INSERT INTO favorites (account_id, inv_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

/* Remove favorite */
async function removeFavorite(account_id, inv_id) {
  try {
    const sql = `
      DELETE FROM favorites
      WHERE account_id = $1 AND inv_id = $2;
    `
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rowCount
  } catch (error) {
    throw error
  }
}

/* Get favorites for a user */
async function getFavoritesByAccountId(account_id) {
  try {
    const sql = `
      SELECT f.favorite_id, i.inv_id, i.inv_make, i.inv_model, i.inv_price, i.inv_year
      FROM favorites f
      JOIN inventory i ON f.inv_id = i.inv_id
      WHERE f.account_id = $1
      ORDER BY f.created_at DESC;
    `
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    throw error
  }
}

module.exports = { addFavorite, removeFavorite, getFavoritesByAccountId }
