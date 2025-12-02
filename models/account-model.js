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

module.exports = {
  checkExistingEmail, 
  getAccountByEmail,
  registerAccount
}
