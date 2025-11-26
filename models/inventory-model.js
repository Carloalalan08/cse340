const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}


/* ***************************
 *  Get a single vehicle by inv_id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const sql = "SELECT * FROM public.inventory WHERE inv_id = $1"
    const params = [inv_id]
    const result = await pool.query(sql, params)
    return result.rows[0] // return a single vehicle object
  } catch (error) {
    console.error("getVehicleById error " + error)
  }
}

// addClassification
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING classification_id"
    const result = await pool.query(sql, [classification_name])
    return result.rowCount ? result.rows[0].classification_id : 0
  } catch (error) {
    console.error("addClassification error: " + error)
    return 0
  }
}

// addInventory
async function addInventory(inv) {
  try {
    const sql = `INSERT INTO public.inventory
      (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING inv_id`

    const params = [
      inv.classification_id,
      inv.inv_make,
      inv.inv_model,
      inv.inv_description,
      inv.inv_image,
      inv.inv_thumbnail,
      inv.inv_price,
      inv.inv_year,
      inv.inv_miles,
      inv.inv_color
    ]

    const result = await pool.query(sql, params)
    return result.rows[0].inv_id
  } catch (error) {
    console.error("addInventory error: " + error)
    return 0
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory
}
