const router = require('express').Router()
const { signUp, ownersLogin } = require('../controllers/auth.controller')

router.post('/signup', signUp).post('/owners/login', ownersLogin)

module.exports = router
