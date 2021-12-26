const router = require('express').Router()
const { getMyBikes } = require('../controllers/owners.controller')

router.get('/bikes', getMyBikes)

module.exports = router
