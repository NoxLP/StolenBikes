const router = require('express').Router()
const {
  reportStolenBike,
  getBikesSearchDTOs,
} = require('../controllers/bikes.controller')
const { authOwners, authOfficers } = require('../utils/auth') // Authenticated Route

router.post('/', authOwners, reportStolenBike)
router.get('/dtos', authOfficers, getBikesSearchDTOs)

module.exports = router
