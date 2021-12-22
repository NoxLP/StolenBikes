const router = require('express').Router()
const {
  signUp,
  ownersLogin,
  officersLogin,
} = require('../controllers/auth.controller')

router
  .post('/owners/signup', signUp)
  .post('/owners/login', ownersLogin)
  .post('/officers/login', officersLogin)

module.exports = router
