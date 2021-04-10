const express = require('express')
const router = express.Router();
const get = require('./requests/get.js')

router.get("/get", get)

module.exports = router;