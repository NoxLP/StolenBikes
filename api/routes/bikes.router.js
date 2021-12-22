const router = require('express').Router()
const { reportStolenBike } = require('../controllers/bikes.controller')

router.post('/', reportStolenBike)

module.exports = router
