const router = require('express').Router()

const authRouter = require('./auth.router')
const officersRouter = require('./police_officers.router')
const bikesRouter = require('./bikes.router')
const { authOwners, authOfficers, authUser } = require('../utils/auth') // Authenticated Route

router.use('/auth', authRouter)
router.use('/officers', authOfficers, officersRouter)
router.use('/bikes', authOwners, bikesRouter)

router.get('/whoami', authUser, (req, res) => {
  res.send(`hi there! ${res.locals.user.name}`)
})

module.exports = router
