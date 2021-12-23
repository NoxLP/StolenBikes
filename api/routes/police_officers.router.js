const router = require('express').Router()
const {
  createOfficer,
  updateOfficer,
} = require('../controllers/police_officers.controller')
const { officerIsAdmin } = require('../utils/auth')

router.post('/', officerIsAdmin, createOfficer)
router.put('/:officerId', officerIsAdmin, updateOfficer)

module.exports = router
