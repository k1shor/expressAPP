const express = require('express')
const { testFunction, secondFunction } = require('../controller/testController')
const router = express.Router()

router.get('/add', testFunction)
router.get('/second', secondFunction)

module.exports = router