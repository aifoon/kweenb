const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");

/**
 * Init Express
 */

// define paths
const isDevelopment = process.env.NODE_ENV !== "production";
const publicFolder = isDevelopment
  ? path.join(__dirname, "webserver")
  : path.join(__dirname, "webserver");

// define some variable
const port = 5050;

// create express app
const app = express();

// enable cors
app.use(cors());

// set the public folder
app.use(express.static(publicFolder));

// create express router
const router = express.Router();
app.use("/", router);

/**
 * Endpoints
 */

router.get("*", (req, res) => {
  res.sendFile(path.join(publicFolder, "index.html"));
});

/**
 * Run server
 */

(async () => {
  app.listen(port);
})().catch(console.error);
