/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()

const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities")

const session = require("express-session")
const flash = require("connect-flash")

/* ***********************
 * Middleware
 *************************/

// Parse URL-encoded bodies (as sent by forms)
app.use(express.urlencoded({ extended: true }))

// Parse JSON
app.use(express.json())

/* ***********************
 * Session + Flash
 *************************/

// ⚠️ IMPORTANT: Session MUST come BEFORE flash and before any route using req.flash
app.use(session({
  secret: process.env.SESSION_SECRET || "dev_secret_change_me",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}))

app.use(flash())

// Make flash messages available in all views
app.use((req, res, next) => {
  res.locals.flash = req.flash()
  next()
})

/* ***********************
 * View Engine + Layouts
 *************************/
app.set("view engine", "ejs")

// MUST be used BEFORE routes
app.use(expressLayouts)

// This tells express-ejs-layouts where the layout.ejs file is
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(require("./routes/static"))

// Homepage
app.get("/", baseController.buildHome)

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute)

/* ***********************
 * Server Startup
 *************************/
const port = process.env.PORT
const host = process.env.HOST

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

/* ***********************
 * Error Handler (must be LAST)
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message: err.message,
    nav
  })
})

// 404 fallback
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})
