const pool = require("../database/")

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT account_id FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    console.error("Error in checkExistingEmail:", error)
    throw new Error("Error checking existing email")
  }
}

/* **********************
 *   Get account by email
 * ********************* */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      `SELECT account_id, account_firstname, account_lastname,
              account_email, account_type, account_password
       FROM account
       WHERE account_email = $1`,
      [account_email]
    )

    return result.rows[0] // returns undefined if no match
  } catch (error) {
    console.error("Error in getAccountByEmail:", error)
    throw new Error("Error retrieving account by email")
  }
}

// Register a new account
async function registerAccount(firstname, lastname, email, password) {
  try {
    const sql = `
      INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
      )
      VALUES ($1, $2, $3, $4, 'Client')
      RETURNING account_id;
    `
    const data = await pool.query(sql, [firstname, lastname, email, password])
    return data.rows[0]
  } catch (error) {
    return null
  }
}

// Get account by ID
async function getAccountById(account_id) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type
      FROM account
      WHERE account_id = $1
    `
    const result = await pool.query(sql, [account_id])
    return result.rows[0] // undefined if not found
  } catch (err) {
    console.error("Error in getAccountById:", err)
    throw err
  }
}

// Update account info (first name, last name, email)
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1,
          account_lastname  = $2,
          account_email     = $3
      WHERE account_id = $4
    `
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return result.rowCount // 1 if success
  } catch (err) {
    console.error("Error in updateAccount:", err)
    throw err
  }
}

// Update account password
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
    `
    const result = await pool.query(sql, [hashedPassword, account_id])
    return result.rowCount
  } catch (err) {
    console.error("Error in updatePassword:", err)
    throw err
  }
}


module.exports = {
  checkExistingEmail, 
  getAccountByEmail,
  registerAccount,
  getAccountById,
  updateAccount,
  updatePassword
}
