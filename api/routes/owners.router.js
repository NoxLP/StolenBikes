const router = require('express').Router()
const { getMyBikes } = require('../controllers/owners.controller')

router.get('/my-bikes', getMyBikes)

module.exports = router
