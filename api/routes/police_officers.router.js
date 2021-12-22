const router = require('express').Router()
const { createOfficer } = require('../controllers/police_officers.controller')
const { officerIsAdmin } = require('../utils/auth') // Authenticated Route

router.post('/', officerIsAdmin, createOfficer)

module.exports = router
