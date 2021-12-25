const router = require('express').Router()
const {
  reportStolenBike,
  getBikesSearchDTOs,
  getBikeById,
  caseSolved,
} = require('../controllers/bikes.controller')
const { authOwners, authOfficers } = require('../utils/auth') // Authenticated Route

router
  .get('/dtos', authOfficers, getBikesSearchDTOs)
  .get('/:bikeId', authOfficers, getBikeById)

router.post('/', authOwners, reportStolenBike)

router.put('/resolved/:bikeId', authOfficers, caseSolved)

module.exports = router
